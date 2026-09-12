import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { companies } from "../../lib/data.ts";
import { financialObservations } from "../../lib/financial-observations.ts";
import { activeObservations, comparableValue, financialHistory, financialSummary, latestObservation, metricPerHuman } from "../../lib/financials.ts";

const financial = { id: "fixture-arr", slug: "fixture", kind: "arr", value: 1200, currency: "USD", precision: "exact", display: "$1,200", asOf: "2026-08-31", periodStart: null, periodEnd: null, scope: "fixture", population: null, status: "reported", source: { name: "Fixture source", url: "https://example.com" }, publishedAt: "2026-09-01", recordedAt: "2026-09-12", checkedAt: "2026-09-12", supersedes: null, notes: "Synthetic test observation" };
const headcount = { ...financial, id: "fixture-headcount", kind: "headcount", currency: null, value: 2, population: "employees_and_founders" };
const contractors = { ...headcount, id: "fixture-contractors", kind: "contractors", population: "contractors", value: 1 };

test("reviewed point values include zero but exclude estimates, bounds and projections", () => {
  assert.equal(comparableValue(financial), 1200);
  assert.equal(comparableValue({ ...financial, value: 0 }), 0);
  for (const overrides of [{ status: "estimated" }, { status: "disputed" }, { precision: "lower_bound" }, { precision: "range" }, { kind: "revenue_projection" }, { kind: "unclassified" }, { checkedAt: null }, { source: null }, { scope: null }, { asOf: null }, { value: null }, { value: NaN }, { value: Infinity }, { value: -1 }, { currency: null }]) {
    assert.equal(comparableValue({ ...financial, ...overrides }), null, JSON.stringify(overrides));
  }
});

test("ratio counts compatible disclosed contractors and handles zero revenue", () => {
  assert.equal(metricPerHuman(financial, headcount), 600);
  assert.equal(metricPerHuman(financial, headcount, contractors), 400);
  assert.equal(metricPerHuman({ ...financial, value: 0 }, headcount), 0);
});

test("ratio refuses incompatible dates, scope, population, unknowns and annual revenue", () => {
  for (const overrides of [{ asOf: "2025-08-31" }, { asOf: "2026-08" }, { asOf: null }, { scope: "parent-company" }, { population: "employees" }, { population: "team_unspecified" }, { precision: "approximate" }, { status: "disputed" }, { checkedAt: null }, { source: null }, { value: 0 }, { value: null }, { value: -2 }, { value: 1.5 }]) {
    assert.equal(metricPerHuman(financial, { ...headcount, ...overrides }), null, JSON.stringify(overrides));
  }
  assert.equal(metricPerHuman({ ...financial, kind: "revenue", periodStart: "2026-01-01", periodEnd: "2026-12-31" }, headcount), null);
  for (const overrides of [{ asOf: null }, { asOf: "2025-08-31" }, { scope: "parent-company" }, { value: -1 }, { value: null }, { source: null }, { checkedAt: null }, { status: "estimated" }]) {
    assert.equal(metricPerHuman(financial, headcount, { ...contractors, ...overrides }), null, JSON.stringify(overrides));
  }
});

test("baseline preserves every original company and every source-bearing legacy metric", () => {
  const baseline = JSON.parse(readFileSync(new URL("../../data/financial-baseline-2026-09-12.json", import.meta.url), "utf8"));
  assert.deepEqual(baseline.companies.map((entry) => entry.slug), companies.map((entry) => entry.slug));
  for (const { slug, metrics } of baseline.companies) {
    const history = financialHistory({ slug });
    if (metrics.arr) assert.ok(history.some((entry) => !["headcount", "contractors"].includes(entry.kind)), slug);
    if (metrics.humans !== null || metrics.sources?.humans) assert.ok(history.some((entry) => entry.kind === "headcount"), slug);
    if (metrics.disclosedContractors !== undefined) assert.ok(history.some((entry) => entry.kind === "contractors" && entry.value === metrics.disclosedContractors), slug);
  }
});

test("ledger corrections preserve predecessors and have valid source/date provenance", () => {
  const ids = new Set(financialObservations.map((entry) => entry.id));
  assert.equal(ids.size, financialObservations.length);
  const seen = new Map();
  const slugs = new Set(companies.map((entry) => entry.slug));
  for (const entry of financialObservations) {
    assert.ok(slugs.has(entry.slug));
    assert.ok(entry.value === null || (Number.isFinite(entry.value) && entry.value >= 0));
    if (entry.source) assert.equal(new URL(entry.source.url).protocol, "https:");
    for (const field of ["asOf", "publishedAt", "recordedAt", "checkedAt", "periodStart", "periodEnd"]) {
      if (entry[field]) assert.match(entry[field], /^\d{4}(-\d{2})?(-\d{2})?$/);
    }
    if (entry.id.includes("-import-")) assert.equal(entry.checkedAt, null);
    if (entry.checkedAt) assert.ok(entry.source);
    if (entry.supersedes) {
      assert.ok(seen.has(entry.supersedes));
      assert.equal(seen.get(entry.supersedes).slug, entry.slug);
      assert.ok(!activeObservations(financialHistory(entry)).some((old) => old.id === entry.supersedes));
    }
    seen.set(entry.id, entry);
  }
});

test("Base44 scopes, Polsia run rate, Gamma correction and Medvi projection stay distinct", () => {
  const base = { slug: "base44" }, polsia = { slug: "polsia" }, gamma = { slug: "gamma" }, medvi = { slug: "medvi" };
  assert.equal(latestObservation(base, "arr").value, 150e6);
  assert.equal(metricPerHuman(latestObservation(base, "arr"), latestObservation(base, "headcount")), null);
  assert.equal(latestObservation(polsia, "arr"), null);
  assert.equal(comparableValue(latestObservation(polsia, "annual_run_rate")), null);
  assert.equal(latestObservation(gamma, "headcount").value, 50);
  assert.ok(financialHistory(gamma).some((entry) => entry.kind === "headcount" && entry.value === 52));
  assert.equal(comparableValue(latestObservation(gamma, "arr")), null);
  assert.equal(financialSummary(medvi).value, 401e6);
  assert.equal(latestObservation(medvi, "revenue_projection").value, 1.8e9);
  assert.equal(latestObservation(medvi, "headcount").asOf, null);
});
