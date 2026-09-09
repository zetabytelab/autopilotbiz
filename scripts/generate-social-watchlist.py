#!/usr/bin/env python3
"""Merge public tracking fields from private CSVs and supplemental research. No network calls."""
import argparse
import csv
import hashlib
import io
import json
from pathlib import Path
import re
import subprocess
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent

# Explicit aliases: registry entities represent organizations, not products.
ALIASES = {
    "anthropic": "stack-claude", "nous-research": "stack-hermes",
    "lambda-labs": "stack-lambda-labs", "akamai": "stack-akamai",
    "mcp": "stack-mcp", "z-ai": "stack-z-ai",
}


def linkedin(value, kind):
    if not value:
        return None
    u = urlparse(value)
    match = re.fullmatch(r"/(in|company|showcase)/([^/]+)(?:/posts)?/?", u.path)
    if u.scheme != "https" or not (u.hostname == "linkedin.com" or (u.hostname or "").endswith(".linkedin.com")) or not match:
        raise ValueError(f"Invalid LinkedIn URL: {value}")
    if match[1] not in ({"company", "showcase"} if kind == "company" else {"in"}):
        raise ValueError(f"Wrong LinkedIn account type: {value}")
    return f"https://www.linkedin.com/{match[1]}/{match[2].lower()}/"


def build(registry):
    entities = json.loads(subprocess.check_output([
        "node", "--input-type=module", "-e",
        'import {loadCompanies,loadStackEntities} from "./scripts/pulse-entities.mjs"; '
        'console.log(JSON.stringify([...loadCompanies(),...loadStackEntities()]));',
    ], cwd=ROOT, text=True))
    known = {e["slug"] for e in entities}
    overrides = json.loads((ROOT / "data/social-watchlist-overrides.json").read_text())
    subjects, source_hashes, used_overrides = [], {}, set()
    for filename, kind in [("companies.csv", "company"), ("people.csv", "person")]:
        content = (registry / filename).read_bytes()
        source_hashes[filename] = hashlib.sha256(content).hexdigest()
        rows = list(csv.DictReader(io.StringIO(content.decode("utf-8-sig"))))
        for row in rows:
            slug = row["slug"]
            pulse_slug = ALIASES.get(slug, slug if slug in known else f"stack-{slug}")
            if pulse_slug not in known:
                raise ValueError(f"Unmapped registry entity: {slug} -> {pulse_slug}")
            name = row["company"] if kind == "company" else row["person"]
            key = f"{slug}:{name}" if kind == "person" else slug
            override = overrides.get(key, {})
            if override:
                used_overrides.add(key)
            confidence = row["confidence"]
            if confidence not in {"verified", "likely", "unverified"}:
                raise ValueError(f"Unknown confidence: {confidence}")
            relationship = override.get("relationship", "associated")
            subject = {
                "id": f"{kind}:{key}", "kind": kind, "name": name,
                "entityName": row["company"], "entitySlug": slug, "pulseSlug": pulse_slug,
                "role": row.get("role", "Company account"), "relationship": relationship,
                "sourceUrl": row["source_url"],
            }
            for platform, field in [("linkedin", "linkedin_company_url" if kind == "company" else "linkedin_url"), ("x", "x_handle")]:
                value = row[field].strip()
                if platform == "linkedin":
                    value = linkedin(value, kind)
                else:
                    value = value.lstrip("@").lower() or None
                    if value and not re.fullmatch(r"[A-Za-z0-9_]{1,15}", value):
                        raise ValueError(f"Invalid X handle: {value}")
                status = "verified" if confidence == "verified" else "review"
                status = override.get(f"{platform}Status", status)
                if not value:
                    status = "missing"
                if relationship == "deceased":
                    status = "inactive"
                subject[platform] = {"value": value, "status": status}
                if platform == "linkedin" and row.get("linkedin_checked"):
                    subject[platform]["checkedAt"] = row["linkedin_checked"]
                if override.get(f"{platform}Reason"):
                    subject[platform]["reason"] = override[f"{platform}Reason"]
            subjects.append(subject)
    if set(overrides) != used_overrides:
        raise ValueError(f"Stale overrides: {set(overrides) - used_overrides}")
    if len({s["id"] for s in subjects}) != len(subjects):
        raise ValueError("Duplicate subject in source registries")
    research_bytes = (ROOT / "data/social-watchlist-research.json").read_bytes()
    research = json.loads(research_bytes)
    source_hashes["social-watchlist-research.json"] = hashlib.sha256(research_bytes).hexdigest()
    if research.get("schemaVersion") != 1:
        raise ValueError("Unsupported supplemental research schema")
    ids = {s["id"] for s in subjects}
    for subject in research["subjects"]:
        if subject["id"] in ids:
            raise ValueError(f"Research overlaps registry; reconcile explicitly: {subject['id']}")
        ids.add(subject["id"])
        subjects.append(subject)
    # Use the collector's validation before emitting either artifact. This also
    # catches different rows that claim the same active platform account.
    subprocess.run([
        "node", "--input-type=module", "-e",
        'import {readFileSync} from "node:fs"; '
        'import {validateWatchlist} from "./scripts/pulse-social.mjs"; '
        'const {subjects,entities}=JSON.parse(readFileSync(0,"utf8")); '
        'validateWatchlist({schemaVersion:1,subjects},entities);',
    ], input=json.dumps({"subjects": subjects, "entities": entities}), cwd=ROOT, text=True, check=True)
    represented = {s["pulseSlug"] for s in subjects}
    research_slugs = [e["pulseSlug"] for e in research["entities"]]
    if len(set(research_slugs)) != len(research_slugs) or not set(research_slugs) <= represented:
        raise ValueError("Duplicate or unrepresented supplemental entity findings")
    return {
        "schemaVersion": 1, "sourceHashes": source_hashes,
        "subjects": sorted(subjects, key=lambda s: s["id"]),
        "entityResearch": research["entities"],
        "unresearchedEntities": [{"name": e["name"], "slug": e["slug"]} for e in entities if e["slug"] not in represented],
    }


