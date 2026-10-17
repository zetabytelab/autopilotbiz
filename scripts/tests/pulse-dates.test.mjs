import test from "node:test";
import assert from "node:assert/strict";
import {
  extractPublishedDate, decideDate, decodeLegacyGoogleToken, googleToken, bingTarget, dateFromUrlPath,
  itemNeedsDateCheck, verifyDates, cacheAction, normalizeCache, resolveAggregatorUrl, RETRY_AFTER_MS,
  decideFromEvidence, createContext, politeFetch, parseRetryAfter, backoffMs, selfTestResolver, lookupRealDate, lookupCap,
  parseFeedEntries, feedDateFor, waybackFirstCapture, dateCheckMeta, evidenceOf, isTransientError, BREAKER_CONSECUTIVE, SELF_TEST_URL, UA, UA_COMPAT, fetchPageHtml,
} from "../pulse-dates.mjs";
import { assessDateCheck } from "../check-date-health.mjs";
import { recheck } from "../recheck-dates.mjs";
import { buildSignals } from "../registry-signals.mjs";

const NOW = Date.parse("2026-10-16T12:00:00Z");
const gnews = (over = {}) => ({
  id: "a1", title: "Story", url: "https://news.google.com/rss/articles/CBMiXXXX?oc=5", domain: "x.com",
  publishedAt: "2026-10-14T06:16:45.000Z", kind: "funding", baseScore: 2, sources: [{ id: "gnews" }], ...over,
});

test("extracts datePublished from JSON-LD, including @graph and arrays", () => {
  const html = `<html><head><script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebSite"},{"@type":"NewsArticle","datePublished":"2025-05-15T09:00:00+00:00"}]}</script></head></html>`;
  assert.deepEqual(extractPublishedDate(html, NOW), { date: "2025-05-15T09:00:00.000Z", via: "json-ld" });
  const arr = `<script type='application/ld+json'>[{"@type":"Organization"},{"@type":"Article","datePublished":"2024-01-02"}]</script>`;
  assert.equal(extractPublishedDate(arr, NOW).date, "2024-01-02T00:00:00.000Z");
});

test("falls back to meta tags then <time datetime>; ignores junk and future dates", () => {
  assert.deepEqual(extractPublishedDate(`<meta property="article:published_time" content="2025-05-15T10:00:00Z">`, NOW), { date: "2025-05-15T10:00:00.000Z", via: "meta:article:published_time" });
  assert.equal(extractPublishedDate(`<meta content='2025-03-01' property='og:published_time'>`, NOW).via, "meta:og:published_time");
  assert.equal(extractPublishedDate(`<body><time datetime="2025-02-03T00:00:00Z">x</time></body>`, NOW).via, "time-tag");
  assert.equal(extractPublishedDate(`<meta property="article:published_time" content="not a date">`, NOW), null);
  assert.equal(extractPublishedDate(`<meta property="article:published_time" content="2031-01-01">`, NOW), null);
  assert.equal(extractPublishedDate(`<script type="application/ld+json">{broken</script>`, NOW), null);
  assert.equal(extractPublishedDate("", NOW), null);
});

test("date decision: real date >48h older than the RSS date wins, otherwise the RSS date stays", () => {
  const item = gnews();
  const old = decideDate(item, { date: "2025-05-15T00:00:00.000Z", via: "json-ld" });
  assert.equal(old.publishedAt, "2025-05-15T00:00:00.000Z");
  assert.equal(old.rssPublishedAt, "2026-10-14T06:16:45.000Z");
  assert.equal(old.dateVerified, true);
  const close = decideDate(item, { date: "2026-10-13T06:00:00.000Z", via: "json-ld" }); // 24h older: within tolerance
  assert.equal(close.publishedAt, item.publishedAt);
  assert.equal(close.dateVerified, true);
  assert.equal(close.rssPublishedAt, undefined);
  const later = decideDate(item, { date: "2026-10-15T00:00:00.000Z", via: "json-ld" });
  assert.equal(later.publishedAt, item.publishedAt);
  const none = decideDate(item, null);
  assert.equal(none.dateVerified, false);
  assert.equal(none.publishedAt, item.publishedAt);
});

test("a URL-path date proves a story older, and only 'infers' fresh when it agrees with the aggregator date", () => {
  assert.equal(dateFromUrlPath("https://x.com/2025/05/15/foo"), "2025-05-15T00:00:00.000Z");
  assert.equal(dateFromUrlPath("https://x.com/foo"), null);
  const old = decideDate(gnews(), { date: "2025-05-15T00:00:00.000Z", via: "url-path" });
  assert.equal(old.publishedAt, "2025-05-15T00:00:00.000Z");
  assert.equal(old.dateVerified, "inferred");
  const agree = decideDate(gnews(), { date: "2026-10-14T00:00:00.000Z", via: "url-path" });
  assert.equal(agree.dateVerified, "inferred");
  assert.equal(agree.dateEvidence, "url-path");
  assert.equal(agree.publishedAt, gnews().publishedAt);
});

test("URL date patterns seen on real publishers; month-only and junk paths give nothing", () => {
  const cases = {
    "https://www.reuters.com/legal/transactional/why-coreweave-s-troubles-2026-10-15/": "2026-10-15",
    "https://www.cnbc.com/2026/10/14/coreweave-put-options-ai-trade.html": "2026-10-14",
    "https://www.businesswire.com/news/home/20261006266441/en/Gamma-Launches": "2026-10-06",
    "https://www.digitimes.com/news/a20261005PD205/anthropic.html": "2026-10-05",
    "https://www.bloomberg.com/news/articles/2026-10-07/video-game": "2026-10-07",
  };
  for (const [u, d] of Object.entries(cases)) assert.equal(dateFromUrlPath(u, NOW)?.slice(0, 10), d, u);
  assert.equal(dateFromUrlPath("https://hedgeco.net/news/10/2026/story.html", NOW), null);
  assert.equal(dateFromUrlPath("https://x.com/p/20269999/story", NOW), null);
  assert.equal(dateFromUrlPath("https://x.com/2031/01/01/future", NOW), null, "future dates are junk");
  assert.equal(dateFromUrlPath("not a url"), null);
});

