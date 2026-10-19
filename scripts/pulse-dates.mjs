// Publish-date verification for Pulse items whose date comes from an untrusted
// aggregator (Google News / Bing News RSS). Google sometimes re-dates old
// articles, so a 2025 story can arrive with an October 2026 pubDate and walk
// straight past the age cutoff. We resolve the aggregator link to the publisher
// page and read the page's own datePublished. Keyless, no paid API, no LLM.
//
// Failure is never fatal: an item whose real date cannot be read is kept in
// pulse.json with dateVerified:false, and the homepage list skips it.

import { SIGNAL_KINDS, SIGNAL_WINDOW_DAYS } from "./registry-signals.mjs";

// Two honest identities, tried in this order. The plain tool UA works for most
// publishers (Yahoo Finance, for one, answers the Mozilla-style UA with a header
// overflow). On 401/403/406 we retry once with the conventional Mozilla/5.0
// (compatible; …) form that crawlers use. We do not impersonate a browser: a
// real-Chrome UA recovered more pages in testing but is a stealth tactic, so it
// is deliberately not used.
export const UA = "autopilotbiz-pulse/1.0 (category tracker; contact: site owner)";
export const UA_COMPAT = "Mozilla/5.0 (compatible; autopilotbiz-pulse/1.0; +https://autopilotindex.com)";
export const UNTRUSTED_SOURCES = new Set(["gnews", "bing"]);
export const TOLERANCE_MS = 48 * 3.6e6; // RSS date may exceed the real date by this much
export const RETRY_AFTER_MS = 2 * 864e5; // re-try a failed lookup after 2 days…
export const MAX_ATTEMPTS = 3; // …at most 3 times, then leave it unverified
export const CACHE_TTL_MS = 45 * 864e5;
const MAX_BODY_BYTES = 600_000;
export const BREAKER_CONSECUTIVE = 6; // consecutive Google lookup failures that open the circuit
export const BREAKER_RATE_LIMITS = 3; // …or this many 429s in one run
export const DEFAULT_BUDGET_MS = 240_000; // stop starting new lookups after this long
export const TRANSIENT_RETRY_MS = 12 * 3.6e6; // transient failures are retried on the next run
// A stable Google News article (resolves to a TechRepublic page). If it stops
// resolving AND a fresh item does not either, the unofficial resolver is broken.
export const SELF_TEST_URL = "https://news.google.com/rss/articles/CBMifkFVX3lxTE1fMEl4amlHZlJwSllEdkVuQlBHeUhheER2NEFOcnJVTjRJUWRHVzhsaEZLQUVGRzRwUGpGeTFBTUIzdHVNbkc1MzBsMHBkdDAxbEUtUUMyQVg5OG1nZzE0czdncjhtaS1fV2xadVU2eEFJMUNnOUl1RFNvUnoyUQ?oc=5";

const hostOf = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};
const GOOGLE_HOSTS = /(?:^|\.)(?:google|googleusercontent|gstatic)\.[a-z.]+$/i;
const isGoogleNews = (u) => /^news\.google\.[a-z.]+$/i.test(hostOf(u));

// ------------------------------------------------------------ item selection
export function itemNeedsDateCheck(item) {
  if (!item || item.social) return false;
  const ids = (item.sources ?? []).map((s) => s.id);
  return ids.length > 0 && ids.every((id) => UNTRUSTED_SOURCES.has(id));
}

// ------------------------------------------------------------- date parsing
function cleanDate(raw, now = Date.now()) {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const t = Date.parse(String(raw).trim());
  if (!Number.isFinite(t)) return null;
  if (t < Date.UTC(1995, 0, 1) || t > now + 864e5) return null;
  return new Date(t).toISOString();
}

const ARTICLE_TYPE = /^(?:News|Report|Tech|Blog|Scholarly)?Article$|^BlogPosting$|^NewsArticle$|^LiveBlogPosting$|^Review$/;

function walkJsonLd(node, out, depth = 0) {
  if (!node || depth > 6) return;
  if (Array.isArray(node)) return node.forEach((n) => walkJsonLd(n, out, depth + 1));
  if (typeof node !== "object") return;
  const type = [].concat(node["@type"] ?? []).join(" ");
  if (node.datePublished) out.push({ date: node.datePublished, article: ARTICLE_TYPE.test(type) || /Article|Posting/.test(type) });
  for (const k of ["@graph", "mainEntity", "mainEntityOfPage", "itemListElement"]) if (node[k]) walkJsonLd(node[k], out, depth + 1);
}

