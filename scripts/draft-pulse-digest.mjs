#!/usr/bin/env node
// Offline editorial input only. Does not publish a page, send email, fetch URLs or infer business implications.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

export function canonicalUrl(value) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.protocol = "https:";
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, "").replace(/^twitter\.com$/, "x.com");
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) if (/^utm_/i.test(key) || ["fbclid", "gclid", "mc_cid", "mc_eid"].includes(key.toLowerCase())) url.searchParams.delete(key);
    url.searchParams.sort();
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.toString();
  } catch { return null; }
}

function normalizedTitle(value) {
  return value.normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

const kindPriority = { product: 4, funding: 3, blog: 2, interview: 2, video: 1, social: 1, other: 0 };

export function draftCandidates(feed, { asOf = new Date().toISOString(), days = 7, limit = 25, perEntity = 3 } = {}) {
  const end = Date.parse(asOf);
  if (!Number.isFinite(end) || !Number.isInteger(days) || days < 1 || days > 90 || !Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(perEntity) || perEntity < 1) throw new Error("Use a valid asOf timestamp, days 1–90, limit 1–100 and positive perEntity.");
  if (!Array.isArray(feed?.items)) throw new Error("Feed must contain an items array.");
  const start = end - days * 86400000;
  const snapshotTime = Date.parse(feed.generatedAt);
  const ageHours = Number.isFinite(snapshotTime) ? (end - snapshotTime) / 3600000 : null;
  const inputFreshness = ageHours === null ? "unknown" : ageHours < 0 ? "future-dated" : ageHours > 48 ? "stale" : "recent";
  const freshnessWarning = inputFreshness === "recent" ? null : inputFreshness === "stale"
    ? `Feed snapshot is ${Math.round(ageHours)} hours old (over 48 hours). This packet may omit recent developments; an empty packet does not mean nothing changed.`
    : inputFreshness === "future-dated" ? "Feed snapshot is dated after the requested window end. Review snapshot provenance; an empty packet does not mean nothing changed."
    : "Feed snapshot timestamp is missing or invalid. Freshness is unknown; an empty packet does not mean nothing changed.";
  const excluded = { invalid: 0, outsideWindow: 0, future: 0, duplicates: 0, entityCap: 0, candidateLimit: 0 };
  const eligible = [];
  for (const item of feed.items) {
    const url = canonicalUrl(item?.url);
    const publishedAt = Date.parse(item?.publishedAt);
    if (!url || typeof item?.title !== "string" || !item.title.trim() || !Number.isFinite(publishedAt)) { excluded.invalid++; continue; }
    if (publishedAt > end) { excluded.future++; continue; }
    if (publishedAt < start) { excluded.outsideWindow++; continue; }
    eligible.push({ ...item, canonicalUrl: url, normalizedTitle: normalizedTitle(item.title) });
  }

  const parents = eligible.map((_, index) => index);
  const root = (index) => { while (parents[index] !== index) { parents[index] = parents[parents[index]]; index = parents[index]; } return index; };
  const keys = new Map();
  eligible.forEach((item, index) => {
    const itemKeys = [`url:${item.canonicalUrl}`];
    // Scoped long exact titles avoid merging unrelated short announcements.
    if (item.companySlug && item.normalizedTitle.length >= 48) itemKeys.push(`title:${item.companySlug}:${item.normalizedTitle}`);
    for (const key of itemKeys) {
      if (keys.has(key)) parents[root(index)] = root(keys.get(key));
      else keys.set(key, index);
    }
  });
  const groups = new Map();
  eligible.forEach((item, index) => {
    const key = root(index); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(item);
  });
  excluded.duplicates = eligible.length - groups.size;

  const candidates = [...groups.values()].map((group) => {
    group.sort((a, b) => (kindPriority[b.kind] ?? 0) - (kindPriority[a.kind] ?? 0) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.canonicalUrl.localeCompare(b.canonicalUrl));
    const item = group[0];
    const sources = new Map();
    for (const entry of group) {
      for (const source of [{ id: entry.social ? "social-statement" : "collected-link", url: entry.url }, ...(Array.isArray(entry.sources) ? entry.sources : [])]) {
        const sourceUrl = canonicalUrl(source?.url);
        if (!sourceUrl) continue;
        const key = `${source?.id ?? "unknown"}:${sourceUrl}`;
        if (!sources.has(key)) sources.set(key, { collectorSource: String(source?.id ?? "unknown"), url: sourceUrl });
      }
    }
    return {
      id: createHash("sha256").update(item.canonicalUrl).digest("hex").slice(0, 12),
      headline: item.title,
      url: item.canonicalUrl,
      publishedAt: item.publishedAt,
      companySlug: item.companySlug ?? null,
      entityMatchReviewed: false,
      collectedKind: item.kind ?? "other",
      track: item.track ?? "company",
      reviewStatus: "unreviewed",
      evidenceBasis: item.social ? "Collected social statement; claims unverified" : "Collected headline; article contents not reviewed by this generator",
      socialRelationship: item.social?.relationship ?? null,
      sourceRefs: [...sources.values()],
      duplicateFeedIds: group.map((entry) => entry.id ?? null),
      mergedHeadlines: [...new Set(group.map((entry) => entry.title))],
      verifiedChange: null,
      businessImplication: null,
      reviewer: null,
    };
  }).sort((a, b) => (kindPriority[b.collectedKind] ?? 0) - (kindPriority[a.collectedKind] ?? 0) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));

  const counts = new Map();
  const selected = [];
  for (const candidate of candidates) {
    const key = candidate.companySlug ?? `unmapped:${candidate.id}`;
    if ((counts.get(key) ?? 0) >= perEntity) { excluded.entityCap++; continue; }
    if (selected.length >= limit) { excluded.candidateLimit++; continue; }
    selected.push(candidate); counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return {
    status: "draft-only",
    generatedFor: new Date(end).toISOString(),
    windowStart: new Date(start).toISOString(),
    windowEnd: new Date(end).toISOString(),
    inputGeneratedAt: feed.generatedAt ?? null,
    inputFreshness,
    inputAgeHours: ageHours === null ? null : Math.round(ageHours * 100) / 100,
    selectionRule: "Collected product/funding category first, then recency; exact canonical URL or long exact title within the same entity deduplication; capped per entity. Category is not fact-checked.",
    warnings: [...(freshnessWarning ? [freshnessWarning] : []), "No sources were opened by this generator. Headlines and collected categories are unverified.", "Source count is provenance, not independent corroboration. Syndicated material may repeat the same claim.", "No business implication is generated. An editor must verify the source and write the actual change before publication."],
    counts: { input: feed.items.length, eligible: eligible.length, unique: groups.size, selected: selected.length, excluded },
    candidates: selected,
  };
}

function markdownText(value) { return String(value).replace(/[\\`*_[\]<>#|]/g, "\\$&").replace(/[\r\n]+/g, " "); }

export function renderDraft(packet) {
  const lines = ["# Pulse digest candidate packet — editorial draft", "", `Window: ${packet.windowStart} to ${packet.windowEnd}. Feed snapshot: ${packet.inputGeneratedAt ?? "unknown"}. Freshness: ${packet.inputFreshness}${packet.inputAgeHours === null ? "" : ` (${packet.inputAgeHours} hours old)`}.`, "", "This is unpublished editorial input. Headlines are collected statements; no source contents or business implications have been verified by this generator.", "", ...packet.warnings.map((warning) => `- ${warning}`), "", `Selected ${packet.counts.selected} of ${packet.counts.unique} deduplicated candidates (${packet.counts.input} feed rows).`, "", "Review each original source, establish what actually changed, distinguish claims from observations, then decide relevance to a one-person business. Do not use source count as proof of independent corroboration.", ""];
  packet.candidates.forEach((candidate, index) => {
    lines.push(`## ${index + 1}. ${markdownText(candidate.headline)}`, "", `- Entity (unverified collector match): ${markdownText(candidate.companySlug ?? "unmapped")}; collected category: ${markdownText(candidate.collectedKind)}; published: ${candidate.publishedAt}.`, `- Evidence basis: ${candidate.evidenceBasis}.`, `- Main source: <${candidate.url}>`, "- Verified change: **awaiting editorial review**.", "- Implication for solo operators: **not written**.", "- Source references:", ...candidate.sourceRefs.map((source) => `  - ${markdownText(source.collectorSource)}: <${source.url}>`), "");
  });
  return lines.join("\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = {};
    for (let index = 2; index < process.argv.length; index += 2) {
      const key = process.argv[index];
      if (!["--input", "--as-of", "--days", "--limit", "--per-entity", "--output-dir"].includes(key) || !process.argv[index + 1]) throw new Error(`Unknown or incomplete argument: ${key}`);
      args[key] = process.argv[index + 1];
    }
    const input = resolve(args["--input"] ?? "data/pulse.json");
    const packet = draftCandidates(JSON.parse(readFileSync(input, "utf8")), {
      asOf: args["--as-of"] ?? new Date().toISOString(), days: Number(args["--days"] ?? 7), limit: Number(args["--limit"] ?? 25), perEntity: Number(args["--per-entity"] ?? 3),
    });
    const directory = resolve(args["--output-dir"] ?? "docs/digests");
    mkdirSync(directory, { recursive: true });
    const basename = `candidates-${packet.generatedFor.slice(0, 10)}`;
    const jsonPath = join(directory, `${basename}.json`); const markdownPath = join(directory, `${basename}.md`);
    writeFileSync(jsonPath, `${JSON.stringify(packet, null, 2)}\n`); writeFileSync(markdownPath, renderDraft(packet));
    console.log(JSON.stringify({ status: "draft-only", jsonPath, markdownPath, counts: packet.counts }, null, 2));
  } catch (error) { console.error(`Cannot draft pulse candidates: ${error.message}`); process.exitCode = 1; }
}
