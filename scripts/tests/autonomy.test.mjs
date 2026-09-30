import test from "node:test";
import assert from "node:assert/strict";
import { companies } from "../../lib/data.ts";
import {
  comparableFundingUsd,
  compareCompanies,
  compareEvidenceThenAutonomy,
  getAutonomyAssessment,
  indexLevelCounts,
  reportedAnnualFigurePerHuman,
} from "../../lib/autonomy.ts";

function company(name, autopilot, metrics = {}) {
  return {
    ...companies[0],
    name,
    slug: name.toLowerCase(),
    autopilot,
    metrics: { ...companies[0].metrics, ...metrics },
  };
}

test("strong financial evidence ranks ahead of a higher unsupported autonomy claim", () => {
  const claimed = company("Claimed", { section: "watchlist", evidence: "D", level: "L4" }, { arrUsd: 1e9 });
  const reviewed = company("Reviewed", { section: "index", evidence: "A", level: "L2" }, { arrUsd: 1 });
  assert.deepEqual([claimed, reviewed].sort(compareEvidenceThenAutonomy).map((entry) => entry.name), ["Reviewed", "Claimed"]);
});

test("autonomy breaks evidence ties, while missing grades and levels sort last", () => {
  const records = [
    company("Ungraded", { section: "watchlist", level: "L5" }),
    company("UnknownLevel", { section: "index", evidence: "C" }),
    company("Function", { section: "index", evidence: "C", level: "L2" }),
    company("Operational", { section: "index", evidence: "C", level: "L3" }),
    company("Unclassified", undefined),
  ];
  assert.deepEqual(records.sort(compareEvidenceThenAutonomy).map((entry) => entry.name), ["Operational", "Function", "UnknownLevel", "Ungraded", "Unclassified"]);
});

test("company verification never promotes evidence or certifies autonomy", () => {
  const entry = company("Verified", { section: "watchlist", evidence: "D", level: "L4" });
  assert.deepEqual(getAutonomyAssessment({ ...entry, verified: true }), getAutonomyAssessment({ ...entry, verified: false }));
  assert.match(getAutonomyAssessment(entry).qualification, /Claimed capability/);
  assert.match(getAutonomyAssessment(company("Missing", undefined)).levelLabel, /Not assessed/);
});

test("legacy mixed figures cannot rank or produce per-person ratios", () => {
  const base44 = companies.find((entry) => entry.slug === "base44");
  const medvi = companies.find((entry) => entry.slug === "medvi");
  const records = [medvi, base44];
  assert.deepEqual(records.sort((a, b) => compareCompanies(a, b, "annual")).map((entry) => entry.slug), ["base44", "medvi"]);
  assert.equal(reportedAnnualFigurePerHuman(base44), null);
  assert.equal(reportedAnnualFigurePerHuman(medvi, "revenue"), null);
  assert.equal(reportedAnnualFigurePerHuman(company("ZeroHuman", undefined, { humans: 0 })), null);
  assert.equal(reportedAnnualFigurePerHuman(company("MissingHuman", undefined, { humans: null })), null);
  assert.equal(reportedAnnualFigurePerHuman(company("Unreviewed", undefined, { humans: 1, arrUsd: 1e9 })), null);
});

test("funding comparison rejects currencies, ranges, and parent-company annotations", () => {
  assert.equal(comparableFundingUsd("$31M"), 31e6);
  assert.equal(comparableFundingUsd("~$1.5B"), 1.5e9);
  for (const value of [null, "€1.7M", "$1.7M (parent pre-seed)", "$5–10M", "Undisclosed"]) {
    assert.equal(comparableFundingUsd(value), null, String(value));
  }
});

test("live Index default uses the existing grades without inventing ratings", () => {
  const indexed = companies.filter((entry) => entry.autopilot?.section === "index").sort(compareEvidenceThenAutonomy);
  assert.ok(indexed.length > 0);
  assert.equal(indexed[0].slug, "medvi");
  assert.equal(indexed[0].autopilot.evidence, "A");
  assert.ok(indexed.every((entry) => entry.autopilot.section === "index"));
});

test("level counts include Index rows only, so a watchlist claim leaves its level vacant", () => {
  const records = [
    company("Indexed", { section: "index", evidence: "C", level: "L3" }),
    company("Claimer", { section: "watchlist", evidence: "D", level: "L4" }),
    company("Tool", { section: "enabler", level: "L2" }),
    company("Cautioned", { section: "caution", level: "L3" }),
  ];
  assert.deepEqual(indexLevelCounts(records), { L2: 0, L3: 1, L4: 0, L5: 0 });
});

test("the live data keeps L4 and L5 vacant and labels Egbe's L4 as an unverified claim", () => {
  const counts = indexLevelCounts(companies);
  assert.equal(counts.L4, 0);
  assert.equal(counts.L5, 0);
  const egbe = companies.find((entry) => entry.slug === "egbe");
  assert.equal(egbe?.autopilot?.section, "watchlist");
  assert.equal(getAutonomyAssessment(egbe).levelLabel, "Claims L4, unverified");
  const indexed = companies.find((entry) => entry.autopilot?.section === "index" && entry.autopilot.level);
  assert.match(getAutonomyAssessment(indexed).levelLabel, /^L\d · /);
});
