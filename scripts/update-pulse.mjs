#!/usr/bin/env node
// Pulse pipeline: aggregates fresh signals for the tracked autopilot companies
// from free, keyless sources (Google News RSS, HN Algolia, Techmeme, YouTube
// channel RSS; Reddit/Bing behind flags), dedupes, classifies, scores hotness,
// and hunts for new-entrant candidates via a keyword taxonomy.
//
// Usage: node scripts/update-pulse.mjs [--reddit] [--bing] [--verbose] [--social-plan | --social-only]
// Writes: data/pulse.json, data/candidates.json (atomic; merges with previous).

import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

import { loadCompanies, loadStackEntities, STACK_WATCH } from "./pulse-entities.mjs";
import { readWatchlist, collectionPlan, socialSettings, collectSocial, isTrustedSocial, validateSocialState, restoreLegacySocial } from "./pulse-social.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "data");
const FLAGS = new Set(process.argv.slice(2));
const VERBOSE = FLAGS.has("--verbose");
const UA = "autopilotbiz-pulse/1.0 (category tracker; contact: site owner)";
const NOW = Date.now();
const MAX_AGE_DAYS = 30;

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
  // Press says "Lambda", not "Lambda Labs" — confirm regex gates AWS Lambda noise.
  "stack-lambda-labs": ["Lambda"],
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