test("evidence policy: stale proof beats everything; silence is never freshness", () => {
  const item = gnews();
  const S = (kind, date, via, strong) => ({ kind, date, via, strong });
  // strong + fresh → true
  assert.equal(decideFromEvidence(item, [S("page", "2026-10-14T05:00:00Z", "json-ld", true)]).dateVerified, true);
  // feed (publisher's own feed) counts as strong
  assert.equal(decideFromEvidence(item, [S("feed", "2026-10-14T05:00:00Z", "feed", true)]).dateEvidence, "feed");
  // strong but old → corrected, true
  const old = decideFromEvidence(item, [S("page", "2025-05-15T00:00:00Z", "json-ld", true)]);
  assert.equal(old.publishedAt, "2025-05-15T00:00:00.000Z");
  assert.equal(old.dateVerified, true);
  assert.equal(old.rssPublishedAt, item.publishedAt);
  // weak agreeing → inferred; weak far BEFORE the aggregator date is stale evidence
  assert.equal(decideFromEvidence(item, [S("url", "2026-10-14T00:00:00Z", "url-path", false)]).dateVerified, "inferred");
  assert.equal(decideFromEvidence(item, [S("page", "2026-10-13T08:00:00Z", "time-tag", false)]).dateVerified, "inferred");
  // weak date AFTER the aggregator date disagrees → hidden
  assert.equal(decideFromEvidence(item, [S("url", "2026-10-16T00:00:00Z", "url-path", false)]).dateVerified, false);
  // Wayback alone can only prove old: hidden, publishedAt moves to the capture
  const wb = decideFromEvidence(item, [S("wayback", "2023-04-17T16:57:00Z", "wayback-first-capture", false)]);
  assert.deepEqual([wb.dateVerified, wb.dateEvidence, wb.publishedAt], [false, "wayback-first-capture", "2023-04-17T16:57:00.000Z"]);
  // …and a first capture NEAR the stated date never promotes an item
  assert.equal(decideFromEvidence(item, [S("wayback", "2026-10-14T08:00:00Z", "wayback-first-capture", false)]).dateVerified, false);
  // conflict: page says fresh, Wayback says old → old wins (hidden)
  const conflict = decideFromEvidence(item, [S("page", "2026-10-14T05:00:00Z", "json-ld", true), S("wayback", "2024-01-01T00:00:00Z", "wayback-first-capture", false)]);
  assert.equal(conflict.dateVerified, false);
  // prefers a direct (non-Wayback) old date when both exist
  assert.equal(decideFromEvidence(item, [S("wayback", "2025-06-01T00:00:00Z", "wayback-first-capture", false), S("url", "2025-05-15T00:00:00Z", "url-path", false)]).dateVerified, "inferred");
  // no evidence → hidden, and re-deciding from fresh data clears stale fields
  const none = decideFromEvidence({ ...item, dateVerified: true, dateEvidence: "json-ld" }, []);
  assert.deepEqual([none.dateVerified, none.dateEvidence], [false, undefined]);
});

test("only aggregator-only items are checked; HN/Techmeme/YouTube/social dates are trusted", () => {
  assert.ok(itemNeedsDateCheck(gnews()));
  assert.ok(itemNeedsDateCheck(gnews({ sources: [{ id: "bing" }] })));
  assert.ok(!itemNeedsDateCheck(gnews({ sources: [{ id: "gnews" }, { id: "hn" }] })));
  assert.ok(!itemNeedsDateCheck(gnews({ sources: [{ id: "techmeme" }] })));
  assert.ok(!itemNeedsDateCheck(gnews({ social: { targetId: "t" }, sources: [{ id: "x" }] })));
});

test("decodes legacy Google tokens offline and bing apiclick links; ignores opaque tokens", () => {
  const token = Buffer.from("\x08\x13\x22\x24https://example.com/a/b?c=1\xd2\x01\x00", "latin1").toString("base64url");
  assert.equal(decodeLegacyGoogleToken(token), "https://example.com/a/b?c=1");
  const opaque = "CBMifkFVX3lxTE1fMEl4amlHZlJwSllEdkVuQlBHeUhheER2NEFOcnJVTjRJUWRHVzhsaEZLQUVGRzRwUGpGeTFB";
  assert.equal(decodeLegacyGoogleToken(opaque), null);
  assert.equal(googleToken(`https://news.google.com/rss/articles/${opaque}?oc=5`), opaque);
  assert.equal(googleToken("https://example.com/rss/articles/abc"), null);
  assert.equal(bingTarget("https://www.bing.com/news/apiclick.aspx?ref=x&url=https%3A%2F%2Fexample.com%2Fp&c=1"), "https://example.com/p");
  assert.equal(bingTarget("https://example.com/p"), null);
});

