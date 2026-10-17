// Publish-date verification for Pulse items whose date comes from an untrusted
// aggregator (Google News / Bing News RSS). Google sometimes re-dates old
// articles, so a 2025 story can arrive with an October 2026 pubDate and walk
// straight past the age cutoff. We resolve the aggregator link to the publisher
// page and read the page's own datePublished. Keyless, no paid API, no LLM.
//
// Failure is never fatal: an item whose real date cannot be read is kept in
// pulse.json with dateVerified:false, and the homepage list skips it.

import { SIGNAL_KINDS, SIGNAL_WINDOW_DAYS } from "./registry-signals.mjs";

export const UA = "autopilotbiz-pulse/1.0 (category tracker; contact: site owner)";
export const UNTRUSTED_SOURCES = new Set(["gnews", "bing"]);
export const TOLERANCE_MS = 48 * 3.6e6; // RSS date may exceed the real date by this much
export const RETRY_AFTER_MS = 2 * 864e5; // re-try a failed lookup after 2 days…
export const MAX_ATTEMPTS = 3; // …at most 3 times, then leave it unverified
export const CACHE_TTL_MS = 45 * 864e5;
const MAX_BODY_BYTES = 600_000;

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

// A /2025/05/15/ style path is weak evidence: used only to prove a story OLDER.
export function dateFromUrlPath(url, now = Date.now()) {
  const m = String(url).match(/\/(20\d{2})[/-](0[1-9]|1[0-2])[/-](0[1-9]|[12]\d|3[01])(?:[/-]|$)/);
  return m ? cleanDate(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`, now) : null;
}

// ------------------------------------------------------------ date decision
// real older than the RSS date by more than 48h → believe the page. A real date
// equal to / newer than the RSS date keeps the RSS date (it is the earlier claim).
export function decideDate(item, real) {
  if (!real || !Number.isFinite(Date.parse(real.date))) {
    const { dateSource, rssPublishedAt, ...rest } = item;
    return { ...rest, dateVerified: false };
  }
  const rss = Date.parse(item.publishedAt);
  const r = Date.parse(real.date);
  const weakOnly = real.via === "url-path";
  if (Number.isFinite(rss) && r < rss - TOLERANCE_MS) {
    return { ...item, publishedAt: real.date, rssPublishedAt: item.rssPublishedAt ?? item.publishedAt, dateVerified: true, dateSource: real.via };
  }
  if (weakOnly) return { ...item, dateVerified: false };
  const { rssPublishedAt, ...rest } = item;
  return { ...rest, dateVerified: true, dateSource: real.via };
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

async function timedFetch(url, opts, { timeout, fetchImpl }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    return await fetchImpl(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Returns { url } on success or { error } (never throws).
export async function resolveAggregatorUrl(url, { timeout = 8_000, fetchImpl = fetch } = {}) {
  const bing = bingTarget(url);
  if (bing) return { url: bing, via: "bing-param" };
  if (!isGoogleNews(url)) return { url, via: "direct" };
  const token = googleToken(url);
  if (!token) return { error: "no-token" };
  const legacy = decodeLegacyGoogleToken(token);
  if (legacy) return { url: legacy, via: "token" };
  try {
    const page = await timedFetch(`https://news.google.com/rss/articles/${token}?hl=en-US&gl=US&ceid=US:en`, { headers: { "user-agent": UA } }, { timeout, fetchImpl });
    if (page.status === 429) return { error: "rate-limited" };
    if (!page.ok) return { error: `page-http-${page.status}` };
    const html = await page.text();
    const sg = html.match(/data-n-a-sg="([^"]+)"/)?.[1];
    const ts = html.match(/data-n-a-ts="([^"]+)"/)?.[1];
    if (!sg || !ts) return { error: "no-params" };
    const inner = JSON.stringify(["garturlreq", [["X", "X", ["X", "X"], null, null, 1, 1, "US:en", null, 1, null, null, null, null, null, 0, 1], "X", "X", 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0], token, Number(ts), sg]);
    const body = "f.req=" + encodeURIComponent(JSON.stringify([[["Fbv4je", inner, null, "generic"]]]));
    const res = await timedFetch(
      "https://news.google.com/_/DotsSplashUi/data/batchexecute",
      { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8", "user-agent": UA }, body },
      { timeout, fetchImpl },
    );
    if (res.status === 429) return { error: "rate-limited" };
    if (!res.ok) return { error: `batch-http-${res.status}` };
    const text = await res.text();
    const arr = JSON.parse(JSON.parse(text.split("\n\n")[1])[0][2]);
    const out = arr?.[1];
    if (typeof out !== "string" || !/^https?:\/\//.test(out) || GOOGLE_HOSTS.test(hostOf(out))) return { error: "no-url" };
    return { url: out, via: "batchexecute" };
  } catch (e) {
    return { error: e?.name === "AbortError" ? "timeout" : "resolve-failed" };
  }
}

