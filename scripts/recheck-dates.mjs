#!/usr/bin/env node
// Re-check Google/Bing News dates already in data/pulse.json. Default is a DRY
// RUN: nothing under data/ is modified. Also the one-off catch-up used after the
// date check first lands (see the dates_catchup input in .github/workflows/pulse.yml).
//
//   node scripts/recheck-dates.mjs                      # homepage-eligible items, last 14 days
//   node scripts/recheck-dates.mjs --scope=window       # every aggregator item in the 14-day window
//   node scripts/recheck-dates.mjs --scope=all          # every aggregator item kept in the feed (30 days)
//   node scripts/recheck-dates.mjs --limit=50           # cap lookups (sample)
//   node scripts/recheck-dates.mjs --budget=600000      # stop starting lookups after this many ms
//   node scripts/recheck-dates.mjs --wayback            # also ask the Internet Archive (stale proof only)
//   node scripts/recheck-dates.mjs --report=out.json    # write a JSON report (outside data/)
//   node scripts/recheck-dates.mjs --write              # apply to pulse.json + date-cache.json
//
// Re-running with --write is a no-op once every item is stamped (cache hits).
import { readFileSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { normalizeCache, verifyDates, itemNeedsDateCheck, evidenceOf, dateCheckMeta } from "./pulse-dates.mjs";
import { buildSignals, SIGNAL_KINDS, SIGNAL_WINDOW_DAYS } from "./registry-signals.mjs";

const DAY = 864e5;
export const STALE_THRESHOLD_MS = 3 * DAY;
const RETENTION_DAYS = 30; // update-pulse.mjs MAX_AGE_DAYS

export async function recheck(pulse, cache, { scope = "homepage", limit, now = Date.now(), budgetMs, wayback = false, lookup, concurrency = 3, ...rest } = {}) {
  const end = Date.parse(pulse.generatedAt);
  const start = end - (scope === "all" ? RETENTION_DAYS : SIGNAL_WINDOW_DAYS) * DAY;
  const inScope = (i) => itemNeedsDateCheck(i) && Date.parse(i.publishedAt) >= start && (scope !== "homepage" || SIGNAL_KINDS.includes(i.kind));
  const subset = pulse.items.filter(inScope);
  const res = await verifyDates(subset, {
    cache, now, cap: limit, catchupCap: limit ?? 100_000, baseCap: limit ?? 100_000, concurrency, window: 365 * DAY, wayback,
    ...(budgetMs ? { budgetMs } : {}), ...(lookup ? { lookup } : {}), ...rest,
  });
  const byId = new Map(res.items.map((i) => [i.id, i]));
  const before = buildSignals(pulse).items;
  const rows = subset.map((orig) => {
    const v = byId.get(orig.id);
    const entry = res.cache.entries[orig.id];
    const ev = evidenceOf(entry);
    const real = entry?.realDate ?? null;
    return { id: orig.id, title: orig.title, stated: orig.publishedAt, real, via: entry?.via ?? null, status: entry?.status ?? "not-checked", evidenceKinds: ev.map((e) => e.kind), dateVerified: v.dateVerified, dateEvidence: v.dateEvidence ?? null, publishedAt: v.publishedAt };
  });
  const rowById = new Map(rows.map((r) => [r.id, r]));
  const homepage = before.map((s) => {
    const r = rowById.get(s.id);
    // "real" is the best publish date we found, or the corrected publishedAt.
    const real = r?.real ?? (r && r.publishedAt !== r.stated ? r.publishedAt : null);
    const diffMs = real ? Date.parse(r.stated) - Date.parse(real) : null;
    const wrong = diffMs != null && diffMs > STALE_THRESHOLD_MS;
    const outcome = !r ? "trusted-source" : r.dateVerified === true ? "verified" : r.dateVerified === "inferred" ? "inferred" : "hidden";
    return { id: s.id, title: s.title, stated: s.publishedAt, real, status: r?.status ?? "trusted-source", staleDays: diffMs == null ? null : Math.round((diffMs / DAY) * 10) / 10, wrong, unverified: r ? r.dateVerified === false : false, outcome, dateEvidence: r?.dateEvidence ?? null };
  });
  const wrong = homepage.filter((h) => h.wrong);
  const corrected = { ...pulse, items: pulse.items.map((i) => byId.get(i.id) ?? i) };
  const after = buildSignals(corrected).items;
  const tierById = new Map(res.items.map((i) => [i.id, i]));
  return {
    updatedItems: corrected.items, cache: res.cache, stats: res.stats, rows, homepage, wrongOnHomepage: wrong,
    homepageAfter: after.map((s) => ({ id: s.id, title: s.title, publishedAt: s.publishedAt, dateVerified: tierById.get(s.id)?.dateVerified ?? "trusted-source", dateEvidence: tierById.get(s.id)?.dateEvidence ?? null })),
  };
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
  const out = await recheck(pulse, cache, {
    scope: args.scope ?? "homepage", limit: args.limit ? Number(args.limit) : undefined, budgetMs: args.budget ? Number(args.budget) : undefined,
    wayback: !!args.wayback, selfTest: true,
  });
  console.log(`checked ${out.stats.candidates} items: ${JSON.stringify(out.stats)}`);
  const tally = {};
  for (const h of out.homepage) tally[h.outcome] = (tally[h.outcome] ?? 0) + 1;
  console.log(`homepage list before (${out.homepage.length}): ${JSON.stringify(tally)}; ${out.wrongOnHomepage.length} with a real date >3 days older than stated`);
  for (const w of out.wrongOnHomepage) console.log(`  stated ${w.stated.slice(0, 10)} real ${w.real.slice(0, 10)} (${w.staleDays}d older)  ${w.title}`);
  if (args.report) writeFileSync(args.report, JSON.stringify({ generatedAt: pulse.generatedAt, stats: out.stats, homepage: out.homepage, rows: out.rows, homepageAfter: out.homepageAfter }, null, 1));
  if (args.write) {
    const cutoff = Date.parse(pulse.generatedAt) - RETENTION_DAYS * DAY;
    const items = out.updatedItems.filter((i) => Date.parse(i.publishedAt) >= cutoff);
    atomicWrite(pulsePath, { ...pulse, dateCheck: dateCheckMeta(out.stats), items });
    atomicWrite(cachePath, out.cache);
    console.log(`wrote data/pulse.json (${pulse.items.length - items.length} corrected-to-old items dropped) and data/date-cache.json`);
  } else console.log("dry run: nothing under data/ was modified (use --write to apply)");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  cli().catch((e) => {
    console.error("recheck failed:", e);
    process.exitCode = 1;
  });
}
