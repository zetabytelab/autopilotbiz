#!/usr/bin/env node
// Pulse pipeline: aggregates fresh signals for the tracked autopilot companies
// from free, keyless sources (Google News RSS, HN Algolia, Techmeme, YouTube
// channel RSS; Reddit/Bing behind flags), dedupes, classifies, scores hotness,
// and hunts for new-entrant candidates via a keyword taxonomy.
//
// Usage: node scripts/update-pulse.mjs [--reddit] [--bing] [--verbose]
// Writes: data/pulse.json, data/candidates.json (atomic; merges with previous).

import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "data");
const FLAGS = new Set(process.argv.slice(2));
const VERBOSE = FLAGS.has("--verbose");
const UA = "autopilotbiz-pulse/1.0 (category tracker; contact: site owner)";
const NOW = Date.now();
const MAX_AGE_DAYS = 30;

// ---------------------------------------------------------------- companies
// Extract {name, slug, url} from lib/data.ts (only company blocks have
// name+slug adjacent, so this doesn't match stackTools).
function loadCompanies() {
  const src = readFileSync(join(ROOT, "lib", "data.ts"), "utf8");
  const re = /name:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*url:\s*(null|"[^"]*")/g;
  const out = [];
  for (const m of src.matchAll(re)) {
    out.push({ name: m[1], slug: m[2], url: m[3] === "null" ? null : m[3].slice(1, -1) });
  }
  if (out.length < 5) throw new Error("company extraction from lib/data.ts failed");
  return out;
}

// ------------------------------------------------------- stack providers
// Watched technology providers (the stack behind the companies). Keyed by the
// EXACT tool name in lib/data.ts stackTools; slug becomes "stack-<kebab>".
// Every entry is deliberately in DISAMBIG form (query + confirm) — provider
// names are generic, so body-match trust is always off and a title must pass
// the confirm regex. Queries stay builder-focused to keep firehose noise out.
const STACK_WATCH = {
  "Claude (Anthropic)": { query: '"Anthropic" Claude model OR API OR pricing', confirm: /anthropic|claude/i },
  "Claude Code": { query: '"Claude Code"', confirm: /claude code/i },
  "OpenAI Codex": { query: '"Codex" OpenAI', confirm: /codex/i },
  "Hermes (Nous Research)": { query: '"Nous Research" OR "Hermes" open-source AI model', confirm: /nous research|hermes[- ]?\d|hermes.*(model|llm)/i },
  "OpenRouter": { query: '"OpenRouter" AI', confirm: /openrouter/i },
  "OpenClaw": { query: '"OpenClaw"', confirm: /openclaw|clawdbot|moltbot/i },
  "NanoClaw": { query: '"NanoClaw"', confirm: /nanoclaw/i },
  "Cursor": { query: '"Cursor" AI coding', confirm: /cursor.*(ai|cod|agent|ide)|anysphere/i },
  "Sciforium": { query: '"Sciforium"', confirm: /sciforium/i },
  "Z.ai (GLM-5.2)": { query: '"Z.ai" OR "GLM-5"', confirm: /z\.ai|glm|zhipu/i },
  "ElevenLabs": { query: '"ElevenLabs"', confirm: /elevenlabs/i },
};
const stackSlug = (name) =>
  "stack-" +
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Extract watched stack tools from lib/data.ts (blocks have name+url+role —
// companies have name+slug, so the shapes don't collide).
function loadStackEntities() {
  const src = readFileSync(join(ROOT, "lib", "data.ts"), "utf8");
  const re = /name:\s*"([^"]+)",\s*url:\s*"([^"]+)",\s*role:/g;
  const out = [];
  for (const m of src.matchAll(re)) {
    if (!STACK_WATCH[m[1]]) continue;
    out.push({ name: m[1], slug: stackSlug(m[1]), url: m[2] });
  }
  return out;
}

// Ambiguous names need extra query context + a confirmation regex on titles.
const DISAMBIG = {
  // NOTE: Travis Kalanick's industrial-AI startup is also named "Atoms" —
  // confirm must match the vibe-coding product, not just any AI headline.
  atoms: { query: '"atoms.dev" OR "Atoms" vibe coding', confirm: /atoms[. ]dev|deepwisdom|metagpt|vibe|app builder|coding/i },
  basis: { query: '"Basis" AI accounting', confirm: /accounting|agent|ai|khosla|accel/i },
  caffeine: { query: '"Caffeine" DFINITY AI', confirm: /dfinity|self-writing|app|ai|icp/i },
  cofounder: { query: '"Cofounder" AI agents startup', confirm: /ai|agent|general intelligence/i },
  semio: { query: '"Semio" robotics', confirm: /robot|ai/i },
  delphi: { query: '"Delphi" AI clone', confirm: /clone|digital mind|ai|sequoia/i },
  artisan: { query: '"Artisan" AI sales', confirm: /ai|sales|bdr|ava|outbound/i },
  "11x": { query: '"11x" AI SDR', confirm: /ai|sdr|sales|digital worker/i },
  lindy: { query: '"Lindy" AI', confirm: /ai|agent|assistant/i },
  // "Egbe" is a Yoruba word — without disambiguation the query drowns in
  // Nigerian news. Listing it here also disables gnews body-match trust.
  egbe: { query: '"egbe.ai" OR "Egbe" AI cofounder startup', confirm: /egbe\.ai|zero.employee|co.?founder|vyahhi|glm|z\.ai|autonomous compan/i },
};

// Extra match tokens per slug: founder names, product domains, parent companies.
// Coverage often names the founder, not the company ("Ben Broca raised $30M…"),
// so without these the best stories fail the title-mention filter.
const ALIASES = {
  polsia: ["Ben Broca", "Ben Cera"],
  atoms: ["atoms.dev", "DeepWisdom", "MetaGPT"],
  medvi: ["Matthew Gallagher"],
  egbe: ["Nikolay Vyahhi"],
  base44: ["Maor Shlomo"],
  boardy: ["Andrew D'Souza"],
  rentahuman: ["Alexander Liteplo"],
  nanocorp: ["Pierre-Louis Biojout"],
};

// Cleaned company name for title matching ("Wordware (Sauna)" → both tokens),
// plus any aliases.
function nameVariants(c) {
  const base = c.name.replace(/\s*\(.*\)\s*/, "").trim();
  const paren = c.name.match(/\(([^)]+)\)/)?.[1];
  const out = paren ? [base, paren] : [base];
  return out.concat(ALIASES[c.slug] ?? []);
}

