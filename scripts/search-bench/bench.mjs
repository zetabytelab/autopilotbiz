// Search-engine benchmark for Autopilot Index discovery.
//
// Question it answers: which engine, and which way of asking, surfaces
// reviewable leads — named companies or experiments that could plausibly enter
// the index — rather than headlines. Keyless engines always run; keyed engines
// run only when their key is present in the environment.
//
// Usage: node scripts/search-bench/bench.mjs [--out results.json] [--engines gnews,bing,...]
//   EXA_API_KEY, BRAVE_API_KEY, TAVILY_API_KEY, SERPER_API_KEY enable those engines.

import { writeFileSync } from "node:fs";
import { candidateRejectionReason, extractCandidateName } from "../update-pulse.mjs";
import { loadCompanies } from "../pulse-entities.mjs";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36";
const DAY = 86_400_000;
const since = new Date(Date.now() - 30 * DAY);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The taxonomy the collector runs today: exact thesis phrases.
export const KEYWORD = [
  '"autonomous company"', '"AI employees" startup', '"zero employees" startup AI', '"one-person unicorn"',
  '"agent-run" startup', '"AI-run business"', '"digital employees" raises', '"self-operating" startup AI',
  '"solo founder" AI agents raises', "AI voice agent called restaurants OR pubs OR shops price",
];
// Redesign 1: describe the economic signal the index needs, not the slogan.
export const SIGNAL = [
  "solo founder AI startup ARR", "AI agents run company tiny team revenue", "startup no employees AI agents profitable",
  "revenue per employee AI startup", "bootstrapped AI agent business monthly revenue", "founder replaced staff with AI agents",
  "AI-native startup handful of employees millions revenue", "agentic company raises seed autonomous operations",
];
// Redesign 2: whole-sentence objectives, for engines that embed meaning.
export const NATURAL = [
  "A startup operated mostly by AI agents with fewer than ten human employees and disclosed revenue",
  "A solo founder running a business with AI agents who reports annual recurring revenue",
  "An experiment where an AI agent autonomously runs a real business, sells products, or makes phone calls for money",
  "A newly funded company whose business runs itself with autonomous AI agents, announced in the last month",
];

const text = async (url, init = {}) => {
  const res = await fetch(url, { ...init, headers: { "user-agent": UA, ...(init.headers ?? {}) }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
};
const json = async (url, init) => JSON.parse(await text(url, init));
const rssItems = (xml) =>
  [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, b]) => {
    const f = (t) => b.match(new RegExp(`<${t}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${t}>`))?.[1]?.trim() ?? null;
    return { title: decode(f("title") ?? ""), url: decode(f("link") ?? ""), date: f("pubDate"), source: decode(f("source") ?? "") };
  });
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

