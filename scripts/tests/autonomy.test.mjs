import test from "node:test";
import assert from "node:assert/strict";
import { companies } from "../../lib/data.ts";
import {
  comparableFundingUsd,
  compareCompanies,
  compareEvidenceThenAutonomy,
  getAutonomyAssessment,
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

test("financial sorting leaves missing values last and does not treat zero as missing", () => {
  const records = [company("Unknown", undefined, { arrUsd: null }), company("Zero", undefined, { arrUsd: 0 }), company("Known", undefined, { arrUsd: 20 })];
  assert.deepEqual(records.sort((a, b) => compareCompanies(a, b, "annual")).map((entry) => entry.name), ["Known", "Zero", "Unknown"]);
  assert.equal(reportedAnnualFigurePerHuman(company("ZeroHuman", undefined, { humans: 0 })), null);
  assert.equal(reportedAnnualFigurePerHuman(company("MissingHuman", undefined, { humans: null })), null);
  assert.equal(reportedAnnualFigurePerHuman(company("ZeroRevenue", undefined, { humans: 1, arrUsd: 0 })), 0);
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