// Return an explicit reason for coverage diagnostics and carry-over validation.
export function itemRejectionReason(item, companyBySlug, cutoff, watchlist) {
  if (!item.title || !item.url || !Number.isFinite(Date.parse(item.publishedAt))) return "malformed";
  if (Date.parse(item.publishedAt) < cutoff) return "expired";
  if (Date.parse(item.publishedAt) > NOW + 300_000) return "future-date";
  const sourceIds = item.sourceId ? [item.sourceId] : (item.sources ?? []).map((s) => s.id);
  const socialSource = sourceIds.some((id) => id === "x" || id === "linkedin");
  const trustedSocial = isTrustedSocial(item, watchlist);
  if ((socialSource || item.social) && !trustedSocial) return "unverified-social-account";
  if (!item.companySlug) return null;
  const company = companyBySlug.get(item.companySlug);
  if (!company) return "unknown-company";
  const mentions = nameVariants(company).some((n) => new RegExp(`\\b${escapeRe(n)}\\b`, "i").test(item.title));
  const ownDomain = company.url && item.domain === hostOf(company.url);
  const trustedBody = sourceIds.includes("gnews") && !DISAMBIG[item.companySlug];
  const trustedChannel = trustedSocial || sourceIds.some((id) => id === "youtube" || id === "investor");
  if (!mentions && !ownDomain && !trustedBody && !trustedChannel) return "company-not-mentioned";
  const dis = DISAMBIG[item.companySlug];
  if (dis && !ownDomain && !trustedChannel && !dis.confirm.test(item.title)) return "ambiguous-company";
  return null;
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
// Money / M&A vocabulary — deliberately broader than TIER1 (adds buy/join/deal/
// merger/takeover) because acquisition headlines get re-worded wildly.
const MONEY_MA = /\b(raises?|raised|series [a-e]\b|seed round|pre-seed|valuation|acquires?|acquired|acquisition|buys?|buying|to buy|bought|merges?|merger|takeover|joins?|joining|snaps? up|strikes? a deal|\bdeal\b|ipo|arr\b|shuts? down|lays? off|layoffs|unicorn)\b/i;
// Are two stories the same event? Used both within a run and against
// carried-over items, so a story re-reported on a later day or by another
// outlet folds its source in instead of spawning a near-duplicate card.
function isDupCluster(mTokens, mTitle, mSlug, mPub, tokens, title, slug, pub) {
  const j = jaccard(mTokens, tokens);
  if (j >= 0.5) return true;
  if (tokens.size <= 5 && [...tokens].every((t) => mTokens.has(t))) return true;
  // Same company + both money/M&A headlines + tight window ⇒ almost certainly
  // the same deal (a company rarely has two distinct money events in 6 days).
  // A low overlap floor still guards against a raise-vs-acquisition false merge.
  if (mSlug && mSlug === slug && MONEY_MA.test(mTitle) && MONEY_MA.test(title) &&
      Math.abs(Date.parse(mPub) - Date.parse(pub)) < 6 * 864e5 && j >= 0.2) return true;
  return false;
}
// A source's identity for display/dedup is its PUBLISHER host (many outlets
// arrive through one pipeline id like "gnews"), falling back to the pipeline id.
function srcKey(s) {
  return hostOf(s.url) || s.id;
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
  if (/reddit\.com|news\.ycombinator\.com|x\.com|twitter\.com|linkedin\.com/.test(d)) return "social";
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
export async function main({ dataDir = DATA_DIR, flags = FLAGS, runSocial = collectSocial } = {}) {
  // Stack providers ride the same pipeline as companies, distinguished only by
  // their "stack-" slug prefix (item.track is derived from it at write time).
  const stackEntities = loadStackEntities();
  for (const e of stackEntities) DISAMBIG[e.slug] = STACK_WATCH[e.name];
  const companies = [...loadCompanies(), ...stackEntities];
  const watchlist = readWatchlist(join(dataDir, "social-watchlist.json"), companies);
  const settings = socialSettings();
  const plan = collectionPlan(watchlist, settings);
  if (flags.has("--social-plan")) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }
  const statePath = join(dataDir, "social-state.json");
  const socialState = existsSync(statePath) ? validateSocialState(JSON.parse(readFileSync(statePath, "utf8"))) : { schemaVersion: 1, targets: {} };
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

  if (!flags.has("--social-only")) {
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
  }

  // Every confirmed account gets its own bounded request; a target failure
  // cannot erase other targets' results. Missing credentials remain visible.
  console.log(`Social watch list: ${plan.xAccounts} X accounts, ${plan.linkedinProfiles} LinkedIn profiles, ${plan.linkedinCompanies} company pages`);
  const social = await runSocial({ watchlist, token: process.env.APIFY_TOKEN, state: socialState, settings, now: NOW });
  rawItems.push(...social.items);
  sourcesRun.push(...social.runs);
  const socialStatuses = Object.fromEntries(["ok", "empty", "partial", "failed", "skipped"].map((status) => [status, social.runs.filter((r) => r.status === status).length]));
  console.log(`Social results: ${JSON.stringify(socialStatuses)}`);
  for (const run of social.runs) {
    if (!run.ok && (VERBOSE || run.status === "failed")) console.warn(`Social ${run.status}: ${run.id}${run.reason ? ` (${run.reason})` : ""}`);
  }

  // Discovery queries (candidates + occasionally company news)
  const discoveryItems = [];
  if (!flags.has("--social-only")) {
    console.log("Running discovery taxonomy…");

    // Investor & accelerator watch — official blogs/newsletters with working RSS
    // (verified 2026-08). Items naming a tracked company route into its feed;
    // agent-economy items become radar candidates; the rest are filtered out.
    const INVESTOR_FEEDS = {
      usv: "https://blog.usv.com/feed",
      "y-combinator": "https://www.ycombinator.com/blog/rss",
      "techcrunch-vc": "https://techcrunch.com/category/venture/feed/",
      strictlyvc: "https://www.strictlyvc.com/feed/",
      // Accelerator radar (2026-08-20): programs explicitly backing agent-run /
      // tiny-team companies — demo-day cohorts feed the candidates pipeline.
      neo: "https://neo.substack.com/feed",
      spc: "https://blog.southparkcommons.com/feed",
      a16z: "https://a16z.com/feed/",
      lobstercap: "https://lobstercap.substack.com/feed",
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
    if (flags.has("--reddit")) {
      for (const q of ['"agent-run" startup', '"autonomous company" AI']) {
        await runSource(`reddit:${q.slice(0, 20)}`, async () => {
          const items = await redditSearch(q);
          discoveryItems.push(...items.map((i) => ({ ...i, discoveryQuery: q })));
          return [];
        });
        await sleep(3000);
      }
    }
    if (flags.has("--bing")) {
      for (const c of companies.slice(0, 10)) {
        await runSource(`bing:${c.slug}`, async () => {
          const items = await bingNews(`"${nameVariants(c)[0]}" AI`);
          return items.map((i) => ({ ...i, companySlug: c.slug }));
        });
        await sleep(500);
      }
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
  const valid = rawItems.filter((item) => {
    const reason = itemRejectionReason(item, companyBySlug, cutoff, watchlist);
    if (reason && item.social) {
      const run = social.report.targets.find((r) => r.id === item.social.targetId);
      if (run) {
        run.filtered ??= {};
        run.filtered[reason] = (run.filtered[reason] ?? 0) + 1;
      }
    }
    return !reason;
  });

  // ----------------------------------------------------------------- dedup
  const merged = [];
  const byUrl = new Map();
  for (const item of valid) {
    const key = canonicalUrl(item.url);
    let target = key && byUrl.get(key);
    if (!target) {
      const tokens = titleTokens(item.title);
      target = merged.find((m) =>
        !item.social && !m.social && isDupCluster(m._tokens, m.title, m.companySlug, m.publishedAt, tokens, item.title, item.companySlug, item.publishedAt),
      );
    }
    if (target) {
      const e = srcEntry(item);
      if (!target.sources.some((s) => srcKey(s) === srcKey(e))) target.sources.push(e);
      if (Date.parse(item.publishedAt) < Date.parse(target.publishedAt)) target.publishedAt = item.publishedAt;
      if ((target.domain ?? "").includes("news.google.com") && !item.url.includes("news.google.com")) {
        target.url = item.url;
        target.domain = item.domain;
      }
      if (item.social) {
        target.social = item.social;
        target.companySlug = item.companySlug;
      } else if (!target.social) target.companySlug ??= item.companySlug ?? null;
    } else {
      const entry = {
        title: item.title,
        url: item.url,
        domain: item.domain,
        publishedAt: item.publishedAt,
        companySlug: item.companySlug ?? null,
        sources: [srcEntry(item)],
        ...(item.social ? { social: item.social } : {}),
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
      ...(m.social ? { social: m.social } : {}),
    };
  });

  // Merge with previous pulse.json so an outage never empties the feed
  const prevPath = join(dataDir, "pulse.json");
  if (existsSync(prevPath)) {
    try {
      const prev = JSON.parse(readFileSync(prevPath, "utf8"));
      const seen = new Set(items.map((i) => i.id));
      // Cluster carried-over items against the fresh set by title similarity,
      // not just id — otherwise the same story re-reported on a later day (or
      // by another outlet) piles up as a near-duplicate card. A match folds its
      // sources into the existing item; only genuinely new stories are kept.
      const clusterIdx = items.map((i) => ({ item: i, tokens: titleTokens(i.title) }));
      for (const previous of prev.items ?? []) {
        const p = restoreLegacySocial(previous, watchlist);
        if (seen.has(p.id) || Date.parse(p.publishedAt) < cutoff) continue;
        // Re-validate carried-over company items against current DISAMBIG
        // rules, so a tightened confirm regex also purges old misattributions.
        if (itemRejectionReason(p, companyBySlug, cutoff, watchlist)) continue;
        const ptokens = titleTokens(p.title);
        const hit = clusterIdx.find(({ item, tokens }) =>
          !p.social && !item.social && isDupCluster(tokens, item.title, item.companySlug, item.publishedAt, ptokens, p.title, p.companySlug, p.publishedAt),
        );
        if (hit) {
          for (const s of p.sources ?? []) {
            if (!hit.item.sources.some((x) => srcKey(x) === srcKey(s))) hit.item.sources.push(s);
          }
          if (Date.parse(p.publishedAt) < Date.parse(hit.item.publishedAt)) hit.item.publishedAt = p.publishedAt;
          continue;
        }
        items.push(p);
        clusterIdx.push({ item: p, tokens: ptokens });
      }
    } catch {}
  }
  // Derive the track from the slug prefix (also stamps carried-over items).
  const subjectById = new Map(watchlist.subjects.map((subject) => [subject.id, subject]));
  items = items.map((i) => {
    const trackSlug = i.companySlug ?? subjectById.get(i.social?.subjectId)?.pulseSlug;
    return { ...i, track: trackSlug ? (trackSlug.startsWith("stack-") ? "stack" : "company") : undefined };
  });
  items.sort((a, b) => decayed(b.baseScore, b.publishedAt) - decayed(a.baseScore, a.publishedAt));

  // hot = top decile by decayed score (min 3 items), or anything scoring > 1.2
  const hotCount = Math.max(3, Math.ceil(items.length * 0.1));
  items = items.map((i, rank) => ({
    ...i,
    hot: rank < hotCount || decayed(i.baseScore, i.publishedAt) > 1.2 || undefined,
  }));

  // -------------------------------------------------------------- candidates
  const candidates = buildCandidates(discoveryItems, companies, cutoff, dataDir);

  // ------------------------------------------------------------------ write
  if (items.length === 0) {
    atomicWrite(join(dataDir, "social-coverage.json"), social.report);
    throw new Error("Refusing to write feed: run produced zero items (coverage report saved).");
  }
  mkdirSync(dataDir, { recursive: true });
  atomicWrite(join(dataDir, "pulse.json"), {
    generatedAt: new Date().toISOString(),
    sourcesRun: compactSourcesRun(sourcesRun),
    items,
  });
  atomicWrite(join(dataDir, "candidates.json"), candidates);
  for (const run of social.report.targets) {
    const fresh = new Set(social.items.filter((i) => i.social.targetId === run.id).map((i) => canonicalUrl(i.url)));
    run.published = items.filter((i) => i.social?.targetId === run.id && fresh.has(canonicalUrl(i.url))).length;
    run.retained = items.filter((i) => i.social?.targetId === run.id && !fresh.has(canonicalUrl(i.url))).length;
  }
  atomicWrite(join(dataDir, "social-coverage.json"), social.report);
  atomicWrite(statePath, social.state);

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

// ------------------------------------------------------------- candidates
// A candidate is a COMPANY, not a headline. Three things have to happen before
// a discovery item becomes one: reject items that are not about a company at
// all, pull the company's name out of the title, and collapse every outlet
// covering the same story into a single row. Grouping used to key on the
// publisher domain, which did the exact opposite — eight outlets covering one
// acquisition produced eight candidates.

const MEGACAPS = new Set([
  "meta", "facebook", "google", "alphabet", "microsoft", "amazon", "apple", "openai",
  "anthropic", "nvidia", "salesforce", "adobe", "ibm", "oracle", "samsung", "tesla",
  "baidu", "alibaba", "tencent", "netflix", "uber", "shopify", "intel", "qualcomm",
  "sap", "servicenow", "workday", "snowflake", "databricks", "xai", "deepmind",
]);

// Headline shapes that are never a company: listicles, explainers, questions,
// self-promotion and trend pieces. Each returns an explicit reason so a human
// reviewing the run can see why something was dropped.
export function candidateRejectionReason(title) {
  const t = (title ?? "").trim();
  if (!t) return "empty-title";
  if (/^\d+\s/.test(t) || /\b\d+\s+(?:ai\s+)?(?:tools|ways|things|tips|startups|companies|apps|reasons|lessons|trends|predictions)\b/i.test(t))
    return "listicle";
  if (/^(?:how|why|what|what's|when|where|which|who|is|are|can|should|does|do|will)\b/i.test(t))
    return "explainer";
  if (/^i\s+(?:made|built|created|launched|shipped)\b/i.test(t) || /^(?:show|ask)\s+hn\b/i.test(t))
    return "self-promotion";
  if (/\b(?:is|are)\s+betting\s+on\b|\bbets\s+on\b|\bbest\s+\d*\s*(?:ai\s+)?(?:tools|platforms|apps)\b|\bhere's\s+(?:how|why)\b/i.test(t))
    return "trend-piece";
  return null;
}

// Headlines capitalise their verbs ("Adobe Buys Indian AI Startup Rilo"), so the
// qualifier words have to match either case while the company name itself must
// still start with a capital. A blanket /i flag would break that, because it
// makes [A-Z] match lowercase too.
const ci = (w) =>
  w
    .split("")
    .map((c) => (/[a-z]/.test(c) ? `[${c.toUpperCase()}${c}]` : c))
    .join("");
const anyCase = (...words) => `(?:${words.map(ci).join("|")})`;

const NAME = "([A-Z][\\w.&'’-]*(?:\\s+[A-Z][\\w.&'’-]*){0,2})";
const QUALIFIER = anyCase("startup", "company", "firm", "platform", "maker", "unicorn", "business");
const BOUGHT = anyCase("acquires", "acquired", "buys", "bought", "snaps up");
const RAISED = anyCase("raises", "raised", "secures", "secured", "lands", "nets", "closes", "banks");
const SHIPPED = anyCase(
  "launches", "launched", "unveils", "debuts", "introduces", "brings", "announces",
  "ships", "opens", "expands", "hits", "reaches", "crosses", "adds",
);

// Ordered most specific first. An acquisition names two companies and the
// interesting one is the target, not the buyer.
const NAME_PATTERNS = [
  new RegExp(`\\b${BOUGHT}\\b[^,]*?\\b${QUALIFIER}\\s+${NAME}`),
  new RegExp(`\\b${QUALIFIER}\\s+${NAME}`),
  new RegExp(`^${NAME}\\s+${RAISED}\\b`),
  new RegExp(`^${NAME}\\s+${SHIPPED}\\b`),
  new RegExp(`^${NAME},\\s+(?:an?|the)\\s+[^,]*\\b(?:AI|agent|startup|company)\\b`),
  new RegExp(`^${NAME}\\s+${anyCase("revenue", "arr", "valuation")}\\b`),
  /\b([A-Z][\w-]*\.(?:ai|com|io|co|dev|app))\b/,
];

// Words that look like a name to the patterns above but never are one. Only
// stripped from the FRONT of a capture: "MAGIC AI" must survive intact, while
// "This Indian AI startup" must not become a candidate called "This".
const NOT_NAMES = new Set([
  "the", "this", "that", "these", "exclusive", "new", "ai", "an", "a", "its", "his", "her",
  "their", "one", "first", "second", "indian", "us", "uk", "european", "chinese", "silicon",
  "peak", "backed",
]);

// Title Case headlines capitalise every word, so a capture can run past the end
// of the name ("Rilo To Expand Agentic Push"). A name stops at the first
// function word.
const NAME_STOPS = new Set([
  "to", "for", "in", "on", "at", "and", "or", "with", "after", "as", "by", "from",
  "of", "the", "a", "an", "is", "are", "its", "will", "into", "over", "amid", "it",
]);

export function extractCandidateName(title) {
  for (const re of NAME_PATTERNS) {
    const raw = (title ?? "").match(re)?.[1]?.trim();
    if (!raw) continue;
    const words = raw.split(/\s+/);
    while (words.length && NOT_NAMES.has(words[0].toLowerCase())) words.shift();
    const stop = words.findIndex((w) => NAME_STOPS.has(w.toLowerCase()));
    const kept = stop === -1 ? words : words.slice(0, stop);
    if (!kept.length) continue;
    const name = kept.join(" ");
    if (name.length < 2) continue;
    return name;
  }
  return null;
}

const CANDIDATE_STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "for", "to", "of", "in", "on", "at", "by", "with",
  "from", "as", "is", "are", "was", "were", "be", "it", "its", "this", "that", "after",
  "less", "than", "year", "new", "just", "more", "into", "over", "up", "out", "second",
]);

// Crude stem so "acquires"/"acquired"/"acquisition" collapse to one token.
const stem = (w) => w.replace(/(?:ition|ing|ies|ied|ed|es|s)$/, "");

export function candidateTokens(title) {
  return new Set(
    (title ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9\s.-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !CANDIDATE_STOPWORDS.has(w))
      .map(stem),
  );
}

export function titleSimilarity(a, b) {
  const x = candidateTokens(a);
  const y = candidateTokens(b);
  if (!x.size || !y.size) return 0;
  let shared = 0;
  for (const t of x) if (y.has(t)) shared++;
  return shared / (x.size + y.size - shared);
}

const SIMILARITY_MERGE = 0.5;

// Thesis keywords: the site tracks businesses that run themselves, so a headline
// about headcount-free operation is worth more than a generic AI funding round.
const THESIS_RE =
  /\bone-person\b|\bsolo founder\b|\bno employees\b|\bzero employees\b|\bAI employees\b|\bdigital employees\b|\bautonomous company\b|\bruns itself\b|\bagent-run\b|\btiny team\b|\bwithout employees\b/i;
const MONEY_RE = /\$\d|\bARR\b|\braises?\b|\braised\b|\bfunding\b|\bseries [a-e]\b|\bvaluation\b|\bseed round\b/i;
const ACQUISITION_RE = /\b(?:acquires|acquired|buys|bought|snaps up|acquisition)\b/i;
const STRONG_DOMAINS =
  /(?:techcrunch|theinformation|bloomberg|reuters|ft\.com|wsj|axios|forbes|sifted|business insider)/i;

export function scoreCandidate(group) {
  const titles = group.evidence.map((e) => e.title).join(" · ");
  const publishers = new Set(group.evidence.map((e) => e.domain).filter(Boolean));
  const reasons = [];
  let score = 0;
  if (group.name) {
    score += 1;
    reasons.push("named entity");
  }
  const corroboration = Math.min(0.5 * Math.max(0, publishers.size - 1), 1.5);
  if (corroboration > 0) {
    score += corroboration;
    reasons.push(`${publishers.size} publishers`);
  }
  if (THESIS_RE.test(titles)) {
    score += 1;
    reasons.push("autonomy thesis");
  }
  if (MONEY_RE.test(titles)) {
    score += 0.75;
    reasons.push("funding or revenue figure");
  }
  if (group.evidence.some((e) => e.source === "investor" || STRONG_DOMAINS.test(e.domain ?? ""))) {
    score += 0.5;
    reasons.push("strong outlet");
  }
  if (ACQUISITION_RE.test(titles)) {
    score -= 0.5;
    reasons.push("acquired — no longer independent");
  }
  return { score: round2(Math.max(0, Math.min(5, score))), reasons, publishers: publishers.size };
}

function buildCandidates(discoveryItems, companies, cutoff, dataDir = DATA_DIR) {
  const prevPath = join(dataDir, "candidates.json");
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
    if (candidateRejectionReason(i.title)) return false;
    // exclude items about companies we already track
    return !companies.some((c) => nameVariants(c).some((n) => new RegExp(`\\b${escapeRe(n)}\\b`, "i").test(i.title)));
  });

  // Group by company, not by publisher. Named items go first so that an unnamed
  // headline about the same story ("Adobe just acquired this Indian AI startup")
  // can merge into the named group regardless of the order they arrived in.
  const named = [];
  const unnamed = [];
  for (const i of fresh) {
    const name = extractCandidateName(i.title);
    if (name && MEGACAPS.has(name.toLowerCase())) continue; // a megacap shipping a feature is not a candidate
    const evidence = {
      title: i.title,
      url: i.url,
      source: i.sourceId,
      domain: i.domain ?? null,
      publishedAt: i.publishedAt,
      matchedKeywords: [i.discoveryQuery ?? ""],
    };
    (name ? named : unnamed).push({ name, evidence });
  }

  const groups = [];
  const byName = new Map();
  for (const { name, evidence } of named) {
    const key = name.toLowerCase();
    if (!byName.has(key)) {
      const g = { key, name, evidence: [] };
      byName.set(key, g);
      groups.push(g);
    }
    byName.get(key).evidence.push(evidence);
  }
  for (const { evidence } of unnamed) {
    const match = groups.find((g) =>
      g.evidence.some((e) => titleSimilarity(e.title, evidence.title) >= SIMILARITY_MERGE),
    );
    if (match) match.evidence.push(evidence);
    else groups.push({ key: `title:${sha1(evidence.title)}`, name: null, evidence: [evidence] });
  }

  const candidates = [];
  for (const g of groups) {
    const id = sha1(g.key);
    const existing = prevById.get(id);
    const { score, reasons, publishers } = scoreCandidate(g);
    g.evidence.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    candidates.push({
      id,
      name: g.name,
      evidence: g.evidence.slice(0, 5),
      coverage: g.evidence.length,
      publishers,
      firstSeen: existing?.firstSeen ?? new Date().toISOString(),
      score,
      reasons,
      status: existing?.status ?? "new",
    });
    prevById.delete(id);
  }
  // keep previously reviewed/added/rejected entries even if not re-seen
  for (const old of prevById.values()) if (old.status !== "new") candidates.push(old);
  candidates.sort((a, b) => b.score - a.score || (b.coverage ?? 0) - (a.coverage ?? 0));
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("pulse update failed:", err);
    process.exitCode = 1;
  });
}
