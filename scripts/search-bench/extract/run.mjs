// Extraction benchmark: webclaw vs Firecrawl (both self-hosted) vs a plain fetch.
// Needs webclaw-server on 127.0.0.1:3010 (WEBCLAW_API_KEY) and Firecrawl on 127.0.0.1:3002.
// Setup and findings: docs/research/search-and-extraction-evaluation.md
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
const W = dirname(fileURLToPath(import.meta.url));
const OUT = process.env.BENCH_OUT ?? "/tmp/extract-bench";
const urls = JSON.parse(readFileSync(`${W}/urls-2026-09-15.json`, "utf8"));
const KEY = process.env.WEBCLAW_API_KEY ?? "";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36";
mkdirSync(`${OUT}/out`, { recursive: true });

const post = async (url, body, headers = {}, ms = 90_000) => {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(ms) });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, j, t };
};
const TOOLS = {
  baseline: async (u) => {                       // what the collector can do today: fetch + strip tags
    const r = await fetch(u, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(30_000) });
    const html = await r.text();
    const md = html.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#\d+;|&\w+;/g, " ").replace(/\s+/g, " ");
    return { status: r.status, md, finalUrl: r.url };
  },
  webclaw: async (u) => {
    const { status, j, t } = await post("http://127.0.0.1:3010/v1/scrape", { url: u, formats: ["markdown"], only_main_content: true }, { authorization: `Bearer ${KEY}` });
    return { status, md: j?.markdown ?? "", finalUrl: j?.metadata?.url ?? null, err: j?.error ?? (status >= 400 ? t.slice(0, 160) : null) };
  },
  firecrawl: async (u) => {
    const { status, j, t } = await post("http://127.0.0.1:3002/v2/scrape", { url: u, formats: ["markdown"], onlyMainContent: true, timeout: 60_000 });
    return { status, md: j?.data?.markdown ?? "", finalUrl: j?.data?.metadata?.url ?? j?.data?.metadata?.sourceURL ?? null, err: j?.error ?? (status >= 400 ? t.slice(0, 160) : null) };
  },
};
const words = (s) => (s.match(/[A-Za-z0-9$€£][\w$.,%'-]*/g) ?? []).length;
const linkShare = (s) => { const lines = s.split("\n").filter((l) => l.trim()); if (!lines.length) return 0; return lines.filter((l) => /^\s*[-*]?\s*\[.*\]\(.*\)\s*$/.test(l)).length / lines.length; };
const wall = /(verify you are human|access denied|attention required|enable javascript|just a moment|captcha|are you a robot|request blocked|sign in to|log in to)/i;

const tools = (process.argv[2] ?? "baseline,webclaw,firecrawl").split(",");
const rows = [];
for (const u of urls) {
  for (const tool of tools) {
    const t0 = Date.now(); let r;
    try { r = await TOOLS[tool](u.url); } catch (e) { r = { status: 0, md: "", err: String(e.message ?? e).slice(0, 160) }; }
    const ms = Date.now() - t0, md = r.md ?? "";
    const hits = u.needles.filter((n) => md.toLowerCase().includes(n.toLowerCase())).length;
    const row = { id: u.id, kind: u.kind, tool, status: r.status, ms, words: words(md), needles: `${hits}/${u.needles.length}`,
      allNeedles: u.needles.length > 0 && hits === u.needles.length, wall: wall.test(md.slice(0, 3000)), linkShare: +linkShare(md).toFixed(2), finalUrl: r.finalUrl, err: r.err ?? null };
    rows.push(row);
    writeFileSync(`${OUT}/out/${u.id}.${tool}.md`, md);
    console.log(`${u.id.padEnd(18)} ${tool.padEnd(9)} ${String(r.status).padStart(3)} ${String(ms).padStart(6)}ms ${String(row.words).padStart(6)}w needles ${row.needles} ${row.wall ? "WALL " : ""}${row.err ? "ERR " + String(row.err).slice(0, 70) : ""}`);
  }
}
writeFileSync(`${OUT}/results-${tools.join("_")}.json`, JSON.stringify(rows, null, 1));