// ------------------------------------------------------- discovery taxonomy
const TAXONOMY = [
  '"autonomous company"',
  '"AI employees" startup',
  '"zero employees" startup AI',
  '"one-person unicorn"',
  '"agent-run" startup',
  '"AI-run business"',
  '"digital employees" raises',
  '"self-operating" startup AI',
  '"solo founder" AI agents raises',
  'AI voice agent called restaurants OR pubs OR shops price', // field-experiment hunter
];

// ------------------------------------------------------------ fetch helpers
async function fetchText(url, { timeout = 10_000, retries = 1, headers = {} } = {}) {
  for (let attempt = 0; ; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { "user-agent": UA, ...headers } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt >= retries) throw err;
      await sleep(800 * (attempt + 1));
    } finally {
      clearTimeout(timer);
    }
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------------------------------------- XML helpers
const xmlBlocks = (xml, tag) =>
  [...xml.matchAll(new RegExp(`<${tag}[\\s>][\\s\\S]*?</${tag}>`, "g"))].map((m) => m[0]);
const xmlDecode = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&amp;/g, "&")
    .trim();
const xmlField = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? xmlDecode(m[1]) : null;
};
const xmlAttr = (block, tag, name) =>
  block.match(new RegExp(`<${tag}[^>]*\\b${name}="([^"]*)"`))?.[1] ?? null;

// ------------------------------------------------------------------ sources
function parseRssItems(xml, sourceId) {
  return xmlBlocks(xml, "item").map((b) => {
    const rawTitle = xmlField(b, "title") ?? "";
    const srcUrl = xmlAttr(b, "source", "url");
    return {
      title: rawTitle.replace(/\s+-\s+[^-]{2,40}$/, "").trim() || rawTitle,
      url: xmlField(b, "link"),
      domain: srcUrl ? hostOf(srcUrl) : hostOf(xmlField(b, "link") ?? ""),
      publishedAt: toIso(xmlField(b, "pubDate")),
      sourceId,
      sourceUrl: xmlField(b, "link"),
    };
  });
}

