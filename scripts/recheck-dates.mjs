#!/usr/bin/env node
// One-off, idempotent re-check of Google/Bing News dates already in
// data/pulse.json. Default is a DRY RUN: nothing under data/ is modified.
//
//   node scripts/recheck-dates.mjs                      # homepage-eligible items, last 14 days
//   node scripts/recheck-dates.mjs --scope=window       # every aggregator item in the 14-day window
//   node scripts/recheck-dates.mjs --limit=50           # cap lookups (sample)
//   node scripts/recheck-dates.mjs --report=out.json    # write a JSON report (outside data/)
//   node scripts/recheck-dates.mjs --write              # apply to pulse.json + date-cache.json
//
// Re-running with --write is a no-op once every item is stamped (cache hits).
import { readFileSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { normalizeCache, verifyDates, itemNeedsDateCheck } from "./pulse-dates.mjs";
import { buildSignals, SIGNAL_KINDS, SIGNAL_WINDOW_DAYS } from "./registry-signals.mjs";

const DAY = 864e5;
export const STALE_THRESHOLD_MS = 3 * DAY;

export async function recheck(pulse, cache, { scope = "homepage", limit = Infinity, now = Date.now(), fetchImpl = fetch, lookup, concurrency = 3 } = {}) {
  const end = Date.parse(pulse.generatedAt);
  const start = end - SIGNAL_WINDOW_DAYS * DAY;
  const inScope = (i) =>
    itemNeedsDateCheck(i) &&
    Date.parse(i.publishedAt) >= start &&
    (scope === "window" || SIGNAL_KINDS.includes(i.kind));
  const targets = pulse.items.filter(inScope);
  // verifyDates only touches aggregator items; hand it just the scoped ones
  // plus a lookup cap so a dry run can be a small sample.
  const ids = new Set(targets.map((i) => i.id));
  const subset = pulse.items.filter((i) => ids.has(i.id));
  const res = await verifyDates(subset, { cache, now, cap: limit, concurrency, fetchImpl, window: 365 * DAY, ...(lookup ? { lookup } : {}) });
  const byId = new Map(res.items.map((i) => [i.id, i]));
  const before = buildSignals(pulse).items;
  const wrong = [];
  const rows = [];
  for (const orig of subset) {
    const v = byId.get(orig.id);
    const entry = res.cache.entries[orig.id];
    const real = entry?.realDate ?? null;
    const diffDays = real ? (Date.parse(orig.publishedAt) - Date.parse(real)) / DAY : null;
    rows.push({ id: orig.id, title: orig.title, stated: orig.publishedAt, real, via: entry?.via ?? null, status: entry?.status ?? "not-checked", dateVerified: v.dateVerified });
  }
  const rowById = new Map(rows.map((r) => [r.id, r]));
  const homepage = before.map((s) => {
    const r = rowById.get(s.id);
    const diffMs = r?.real ? Date.parse(r.stated) - Date.parse(r.real) : null;
    return { id: s.id, title: s.title, stated: s.publishedAt, real: r?.real ?? null, status: r?.status ?? "trusted-source", staleDays: diffMs == null ? null : Math.round((diffMs / DAY) * 10) / 10, wrong: diffMs != null && diffMs > STALE_THRESHOLD_MS, unverified: r ? r.dateVerified === false : false };
  });
  for (const h of homepage) if (h.wrong) wrong.push(h);
  // What the homepage list would be after applying the corrections.
  const corrected = { ...pulse, items: pulse.items.map((i) => byId.get(i.id) ?? i) };
  const after = buildSignals(corrected).items;
  return { updatedItems: corrected.items, cache: res.cache, stats: res.stats, rows, homepage, wrongOnHomepage: wrong, homepageAfter: after.map((s) => ({ id: s.id, title: s.title, publishedAt: s.publishedAt })) };
}

const atomicWrite = (path, obj) => {
  writeFileSync(`${path}.tmp`, JSON.stringify(obj, null, 1));
  renameSync(`${path}.tmp`, path);
};

async function cli() {
  const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
  const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
  const pulsePath = join(dataDir, "pulse.json");
  const cachePath = join(dataDir, "date-cache.json");
  const pulse = JSON.parse(readFileSync(pulsePath, "utf8"));
  const cache = normalizeCache(existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : null);
  const out = await recheck(pulse, cache, { scope: args.scope ?? "homepage", limit: args.limit ? Number(args.limit) : Infinity });
  console.log(`checked ${out.stats.candidates} items: ${JSON.stringify(out.stats)}`);
  console.log(`homepage list now (${out.homepage.length}): ${out.wrongOnHomepage.length} with a real date >3 days older than stated`);
  for (const w of out.wrongOnHomepage) console.log(`  stated ${w.stated.slice(0, 10)} real ${w.real.slice(0, 10)} (${w.staleDays}d older)  ${w.title}`);
  if (args.report) writeFileSync(args.report, JSON.stringify({ generatedAt: pulse.generatedAt, stats: out.stats, homepage: out.homepage, rows: out.rows, homepageAfter: out.homepageAfter }, null, 1));
  if (args.write) {
    atomicWrite(pulsePath, { ...pulse, items: out.updatedItems });
    atomicWrite(cachePath, out.cache);
    console.log("wrote data/pulse.json and data/date-cache.json");
  } else console.log("dry run: nothing under data/ was modified (use --write to apply)");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  cli().catch((e) => {
    console.error("recheck failed:", e);
    process.exitCode = 1;
  });
}
