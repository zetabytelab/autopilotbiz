import test from "node:test";
import assert from "node:assert/strict";
import {
  candidateRejectionReason,
  extractCandidateName,
  titleSimilarity,
  scoreCandidate,
} from "../update-pulse.mjs";

// The eight headlines below are the real 11 September 2026 run, in which one
// Adobe acquisition produced eight separate candidates because grouping keyed
// on the publisher domain.
const RILO = [
  "Adobe just acquired this Indian AI startup less than a year after it launched",
  "Adobe acquires Peak XV-backed Indian AI startup Rilo to expand agentic marketing capabilities",
  "Adobe Buys Peak XV-Backed AI Startup Rilo in Second India Acquisition",
  "Adobe acquires Indian AI automation startup Rilo to boost agentic push",
  "Adobe acquires Indian AI startup Rilo to expand agentic AI push",
  "Adobe acquires Peak XV-backed Indian AI marketing startup Rilo",
  "Adobe Buys Indian AI Startup Rilo To Expand Agentic Push",
  "Adobe acquires Indian AI startup Rilo",
];

test("names the acquired company, not the buyer", () => {
  for (const title of RILO.slice(1)) {
    assert.equal(extractCandidateName(title), "Rilo", title);
  }
});

test("survives Title Case headlines without swallowing the next clause", () => {
  assert.equal(extractCandidateName("Adobe Buys Indian AI Startup Rilo To Expand Agentic Push"), "Rilo");
});

test("keeps a name whose second word is AI", () => {
  assert.equal(extractCandidateName("MAGIC AI Revenue 2025: $4.1M Est. ARR, $8.6M Raised"), "MAGIC AI");
});

test("reads names from mid-sentence, leading verbs and bare domains", () => {
  assert.equal(
    extractCandidateName("AI research startup Listen Labs scrubbed a $1.5B funding round for Salesforce talks"),
    "Listen Labs",
  );
  assert.equal(extractCandidateName("Paystand Brings AI 'Digital Employees' to B2B Finance"), "Paystand");
  assert.equal(extractCandidateName("Phony.ai Launches Provider-Neutral AI Phone and Voice Agent Platform"), "Phony.ai");
});

test("does not invent a name where the headline gives none", () => {
  assert.equal(extractCandidateName("This startup wants to build the first one-person unicorn using AI"), null);
  assert.equal(extractCandidateName(RILO[0]), null);
});

test("the unnamed Adobe headline is similar enough to merge into Rilo", () => {
  assert.ok(titleSimilarity(RILO[0], RILO[7]) >= 0.5);
  assert.ok(titleSimilarity(RILO[0], "Phony.ai Launches Provider-Neutral AI Phone Platform") < 0.5);
});

test("rejects headlines that are not about a company", () => {
  const cases = {
    "7 AI Tools that Could Power a Solo Business in 2027": "listicle",
    "How AI Agent Sandboxing Actually Works and Where Startups Cut Corners": "explainer",
    "YC is betting on robotics and physical AI startups": "trend-piece",
    "I made an AI pre-mortem that tries to kill startup ideas before you build them": "self-promotion",
  };
  for (const [title, reason] of Object.entries(cases)) {
    assert.equal(candidateRejectionReason(title), reason, title);
  }
});

test("keeps real company headlines", () => {
  for (const title of [...RILO, "Paystand Brings AI 'Digital Employees' to B2B Finance"]) {
    assert.equal(candidateRejectionReason(title), null, title);
  }
});

test("scores rank thesis and corroboration above bare mentions", () => {
  const pub = (n) => Array.from({ length: n }, (_, i) => ({ title: RILO[i], domain: `p${i}.com`, source: "gnews" }));
  const corroborated = scoreCandidate({ name: "Rilo", evidence: pub(7) });
  const single = scoreCandidate({ name: "Phony.ai", evidence: [{ title: RILO[7], domain: "p.com", source: "gnews" }] });
  const thesis = scoreCandidate({
    name: null,
    evidence: [{ title: "This startup wants to build the first one-person unicorn using AI", domain: "p.com", source: "gnews" }],
  });
  assert.ok(corroborated.score > single.score);
  assert.ok(thesis.score > 0);
  assert.ok(corroborated.reasons.includes("7 publishers"));
  assert.ok(thesis.reasons.includes("autonomy thesis"));
  // score must discriminate — the old generator gave every candidate 0.5
  assert.equal(new Set([corroborated.score, single.score, thesis.score]).size, 3);
});

// --- publisher URL resolution ---------------------------------------------
// Google News links are opaque redirectors, so a reviewer clicking one from the
// watchlist lands on Google's consent wall rather than the article.
import { resolvePublisherUrl } from "../update-pulse.mjs";

const GNEWS = "https://news.google.com/rss/articles/CBMiabc123?oc=5";
const fakeFetch = (finalUrl) => async () => ({ url: finalUrl });

test("leaves a publisher URL untouched", async () => {
  const direct = "https://techcrunch.com/2026/09/09/listen-labs/";
  assert.equal(await resolvePublisherUrl(direct, { fetchImpl: fakeFetch("https://evil.example/") }), direct);
});

test("resolves a Google News link to the publisher it lands on", async () => {
  assert.equal(
    await resolvePublisherUrl(GNEWS, { fetchImpl: fakeFetch("https://www.fastcompany.com/91/ai-employees") }),
    "https://www.fastcompany.com/91/ai-employees",
  );
});

test("keeps the original when the hop stays inside Google or fails", async () => {
  const consent = "https://consent.google.com/m?continue=https://news.google.com/rss/articles/CBMiabc123";
  assert.equal(await resolvePublisherUrl(GNEWS, { fetchImpl: fakeFetch(consent) }), GNEWS);
  assert.equal(await resolvePublisherUrl(GNEWS, { fetchImpl: async () => { throw new Error("network"); } }), GNEWS);
});