async function gnews(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + " when:30d")}&hl=en-US&gl=US&ceid=US:en`;
  return parseRssItems(await fetchText(url), "gnews").slice(0, 20);
}

async function hn(query) {
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query.replace(/"/g, ""))}&tags=story&hitsPerPage=10`;
  const json = JSON.parse(await fetchText(url));
  return (json.hits ?? []).map((h) => ({
    title: h.title ?? "",
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    domain: hostOf(h.url || "https://news.ycombinator.com"),
    publishedAt: h.created_at,
    sourceId: "hn",
    sourceUrl: `https://news.ycombinator.com/item?id=${h.objectID}`,
    points: h.points ?? 0,
    comments: h.num_comments ?? 0,
  }));
}

async function techmeme() {
  return parseRssItems(await fetchText("https://www.techmeme.com/feed.xml"), "techmeme");
}

async function redditSearch(query) {
  const url = `https://www.reddit.com/search.rss?q=${encodeURIComponent(query)}&sort=new&t=month`;
  const xml = await fetchText(url, { headers: { "user-agent": "macos:biz.autopilot.pulse:1.0 (tracker)" } });
  return xmlBlocks(xml, "entry")
    .map((b) => ({
      title: xmlField(b, "title") ?? "",
      url: xmlAttr(b, "link", "href"),
      domain: "reddit.com",
      publishedAt: toIso(xmlField(b, "updated")),
      sourceId: "reddit",
      sourceUrl: xmlAttr(b, "link", "href"),
    }))
    .slice(0, 10);
}

async function bingNews(query) {
  const url = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss&setlang=en-US&cc=us`;
  return parseRssItems(await fetchText(url), "bing").slice(0, 10);
}

// Founder/company YouTube channels (channel_id → label). Hand-maintained; the
// only keyless YouTube access is per-channel RSS — there is no keyless search.
const YOUTUBE_CHANNELS = {
  // Polsia — founder Ben Cera's self-documentary channel (@bencera-aislop),
  // the primary source for the company's story arc.
  "UCvONzA-juYE_H7cd9MQhXdw": "polsia",
  // Official company channels (linked from their sites).
  "UCFJ2Y3dktNSTFZ1kiMeTNKA": "lindy", // @Lindy-AI
  "UCg56AMyflQDXRgGL2xLZ73w": "artisan", // @GetArtisanAI
};

// Official founder/company X handles (handle → slug), hand-verified.
// Add more as they're confirmed — wrong handles poison attribution.
const X_HANDLES = {
  Bencera: "polsia", // Ben Cera, founder (verified via raise announcement)
  Egbe_ai: "egbe", // official company account (verified on egbe.ai)
};

// Pull latest tweets for all watched handles in one actor run
// (apidojo/tweet-scraper, ~$0.40/1k tweets). Sync endpoint returns the dataset.
async function apifyTweets(token) {
  const res = await fetch(
    `https://api.apify.com/v2/acts/apidojo~tweet-scraper/run-sync-get-dataset-items?token=${token}&timeout=240`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ twitterHandles: Object.keys(X_HANDLES), maxItems: 60, sort: "Latest" }),
    },
  );
  if (!res.ok) throw new Error(`apify tweet-scraper: HTTP ${res.status}`);
  const rows = await res.json();
  const items = [];
  for (const r of Array.isArray(rows) ? rows : []) {
    const handle = r.author?.userName ?? r.author?.username;
    const slug = X_HANDLES[handle];
    const text = (r.text ?? r.fullText ?? "").replace(/\s+/g, " ").trim();
    const url = r.url ?? r.twitterUrl;
    let publishedAt = null;
    try {
      publishedAt = new Date(r.createdAt).toISOString();
    } catch {}
    if (!slug || !text || !url || !publishedAt) continue;
    if (r.isRetweet || text.startsWith("RT @")) continue;
    items.push({
      title: `@${handle}: ${text.length > 160 ? text.slice(0, 157) + "…" : text}`,
      url,
      domain: "x.com",
      publishedAt,
      sourceId: "x",
      companySlug: slug,
      points: r.likeCount ?? undefined,
    });
  }
  return items;
}