test("resolver: legacy token is offline; opaque token uses batchexecute; failures return an error, never throw", async () => {
  const legacy = Buffer.from("\x08\x13\x22\x24https://example.com/a\xd2\x01\x00", "latin1").toString("base64url");
  const never = () => { throw new Error("no network expected"); };
  assert.deepEqual(await resolveAggregatorUrl(`https://news.google.com/rss/articles/${legacy}`, { fetchImpl: never }), { url: "https://example.com/a", via: "token" });

  const calls = [];
  const fetchImpl = async (url, opts) => {
    calls.push(url);
    if (!opts?.method) return { ok: true, status: 200, text: async () => `<c-wiz data-n-a-sg="SIG" data-n-a-ts="123"></c-wiz>` };
    const payload = JSON.stringify([["wrb.fr", "Fbv4je", JSON.stringify(["garturlres", "https://publisher.example/story", 1])]]);
    return { ok: true, status: 200, text: async () => `)]}'\n\n${payload}\n` };
  };
  const opaque = "CBMifkFVX3lxTE1fMEl4amlHZlJwSllEdkVuQlBHeUhheER2NEFOcnJVTjRJ";
  const r = await resolveAggregatorUrl(`https://news.google.com/rss/articles/${opaque}?oc=5`, { fetchImpl });
  assert.deepEqual(r, { url: "https://publisher.example/story", via: "batchexecute" });
  assert.equal(calls.length, 2);

  const boom = async () => { throw new Error("down"); };
  assert.ok((await resolveAggregatorUrl(`https://news.google.com/rss/articles/${opaque}`, { fetchImpl: boom, sleep: async () => {} })).error);
  const limited = async () => ({ ok: false, status: 429, text: async () => "" });
  assert.equal((await resolveAggregatorUrl(`https://news.google.com/rss/articles/${opaque}`, { fetchImpl: limited, sleep: async () => {} })).error, "rate-limited");
});

test("verifyDates corrects re-dated items, caches results, caps lookups, and never throws", async () => {
  const items = [
    gnews({ id: "old", baseScore: 3 }),
    gnews({ id: "fresh", baseScore: 2 }),
    gnews({ id: "nodate", baseScore: 1.5 }),
    gnews({ id: "boom", baseScore: 1.2 }),
    gnews({ id: "hn", baseScore: 9, sources: [{ id: "gnews" }, { id: "hn" }] }),
  ];
  const seen = [];
  const lookup = async (item) => {
    seen.push(item.id);
    if (item.id === "boom") throw new Error("kaboom");
    const real = { old: "2025-05-15T00:00:00.000Z", fresh: "2026-10-14T05:00:00.000Z" }[item.id] ?? null;
    return { checkedAt: new Date(NOW).toISOString(), status: real ? "ok" : "page:no-date", realDate: real, via: "json-ld" };
  };
  const cache = { schemaVersion: 1, entries: {} };
  const r = await verifyDates(items, { cache, now: NOW, cap: 10, lookup });
  const by = Object.fromEntries(r.items.map((i) => [i.id, i]));
  assert.equal(by.old.publishedAt, "2025-05-15T00:00:00.000Z");
  assert.equal(by.old.dateVerified, true);
  assert.equal(by.fresh.dateVerified, true);
  assert.equal(by.nodate.dateVerified, false);
  assert.equal(by.boom.dateVerified, false);
  assert.equal(by.hn.dateVerified, undefined);
  assert.ok(!seen.includes("hn"));
  assert.equal(r.stats.corrected, 1);

  // second run: verified items come from the cache; failures wait out the retry delay
  seen.length = 0;
  const r2 = await verifyDates(items, { cache: r.cache, now: NOW + 3_600_000, cap: 10, lookup });
  assert.deepEqual(seen, []);
  assert.equal(r2.items.find((i) => i.id === "old").publishedAt, "2025-05-15T00:00:00.000Z");
  const r3 = await verifyDates(items, { cache: r.cache, now: NOW + RETRY_AFTER_MS + 1000, cap: 10, lookup });
  assert.deepEqual(seen.sort(), ["boom", "nodate"]);
  assert.equal(r3.stats.cacheHits, 2);

  // cap: best-scored lookups first, the rest stay unverified
  seen.length = 0;
  const capped = await verifyDates(items, { cache: { schemaVersion: 1, entries: {} }, now: NOW, cap: 2, lookup });
  assert.deepEqual(seen.sort(), ["fresh", "old"]);
  assert.equal(capped.stats.deferred, 2);
  assert.equal(capped.items.find((i) => i.id === "nodate").dateVerified, false);
});

test("items the resolver could not serve are 'lookup-unavailable': hidden, not cached, retried next run", async () => {
  const items = Array.from({ length: 4 }, (_, n) => gnews({ id: `i${n}`, baseScore: 6 - n }));
  const lookup = async () => ({ checkedAt: new Date(NOW).toISOString(), status: "resolve:lookup-unavailable", realDate: null, evidence: [], transient: true });
  const cache = { schemaVersion: 1, entries: {} };
  const r = await verifyDates(items, { cache, now: NOW, concurrency: 1, lookup });
  assert.ok(r.items.every((i) => i.dateVerified === false && i.dateEvidence === "lookup-unavailable"));
  assert.equal(r.stats.lookupUnavailable, 4);
  assert.deepEqual(Object.keys(r.cache.entries), [], "nothing cached as a permanent failure");
});

test("cache: ok is final, failures retry on a delay then stop after 3 attempts, old entries expire", () => {
  const iso = new Date(NOW).toISOString();
  assert.equal(cacheAction(undefined, NOW), "fetch");
  assert.equal(cacheAction({ checkedAt: iso, status: "ok" }, NOW + 9e9), "use");
  assert.equal(cacheAction({ checkedAt: iso, status: "page:http-403", attempts: 1 }, NOW + 1000), "use");
  assert.equal(cacheAction({ checkedAt: iso, status: "page:http-403", attempts: 1 }, NOW + RETRY_AFTER_MS), "fetch");
  assert.equal(cacheAction({ checkedAt: iso, status: "page:http-403", attempts: 3 }, NOW + RETRY_AFTER_MS * 9), "use");
  const c = normalizeCache({ entries: { keep: { checkedAt: iso, status: "ok" }, drop: { checkedAt: "2020-01-01T00:00:00Z", status: "ok" } } }, NOW);
  assert.deepEqual(Object.keys(c.entries), ["keep"]);
});

