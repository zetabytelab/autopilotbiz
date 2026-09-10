import test from "node:test";
import assert from "node:assert/strict";
import { canonicalUrl, draftCandidates, renderDraft } from "../draft-pulse-digest.mjs";

const asOf = "2026-09-10T12:00:00Z";
const item = (id, overrides = {}) => ({ id, title: `A substantive product change with enough detail to distinguish it ${id}`, url: `https://example.test/${id}`, publishedAt: "2026-09-09T12:00:00Z", companySlug: "atoms", kind: "product", sources: [], ...overrides });

test("canonicalization removes tracking but preserves meaningful query parameters", () => {
  assert.equal(canonicalUrl("http://www.twitter.com/person/status/123/?utm_source=x#fragment"), "https://x.com/person/status/123");
  assert.equal(canonicalUrl("https://example.test/article?id=2&utm_campaign=test"), "https://example.test/article?id=2");
  assert.equal(canonicalUrl("javascript:alert(1)"), null);
});

test("draft groups URL/title duplicates while retaining provenance", () => {
  const a = item("a");
  const b = item("b", { url: "https://example.test/a?utm_source=social", title: "Different collected headline", sources: [{ id: "hn", url: "https://news.ycombinator.com/item?id=1" }] });
  const c = item("c", { title: b.title });
  const packet = draftCandidates({ items: [a, b, c] }, { asOf });
  assert.equal(packet.counts.excluded.duplicates, 1);
  assert.equal(packet.candidates.length, 2);
  assert.ok(packet.candidates.some((entry) => entry.sourceRefs.some((source) => source.collectorSource === "hn")));
  assert.ok(packet.candidates.every((entry) => entry.verifiedChange === null && entry.businessImplication === null && entry.reviewStatus === "unreviewed"));
});

test("window rejects invalid, stale and future rows and applies entity diversity", () => {
  const rows = [item("old", { publishedAt: "2026-01-01" }), item("future", { publishedAt: "2026-10-01" }), item("bad", { url: "file:///secret" }), item("a"), item("b"), item("c", { companySlug: "nanocorp" })];
  const packet = draftCandidates({ items: rows }, { asOf, perEntity: 1 });
  assert.equal(packet.candidates.length, 2);
  assert.deepEqual(packet.counts.excluded, { invalid: 1, outsideWindow: 1, future: 1, duplicates: 0, entityCap: 1, candidateLimit: 0 });
  assert.equal(packet.status, "draft-only");
});

test("long identical titles merge only within the same company", () => {
  const title = "An announcement containing sufficient exact detail to be deduplicated across collected sources";
  const packet = draftCandidates({ items: [item("a", { title }), item("b", { title }), item("c", { title, companySlug: "other" })] }, { asOf });
  assert.equal(packet.candidates.length, 2);
  assert.equal(packet.counts.excluded.duplicates, 1);
});

test("stale or undated empty feeds cannot imply that nothing changed", () => {
  for (const generatedAt of ["2026-09-01T00:00:00Z", "invalid", undefined]) {
    const packet = draftCandidates({ generatedAt, items: [] }, { asOf });
    assert.notEqual(packet.inputFreshness, "recent");
    assert.ok(packet.warnings.some((warning) => /does not mean nothing changed/.test(warning)));
    assert.match(renderDraft(packet), /does not mean nothing changed/);
  }
});

test("recent and future snapshots are distinguished", () => {
  assert.equal(draftCandidates({ generatedAt: "2026-09-09T12:00:00Z", items: [] }, { asOf }).inputFreshness, "recent");
  assert.equal(draftCandidates({ generatedAt: "2026-09-11T12:00:00Z", items: [] }, { asOf }).inputFreshness, "future-dated");
});
