#!/usr/bin/env node
// Turns the dateCheck block that update-pulse.mjs writes into data/pulse.json
// into a pass/fail. The Pulse workflow runs it AFTER the data commit is pushed,
// so a failure never loses data; it only turns the run red, which alert.yml
// already converts into a GitHub issue (and closes again on the next green run).
//
// Fails when the Google News resolver is broken (self-test failed or the circuit
// breaker opened) or when the share of checked items that could be dated collapses.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const MIN_RESOLVED_RATIO = 0.35; // normal is ~0.7 once the cache is warm
export const MIN_SAMPLE = 20;
export const MIN_HOMEPAGE_SAMPLE = 10;

export function assessDateCheck(dc, { minRatio = MIN_RESOLVED_RATIO, minSample = MIN_SAMPLE } = {}) {
  if (!dc || typeof dc !== "object") return { ok: true, problems: [], note: "no dateCheck block (date check skipped this run)" };
  const problems = [];
  if (dc.lookupHealthy === false) problems.push(`Google News link resolver is unhealthy (${dc.breaker ?? "unknown reason"}); ${dc.lookupUnavailable ?? 0} items could not be dated this run`);
  const checked = (dc.candidates ?? 0) - (dc.deferred ?? 0) - (dc.lookupUnavailable ?? 0);
  const dated = (dc.verified ?? 0) + (dc.inferred ?? 0);
  if (checked >= minSample && dated / checked < minRatio) problems.push(`only ${dated} of ${checked} checked items could be dated (${Math.round((dated / checked) * 100)}%, floor ${Math.round(minRatio * 100)}%)`);
  if ((dc.homepageCandidates ?? 0) >= MIN_HOMEPAGE_SAMPLE && (dc.homepageShown ?? 0) / dc.homepageCandidates < minRatio / 2) problems.push(`homepage keeps only ${dc.homepageShown} of ${dc.homepageCandidates} eligible items`);
  return { ok: problems.length === 0, problems };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "pulse.json");
  const dc = JSON.parse(readFileSync(file, "utf8")).dateCheck;
  const r = assessDateCheck(dc);
  console.log(`dateCheck: ${JSON.stringify(dc ?? null)}`);
  if (r.note) console.log(r.note);
  for (const p of r.problems) console.log(`::error title=Pulse date check::${p}`);
  process.exitCode = r.ok ? 0 : 1;
}