// ------------------------------------------------------- homepage exclusion
const pulse = (items) => ({ generatedAt: "2026-10-16T11:33:43.557Z", items });
const sig = (id, extra = {}) => ({ id, title: `Title ${id}`, url: `https://e.com/${id}`, domain: "e.com", publishedAt: "2026-10-14T00:00:00.000Z", kind: "funding", baseScore: 2, sources: [{ id: "gnews" }], ...extra });

test("homepage list drops dateVerified:false items but keeps true and legacy (unstamped) items", () => {
  const out = buildSignals(pulse([sig("ok", { dateVerified: true }), sig("bad", { dateVerified: false }), sig("legacy"), sig("hn", { sources: [{ id: "hn" }] })]));
  assert.deepEqual(out.items.map((i) => i.id).sort(), ["hn", "legacy", "ok"]);
});

test("a corrected (old) date drops out of the 14-day homepage window", () => {
  const item = sig("neo", { publishedAt: "2025-05-15T00:00:00.000Z", rssPublishedAt: "2026-10-14T06:16:45.000Z", dateVerified: true });
  assert.equal(buildSignals(pulse([item])).items.length, 0);
});

test("recheck reports homepage items whose real date is >3 days older, and is a pure dry run", async () => {
  const p = pulse([sig("wrong", { baseScore: 3 }), sig("right", { baseScore: 2 }), sig("blocked", { baseScore: 1.5 })]);
  const lookup = async (item) => ({
    checkedAt: new Date(NOW).toISOString(), status: item.id === "blocked" ? "page:http-403" : "ok",
    realDate: { wrong: "2025-05-15T00:00:00.000Z", right: "2026-10-14T00:00:00.000Z" }[item.id] ?? null, via: "json-ld",
  });
  const snapshot = JSON.stringify(p);
  const r = await recheck(p, { schemaVersion: 1, entries: {} }, { now: NOW, lookup });
  assert.equal(JSON.stringify(p), snapshot, "input data untouched");
  assert.deepEqual(r.wrongOnHomepage.map((w) => w.id), ["wrong"]);
  assert.ok(r.homepage.find((h) => h.id === "blocked").unverified);
  assert.deepEqual(r.homepageAfter.map((h) => h.id), ["right"]);
  // idempotent: re-running with the produced cache looks nothing up
  let again = 0;
  await recheck({ ...p, items: r.updatedItems }, r.cache, { now: NOW, lookup: async (i) => (again++, lookup(i)) });
  assert.equal(again, 0, "nothing is re-fetched inside the retry window");
});

// ----------------------------------------------------- resilience (mocked)
const noSleep = async () => {};
const res = (status, text = "", headers = {}) => ({ ok: status >= 200 && status < 300, status, text: async () => text, headers: { get: (k) => headers[k.toLowerCase()] ?? null } });
const OPAQUE = "CBMifkFVX3lxTE1fMEl4amlHZlJwSllEdkVuQlBHeUhheER2NEFOcnJVTjRJ";
const gUrl = (t = OPAQUE) => `https://news.google.com/rss/articles/${t}?oc=5`;
const GOOD_PAGE = `<c-wiz data-n-a-sg="SIG" data-n-a-ts="123"></c-wiz>`;
const batch = (inner) => `)]}'\n\n${JSON.stringify([["wrb.fr", "Fbv4je", JSON.stringify(inner), null, null, null, "generic"]])}\n`;

test("polite fetch: honest UA, Retry-After honoured then retried, still-429 hosts are left alone", async () => {
  const waits = [];
  let n = 0;
  const seenHeaders = [];
  const fetchImpl = async (_u, init) => {
    seenHeaders.push(init.headers);
    return ++n === 1 ? res(429, "", { "retry-after": "3" }) : res(200, "<html>ok</html>");
  };
  const ctx = createContext({ fetchImpl, sleep: async (ms) => waits.push(ms), hostGapMs: 0 });
  const r = await politeFetch("https://pub.example/a", ctx, { retries: 1 });
  assert.equal(r.status, 200);
  assert.deepEqual(waits, [3000]);
  assert.equal(seenHeaders[0]["user-agent"], UA);
  for (const ua of [UA, UA_COMPAT]) {
    assert.match(ua, /autopilotbiz-pulse/);
    assert.doesNotMatch(ua, /Chrome|Safari|Firefox/, "no browser impersonation");
  }

  // a Retry-After longer than the cap is not slept through; the host is blocked for the run
  const always429 = async () => res(429, "", { "retry-after": "600" });
  const c2 = createContext({ fetchImpl: always429, sleep: noSleep, hostGapMs: 0 });
  assert.equal((await politeFetch("https://slow.example/a", c2, { retries: 2 })).status, 429);
  let calls = 0;
  c2.fetchImpl = async () => (calls++, res(200, "x"));
  assert.equal((await politeFetch("https://slow.example/b", c2)).blocked, true);
  assert.equal(calls, 0, "no further requests to a host that is still rate limiting");

  assert.equal(parseRetryAfter("7"), 7000);
  assert.equal(parseRetryAfter(new Date(Date.now() + 5000).toUTCString()) <= 5000, true);
  assert.equal(parseRetryAfter("soon"), null);
  const b = [0, 1, 2, 9].map((a) => backoffMs(a, { rand: () => 1 }));
  assert.deepEqual(b, [500, 1000, 2000, 8000], "exponential and capped");
  assert.equal(backoffMs(3, { rand: () => 0 }), 2000, "jitter scales into [0.5, 1)");
});