// Reads at most ~600 KB: dates live in <head> or the JSON-LD near the top.
export async function fetchPageHtml(url, { timeout = 8_000, fetchImpl = fetch } = {}) {
  try {
    const res = await timedFetch(url, { headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" }, redirect: "follow" }, { timeout, fetchImpl });
    if (!res.ok) return { error: `http-${res.status}` };
    if (!res.body?.getReader) return { html: (await res.text()).slice(0, MAX_BODY_BYTES) };
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
    return { html };
  } catch (e) {
    return { error: e?.name === "AbortError" ? "timeout" : "fetch-failed" };
  }
}

// Look up one item's real date. Returns a cache entry.
export async function lookupRealDate(item, { now = Date.now(), fetchImpl = fetch, timeout = 8_000, state = {} } = {}) {
  const base = { checkedAt: new Date(now).toISOString() };
  const r = await resolveAggregatorUrl(item.url, { timeout, fetchImpl });
  if (r.error) {
    if (r.error === "rate-limited") state.rateLimited = true;
    return { ...base, status: `resolve:${r.error}`, realDate: null };
  }
  const page = await fetchPageHtml(r.url, { timeout, fetchImpl });
  const urlDate = dateFromUrlPath(r.url, now);
  if (page.error) {
    return { ...base, status: `page:${page.error}`, publisherUrl: r.url, realDate: urlDate, via: urlDate ? "url-path" : null };
  }
  const d = extractPublishedDate(page.html, now);
  if (d) return { ...base, status: "ok", publisherUrl: r.url, realDate: d.date, via: d.via };
  return { ...base, status: "page:no-date", publisherUrl: r.url, realDate: urlDate, via: urlDate ? "url-path" : null };
}

// ----------------------------------------------------------------- cache
export function normalizeCache(raw, now = Date.now()) {
  const entries = {};
  for (const [k, v] of Object.entries(raw?.entries ?? {})) {
    if (v && typeof v.checkedAt === "string" && now - Date.parse(v.checkedAt) < CACHE_TTL_MS) entries[k] = v;
  }
  return { schemaVersion: 1, entries };
}

// "ok" entries are final; failures retry after 2 days, up to 3 attempts.
export function cacheAction(entry, now) {
  if (!entry) return "fetch";
  if (entry.status === "ok") return "use";
  if ((entry.attempts ?? 1) >= MAX_ATTEMPTS) return "use";
  return now - Date.parse(entry.checkedAt) >= RETRY_AFTER_MS ? "fetch" : "use";
}

const realFromEntry = (e) => (e?.realDate ? { date: e.realDate, via: e.via ?? "page" } : null);

// ------------------------------------------------------------- orchestration
// Stamps every aggregator-only item with dateVerified true/false and corrects
// re-dated ones. At most `cap` new lookups per run (best-scored first); the
// rest stay dateVerified:false and are picked up on later runs. Never throws.
export async function verifyDates(items, { cache, now = Date.now(), cap = 60, concurrency = 3, fetchImpl = fetch, timeout = 8_000, window = 30 * 864e5, lookup = lookupRealDate } = {}) {
  const entries = cache?.entries ?? {};
  const stats = { candidates: 0, cacheHits: 0, fetched: 0, ok: 0, failed: 0, corrected: 0, deferred: 0, ms: 0 };
  const t0 = Date.now();
  const out = items.map((i) => ({ ...i }));
  const queue = [];
  out.forEach((item, idx) => {
    if (!itemNeedsDateCheck(item)) return;
    if (Date.parse(item.publishedAt) < now - window) return; // expires on its own
    stats.candidates++;
    const entry = entries[item.id];
    if (cacheAction(entry, now) === "use") {
      stats.cacheHits++;
      out[idx] = decideDate(item, realFromEntry(entry));
    } else queue.push(idx);
  });
  // Homepage-eligible items (news kinds, inside the homepage window) go first.
  const homepageish = (i) => SIGNAL_KINDS.includes(i.kind) && Date.parse(i.publishedAt) >= now - SIGNAL_WINDOW_DAYS * 864e5 ? 1 : 0;
  queue.sort((a, b) => homepageish(out[b]) - homepageish(out[a]) || (out[b].baseScore ?? 0) - (out[a].baseScore ?? 0) || Date.parse(out[b].publishedAt) - Date.parse(out[a].publishedAt));
  const todo = queue.slice(0, cap);
  for (const idx of queue.slice(cap)) {
    stats.deferred++;
    out[idx] = decideDate(out[idx], realFromEntry(entries[out[idx].id]));
  }
  const state = { rateLimited: false };
  let next = 0;
  async function worker() {
    while (next < todo.length && !state.rateLimited) {
      const idx = todo[next++];
      const item = out[idx];
      let entry;
      try {
        entry = await lookup(item, { now, fetchImpl, timeout, state });
      } catch {
        entry = { checkedAt: new Date(now).toISOString(), status: "lookup:error", realDate: null };
      }
      stats.fetched++;
      const prev = entries[item.id];
      entry.attempts = entry.status === "ok" ? 1 : (prev?.attempts ?? 0) + 1;
      entries[item.id] = entry;
      out[idx] = decideDate(item, realFromEntry(entry));
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  // Items skipped because Google rate-limited us stay unverified.
  for (const idx of todo.slice(next)) {
    stats.deferred++;
    out[idx] = decideDate(out[idx], realFromEntry(entries[out[idx].id]));
  }
  for (let i = 0; i < out.length; i++) {
    if (out[i].dateVerified === true) stats.ok++;
    else if (out[i].dateVerified === false) stats.failed++;
    if (out[i].rssPublishedAt && out[i].rssPublishedAt !== items[i].rssPublishedAt) stats.corrected++;
  }
  stats.rateLimited = state.rateLimited;
  stats.ms = Date.now() - t0;
  return { items: out, cache: { schemaVersion: 1, entries }, stats };
}
