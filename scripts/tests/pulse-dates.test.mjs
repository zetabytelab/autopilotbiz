import test from "node:test";
import assert from "node:assert/strict";
import {
  extractPublishedDate, decideDate, decodeLegacyGoogleToken, googleToken, bingTarget, dateFromUrlPath,
  itemNeedsDateCheck, verifyDates, cacheAction, normalizeCache, resolveAggregatorUrl, RETRY_AFTER_MS,
} from "../pulse-dates.mjs";
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

test("a URL-path date can prove a story older but never verifies a story as fresh", () => {
  assert.equal(dateFromUrlPath("https://x.com/2025/05/15/foo"), "2025-05-15T00:00:00.000Z");
  assert.equal(dateFromUrlPath("https://x.com/foo"), null);
  assert.equal(decideDate(gnews(), { date: "2025-05-15T00:00:00.000Z", via: "url-path" }).publishedAt, "2025-05-15T00:00:00.000Z");
  assert.equal(decideDate(gnews(), { date: "2026-10-14T00:00:00.000Z", via: "url-path" }).dateVerified, false);
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
  assert.ok((await resolveAggregatorUrl(`https://news.google.com/rss/articles/${opaque}`, { fetchImpl: boom })).error);
  const limited = async () => ({ ok: false, status: 429, text: async () => "" });
  assert.equal((await resolveAggregatorUrl(`https://news.google.com/rss/articles/${opaque}`, { fetchImpl: limited })).error, "rate-limited");
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

test("a rate-limited resolver stops further lookups for the run", async () => {
  const items = Array.from({ length: 6 }, (_, n) => gnews({ id: `i${n}`, baseScore: 6 - n }));
  let calls = 0;
  const lookup = async (_i, { state }) => {
    calls++;
    state.rateLimited = true;
    return { checkedAt: new Date(NOW).toISOString(), status: "resolve:rate-limited", realDate: null };
  };
  const r = await verifyDates(items, { cache: { schemaVersion: 1, entries: {} }, now: NOW, cap: 6, concurrency: 1, lookup });
  assert.equal(calls, 1);
  assert.ok(r.items.every((i) => i.dateVerified === false));
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