// Official LinkedIn pages/profiles to watch (URL → slug), hand-verified.
const LINKEDIN_TARGETS = {
  "https://www.linkedin.com/company/egbe-ai/": "egbe", // official company page
  "https://www.linkedin.com/in/vyahhi/": "egbe", // Nikolay Vyahhi, founder
};

// harvestapi/linkedin-profile-posts (no cookies) — accepts profile AND company
// URLs. One run per target keeps attribution trivial.
async function apifyLinkedIn(token) {
  const items = [];
  for (const [target, slug] of Object.entries(LINKEDIN_TARGETS)) {
    const res = await fetch(
      `https://api.apify.com/v2/acts/harvestapi~linkedin-profile-posts/run-sync-get-dataset-items?token=${token}&timeout=180`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetUrls: [target], maxPosts: 10, postedLimit: "month", includeReposts: false }),
      },
    );
    if (!res.ok) throw new Error(`apify linkedin: HTTP ${res.status} for ${target}`);
    const rows = await res.json();
    for (const r of Array.isArray(rows) ? rows : []) {
      const text = (r.content ?? r.text ?? "").replace(/\s+/g, " ").trim();
      const url = r.linkedinUrl ?? r.postUrl ?? r.url;
      const rawDate = r.postedAt?.date ?? r.postedAt?.timestamp ?? r.postedAt ?? r.date;
      let publishedAt = null;
      try {
        publishedAt = new Date(rawDate).toISOString();
      } catch {}
      if (!text || !url || !publishedAt) continue;
      items.push({
        title: `LinkedIn: ${text.length > 160 ? text.slice(0, 157) + "…" : text}`,
        url,
        domain: "linkedin.com",
        publishedAt,
        sourceId: "linkedin",
        companySlug: slug,
        points: r.reactionsCount ?? r.likesCount ?? undefined,
      });
    }
    await sleep(500);
  }
  return items;
}

async function youtubeChannel(channelId, slug) {
  const xml = await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
  return xmlBlocks(xml, "entry")
    .map((b) => ({
      title: xmlField(b, "title") ?? "",
      url: xmlAttr(b, "link", "href"),
      domain: "youtube.com",
      publishedAt: toIso(xmlField(b, "published")),
      sourceId: "youtube",
      sourceUrl: xmlAttr(b, "link", "href"),
      companySlug: slug,
    }))
    .slice(0, 5);
}

// -------------------------------------------------------------------- utils
function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
function toIso(d) {
  const t = d ? Date.parse(d) : NaN;
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}
const STRIP_PARAMS = /^(utm_|fbclid|gclid|ref$|ref_)/;
function canonicalUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("news.google.com")) return null; // opaque redirect
    for (const k of [...u.searchParams.keys()]) if (STRIP_PARAMS.test(k)) u.searchParams.delete(k);
    u.hash = "";
    let s = `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`;
    const q = u.searchParams.toString();
    return s.toLowerCase() + (q ? `?${q}` : "");
  } catch {
    return null;
  }
}
const STOPWORDS = new Set("a an and are as at be by for from has in is it its of on or that the to was will with this new says say after amid over".split(" "));
function titleTokens(title) {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOPWORDS.has(w)),
  );
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}
const sha1 = (s) => createHash("sha1").update(s).digest("hex").slice(0, 12);

// ------------------------------------------------------------ classification
const TIER1 = /\b(raises?|raised|series [a-e]\b|seed round|pre-seed|valuation|acquires?|acquired|acquisition|merges?|ipo|arr\b|shuts? down|shutting down|lays? off|layoffs|unicorn)\b/i;
const TIER2 = /\b(launches?|launched|ships|unveils?|introduces?|partnership|partners? with|milestone|expands?|hits|surpasses|crosses)\b/i;
const INTERVIEW = /\b(interview|podcast|fireside|q&a|sits down|in conversation|talks? (to|with)|episode)\b/i;
const PRODUCT = /\b(launches?|ships|unveils?|introduces?|rolls out|beta|general availability|\bga\b|update|feature)\b/i;