const attrOf = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"))?.slice(1).find((v) => v != null) ?? null;

// Returns { date: ISO, via } or null. Order of trust: JSON-LD article, meta
// tags, itemprop, then the first <time datetime> in the document.
export function extractPublishedDate(html, now = Date.now()) {
  if (typeof html !== "string" || !html) return null;
  const ld = [];
  for (const m of html.matchAll(/<script[^>]+type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walkJsonLd(JSON.parse(m[1].trim()), ld);
    } catch {}
  }
  const ldDates = ld.map((c) => ({ ...c, iso: cleanDate(c.date, now) })).filter((c) => c.iso);
  const ldPick = ldDates.find((c) => c.article) ?? ldDates[0];
  if (ldPick) return { date: ldPick.iso, via: "json-ld" };

  const METAS = ["article:published_time", "og:article:published_time", "og:published_time", "datepublished", "pubdate", "publishdate", "publish-date", "parsely-pub-date", "dc.date", "dc.date.issued", "date"];
  const wanted = new Map();
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const key = (attrOf(m[0], "property") ?? attrOf(m[0], "name") ?? attrOf(m[0], "itemprop") ?? "").toLowerCase();
    const content = attrOf(m[0], "content");
    if (key && content && METAS.includes(key) && !wanted.has(key)) wanted.set(key, content);
  }
  for (const k of METAS) {
    const iso = wanted.has(k) ? cleanDate(wanted.get(k), now) : null;
    if (iso) return { date: iso, via: `meta:${k}` };
  }
  for (const m of html.matchAll(/<time\b[^>]*>/gi)) {
    const iso = cleanDate(attrOf(m[0], "datetime"), now);
    if (iso) return { date: iso, via: "time-tag" };
  }
  return null;
}