export const ENGINES = {
  gnews: {
    kind: "keyword", keyless: true,
    async search(q) {
      const xml = await text(`https://news.google.com/rss/search?q=${encodeURIComponent(q + " when:30d")}&hl=en-US&gl=US&ceid=US:en`);
      return rssItems(xml).map((i) => ({ ...i, title: i.title.replace(/\s+-\s+[^-]{2,60}$/, "") }));
    },
  },
  bing: {
    kind: "keyword", keyless: true,
    async search(q) {
      const xml = await text(`https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss&setlang=en-US&cc=us`);
      // Bing wraps the publisher URL in a click-tracker; the real URL is its url= parameter.
      return rssItems(xml).map((i) => {
        let real = i.url;
        try { real = new URL(i.url).searchParams.get("url") ?? i.url; } catch {}
        return { ...i, url: real };
      });
    },
  },
  hn: {
    kind: "keyword", keyless: true,
    async search(q) {
      const d = await json(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q.replace(/"/g, ""))}&tags=story&hitsPerPage=10&numericFilters=created_at_i>${Math.floor(since / 1000)}`);
      return (d.hits ?? []).map((h) => ({ title: h.title ?? "", url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, date: h.created_at }));
    },
  },
  gdelt: {
    kind: "keyword", keyless: true, spacingMs: 6_500,
    async search(q) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const body = await text(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q + " sourcelang:english")}&mode=artlist&format=json&maxrecords=10&timespan=30d&sort=datedesc`);
        if (body.trimStart().startsWith("{")) return (JSON.parse(body).articles ?? []).map((a) => ({ title: a.title, url: a.url, date: a.seendate }));
        if (/limit requests/i.test(body)) { await sleep(20_000); continue; }
        if (/phrase is too short|too common|invalid/i.test(body)) throw new Error(body.slice(0, 80));
        return [];
      }
      throw new Error("rate-limited");
    },
  },
  exa: {
    kind: "semantic", key: "EXA_API_KEY",
    async search(q) {
      const d = await json("https://api.exa.ai/search", {
        method: "POST", headers: { "x-api-key": process.env.EXA_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({ query: q, type: "auto", category: "news", numResults: 10, startPublishedDate: since.toISOString() }),
      });
      return (d.results ?? []).map((r) => ({ title: r.title ?? "", url: r.url, date: r.publishedDate }));
    },
  },
  brave: {
    kind: "keyword", key: "BRAVE_API_KEY",
    async search(q) {
      const d = await json(`https://api.search.brave.com/res/v1/news/search?q=${encodeURIComponent(q)}&count=10&freshness=pm`, {
        headers: { "X-Subscription-Token": process.env.BRAVE_API_KEY, accept: "application/json" },
      });
      return (d.results ?? []).map((r) => ({ title: r.title ?? "", url: r.url, date: r.page_age ?? r.age }));
    },
  },
  tavily: {
    kind: "semantic", key: "TAVILY_API_KEY",
    async search(q) {
      const d = await json("https://api.tavily.com/search", {
        method: "POST", headers: { authorization: `Bearer ${process.env.TAVILY_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ query: q, topic: "news", time_range: "month", max_results: 10 }),
      });
      return (d.results ?? []).map((r) => ({ title: r.title ?? "", url: r.url, date: r.published_date }));
    },
  },
  serper: {
    kind: "keyword", key: "SERPER_API_KEY",
    async search(q) {
      const d = await json("https://google.serper.dev/news", {
        method: "POST", headers: { "X-API-KEY": process.env.SERPER_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({ q, num: 10, tbs: "qdr:m" }),
      });
      return (d.news ?? []).map((r) => ({ title: r.title ?? "", url: r.link, date: r.date }));
    },
  },
};

const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
const REDIRECTORS = /(^|\.)(news\.google\.|bing\.com$|msn\.com$)/;
const tracked = loadCompanies().map((c) => c.name.replace(/\s*\(.*\)\s*/, "").trim()).filter((n) => n.length > 3);

function features(r) {
  const h = host(r.url);
  const t = Date.parse(r.date);
  return {
    host: h,
    direct: Boolean(h) && !REDIRECTORS.test(h),
    fresh: Number.isFinite(t) ? t >= since.getTime() - DAY : null,
    rejected: candidateRejectionReason(r.title),
    name: extractCandidateName(r.title),
    tracked: tracked.find((n) => new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(r.title)) ?? null,
  };
}

async function main() {
  const arg = (f) => { const i = process.argv.indexOf(f); return i > -1 ? process.argv[i + 1] : null; };
  const only = arg("--engines")?.split(",");
  const out = arg("--out") ?? "search-bench-results.json";
  const runs = [];
  for (const [id, eng] of Object.entries(ENGINES)) {
    if (only && !only.includes(id)) continue;
    if (eng.key && !process.env[eng.key]) { console.log(`skip ${id}: ${eng.key} not set`); continue; }
    const sets = eng.kind === "semantic" ? { KEYWORD, SIGNAL, NATURAL } : { KEYWORD, SIGNAL };
    for (const [set, queries] of Object.entries(sets)) {
      for (const q of queries) {
        const t0 = Date.now();
        let results = [], error = null;
        try { results = (await eng.search(q)).slice(0, 10); } catch (e) { error = String(e.message ?? e); }
        const ms = Date.now() - t0;
        runs.push({ engine: id, set, query: q, ms, error, results: results.map((r) => ({ ...r, ...features(r) })) });
        console.log(`${id.padEnd(7)} ${set.padEnd(8)} ${String(results.length).padStart(2)} results ${String(ms).padStart(5)}ms ${error ? "ERR " + error : ""} ${q.slice(0, 50)}`);
        await sleep(eng.spacingMs ?? 1_200);
      }
    }
  }
  writeFileSync(out, JSON.stringify({ ranAt: new Date().toISOString(), since: since.toISOString(), runs }, null, 1));
  console.log(`wrote ${out}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