function classifyKind(item, companyDomains) {
  const d = item.domain ?? "";
  const t = item.title ?? "";
  if (/youtube\.com|youtu\.be|vimeo\.com/.test(d)) return "video";
  if (INTERVIEW.test(t)) return "interview";
  if (TIER1.test(t)) return "funding";
  if (PRODUCT.test(t)) return "product";
  if (/reddit\.com|news\.ycombinator\.com|x\.com|twitter\.com/.test(d)) return "social";
  if (companyDomains.has(d)) return "blog";
  return "other";
}
const KIND_WEIGHT = { funding: 1.0, product: 0.5, interview: 0.4, video: 0.3, social: 0.2, blog: 0.1, other: 0.1 };

function scoreItem(item) {
  const kindWeight = KIND_WEIGHT[item.kind] ?? 0.1;
  let keywordBoost = 0;
  for (const m of item.title.matchAll(new RegExp(TIER1.source, "gi"))) keywordBoost += 0.4;
  for (const m of item.title.matchAll(new RegExp(TIER2.source, "gi"))) keywordBoost += 0.15;
  keywordBoost = Math.min(keywordBoost, 1.0);
  const domains = new Set(item.sources.map((s) => s.id));
  const corroboration = Math.min(0.5 * (domains.size - 1), 1.5);
  const hnSrc = item.sources.find((s) => s.points != null);
  const engagement = hnSrc ? 0.4 * Math.log10(hnSrc.points + 1) + 0.2 * Math.log10((hnSrc.comments ?? 0) + 1) : 0;
  return 1 + kindWeight + keywordBoost + corroboration + engagement; // baseScore (decay applied client-side)
}
const decayed = (baseScore, publishedAt) =>
  baseScore * Math.exp(-Math.max(0, (NOW - Date.parse(publishedAt)) / 3.6e6) / 48);