test("polite fetch spaces requests to one host and never throws on network errors", async () => {
  const waits = [];
  const ctx = createContext({ fetchImpl: async () => res(200, "x"), sleep: async (ms) => waits.push(ms), hostGapMs: 400 });
  await politeFetch("https://a.example/1", ctx);
  await politeFetch("https://a.example/2", ctx);
  assert.ok(waits.length === 1 && waits[0] > 0 && waits[0] <= 400);
  const boom = createContext({ fetchImpl: async () => { throw new Error("down"); }, sleep: noSleep, hostGapMs: 0 });
  assert.deepEqual(await politeFetch("https://b.example/", boom, { retries: 0 }), { error: "fetch-failed" });
  const aborted = createContext({ fetchImpl: async () => { throw Object.assign(new Error("t"), { name: "AbortError" }); }, sleep: noSleep, hostGapMs: 0 });
  assert.deepEqual(await politeFetch("https://c.example/", aborted, { retries: 0 }), { error: "timeout" });
});

test("resolver validates the response shape strictly", async () => {
  const run = async (body) => {
    const fetchImpl = async (_u, o) => (o?.method ? res(200, body) : res(200, GOOD_PAGE));
    return resolveAggregatorUrl(gUrl(), { ctx: createContext({ fetchImpl, sleep: noSleep, hostGapMs: 0 }) });
  };
  assert.equal((await run(batch(["garturlres", "https://pub.example/a", 1]))).url, "https://pub.example/a");
  for (const bad of [batch(["somethingelse", "https://pub.example/a"]), batch(["garturlres", 42]), "<html>blocked</html>", ")]}'\n\nnot json", `)]}'\n\n${JSON.stringify([["wrb.fr", "OtherRpc", "[]"]])}`]) {
    assert.equal((await run(bad)).error, "bad-shape", bad.slice(0, 40));
  }
  assert.equal((await run(batch(["garturlres", "https://news.google.com/x"]))).error, "no-url", "a Google URL is not a publisher URL");
  const noParams = createContext({ fetchImpl: async () => res(200, "<html>consent wall</html>"), sleep: noSleep, hostGapMs: 0 });
  assert.equal((await resolveAggregatorUrl(gUrl(), { ctx: noParams })).error, "no-params");
  assert.ok(isTransientError("bad-shape") && isTransientError("batch-http-503") && !isTransientError("no-token") && !isTransientError("page:http-403"));
});

test("circuit breaker: consecutive failures stop all further Google calls without network traffic", async () => {
  let calls = 0;
  const fetchImpl = async () => (calls++, res(503));
  const ctx = createContext({ fetchImpl, sleep: noSleep, hostGapMs: 0 });
  for (let i = 0; i < BREAKER_CONSECUTIVE; i++) await resolveAggregatorUrl(gUrl(OPAQUE + i), { ctx });
  assert.equal(ctx.google.open, true);
  assert.equal(ctx.google.reason, "consecutive-failures");
  const before = calls;
  const r = await resolveAggregatorUrl(gUrl(OPAQUE + "zz"), { ctx });
  assert.deepEqual(r, { error: "lookup-unavailable" });
  assert.equal(calls, before, "open breaker makes no requests");
  // legacy tokens and Bing links still resolve offline while the breaker is open
  const legacy = Buffer.from("\x08\x13\x22\x24https://example.com/a\xd2\x01\x00", "latin1").toString("base64url");
  assert.equal((await resolveAggregatorUrl(gUrl(legacy), { ctx })).url, "https://example.com/a");
  // a success in between resets the consecutive counter
  const flaky = createContext({ fetchImpl: async (_u, o) => (o?.method ? res(200, batch(["garturlres", "https://pub.example/a"])) : res(200, GOOD_PAGE)), sleep: noSleep, hostGapMs: 0 });
  flaky.google.consecutive = BREAKER_CONSECUTIVE - 1;
  await resolveAggregatorUrl(gUrl(), { ctx: flaky });
  assert.equal(flaky.google.consecutive, 0);
});

test("circuit breaker also opens on repeated 429s", async () => {
  const ctx = createContext({ fetchImpl: async () => res(429), sleep: noSleep, hostGapMs: 0 });
  ctx.google.rateLimited = 2;
  await resolveAggregatorUrl(gUrl(), { ctx });
  assert.equal(ctx.google.open, true);
  assert.equal(ctx.google.reason, "rate-limited");
});

test("self-test: healthy when the known article resolves, falls back to a live item, unhealthy opens the breaker", async () => {
  const ok = async (_u, o) => (o?.method ? res(200, batch(["garturlres", "https://pub.example/a"])) : res(200, GOOD_PAGE));
  const c1 = createContext({ fetchImpl: ok, sleep: noSleep, hostGapMs: 0 });
  assert.deepEqual(await selfTestResolver(c1), { healthy: true, tried: ["ok"] });
  assert.equal(c1.google.open, false);

  // the pinned URL is gone (no params) but a live item still resolves → still healthy
  let first = true;
  const pinnedGone = async (u, o) => {
    if (!o?.method) return u.includes(SELF_TEST_URL.split("/articles/")[1].slice(0, 40)) ? res(200, "<html>gone</html>") : res(200, GOOD_PAGE);
    first = false;
    return res(200, batch(["garturlres", "https://pub.example/a"]));
  };
  const c2 = createContext({ fetchImpl: pinnedGone, sleep: noSleep, hostGapMs: 0 });
  const t2 = await selfTestResolver(c2, [gUrl("CBMiZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ")]);
  assert.equal(t2.healthy, true);
  assert.deepEqual(t2.tried, ["no-params", "ok"]);
  assert.equal(first, false);

  const broken = createContext({ fetchImpl: async () => res(200, "<html>changed</html>"), sleep: noSleep, hostGapMs: 0 });
  const t3 = await selfTestResolver(broken, [gUrl()]);
  assert.equal(t3.healthy, false);
  assert.equal(broken.google.open, true);
  assert.match(broken.google.reason, /^self-test-failed:/);
});

