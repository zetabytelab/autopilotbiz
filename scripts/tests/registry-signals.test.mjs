import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildSignals, SIGNAL_LIMIT, SIGNAL_KINDS } from "../registry-signals.mjs";

const pulse = JSON.parse(fs.readFileSync(new URL("../../data/pulse.json", import.meta.url), "utf8"));

test("homepage signals take generatedAt from the real Pulse data", () => {
  const s = buildSignals(pulse);
  assert.equal(s.generatedAt, pulse.generatedAt);
  assert.ok(s.items.length > 0 && s.items.length <= SIGNAL_LIMIT);
});

test("every homepage signal is a real, linked, non-social Pulse item", () => {
  const byId = new Map(pulse.items.map((i) => [i.id, i]));
  for (const n of buildSignals(pulse).items) {
    const src = byId.get(n.id);
    assert.ok(src, "item exists in pulse.json");
    assert.equal(n.title, src.title);
    assert.equal(n.url, src.url);
    assert.equal(n.publishedAt, src.publishedAt);
    assert.ok(!src.social);
    assert.ok(SIGNAL_KINDS.includes(n.kind));
    assert.match(n.selection, /not independently confirmed/);
  }
});

test("homepage signals are not stale or in the future", () => {
  const end = Date.parse(pulse.generatedAt);
  for (const n of buildSignals(pulse).items) {
    const t = Date.parse(n.publishedAt);
    assert.ok(t <= end && t >= end - 14 * 864e5);
  }
});

test("a broken pulse file fails the build instead of shipping stale news", () => {
  assert.throws(() => buildSignals({}), /generatedAt/);
});