// ---------------------------------------------------------------- URL dates
// Publishers often put the publish day in the URL. Returns an ISO date (UTC
// midnight) or null. Day-precision patterns only; a /YYYY/MM/ month alone is
// not enough to say anything about a specific day.
const URL_DATE_PATTERNS = [
  /\/(20\d{2})[/-](0[1-9]|1[0-2])[/-](0[1-9]|[12]\d|3[01])(?!\d)/, // /2025/05/15/ and /2025-05-15-
  /[-_](20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(?:[/.\-_?]|$)/, // …-story-2026-10-15/ (Reuters)
  /\/(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d*(?:\/|$)/, // /20261006266441/ (Business Wire)
  /\/[a-z](20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z]/, // /a20261005PD205/ (DigiTimes)
];
export function dateFromUrlPath(url, now = Date.now()) {
  let path;
  try {
    path = new URL(url).pathname;
  } catch {
    return null;
  }
  for (const re of URL_DATE_PATTERNS) {
    const m = path.match(re);
    if (m) {
      const iso = cleanDate(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`, now);
      if (iso) return iso;
    }
  }
  return null;
}

// ------------------------------------------------------------ date decision
// Evidence is a list of { kind, date, via, strong }:
//   page    – the publisher page's own date (JSON-LD / meta = strong; first <time> = weak)
//   feed    – the publisher's own RSS/Atom entry for this exact URL (strong)
//   url     – a day embedded in the URL path (weak)
//   wayback – first Internet Archive capture. The article existed by then, so it is
//             an UPPER bound on age: proof of "old", never proof of "fresh".
//
// Policy (the false-"fresh" label is the thing to avoid):
//   1. If ANY evidence is more than 48h older than the aggregator's date, the story is
//      old: publishedAt moves to the earliest such date. Tier true when that date is
//      strong, 'inferred' when weak, false when only Wayback says so (hidden; it is
//      kept in the data with the capture date).
//   2. Else strong evidence that does not contradict the aggregator date → true.
//   3. Else weak evidence that agrees with the aggregator date (URL day or <time>
//      within 3 days before it, and not after it) → 'inferred'.
//   4. Else no evidence: false (hidden). Silence is never read as freshness.
const DAY = 864e5;
export const TIERS = { VERIFIED: true, INFERRED: "inferred", UNVERIFIED: false };

export function decideFromEvidence(item, evidence) {
  const { dateSource, rssPublishedAt, dateEvidence, ...rest } = item;
  const rss = Date.parse(item.publishedAt);
  const ev = (evidence ?? []).filter((e) => e && Number.isFinite(Date.parse(e.date)));
  const hide = (why) => ({ ...rest, ...(rssPublishedAt ? { rssPublishedAt } : {}), dateVerified: false, ...(why ? { dateEvidence: why } : {}) });
  if (!ev.length || !Number.isFinite(rss)) return hide(null);

  const older = ev.filter((e) => Date.parse(e.date) < rss - TOLERANCE_MS).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  if (older.length) {
    // Prefer the earliest non-Wayback date: it is a direct statement of the publish day.
    const pick = older.find((e) => e.kind !== "wayback") ?? older[0];
    const base = { ...rest, publishedAt: new Date(Date.parse(pick.date)).toISOString(), rssPublishedAt: rssPublishedAt ?? item.publishedAt };
    if (pick.kind === "wayback") return { ...base, dateVerified: false, dateEvidence: "wayback-first-capture" };
    return { ...base, dateVerified: pick.strong ? true : "inferred", dateEvidence: pick.via };
  }
  const strong = ev.find((e) => e.strong && e.kind !== "wayback");
  if (strong) return { ...rest, dateVerified: true, dateEvidence: strong.via };
  const weak = ev.find((e) => !e.strong && e.kind !== "wayback" && rss - Date.parse(e.date) <= 3 * DAY && Date.parse(e.date) <= rss + 12 * 3.6e6);
  if (weak) return { ...rest, dateVerified: "inferred", dateEvidence: weak.via };
  return hide("no-agreeing-evidence");
}

// Back-compat: one { date, via } in, same decision out.
export function decideDate(item, real) {
  if (!real) return decideFromEvidence(item, []);
  const weak = real.via === "url-path" || real.via === "time-tag";
  return decideFromEvidence(item, [{ kind: real.via === "url-path" ? "url" : "page", date: real.date, via: real.via, strong: !weak }]);
}

// ------------------------------------------------------- redirect resolving
// Legacy Google News tokens ("CBMi…") embed the publisher URL in a protobuf and
// decode offline. Current tokens ("CBMi…AU_yq…") are opaque: the only keyless
// route is the batchexecute call Google's own news page makes. Following HTTP
// redirects does NOT work: news.google.com returns a 200 JS shell, not a 302.
export function decodeLegacyGoogleToken(token) {
  try {
    const raw = Buffer.from(String(token).replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("latin1");
    const m = raw.match(/https?:\/\/[\x21-\x7e]+/);
    if (!m) return null;
    const url = m[0].replace(/[\x00-\x20\x7f-\xff].*$/s, "");
    return /^https?:\/\/[^/]+\.[^/]+/.test(url) && !GOOGLE_HOSTS.test(hostOf(url)) ? url : null;
  } catch {
    return null;
  }
}

export function googleToken(url) {
  try {
    const u = new URL(url);
    if (!isGoogleNews(url)) return null;
    return u.pathname.match(/\/(?:rss\/)?(?:articles|read)\/([^/?]+)/)?.[1] ?? null;
  } catch {
    return null;
  }
}

export function bingTarget(url) {
  try {
    const u = new URL(url);
    if (!/(^|\.)bing\.com$/i.test(u.hostname)) return null;
    const t = u.searchParams.get("url");
    return t && /^https?:\/\//i.test(t) && !/bing\.com/i.test(hostOf(t)) ? t : null;
  } catch {
    return null;
  }
}
// ------------------------------------------------------------ polite HTTP
export const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));
export const parseRetryAfter = (v, now = Date.now()) => {
  if (v == null || v === "") return null;
  const s = Number(v);
  if (Number.isFinite(s)) return Math.max(0, s * 1000);
  const t = Date.parse(String(v));
  return Number.isFinite(t) ? Math.max(0, t - now) : null;
};
// Exponential backoff with jitter: base·2^attempt, capped, scaled into [0.5, 1).
export const backoffMs = (attempt, { base = 500, cap = 8_000, rand = Math.random } = {}) => Math.min(cap, base * 2 ** attempt) * (0.5 + rand() * 0.5);

// One context per run: shared fetch, pacing, per-host 429 blocks, feed cache,
// and the Google circuit breaker. Nothing here costs money or needs a secret.
export function createContext(opts = {}) {
  return {
    fetchImpl: opts.fetchImpl ?? fetch,
    sleep: opts.sleep ?? sleepMs,
    rand: opts.rand ?? Math.random,
    timeout: opts.timeout ?? 8_000,
    hostGapMs: opts.hostGapMs ?? 400,
    maxRetryWaitMs: opts.maxRetryWaitMs ?? 15_000,
    wayback: opts.wayback ?? true,
    feeds: opts.feeds ?? true,
    hostNext: new Map(),
    blockedHosts: new Set(),
    feedCache: new Map(),
    feedBudget: opts.feedBudget ?? 40,
    waybackNext: 0,
    // Google resolver health
    google: { consecutive: 0, failures: 0, rateLimited: 0, open: false, reason: null, ok: 0 },
    ...opts.state,
  };
}
const ctxOf = (o = {}) => (o.ctx ?? createContext(o));

async function timedFetch(url, init, ctx, timeout = ctx.timeout) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    return await ctx.fetchImpl(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function readBody(res) {
  if (!res.body?.getReader) return (await res.text()).slice(0, MAX_BODY_BYTES);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let html = "";
  let bytes = 0;
  while (bytes < MAX_BODY_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    html += dec.decode(value, { stream: true });
  }
  reader.cancel().catch(() => {});
  return html;
}

// GET/POST with host pacing, Retry-After handling and bounded retries.
// Returns { status, text } on any HTTP answer or { error } on network failure. Never throws.
export async function politeFetch(url, ctx, { headers = {}, method = "GET", body, retries = 1, timeout, readText = true } = {}) {
  const host = hostOf(url);
  for (let attempt = 0; ; attempt++) {
    if (ctx.blockedHosts.has(host)) return { status: 429, blocked: true, text: "" };
    const gap = Math.max(0, (ctx.hostNext.get(host) ?? 0) - Date.now());
    ctx.hostNext.set(host, Date.now() + gap + ctx.hostGapMs);
    if (gap) await ctx.sleep(gap);
    let res;
    try {
      res = await timedFetch(url, { ...(method === "GET" ? {} : { method }), headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9", ...headers }, body, redirect: "follow" }, ctx, timeout);
    } catch (e) {
      const error = e?.name === "AbortError" ? "timeout" : "fetch-failed";
      if (attempt < retries && error === "timeout") {
        await ctx.sleep(backoffMs(attempt, { rand: ctx.rand }));
        continue;
      }
      return { error };
    }
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const ra = parseRetryAfter(res.headers?.get?.("retry-after"));
      const wait = ra != null ? ra : backoffMs(attempt, { rand: ctx.rand });
      if (wait <= ctx.maxRetryWaitMs) {
        await ctx.sleep(wait);
        continue;
      }
    }
    if (res.status === 429) ctx.blockedHosts.add(host); // still limited after backoff: leave this host alone for the run
    let text = "";
    if (res.ok && readText) {
      try {
        text = await readBody(res);
      } catch {
        return { error: "read-failed" };
      }
    }
    return { status: res.status, ok: res.ok, text };
  }
}

// ------------------------------------------------- Google News resolution
// Following redirects does NOT work (news.google.com returns a 200 JS shell). The
// keyless route is the batchexecute call Google's own page makes. It is
// unofficial, so every step validates the response shape and failures feed a
// circuit breaker instead of being trusted.
export const TRANSIENT_ERRORS = new Set(["rate-limited", "timeout", "resolve-failed", "bad-shape", "no-params", "lookup-unavailable", "fetch-failed", "read-failed"]);
export const isTransientError = (e) => TRANSIENT_ERRORS.has(e) || /^(?:page|batch)-http-(?:5\d\d|429)$/.test(e ?? "");

function parseBatchexecute(text) {
  if (typeof text !== "string" || !text.startsWith(")]}'")) return null;
  try {
    const outer = JSON.parse(text.split("\n\n")[1]);
    const row = outer?.[0];
    if (row?.[0] !== "wrb.fr" || row?.[1] !== "Fbv4je" || typeof row?.[2] !== "string") return null;
    const inner = JSON.parse(row[2]);
    if (inner?.[0] !== "garturlres" || typeof inner?.[1] !== "string") return null;
    return inner[1];
  } catch {
    return null;
  }
}

function noteGoogle(ctx, error) {
  const g = ctx.google;
  if (!error) {
    g.consecutive = 0;
    g.ok++;
    return;
  }
  if (!isTransientError(error) || error === "lookup-unavailable") return;
  g.consecutive++;
  g.failures++;
  if (error === "rate-limited" || /429/.test(error)) g.rateLimited++;
  if (!g.open && (g.consecutive >= BREAKER_CONSECUTIVE || g.rateLimited >= BREAKER_RATE_LIMITS)) {
    g.open = true;
    g.reason = g.rateLimited >= BREAKER_RATE_LIMITS ? "rate-limited" : "consecutive-failures";
  }
}

// Returns { url, via } on success or { error } (never throws).
export async function resolveAggregatorUrl(url, opts = {}) {
  const ctx = ctxOf(opts);
  const bing = bingTarget(url);
  if (bing) return { url: bing, via: "bing-param" };
  if (!isGoogleNews(url)) return { url, via: "direct" };
  const token = googleToken(url);
  if (!token) return { error: "no-token" };
  const legacy = decodeLegacyGoogleToken(token);
  if (legacy) return { url: legacy, via: "token" };
  if (ctx.google.open) return { error: "lookup-unavailable" };
  const r = await resolveViaBatchexecute(token, ctx);
  noteGoogle(ctx, r.error);
  return r;
}

async function resolveViaBatchexecute(token, ctx) {
  const page = await politeFetch(`https://news.google.com/rss/articles/${token}?hl=en-US&gl=US&ceid=US:en`, ctx, { retries: 2 });
  if (page.error) return { error: page.error === "timeout" ? "timeout" : "resolve-failed" };
  if (page.status === 429) return { error: "rate-limited" };
  if (!page.ok) return { error: `page-http-${page.status}` };
  const sg = page.text.match(/data-n-a-sg="([^"]+)"/)?.[1];
  const ts = page.text.match(/data-n-a-ts="([^"]+)"/)?.[1];
  if (!sg || !ts) return { error: "no-params" };
  const inner = JSON.stringify(["garturlreq", [["X", "X", ["X", "X"], null, null, 1, 1, "US:en", null, 1, null, null, null, null, null, 0, 1], "X", "X", 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0], token, Number(ts), sg]);
  const body = "f.req=" + encodeURIComponent(JSON.stringify([[["Fbv4je", inner, null, "generic"]]]));
  const res = await politeFetch("https://news.google.com/_/DotsSplashUi/data/batchexecute", ctx, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body,
    retries: 2,
  });
  if (res.error) return { error: res.error === "timeout" ? "timeout" : "resolve-failed" };
  if (res.status === 429) return { error: "rate-limited" };
  if (!res.ok) return { error: `batch-http-${res.status}` };
  const out = parseBatchexecute(res.text);
  if (out == null) return { error: "bad-shape" };
  if (!/^https?:\/\/[^/]+\.[^/]+/.test(out) || GOOGLE_HOSTS.test(hostOf(out))) return { error: "no-url" };
  return { url: out, via: "batchexecute" };
}

// Run once at the start of a run. Healthy when the known-stable article (or, if
// that one has been taken down, a current queued item) resolves to a publisher
// URL. When unhealthy the breaker opens immediately: no point burning requests.
export async function selfTestResolver(ctx, sampleUrls = []) {
  const tried = [];
  for (const u of [SELF_TEST_URL, ...sampleUrls.slice(0, 2)]) {
    if (!googleToken(u) || decodeLegacyGoogleToken(googleToken(u))) continue;
    const r = await resolveViaBatchexecute(googleToken(u), ctx);
    tried.push(r.error ?? "ok");
    if (!r.error) {
      ctx.google.consecutive = 0;
      return { healthy: true, tried };
    }
    if (r.error === "rate-limited") break; // asking again would only make it worse
  }
  ctx.google.open = true;
  ctx.google.reason = `self-test-failed:${tried.join(",")}`;
  return { healthy: false, tried };
}

// -------------------------------------------------------- page / feed / wayback
const HTML_ACCEPT = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";

const UA_RETRY_STATUS = new Set([401, 403, 406]);
export async function fetchPageHtml(url, opts = {}) {
  const ctx = ctxOf(opts);
  let r = await politeFetch(url, ctx, { headers: { accept: HTML_ACCEPT }, retries: 1 });
  if (r.error === "fetch-failed" || UA_RETRY_STATUS.has(r.status)) {
    const again = await politeFetch(url, ctx, { headers: { accept: HTML_ACCEPT, "user-agent": UA_COMPAT }, retries: 1 });
    if (again.ok || (r.error && !again.error)) r = again;
  }
  if (r.error) return { error: r.error };
  if (!r.ok) return { error: `http-${r.status}` };
  return { html: r.text };
}

const normUrl = (u) => {
  try {
    const x = new URL(u);
    return (x.hostname.replace(/^www\./, "") + x.pathname).replace(/\/+$/, "").toLowerCase();
  } catch {
    return String(u);
  }
};
const decodeEntities = (s) => s.replace(/&amp;/g, "&").replace(/&#38;/g, "&").replace(/&quot;/g, '"');

export function parseFeedEntries(xml) {
  const out = [];
  for (const m of String(xml).matchAll(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi)) {
    const b = m[0];
    const link =
      b.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i)?.[1] ??
      b.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']alternate["']/i)?.[1] ??
      b.match(/<link>\s*(?:<!\[CDATA\[)?\s*([^<\s\]]+)/i)?.[1] ??
      b.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ??
      b.match(/<guid[^>]*>\s*(https?:[^<\s]+)/i)?.[1];
    const dt = b.match(/<(?:pubDate|published|dc:date)>\s*(?:<!\[CDATA\[)?\s*([^<\]]+)/i)?.[1];
    const t = Date.parse(String(dt ?? "").trim());
    if (link && Number.isFinite(t)) out.push({ link: decodeEntities(link), date: new Date(t).toISOString() });
  }
  return out;
}

// The publisher's own feed entry for this exact URL. Feeds are found from the
// page's <link rel=alternate> when we could read it, else /feed and /rss.xml.
// One origin's feed is fetched once per run, at most `feedBudget` origins per run.
export async function feedDateFor(pubUrl, html, ctx, now = Date.now()) {
  if (!ctx.feeds) return null;
  let origin;
  try {
    origin = new URL(pubUrl).origin;
  } catch {
    return null;
  }
  let entries = ctx.feedCache.get(origin);
  if (!entries) {
    entries = [];
    if (ctx.feedBudget <= 0) return null;
    ctx.feedBudget--;
    const cands = [];
    for (const m of String(html ?? "").matchAll(/<link\b[^>]*>/gi)) {
      if (/rel=["']alternate["']/i.test(m[0]) && /(rss|atom)\+xml/i.test(m[0])) {
        const h = attrOf(m[0], "href");
        if (h) {
          try {
            cands.push(new URL(decodeEntities(h), pubUrl).href);
          } catch {}
        }
      }
    }
    cands.push(`${origin}/feed`, `${origin}/rss.xml`);
    for (const c of [...new Set(cands)].slice(0, 3)) {
      const r = await politeFetch(c, ctx, { headers: { accept: "application/rss+xml,application/atom+xml,application/xml;q=0.9,text/xml;q=0.8,*/*;q=0.5" }, retries: 0 });
      if (r.ok && /<(rss|feed|rdf)\b/i.test(r.text.slice(0, 2000))) entries.push(...parseFeedEntries(r.text));
      if (entries.length) break;
    }
    ctx.feedCache.set(origin, entries);
  }
  const want = normUrl(pubUrl);
  const hit = entries.find((e) => normUrl(e.link) === want);
  const iso = hit ? cleanDate(hit.date, now) : null;
  return iso ? { date: iso, via: "feed" } : null;
}

// Internet Archive availability API with timestamp=1995 returns the capture
// closest to 1995, i.e. the earliest one. (The CDX API is more exact but timed out
// on most of our test URLs.) Serialised with a gap: it is a free public service.
export async function waybackFirstCapture(pubUrl, ctx, now = Date.now()) {
  const wait = Math.max(0, ctx.waybackNext - Date.now());
  ctx.waybackNext = Date.now() + wait + 500;
  if (wait) await ctx.sleep(wait);
  const r = await politeFetch(`https://archive.org/wayback/available?url=${encodeURIComponent(pubUrl)}&timestamp=19950101`, ctx, { retries: 0, timeout: 12_000 });
  if (!r.ok) return { error: r.error ?? `http-${r.status}` };
  try {
    const snap = JSON.parse(r.text)?.archived_snapshots?.closest;
    const ts = snap?.available ? String(snap.timestamp) : null;
    if (!ts || !/^\d{14}$/.test(ts)) return { capture: null };
    const iso = cleanDate(`${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}T${ts.slice(8, 10)}:${ts.slice(10, 12)}:${ts.slice(12, 14)}Z`, now);
    return { capture: iso };
  } catch {
    return { error: "bad-shape" };
  }
}

// Look up one item's date evidence. Returns a cache entry.
//   { checkedAt, status, publisherUrl, evidence:[…], realDate, via, transient? }
export async function lookupRealDate(item, opts = {}) {
  const ctx = ctxOf(opts);
  const now = opts.now ?? Date.now();
  const base = { checkedAt: new Date(now).toISOString() };
  const r = await resolveAggregatorUrl(item.url, { ctx });
  if (r.error) return { ...base, status: `resolve:${r.error}`, evidence: [], realDate: null, ...(isTransientError(r.error) ? { transient: true } : {}) };

  const evidence = [];
  const page = await fetchPageHtml(r.url, { ctx });
  let status = "ok";
  if (page.error) status = `page:${page.error}`;
  else {
    const d = extractPublishedDate(page.html, now);
    if (d) evidence.push({ kind: "page", date: d.date, via: d.via, strong: d.via !== "time-tag" });
    else status = "page:no-date";
  }
  const urlDate = dateFromUrlPath(r.url, now);
  if (urlDate) evidence.push({ kind: "url", date: urlDate, via: "url-path", strong: false });
  const strongFound = () => evidence.some((e) => e.strong);
  if (!strongFound()) {
    const f = await feedDateFor(r.url, page.html, ctx, now);
    if (f) evidence.push({ kind: "feed", date: f.date, via: f.via, strong: true });
  }
  if (!strongFound() && ctx.wayback) {
    const w = await waybackFirstCapture(r.url, ctx, now);
    if (w.capture) evidence.push({ kind: "wayback", date: w.capture, via: "wayback-first-capture", strong: false });
  }
  const best = evidence.find((e) => e.strong) ?? evidence.find((e) => e.kind === "url" || e.via === "time-tag");
  const transientPage = page.error === "timeout" || page.error === "http-429" || /^http-5\d\d$/.test(page.error ?? "");
  return { ...base, status, publisherUrl: r.url, evidence, realDate: best?.date ?? null, via: best?.via ?? null, ...(transientPage ? { transient: true } : {}) };
}

// ----------------------------------------------------------------- cache
export function normalizeCache(raw, now = Date.now()) {
  const entries = {};
  for (const [k, v] of Object.entries(raw?.entries ?? {})) {
    if (v && typeof v.checkedAt === "string" && now - Date.parse(v.checkedAt) < CACHE_TTL_MS) entries[k] = v;
  }
  return { schemaVersion: 1, entries };
}

// "ok" entries are final. Permanent failures (403, no date) retry after 2 days, at
// most 3 times. Transient failures (429, timeout, resolver down) never count as
// attempts and are retried on the next run.
export function cacheAction(entry, now) {
  if (!entry) return "fetch";
  if (entry.status === "ok") return "use";
  const age = now - Date.parse(entry.checkedAt);
  if (entry.transient) return age >= TRANSIENT_RETRY_MS ? "fetch" : "use";
  if ((entry.attempts ?? 1) >= MAX_ATTEMPTS) return "use";
  return age >= RETRY_AFTER_MS ? "fetch" : "use";
}

export const evidenceOf = (e) => {
  if (!e) return [];
  if (Array.isArray(e.evidence)) return e.evidence;
  return e.realDate ? [{ kind: e.via === "url-path" ? "url" : "page", date: e.realDate, via: e.via ?? "page", strong: e.via !== "url-path" && e.via !== "time-tag" }] : [];
};

// ------------------------------------------------------------- orchestration
// Stamps every aggregator-only item with dateVerified true | 'inferred' | false
// (+ dateEvidence) and corrects re-dated ones. Lookups run best-first
// (homepage-eligible, then score) until `cap` lookups or `budgetMs` is reached; what
// is left stays unverified and is picked up next run. Items deferred by the
// breaker/budget are NOT cached as failures. Never throws.
export function lookupCap({ uncached, candidates, base = 60, catchup = 400 }) {
  // Cold cache (more than a third of candidates never looked up): catch-up mode.
  return candidates > 0 && uncached / candidates > 1 / 3 ? Math.max(base, Math.min(catchup, uncached)) : base;
}

export async function verifyDates(items, { cache, now = Date.now(), cap, baseCap = 60, catchupCap = 400, budgetMs = DEFAULT_BUDGET_MS, concurrency = 3, fetchImpl, sleep, rand, timeout, hostGapMs, wayback, feeds, window = 30 * DAY, lookup = lookupRealDate, selfTest = false, ctx: ctxIn } = {}) {
  const entries = cache?.entries ?? {};
  const ctx = ctxIn ?? createContext({ fetchImpl, sleep, rand, timeout, hostGapMs, wayback, feeds });
  const stats = { candidates: 0, cacheHits: 0, fetched: 0, resolved: 0, verified: 0, inferred: 0, unverified: 0, ok: 0, failed: 0, corrected: 0, deferred: 0, lookupUnavailable: 0, homepageCandidates: 0, homepageShown: 0, cap: 0, budgetHit: false, rateLimited: false, lookupHealthy: true, breaker: null, selfTest: null, ms: 0 };
  const t0 = Date.now();
  const out = items.map((i) => ({ ...i }));
  const queue = [];
  const homepageish = (i) => (SIGNAL_KINDS.includes(i.kind) && Date.parse(i.publishedAt) >= now - SIGNAL_WINDOW_DAYS * DAY ? 1 : 0);
  const apply = (idx, entry) => {
    const entryEv = evidenceOf(entry);
    out[idx] = decideFromEvidence(out[idx], entryEv);
  };
  out.forEach((item, idx) => {
    if (!itemNeedsDateCheck(item)) return;
    if (Date.parse(item.publishedAt) < now - window) return; // expires on its own
    stats.candidates++;
    const entry = entries[item.id];
    if (cacheAction(entry, now) === "use") {
      stats.cacheHits++;
      apply(idx, entry);
    } else queue.push(idx);
  });
  queue.sort((a, b) => homepageish(out[b]) - homepageish(out[a]) || (out[b].baseScore ?? 0) - (out[a].baseScore ?? 0) || Date.parse(out[b].publishedAt) - Date.parse(out[a].publishedAt));
  stats.cap = cap ?? lookupCap({ uncached: queue.length, candidates: stats.candidates, base: baseCap, catchup: catchupCap });
  const todo = queue.slice(0, stats.cap);
  const deferIdx = new Set(queue.slice(stats.cap));

  if (selfTest && todo.length) {
    const sample = todo.map((i) => out[i].url).filter((u) => isGoogleNews(u));
    stats.selfTest = await selfTestResolver(ctx, sample);
  }

  let next = 0;
  async function worker() {
    while (next < todo.length) {
      if (Date.now() - t0 > budgetMs) {
        stats.budgetHit = true;
        return;
      }
      const idx = todo[next++];
      const item = out[idx];
      let entry;
      try {
        entry = await lookup(item, { now, ctx, fetchImpl: ctx.fetchImpl, timeout: ctx.timeout, state: ctx.google });
      } catch {
        entry = { checkedAt: new Date(now).toISOString(), status: "lookup:error", realDate: null, evidence: [], transient: true };
      }
      if (entry.status === "resolve:lookup-unavailable") {
        // Breaker is open: do not cache, retry next run.
        stats.lookupUnavailable++;
        out[idx] = { ...decideFromEvidence(item, evidenceOf(entries[item.id])), ...(evidenceOf(entries[item.id]).length ? {} : { dateEvidence: "lookup-unavailable" }) };
        continue;
      }
      stats.fetched++;
      if (entry.publisherUrl) stats.resolved++;
      const prev = entries[item.id];
      entry.attempts = entry.status === "ok" || entry.transient ? (entry.transient ? prev?.attempts ?? 0 : 1) : (prev?.attempts ?? 0) + 1;
      entries[item.id] = entry;
      apply(idx, entry);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  for (const idx of [...deferIdx, ...todo.slice(next)]) {
    stats.deferred++;
    apply(idx, entries[out[idx].id]);
  }
  for (let i = 0; i < out.length; i++) {
    if (!itemNeedsDateCheck(out[i]) || out[i].dateVerified === undefined) continue;
    if (out[i].dateVerified === true) stats.verified++;
    else if (out[i].dateVerified === "inferred") stats.inferred++;
    else stats.unverified++;
    if (out[i].rssPublishedAt && out[i].rssPublishedAt !== items[i].rssPublishedAt) stats.corrected++;
    if (homepageish(items[i])) {
      stats.homepageCandidates++;
      if (out[i].dateVerified !== false && Date.parse(out[i].publishedAt) >= now - SIGNAL_WINDOW_DAYS * DAY) stats.homepageShown++;
    }
  }
  stats.ok = stats.verified + stats.inferred;
  stats.failed = stats.unverified;
  stats.rateLimited = ctx.google.rateLimited > 0;
  stats.breaker = ctx.google.open ? ctx.google.reason : null;
  stats.lookupHealthy = !ctx.google.open;
  stats.ms = Date.now() - t0;
  return { items: out, cache: { schemaVersion: 1, entries }, stats };
}

// The run-metadata block written to data/pulse.json. `lookupHealthy:false` or a
// collapsed verified ratio is what scripts/check-date-health.mjs turns into an alert.
export function dateCheckMeta(stats, now = Date.now()) {
  return {
    at: new Date(now).toISOString(),
    candidates: stats.candidates,
    attempted: stats.fetched,
    resolved: stats.resolved,
    verified: stats.verified,
    inferred: stats.inferred,
    unverified: stats.unverified,
    deferred: stats.deferred,
    lookupUnavailable: stats.lookupUnavailable,
    homepageCandidates: stats.homepageCandidates,
    homepageShown: stats.homepageShown,
    lookupHealthy: stats.lookupHealthy,
    breaker: stats.breaker,
    budgetHit: stats.budgetHit,
    ms: stats.ms,
  };
}