test("verifyDates with a broken resolver: self-test fails, nothing is cached, stats say unhealthy", async () => {
  const items = [gnews({ id: "a", url: gUrl("CBMiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA") }), gnews({ id: "b" })];
  const ctx = createContext({ fetchImpl: async () => res(200, "<html>changed</html>"), sleep: noSleep, hostGapMs: 0 });
  const r = await verifyDates(items, { cache: { schemaVersion: 1, entries: {} }, now: NOW, ctx, selfTest: true, concurrency: 1 });
  assert.equal(r.stats.lookupHealthy, false);
  assert.match(r.stats.breaker, /^self-test-failed/);
  assert.equal(r.stats.lookupUnavailable, 2);
  assert.deepEqual(r.cache.entries, {});
  assert.ok(r.items.every((i) => i.dateVerified === false));
  const meta = dateCheckMeta(r.stats, NOW);
  assert.equal(meta.lookupHealthy, false);
  assert.equal(meta.at, new Date(NOW).toISOString());
  assert.deepEqual(Object.keys(meta).sort(), ["at", "attempted", "breaker", "budgetHit", "candidates", "deferred", "homepageCandidates", "homepageShown", "inferred", "lookupHealthy", "lookupUnavailable", "ms", "resolved", "unverified", "verified"]);
});

// ----------------------------------------------------- fallbacks (mocked)
const PUB = "https://www.reuters.com/world/story-2026-10-14/";
const legacyToken = (u) => Buffer.from(`\x08\x13\x22\x24${u}\xd2\x01\x00`, "latin1").toString("base64url");
const legacyItem = (u, over = {}) => gnews({ url: gUrl(legacyToken(u)), ...over });

test("lookup: blocked page (401/403) still yields an 'inferred' date from the URL path", async () => {
  const fetchImpl = async (u) => res(u.includes("reuters.com/world") ? 401 : 404);
  const entry = await lookupRealDate(legacyItem(PUB), { now: NOW, ctx: createContext({ fetchImpl, sleep: noSleep, hostGapMs: 0, wayback: false }) });
  assert.equal(entry.status, "page:http-401");
  assert.equal(entry.realDate, "2026-10-14T00:00:00.000Z");
  assert.equal(entry.transient, undefined, "401 is a permanent failure, not a retry-every-run one");
  const d = decideFromEvidence(legacyItem(PUB), evidenceOf(entry));
  assert.deepEqual([d.dateVerified, d.dateEvidence], ["inferred", "url-path"]);
});

test("lookup: page timeouts and 429s are transient (not counted as attempts)", async () => {
  const to = createContext({ fetchImpl: async () => { throw Object.assign(new Error("t"), { name: "AbortError" }); }, sleep: noSleep, hostGapMs: 0, wayback: false, feeds: false });
  assert.equal((await lookupRealDate(legacyItem("https://pub.example/a"), { now: NOW, ctx: to })).transient, true);
  const limited = createContext({ fetchImpl: async () => res(429), sleep: noSleep, hostGapMs: 0, wayback: false, feeds: false });
  assert.equal((await lookupRealDate(legacyItem("https://pub.example/a"), { now: NOW, ctx: limited })).transient, true);
  assert.equal(cacheAction({ checkedAt: new Date(NOW).toISOString(), status: "page:timeout", transient: true, attempts: 0 }, NOW + 3_600_000), "use");
  assert.equal(cacheAction({ checkedAt: new Date(NOW).toISOString(), status: "page:timeout", transient: true, attempts: 0 }, NOW + 13 * 3.6e6), "fetch");
  assert.equal(cacheAction({ checkedAt: new Date(NOW).toISOString(), status: "page:timeout", transient: true, attempts: 9 }, NOW + 13 * 3.6e6), "fetch", "transient never exhausts attempts");
});

const FEED = (link, date) => `<?xml version="1.0"?><rss version="2.0"><channel><item><title>x</title><link>${link}</link><pubDate>${date}</pubDate></item></channel></rss>`;

test("feed: publisher's own RSS entry for the exact URL gives a strong date; discovery from <link rel=alternate>", async () => {
  const url = "https://blog.pub.example/2026/story?utm=1";
  const fetchImpl = async (u) => (u === "https://blog.pub.example/custom.xml" ? res(200, FEED("https://blog.pub.example/2026/story", "Wed, 14 Oct 2026 08:00:00 GMT")) : res(404));
  const ctx = createContext({ fetchImpl, sleep: noSleep, hostGapMs: 0 });
  const html = `<head><link rel="alternate" type="application/rss+xml" href="/custom.xml"></head>`;
  assert.deepEqual(await feedDateFor(url, html, ctx, NOW), { date: "2026-10-14T08:00:00.000Z", via: "feed" });
  // cached per origin: no new requests, and a URL that is not in the feed yields nothing
  let again = 0;
  ctx.fetchImpl = async () => (again++, res(404));
  assert.equal(await feedDateFor("https://blog.pub.example/other", html, ctx, NOW), null);
  assert.equal(again, 0);
  // budget: stops discovering new origins
  const none = createContext({ fetchImpl, sleep: noSleep, hostGapMs: 0, feedBudget: 0 });
  assert.equal(await feedDateFor("https://new.example/a", "", none, NOW), null);
  assert.deepEqual(parseFeedEntries(`<feed><entry><link rel="alternate" href="https://e.com/a"/><published>2026-10-01T00:00:00Z</published></entry><entry><title>no date</title><link href="https://e.com/b"/></entry></feed>`), [{ link: "https://e.com/a", date: "2026-10-01T00:00:00.000Z" }]);
});