// --------------------------------------------------------------------- main
async function main() {
  // Stack providers ride the same pipeline as companies, distinguished only by
  // their "stack-" slug prefix (item.track is derived from it at write time).
  const stackEntities = loadStackEntities();
  for (const e of stackEntities) DISAMBIG[e.slug] = STACK_WATCH[e.name];
  const companies = [...loadCompanies(), ...stackEntities];
  const companyDomains = new Set(companies.map((c) => (c.url ? hostOf(c.url) : null)).filter(Boolean));
  const sourcesRun = [];
  const rawItems = [];

  async function runSource(id, fn) {
    const t0 = Date.now();
    try {
      const items = await fn();
      sourcesRun.push({ id, ok: true, items: items.length, ms: Date.now() - t0, error: null });
      rawItems.push(...items);
      if (VERBOSE) console.log(`  ✓ ${id}: ${items.length} items`);
    } catch (err) {
      sourcesRun.push({ id, ok: false, items: 0, ms: Date.now() - t0, error: String(err.message ?? err) });
      if (VERBOSE) console.log(`  ✗ ${id}: ${err.message}`);
    }
  }

  // Per-company queries (Google News sequential with politeness delay; HN parallel-ish)
  console.log(`Fetching signals for ${companies.length} companies…`);
  for (const c of companies) {
    const q = DISAMBIG[c.slug]?.query ?? `"${nameVariants(c)[0]}" AI`;
    await runSource(`gnews:${c.slug}`, async () => {
      const items = await gnews(q);
      return items.map((i) => ({ ...i, companySlug: c.slug }));
    });
    await sleep(400);
  }
  await Promise.allSettled(
    companies.map((c) =>
      runSource(`hn:${c.slug}`, async () => {
        const items = await hn(nameVariants(c)[0]);
        return items.map((i) => ({ ...i, companySlug: c.slug }));
      }),
    ),
  );

  // Techmeme firehose → keep items mentioning a tracked company
  await runSource("techmeme", async () => {
    const all = await techmeme();
    return all
      .map((i) => {
        const c = companies.find((c) => nameVariants(c).some((n) => new RegExp(`\\b${escapeRe(n)}\\b`, "i").test(i.title)));
        return c ? { ...i, companySlug: c.slug } : null;
      })
      .filter(Boolean);
  });

  // YouTube channel map
  for (const [channelId, slug] of Object.entries(YOUTUBE_CHANNELS)) {
    await runSource(`youtube:${slug}`, () => youtubeChannel(channelId, slug));
  }

  // X/Twitter via Apify (paid credits) — only runs when APIFY_TOKEN is set
  // (GitHub Actions secret; local runs without it skip silently).
  if (process.env.APIFY_TOKEN) {
    await runSource("x:apify", () => apifyTweets(process.env.APIFY_TOKEN));
    await runSource("linkedin:apify", () => apifyLinkedIn(process.env.APIFY_TOKEN));
  }

  // Discovery queries (candidates + occasionally company news)
  console.log("Running discovery taxonomy…");
  const discoveryItems = [];

  // Investor & accelerator watch — official blogs/newsletters with working RSS
  // (verified 2026-08). Items naming a tracked company route into its feed;
  // agent-economy items become radar candidates; the rest are filtered out.
  const INVESTOR_FEEDS = {
    usv: "https://blog.usv.com/feed",
    "y-combinator": "https://www.ycombinator.com/blog/rss",
    "techcrunch-vc": "https://techcrunch.com/category/venture/feed/",
    strictlyvc: "https://www.strictlyvc.com/feed/",
  };
  for (const [label, url] of Object.entries(INVESTOR_FEEDS)) {
    await runSource(`investor:${label}`, async () => {
      const xml = await fetchText(url);
      const items = parseRssItems(xml, "investor").map((i) => ({ ...i, discoveryQuery: `investor:${label}` }));
      discoveryItems.push(...items);
      return [];
    });
    await sleep(300);
  }
  for (const q of TAXONOMY) {
    await runSource(`discover:gnews:${q.slice(0, 24)}`, async () => {
      const items = (await gnews(q)).map((i) => ({ ...i, discoveryQuery: q }));
      discoveryItems.push(...items);
      return [];
    });
    await sleep(400);
  }
  await Promise.allSettled(
    TAXONOMY.slice(0, 9).map((q) =>
      runSource(`discover:hn:${q.slice(0, 24)}`, async () => {
        const items = (await hn(q)).map((i) => ({ ...i, discoveryQuery: q }));
        discoveryItems.push(...items);
        return [];
      }),
    ),
  );

  // Optional tier-2 sources
  if (FLAGS.has("--reddit")) {
    for (const q of ['"agent-run" startup', '"autonomous company" AI']) {
      await runSource(`reddit:${q.slice(0, 20)}`, async () => {
        const items = await redditSearch(q);
        discoveryItems.push(...items.map((i) => ({ ...i, discoveryQuery: q })));
        return [];
      });
      await sleep(3000);
    }
  }
  if (FLAGS.has("--bing")) {
    for (const c of companies.slice(0, 10)) {
      await runSource(`bing:${c.slug}`, async () => {
        const items = await bingNews(`"${nameVariants(c)[0]}" AI`);
        return items.map((i) => ({ ...i, companySlug: c.slug }));
      });
      await sleep(500);
    }
  }

  // Route discovery hits that actually mention a tracked company into the feed
  for (const item of discoveryItems) {
    const c = companies.find((c) => nameVariants(c).some((n) => new RegExp(`\\b${escapeRe(n)}\\b`, "i").test(item.title)));
    if (c) rawItems.push({ ...item, companySlug: c.slug });
  }

  // ------------------------------------------------------------- normalize
  const cutoff = NOW - MAX_AGE_DAYS * 86_400_000;
  const companyBySlug = new Map(companies.map((c) => [c.slug, c]));
  const valid = rawItems.filter((i) => {
    if (!i.title || !i.url || !i.publishedAt) return false;
    if (Date.parse(i.publishedAt) < cutoff) return false;
    // Company-tagged items must actually mention the company (HN/Algolia does
    // fuzzy matching and returns unrelated stories) or come from its own domain.
    if (i.companySlug) {
      const c = companyBySlug.get(i.companySlug);
      const mentions = nameVariants(c).some((n) => new RegExp(`\\b${escapeRe(n)}\\b`, "i").test(i.title));
      const ownDomain = c.url && i.domain === hostOf(c.url);
      // Google News company queries match article bodies too — for companies
      // with globally unique names (no DISAMBIG entry), a body match from the
      // scoped query is trustworthy even when the headline names only the
      // founder or describes the story obliquely.
      const trustedBodyMatch = i.sourceId === "gnews" && !DISAMBIG[i.companySlug];
      // Hand-curated official channels/feeds are trusted outright — a founder's
      // video titled "pov: raising $30M using AI" never names the company.
      const trustedChannel = ["youtube", "investor", "x", "linkedin"].includes(i.sourceId);
      if (!mentions && !ownDomain && !trustedBodyMatch && !trustedChannel) return false;
      // Ambiguous company names must also match a context regex
      const dis = DISAMBIG[i.companySlug];
      if (dis && !ownDomain && !dis.confirm.test(i.title)) return false;
    }
    return true;
  });

  // ----------------------------------------------------------------- dedup
  const merged = [];
  const byUrl = new Map();
  for (const item of valid) {
    const key = canonicalUrl(item.url);
    let target = key && byUrl.get(key);
    if (!target) {
      const tokens = titleTokens(item.title);
      target = merged.find((m) => {
        const j = jaccard(m._tokens, tokens);
        return j >= 0.6 || (tokens.size <= 5 && [...tokens].every((t) => m._tokens.has(t)));
      });
    }
    if (target) {
      if (!target.sources.some((s) => s.id === item.sourceId)) {
        target.sources.push(srcEntry(item));
      }
      if (Date.parse(item.publishedAt) < Date.parse(target.publishedAt)) target.publishedAt = item.publishedAt;
      if ((target.domain ?? "").includes("news.google.com") && !item.url.includes("news.google.com")) {
        target.url = item.url;
        target.domain = item.domain;
      }
      target.companySlug ??= item.companySlug ?? null;
    } else {
      const entry = {
        title: item.title,
        url: item.url,
        domain: item.domain,
        publishedAt: item.publishedAt,
        companySlug: item.companySlug ?? null,
        sources: [srcEntry(item)],
        _tokens: titleTokens(item.title),
      };
      merged.push(entry);
      if (key) byUrl.set(key, entry);
    }
  }

  // --------------------------------------------------- classify, score, id
  let items = merged.map((m) => {
    const kind = classifyKind(m, companyDomains);
    const withKind = { ...m, kind };
    const baseScore = round2(scoreItem(withKind));
    return {
      id: sha1(canonicalUrl(m.url) ?? m.title.toLowerCase()),
      title: m.title,
      url: m.url,
      domain: m.domain,
      publishedAt: m.publishedAt,
      companySlug: m.companySlug,
      kind,
      sources: m.sources,
      baseScore,
    };
  });

  // Merge with previous pulse.json so an outage never empties the feed
  const prevPath = join(DATA_DIR, "pulse.json");
  if (existsSync(prevPath)) {
    try {
      const prev = JSON.parse(readFileSync(prevPath, "utf8"));
      const seen = new Set(items.map((i) => i.id));
      for (const p of prev.items ?? []) {
        if (seen.has(p.id) || Date.parse(p.publishedAt) < cutoff) continue;
        // Re-validate carried-over company items against current DISAMBIG
        // rules, so a tightened confirm regex also purges old misattributions.
        const dis = p.companySlug && DISAMBIG[p.companySlug];
        if (dis && !dis.confirm.test(p.title)) continue;
        items.push(p);
      }
    } catch {}
  }
  // Derive the track from the slug prefix (also stamps carried-over items).
  items = items.map((i) => ({
    ...i,
    track: i.companySlug ? (i.companySlug.startsWith("stack-") ? "stack" : "company") : undefined,
  }));
  items.sort((a, b) => decayed(b.baseScore, b.publishedAt) - decayed(a.baseScore, a.publishedAt));

  // hot = top decile by decayed score (min 3 items), or anything scoring > 1.2
  const hotCount = Math.max(3, Math.ceil(items.length * 0.1));
  items = items.map((i, rank) => ({
    ...i,
    hot: rank < hotCount || decayed(i.baseScore, i.publishedAt) > 1.2 || undefined,
  }));

  // -------------------------------------------------------------- candidates
  const candidates = buildCandidates(discoveryItems, companies, cutoff);

  // ------------------------------------------------------------------ write
  if (items.length === 0) {
    console.error("Refusing to write: run produced zero items.");
    process.exit(1);
  }
  mkdirSync(DATA_DIR, { recursive: true });
  atomicWrite(join(DATA_DIR, "pulse.json"), {
    generatedAt: new Date().toISOString(),
    sourcesRun: compactSourcesRun(sourcesRun),
    items,
  });
  atomicWrite(join(DATA_DIR, "candidates.json"), candidates);

  const okSources = sourcesRun.filter((s) => s.ok).length;
  console.log(
    `Done: ${items.length} feed items (${items.filter((i) => i.hot).length} hot), ${candidates.candidates.length} candidates, ${okSources}/${sourcesRun.length} source queries ok.`,
  );
}

