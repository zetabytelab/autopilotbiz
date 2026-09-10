import test from "node:test";
import assert from "node:assert/strict";
import { fixtureSet, observationTemplate, verifyObservations } from "../verify-atoms.mjs";

// Synthetic records test the verifier itself. They are never written to the experiment ledger.
function syntheticRecord() {
  const record = observationTemplate();
  record.productUrl = "https://example.test/fixture-only";
  record.artifactVersion = "synthetic verifier test; not an Atoms run";
  record.captureMethod = "synthetic verifier test";
  record.observations.forEach((observation, index) => {
    const fixture = fixtureSet.cases[index];
    observation.observedAt = "2026-09-10T00:00:00Z";
    observation.evidenceRefs = ["synthetic-test-only"];
    if (fixture.invalid) observation.validation = { inputRejected: true, visibleError: "Enter a valid value", resultsSuppressed: true };
    else {
      observation.outputs = { ...fixture.expected };
      observation.breakEvenExplanation = fixture.expected.breakEvenCustomers === null ? "No break-even at these assumptions" : null;
    }
  });
  return record;
}

test("an empty template cannot pass as a completed experiment", () => {
  const report = verifyObservations(observationTemplate());
  assert.notEqual(report.status, "pass");
  assert.ok(report.cases.every((entry) => entry.status === "not_run"));
});

test("verifier accepts complete matching synthetic observations", () => {
  assert.equal(verifyObservations(syntheticRecord()).status, "pass");
});

test("wrong break-even, monetary result, units, or missing evidence fail", () => {
  for (const mutate of [
    (record) => { record.observations[0].outputs.breakEvenCustomers = 1; },
    (record) => { record.observations[0].outputs.economicSurplus = 124; },
    (record) => { record.observations[0].outputs.humanHours = 270; },
    (record) => { record.observations[0].evidenceRefs = []; },
    (record) => { record.observations[0].outputs.revenue = "200"; },
    (record) => { record.observations[0].inputs.customers = 11; },
  ]) {
    const record = syntheticRecord(); mutate(record);
    assert.equal(verifyObservations(record).status, "fail");
  }
});

test("unavailable break-even requires null plus an observed explanation", () => {
  const record = syntheticRecord();
  record.observations.find((entry) => entry.fixtureId === "zero-contribution").breakEvenExplanation = null;
  assert.equal(verifyObservations(record).status, "fail");
});

test("invalid input without an error, stale results, or duplicate capture fails", () => {
  for (const mutate of [
    (record) => { record.observations.at(-1).validation.visibleError = ""; },
    (record) => { record.observations.at(-1).validation.resultsSuppressed = false; },
    (record) => { record.observations.push(record.observations[0]); },
    (record) => { record.productUrl = "https://autopilotindex.com/experiments/atoms"; },
  ]) {
    const record = syntheticRecord(); mutate(record);
    assert.equal(verifyObservations(record).status, "fail");
  }
});

test("partial runs remain incomplete and cannot be counted as full acceptance", () => {
  const record = syntheticRecord(); record.observations = record.observations.slice(0, 1);
  const report = verifyObservations(record);
  assert.equal(report.status, "incomplete");
  assert.equal(report.cases.filter((entry) => entry.status === "pass").length, 1);
});
