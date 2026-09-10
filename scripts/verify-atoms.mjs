#!/usr/bin/env node
// Checks observations copied from the real Atoms product; never generates a product or browser results.
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

export const fixtureSet = JSON.parse(readFileSync(new URL("../docs/experiments/atoms/fixtures.json", import.meta.url), "utf8"));

export function observationTemplate() {
  return {
    fixtureVersion: fixtureSet.version,
    productUrl: null,
    artifactVersion: null,
    captureMethod: null,
    observations: fixtureSet.cases.map((fixture) => ({
      fixtureId: fixture.id,
      observedAt: null,
      evidenceRefs: [],
      inputs: { ...fixtureSet.defaultInputs, ...fixture.overrides },
      ...(fixture.invalid
        ? { validation: { inputRejected: null, visibleError: null, resultsSuppressed: null } }
        : { outputs: Object.fromEntries(Object.keys(fixture.expected).map((key) => [key, null])), breakEvenExplanation: null }),
    })),
  };
}

function recorded(value) { return typeof value === "string" && value.trim().length > 0; }

export function verifyObservations(record) {
  const errors = [];
  if (record?.fixtureVersion !== fixtureSet.version) errors.push("fixtureVersion does not match the frozen fixtures.");
  try {
    const url = new URL(record?.productUrl);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    if (url.hostname === "autopilotindex.com" && url.pathname.startsWith("/experiments/atoms")) throw new Error();
  } catch { errors.push("productUrl must be the actual HTTP(S) product, not the protocol page."); }
  for (const field of ["artifactVersion", "captureMethod"]) if (!recorded(record?.[field])) errors.push(`${field} is required.`);
  if (!Array.isArray(record?.observations)) return { status: "incomplete", errors: [...errors, "observations must be an array."], cases: [] };

  const known = new Set(fixtureSet.cases.map((item) => item.id));
  const seen = new Set();
  for (const observation of record.observations) {
    if (!known.has(observation?.fixtureId)) errors.push(`Unknown fixture: ${observation?.fixtureId}`);
    if (seen.has(observation?.fixtureId)) errors.push(`Duplicate fixture: ${observation?.fixtureId}; use a separate file per attempt.`);
    seen.add(observation?.fixtureId);
  }

  const cases = fixtureSet.cases.map((fixture) => {
    const observation = record.observations.find((entry) => entry?.fixtureId === fixture.id);
    if (!observation || observation.observedAt === null) return { fixtureId: fixture.id, status: "not_run", errors: [] };
    const problems = [];
    if (!recorded(observation.observedAt) || !Number.isFinite(Date.parse(observation.observedAt)) || !/(Z|[+-]\d\d:\d\d)$/.test(observation.observedAt)) problems.push("observedAt must include a valid timestamp and timezone.");
    if (!Array.isArray(observation.evidenceRefs) || observation.evidenceRefs.length === 0 || !observation.evidenceRefs.every(recorded)) problems.push("At least one captured evidence reference is required.");
    const inputs = { ...fixtureSet.defaultInputs, ...fixture.overrides };
    for (const [key, value] of Object.entries(inputs)) if (observation.inputs?.[key] !== value) problems.push(`Input ${key} differs from the fixture.`);

    if (fixture.invalid) {
      if (observation.validation?.inputRejected !== true) problems.push("Invalid input was not recorded as rejected.");
      if (!recorded(observation.validation?.visibleError)) problems.push("The actual visible validation message is required.");
      if (observation.validation?.resultsSuppressed !== true) problems.push("Results must not present invalid assumptions as a valid calculation.");
    } else {
      for (const [key, expected] of Object.entries(fixture.expected)) {
        const actual = observation.outputs?.[key];
        if (expected === null) {
          if (actual !== null) problems.push(`${key}: expected null, observed ${JSON.stringify(actual)}.`);
          if (!recorded(observation.breakEvenExplanation) || !/no break.?even/i.test(observation.breakEvenExplanation)) problems.push("The unavailable break-even result needs its actual explanation.");
        } else {
          const tolerance = key === "breakEvenCustomers" ? 0 : key === "humanHours" ? 0.000001 : 0.005000001;
          if (typeof actual !== "number" || !Number.isFinite(actual) || Math.abs(actual - expected) > tolerance) problems.push(`${key}: expected ${expected}, observed ${JSON.stringify(actual)}.`);
        }
      }
    }
    return { fixtureId: fixture.id, status: problems.length ? "fail" : "pass", errors: problems };
  });
  const status = errors.length || cases.some((item) => item.status === "fail") ? "fail" : cases.every((item) => item.status === "pass") ? "pass" : "incomplete";
  return { status, errors, cases, scope: "Compares recorded observations with numerical fixtures only. Does not authenticate captures or establish A5–A8, customer demand, revenue or autonomy." };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argument = process.argv[2];
  if (argument === "--template") console.log(JSON.stringify(observationTemplate(), null, 2));
  else if (!argument || process.argv.length !== 3) {
    console.error(`Usage: node ${fileURLToPath(import.meta.url)} --template | observations.json`);
    process.exitCode = 2;
  } else {
    try {
      const report = verifyObservations(JSON.parse(readFileSync(argument, "utf8")));
      console.log(JSON.stringify(report, null, 2));
      process.exitCode = report.status === "pass" ? 0 : report.status === "incomplete" ? 2 : 1;
    } catch (error) { console.error(`Cannot verify observations: ${error.message}`); process.exitCode = 2; }
  }
}