test("lookup: feed rescues a 403 page; the date is 'verified' (publisher's own feed)", async () => {
  const fetchImpl = async (u) => {
    if (u.endsWith("/feed")) return res(200, FEED("https://pub.example/post/1", "Wed, 14 Oct 2026 08:00:00 GMT"));
    return res(403);
  };
  const item = legacyItem("https://pub.example/post/1");
  const entry = await lookupRealDate(item, { now: NOW, ctx: createContext({ fetchImpl, sleep: noSleep, hostGapMs: 0, wayback: false }) });
  assert.equal(entry.status, "page:http-403");
  const d = decideFromEvidence(item, evidenceOf(entry));
  assert.deepEqual([d.dateVerified, d.dateEvidence], [true, "feed"]);
});

test("wayback: earliest capture parsed; stale proof only; failures are errors, never throws", async () => {
  const cap = (ts) => res(200, JSON.stringify({ archived_snapshots: ts ? { closest: { available: true, timestamp: ts, status: "200" } } : {} }));
  const ctx = (impl) => createContext({ fetchImpl: impl, sleep: noSleep, hostGapMs: 0 });
  assert.deepEqual(await waybackFirstCapture("https://p.example/a", ctx(async () => cap("20230417165700")), NOW), { capture: "2023-04-17T16:57:00.000Z" });
  assert.deepEqual(await waybackFirstCapture("https://p.example/a", ctx(async () => cap(null)), NOW), { capture: null });
  assert.equal((await waybackFirstCapture("https://p.example/a", ctx(async () => res(503)), NOW)).error, "http-503");
  assert.equal((await waybackFirstCapture("https://p.example/a", ctx(async () => res(200, "<html>")), NOW)).error, "bad-shape");
  let asked = "";
  await waybackFirstCapture("https://p.example/a b", ctx(async (u) => (asked = u, cap(null))), NOW);
  assert.match(asked, /timestamp=19950101/);

  // end to end: a blocked page whose first capture is years old is proven old → hidden, date moved
  const fetchImpl = async (u) => (u.startsWith("https://archive.org/") ? cap("20230417165700") : res(403));
  const item = legacyItem("https://forbes.example/evergreen");
  const entry = await lookupRealDate(item, { now: NOW, ctx: createContext({ fetchImpl, sleep: noSleep, hostGapMs: 0, feeds: false }) });
  const d = decideFromEvidence(item, evidenceOf(entry));
  assert.deepEqual([d.dateVerified, d.publishedAt.slice(0, 10)], [false, "2023-04-17"]);
  // wayback is off unless asked for: no archive.org request
  const urls = [];
  await lookupRealDate(item, { now: NOW, ctx: createContext({ fetchImpl: async (u) => (urls.push(u), res(403)), sleep: noSleep, hostGapMs: 0, feeds: false, wayback: false }) });
  assert.ok(!urls.some((u) => u.includes("archive.org")));
});

// ----------------------------------------------------- catch-up and budget
test("lookup cap: cold cache switches to catch-up size, warm cache stays small", () => {
  assert.equal(lookupCap({ uncached: 600, candidates: 900 }), 400);
  assert.equal(lookupCap({ uncached: 150, candidates: 900 }), 60);
  assert.equal(lookupCap({ uncached: 80, candidates: 100 }), 80, "never more than what is uncached");
  assert.equal(lookupCap({ uncached: 0, candidates: 0 }), 60);
});

test("verifyDates: time budget stops new lookups; the rest are deferred (not cached) and homepage items go first", async () => {
  const items = [
    ...Array.from({ length: 5 }, (_, n) => gnews({ id: `h${n}`, baseScore: 1 })),
    gnews({ id: "blog", kind: "blog", baseScore: 9 }),
  ];
  const seen = [];
  let clock = 0;
  const lookup = async (item) => {
    seen.push(item.id);
    clock += 1;
    return { checkedAt: new Date(NOW).toISOString(), status: "ok", realDate: "2026-10-14T05:00:00.000Z", via: "json-ld" };
  };
  const realNow = Date.now;
  Date.now = () => realNow() + clock * 1000;
  try {
    const r = await verifyDates(items, { cache: { schemaVersion: 1, entries: {} }, now: NOW, concurrency: 1, budgetMs: 2500, lookup });
    assert.equal(r.stats.budgetHit, true);
    assert.equal(seen.length, 3);
    assert.ok(!seen.includes("blog"), "a non-homepage kind with a higher score waits behind homepage-eligible items");
    assert.equal(r.stats.deferred, 3);
    assert.equal(Object.keys(r.cache.entries).length, 3);
  } finally {
    Date.now = realNow;
  }
});

