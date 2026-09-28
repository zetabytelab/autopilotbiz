// Exports the tracked index as CSV for sharing outside the site.
//
// Two files, because they answer different questions:
//   companies.csv    — one row per company, headline grades and latest metrics
//   observations.csv — one row per dated metric observation, the audit trail
//
// Every metric column carries its source and as-of date. A figure without a
// date is not a figure; keep them together when sharing.
//
// Usage: npm run export:csv -- [outDir]   (default: docs/exports)

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { companies } from "../lib/data.ts";
import { financialObservations } from "../lib/financial-observations.ts";
import { activeObservations, comparableValue, financialHistory, latestObservation, metricPerHuman } from "../lib/financials.ts";

const outDir = process.argv[2] ?? "docs/exports";
mkdirSync(outDir, { recursive: true });

// RFC 4180: quote everything, double internal quotes. Excel and Sheets both
// mis-parse bare fields containing commas, newlines or a leading "=".
const cell = (v: unknown) => {
  if (v === null || v === undefined) return '""';
  const s = String(v).replace(/\r?\n/g, " ").trim();
  return `"${s.replace(/"/g, '""')}"`;
};
const row = (values: unknown[]) => values.map(cell).join(",");
const sourceText = (s: { label?: string; url?: string } | null | undefined) =>
  s ? [s.label, s.url].filter(Boolean).join(" — ") : "";

const LEVEL_MEANING: Record<string, string> = {
  L2: "function autopilot",
  L3: "operational",
  L4: "goal-level",
  L5: "full autonomy",
};
const EVIDENCE_MEANING: Record<string, string> = {
  A: "third-party audited",
  B: "public transaction or filing",
  C: "credible press",
  D: "founder claims only",
};

const companyHeader = [
  "name", "slug", "url", "section", "autopilot_level", "level_meaning",
  "evidence_grade", "evidence_meaning", "story", "flags", "tagline",
  "category_claim", "arr_display", "arr_usd", "arr_as_of", "arr_status", "arr_source",
  "headcount", "headcount_as_of", "headcount_population", "headcount_source",
  "disclosed_contractors", "revenue_per_human_usd",
  "total_raised", "last_round", "last_round_date", "valuation", "investors",
  "founders", "tech_stack", "pricing", "verified", "cohort", "profile_url",
];

const companyRows = companies.map((c) => {
  const history = financialHistory(c);
  const active = activeObservations(history);
  const arr = latestObservation(c, "arr") ?? active.find((o) => o.kind !== "headcount" && o.kind !== "contractors") ?? null;
  const heads = latestObservation(c, "headcount");
  const contractors = latestObservation(c, "contractors");
  const perHuman = metricPerHuman(arr, heads, contractors);
  return row([
    c.name, c.slug, c.url, c.autopilot?.section ?? "",
    c.autopilot?.level ?? "", c.autopilot?.level ? LEVEL_MEANING[c.autopilot.level] : "",
    c.autopilot?.evidence ?? "", c.autopilot?.evidence ? EVIDENCE_MEANING[c.autopilot.evidence] : "",
    c.autopilot?.story ?? "", c.autopilot?.flags ?? "", c.tagline, c.categoryClaim,
    arr?.display ?? c.metrics.arr ?? "", comparableValue(arr) ?? c.metrics.arrUsd ?? "",
    arr?.asOf ?? "", arr?.status ?? "", sourceText(arr?.source ?? c.metrics.sources?.arr),
    comparableValue(heads) ?? c.metrics.humans ?? "", heads?.asOf ?? "", heads?.population ?? "",
    sourceText(heads?.source ?? c.metrics.sources?.humans),
    comparableValue(contractors) ?? c.metrics.disclosedContractors ?? "",
    perHuman ?? "",
    c.funding.totalRaised, c.funding.lastRound, c.funding.date, c.funding.valuation,
    c.funding.investors.join("; "),
    c.founders.map((f) => f.name).join("; "), c.techStack.join("; "), c.pricing,
    c.verified ? "yes" : "no", c.cohort ?? "hackathon",
    `https://www.autopilotindex.com/companies/${c.slug}`,
  ]);
});

const observationHeader = [
  "slug", "kind", "display", "value", "currency", "precision", "as_of",
  "period_start", "period_end", "scope", "population", "status",
  "source_label", "source_url", "published_at", "recorded_at", "checked_at",
  "supersedes", "notes",
];

const observationRows = financialObservations.map((o) =>
  row([
    o.slug, o.kind, o.display, o.value, o.currency, o.precision, o.asOf,
    o.periodStart, o.periodEnd, o.scope, o.population, o.status,
    o.source?.label ?? "", o.source?.url ?? "", o.publishedAt, o.recordedAt,
    o.checkedAt, o.supersedes, o.notes,
  ]),
);

// BOM so Excel opens UTF-8 names correctly without an import dialog.
const write = (file: string, header: string[], rows: string[]) => {
  const path = join(outDir, file);
  writeFileSync(path, "﻿" + [row(header), ...rows].join("\r\n") + "\r\n");
  console.log(`${path} — ${rows.length} rows, ${header.length} columns`);
};

write("autopilot-index-companies.csv", companyHeader, companyRows);
write("autopilot-index-observations.csv", observationHeader, observationRows);