function srcEntry(item) {
  const e = { id: item.sourceId, url: item.sourceUrl ?? item.url };
  if (item.points != null) {
    e.points = item.points;
    e.comments = item.comments;
  }
  return e;
}

function buildCandidates(discoveryItems, companies, cutoff) {
  const prevPath = join(DATA_DIR, "candidates.json");
  let prev = { candidates: [] };
  if (existsSync(prevPath)) {
    try {
      prev = JSON.parse(readFileSync(prevPath, "utf8"));
    } catch {}
  }
  const prevById = new Map(prev.candidates.map((c) => [c.id, c]));

  const fresh = discoveryItems.filter((i) => {
    if (!i.title || !i.url || !i.publishedAt || Date.parse(i.publishedAt) < cutoff) return false;
    // must look like startup/agent news (kills HN fuzzy-match noise)
    if (!/\bai\b|agent|autonomous/i.test(i.title)) return false;
    if (!/startup|company|founder|raises|raised|launches|business|unicorn|employees|fundraise/i.test(i.title)) return false;
    // exclude items about companies we already track
    return !companies.some((c) => nameVariants(c).some((n) => new RegExp(`\\b${escapeRe(n)}\\b`, "i").test(i.title)));
  });

  // Group evidence by guessed name (dumb heuristic) or domain
  const groups = new Map();
  for (const i of fresh) {
    const name =
      i.title.match(
        /^([A-Z][A-Za-z0-9.&'-]*(?:\s+[A-Z][A-Za-z0-9.&'-]*){0,2})\s+(?:raises|raised|launches|unveils|debuts|lands|secures|,\s*an?\s+AI)/,
      )?.[1] ?? null;
    const key = name?.toLowerCase() ?? `domain:${i.domain}`;
    if (!groups.has(key)) groups.set(key, { name, evidence: [] });
    groups.get(key).evidence.push({
      title: i.title,
      url: i.url,
      source: i.sourceId,
      publishedAt: i.publishedAt,
      matchedKeywords: [i.discoveryQuery ?? ""],
    });
  }

  const candidates = [];
  for (const [key, g] of groups) {
    const id = sha1(key);
    const existing = prevById.get(id);
    const score = round2(Math.min(3, g.evidence.length * 0.5 + (g.name ? 0.5 : 0)));
    candidates.push({
      id,
      name: g.name,
      evidence: g.evidence.slice(0, 5),
      firstSeen: existing?.firstSeen ?? new Date().toISOString(),
      score,
      status: existing?.status ?? "new",
    });
    prevById.delete(id);
  }
  // keep previously reviewed/added/rejected entries even if not re-seen
  for (const old of prevById.values()) if (old.status !== "new") candidates.push(old);
  candidates.sort((a, b) => b.score - a.score);
  return { generatedAt: new Date().toISOString(), candidates: candidates.slice(0, 60) };
}

function compactSourcesRun(runs) {
  // Collapse per-company runs into per-source aggregates for the UI footer
  const agg = new Map();
  for (const r of runs) {
    const id = r.id.split(":")[0].replace("discover", "discovery");
    if (!agg.has(id)) agg.set(id, { id, ok: 0, failed: 0, items: 0 });
    const a = agg.get(id);
    r.ok ? a.ok++ : a.failed++;
    a.items += r.items;
  }
  return [...agg.values()];
}

function atomicWrite(path, obj) {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(obj, null, 1));
  renameSync(tmp, path);
}
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const round2 = (n) => Math.round(n * 100) / 100;

main().catch((err) => {
  console.error("pulse update failed:", err);
  process.exit(1);
});