def report(data):
    subjects = data["subjects"]
    lines = ["# Pulse social watch list", "", "Generated from the private ops registries and public supplemental research in `data/social-watchlist-research.json`. Private research notes remain private.", "",
             "All confirmed registry accounts are included, including selected technical leaders. `associated` means the registry links the person to this entity; it is not a fresh employment check.", "",
             "Former or uncertain affiliations remain tracked as people, with no automatic company attribution. Account verification is separate for X and LinkedIn.", ""]
    for kind in ["person", "company"]:
        subset = [s for s in subjects if s["kind"] == kind]
        lines += [f"## {'People' if kind == 'person' else 'Companies'} ({len(subset)})", "",
                  "| Entity | Name / role | Affiliation | LinkedIn | X |", "|---|---|---|---|---|"]
        for s in subset:
            def account(platform):
                a = s[platform]
                if not a["value"]:
                    return a["status"]
                url = a["value"] if platform == "linkedin" else f"https://x.com/{a['value']}"
                return f"[{a['status']}]({url})"
            cells = [s["entityName"], f"{s['name']} — {s['role']}", s["relationship"], account("linkedin"), account("x")]
            lines.append("| " + " | ".join(c.replace("|", "\\|").replace("\n", " ") for c in cells) + " |")
        lines.append("")
    lines += ["## Entities still needing research", ""]
    lines += [f"- {e['name']} (`{e['slug']}`)" for e in data["unresearchedEntities"]] or ["None without an initial research record. Unresolved accounts and roles are listed below."]
    lines += ["", "## Supplemental entity findings", ""]
    for e in data.get("entityResearch", []):
        lines += [f"### {e['name']}", "", f"{e['description']} [Source]({e['sourceUrl']})", ""]
        lines += [f"- {note}" for note in e["notes"]]
        lines.append("")
    lines += ["## Account review notes", ""]
    for s in subjects:
        for platform in ["linkedin", "x"]:
            if s[platform].get("reason"):
                lines.append(f"- {s['name']} ({platform}): {s[platform]['reason']}")
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("registry", type=Path, help="Private ops registry directory containing people.csv and companies.csv")
    parser.add_argument("--check", action="store_true", help="Verify committed outputs are current without writing")
    args = parser.parse_args()
    data = build(args.registry)
    outputs = {ROOT / "data/social-watchlist.json": json.dumps(data, ensure_ascii=False, indent=2) + "\n",
               ROOT / "docs/PULSE-WATCHLIST.md": report(data)}
    for path, content in outputs.items():
        if args.check:
            if not path.exists() or path.read_text() != content:
                raise SystemExit(f"Stale export: {path.name}")
        else:
            path.write_text(content)
    print(f"{'Checked' if args.check else 'Exported'} {len(data['subjects'])} subjects; {len(data['unresearchedEntities'])} entity research gaps.")