test("verifyDates stats: verified / inferred / unverified, homepage numbers, catch-up cap", async () => {
  const items = Array.from({ length: 6 }, (_, n) => gnews({ id: `i${n}`, baseScore: 6 - n }));
  const lookup = async (item) => {
    const n = Number(item.id.slice(1));
    const evidence = n < 2 ? [{ kind: "page", date: "2026-10-14T05:00:00.000Z", via: "json-ld", strong: true }] : n < 4 ? [{ kind: "url", date: "2026-10-14T00:00:00.000Z", via: "url-path", strong: false }] : [];
    return { checkedAt: new Date(NOW).toISOString(), status: n < 2 ? "ok" : "page:http-403", publisherUrl: "https://p.example/" + n, evidence, realDate: null };
  };
  const r = await verifyDates(items, { cache: { schemaVersion: 1, entries: {} }, now: NOW, lookup, baseCap: 2, catchupCap: 50 });
  assert.equal(r.stats.cap, 6, "cold cache: every candidate is uncached, so the catch-up cap applies (bounded by what is uncached)");
  assert.deepEqual([r.stats.verified, r.stats.inferred, r.stats.unverified], [2, 2, 2]);
  assert.deepEqual([r.stats.resolved, r.stats.fetched, r.stats.homepageCandidates, r.stats.homepageShown], [6, 6, 6, 4]);
  const warm = await verifyDates(items, { cache: r.cache, now: NOW, lookup, baseCap: 2 });
  assert.equal(warm.stats.cacheHits, 6);
});

test("verifyDates: transient failures keep attempts at 0 so they are never given up on", async () => {
  const items = [gnews({ id: "t" })];
  const lookup = async () => ({ checkedAt: new Date(NOW).toISOString(), status: "page:timeout", publisherUrl: "https://p.example/a", evidence: [], realDate: null, transient: true });
  let cache = { schemaVersion: 1, entries: {} };
  for (let i = 0; i < 5; i++) {
    cache = (await verifyDates(items, { cache, now: NOW + i * 13 * 3.6e6, lookup })).cache;
  }
  assert.equal(cache.entries.t.attempts, 0);
  assert.equal(cacheAction(cache.entries.t, NOW + 99 * 3.6e6), "fetch");
});

// -------------------------------------------------------------- alert gate
test("date-health gate: broken resolver or collapsed dated share fails; healthy and missing blocks pass", () => {
  const healthy = { candidates: 300, deferred: 0, lookupUnavailable: 0, verified: 200, inferred: 20, lookupHealthy: true, homepageCandidates: 60, homepageShown: 40 };
  assert.equal(assessDateCheck(healthy).ok, true);
  assert.equal(assessDateCheck(undefined).ok, true, "date check skipped (social-only run)");
  const down = assessDateCheck({ ...healthy, lookupHealthy: false, breaker: "self-test-failed:bad-shape", lookupUnavailable: 300, verified: 0, inferred: 0 });
  assert.equal(down.ok, false);
  assert.match(down.problems[0], /resolver is unhealthy/);
  const collapsed = assessDateCheck({ ...healthy, verified: 20, inferred: 5 });
  assert.equal(collapsed.ok, false);
  assert.match(collapsed.problems.join(" "), /only 25 of 300/);
  // small samples and deferred items do not trip it (cold-cache run mid catch-up)
  assert.equal(assessDateCheck({ ...healthy, candidates: 10, verified: 1, inferred: 0, homepageCandidates: 3, homepageShown: 0 }).ok, true);
  assert.equal(assessDateCheck({ ...healthy, candidates: 900, deferred: 800, verified: 40, inferred: 5 }).ok, true);
  assert.equal(assessDateCheck({ ...healthy, homepageShown: 2 }).ok, false, "homepage nearly emptied");
});

test("homepage shows verified and inferred items, exposes the tier, and never shows hidden ones", () => {
  const out = buildSignals(pulse([
    sig("v", { dateVerified: true, dateEvidence: "json-ld" }),
    sig("i", { dateVerified: "inferred", dateEvidence: "url-path" }),
    sig("h", { dateVerified: false, dateEvidence: "no-agreeing-evidence" }),
    sig("t", { sources: [{ id: "hn" }] }),
  ]));
  const by = Object.fromEntries(out.items.map((i) => [i.id, i]));
  assert.deepEqual(Object.keys(by).sort(), ["i", "t", "v"]);
  assert.deepEqual([by.v.dateVerified, by.v.dateEvidence, by.i.dateVerified, by.i.dateEvidence], [true, "json-ld", "inferred", "url-path"]);
  assert.equal("dateVerified" in by.t, false, "trusted-date sources carry no tier");
  assert.match(by.i.selection, /not independently confirmed/);
});

test("page fetch: plain UA first, one honest Mozilla-compatible retry on 401/403/406, none on 404", async () => {
  const uas = [];
  const fetchImpl = async (_u, init) => {
    uas.push(init.headers["user-agent"]);
    return init.headers["user-agent"] === UA_COMPAT ? res(200, "<html>ok</html>") : res(403);
  };
  const ctx = createContext({ fetchImpl, sleep: noSleep, hostGapMs: 0 });
  assert.deepEqual(await fetchPageHtml("https://pub.example/a", { ctx }), { html: "<html>ok</html>" });
  assert.deepEqual(uas, [UA, UA_COMPAT]);
  uas.length = 0;
  const nf = createContext({ fetchImpl: async (_u, init) => (uas.push(init.headers["user-agent"]), res(404)), sleep: noSleep, hostGapMs: 0 });
  assert.deepEqual(await fetchPageHtml("https://pub.example/b", { ctx: nf }), { error: "http-404" });
  assert.equal(uas.length, 1);
  // a header-overflow style network error on the plain UA is retried with the compat UA, and reports the real error if both fail
  const odd = createContext({ fetchImpl: async () => { throw new Error("Headers Overflow Error"); }, sleep: noSleep, hostGapMs: 0 });
  assert.deepEqual(await fetchPageHtml("https://pub.example/c", { ctx: odd }), { error: "fetch-failed" });
  const stillBlocked = createContext({ fetchImpl: async () => res(403), sleep: noSleep, hostGapMs: 0 });
  assert.deepEqual(await fetchPageHtml("https://pub.example/d", { ctx: stillBlocked }), { error: "http-403" });
});
