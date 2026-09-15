# Search and extraction tools for the Autopilot Index agent

Evaluated 13–15 September 2026. Two questions: which **search engine** finds leads for the index now that Google News links no longer resolve, and which **extraction tool** turns a found URL into text an agent can verify.

Reproduce:

- Search: `npm run search:bench` (`scripts/search-bench/bench.mjs`, labels in `labels-2026-09-13.json`)
- Extraction: `scripts/search-bench/extract/run.mjs` (URL set, results and setup below)

---

## 1. Search engines (13 September 2026)

### What broke

Google News RSS links are opaque redirectors that no longer resolve to the publisher, even from US GitHub runners. The run on 13 September left 1 of 1 candidate URLs on `news.google.com`, and 836 of 3,358 collected items carried Google links. Scraping the link does not help either: webclaw and Firecrawl both return Google's language and consent page, not the article.

### Method

Eighteen queries against four keyless engines, in two designs:

- **KEYWORD**: the collector's current exact-phrase taxonomy (`"autonomous company"`, `"one-person unicorn"` and so on).
- **SIGNAL**: queries describing the economics the index needs (`solo founder AI startup ARR`, `founder replaced staff with AI agents`).

All 151 unique results were hand labelled: **lead** (a named company or experiment that could enter the index or watchlist), **context** (useful for an edition) or **noise**.

### Results

| Engine · query design | Unique results | Leads | Useful (lead or context) |
|---|---|---|---|
| Google News · KEYWORD | 45 | 2 | 27% |
| Google News · SIGNAL | 61 | 9 | 48% |
| Bing News · KEYWORD | 11 | 2 | 73% |
| Bing News · SIGNAL | 27 | 3 | 81% |
| Hacker News · both | 12 | 1 | 25% |
| GDELT · both | 2 | 1 | rate-limited on 12 of 18 queries |

- **Query design mattered more than engine.** SIGNAL queries found 12 leads, KEYWORD found 4, with zero overlap.
- **Bing News RSS** has the best precision, and its links carry the publisher URL in the `url=` parameter. It returns nothing for quoted phrases, has low volume and no date filter (17–54% of results were within 30 days), so filter dates client-side.
- **Hacker News** returned no leads on the thesis phrases. **GDELT** refuses requests closer than about 5 seconds apart and still rate-limited at 6.5 seconds.
- Revenue-estimate pages ("X Revenue 2025: $4.4M Est. ARR") were 14 of 151 results and 13 were noise. Filter them.
- Recovering publisher URLs by searching Bing for a Google headline worked for 18 of 44 (41%), including 7 of 14 lead headlines. A stopgap, not a fix.

### Keyed engines: researched, not yet benchmarked

No keys were available, so these are from documentation only.

| Engine | What it is | Price | Free allowance | Fit |
|---|---|---|---|---|
| **Brave Search API** | Independent index, 30bn+ pages; News endpoint | $5 per 1,000 requests | $5 credit monthly | Publisher URLs, `freshness=pm` (31 days), up to 50 results |
| **Exa** | Neural search; `category: news/company/people`, published-date filters | $7 per 1,000 (deep $12–15) | $20 on signup + $10 monthly | Whole-sentence objectives ("a startup run mostly by AI agents with under ten staff") |
| **Tavily** | Agent search, `topic: news`, `time_range` | $0.008 per credit (basic 1, advanced 2) | 1,000 credits monthly | Similar to Brave, returns short content |
| **Serper** | Google results via API, News endpoint with publisher links | not shown on pricing page | 2,500 queries on signup | Google coverage without redirector links |
| **Parallel Search** | Objective-based search returning LLM excerpts | not stated | not stated | Unpriced; revisit |

Estimated monthly cost at Autopilot volume (about 300 discovery queries, about 2,700 including company news checks): Brave and Exa $0 for discovery alone and about $7 with company checks; Tavily about $11 with company checks.

**Next step:** get Brave and Exa keys, run `BRAVE_API_KEY=... EXA_API_KEY=... npm run search:bench`, and score against the same labels.

### Recommendations

1. Rewrite the discovery taxonomy around economic signals. Free, and tripled leads.
2. Add Bing News RSS as a second keyless engine, with client-side date filtering.
3. Drop Hacker News and GDELT from discovery.
4. Filter revenue-estimate pages.
5. Choose between Brave and Exa after the keyed benchmark.

---

## 2. Extraction: webclaw vs Firecrawl (15 September 2026)

Prompted by *Testing webclaw: A Firecrawl Alternative for Web Extraction in AI Agents* (The Web Scraping Club, 15 September 2026). Its author received a free Scale plan from webclaw.

### webclaw security review

Source reviewed at commit `aadf8ed` (v0.6.23, 42,567 lines of Rust).

**Strengths**

- No analytics or telemetry. Outbound calls to `api.webclaw.io` happen only when a `WEBCLAW_API_KEY` is set (cloud fallback, `--cloud`, `--research`).
- SSRF guard (`crates/webclaw-fetch/src/url_security.rs`) resolves DNS and rejects private, loopback, link-local and metadata addresses, re-checked on redirects. Probed and blocked: `169.254.169.254`, `127.0.0.1`, `host.docker.internal`, a Docker network IP, `127.0.0.1.nip.io`, `[::ffff:127.0.0.1]`.
- `--on-change` runs commands without a shell (shlex, no `sh -c`) unless `WEBCLAW_ALLOW_SHELL=1`, explicitly to resist prompt injection via MCP.
- `webclaw-server` binds 127.0.0.1 by default and refuses `0.0.0.0` without an API key; unauthenticated requests get 401.
- The `@webclaw/mcp@0.6.23` npm tarball is identical to the repo source.

**Risks**

- Single-maintainer project: 329 of about 350 commits by the founder; repo created March 2026; releases every one to two weeks. The founder also sells the cloud service.
- Releases are unsigned. `SHA256SUMS` comes from the same GitHub release as the binaries, so it proves integrity, not authenticity. The npm launcher proceeds with only a warning if the sums file cannot be fetched. The Docker image is built with `--provenance=false --sbom=false` and runs as root.
- `npx -y @webclaw/mcp` and `npx create-webclaw` run whatever version was last published. `create-webclaw` edits config files for Claude, Cursor, Codex, Windsurf, Continue and Antigravity.
- The unscoped npm package `webclaw` belongs to a different publisher.
- OSV scan of 383 crates found three advisories: `rustls@0.23.43` (RUSTSEC-2026-0285, TLS 1.3 handshake messages accepted across encryption levels, fixed in 0.23.45), and unmaintained `fxhash` and `ttf-parser`.
- AGPL-3.0: fine for internal use; obligations apply if a modified version is offered as a network service.

**Safe usage**

Use a pinned image digest (`ghcr.io/0xmassi/webclaw@sha256:8990d38c…` for v0.6.23), not `npx` or `create-webclaw`:

```
docker run -d --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges \
  --user 65534:65534 --memory 1g --cpus 2 -p 127.0.0.1:3010:3000 \
  -e WEBCLAW_API_KEY=<random> ghcr.io/0xmassi/webclaw@sha256:<digest> \
  webclaw-server --host 0.0.0.0 --port 3000
```

Leave `WEBCLAW_CLOUD_API_KEY` unset unless cloud fallback is wanted, since that sends URLs to webclaw's servers.

### Benchmark

Twenty-four real URLs from the pipeline (12 evidence articles, 8 index company pages, X, LinkedIn, an arXiv PDF and a Google News link), two passes each. Firecrawl self-hosted from its published images (`docker-compose` with API memory raised to 5 GB, since 3 GB was OOM-killed). Both tools ran with main-content extraction on. **Usable** means all key facts present and at least 400 words for articles or 300 words for company pages.

| | Plain fetch | webclaw | Firecrawl |
|---|---|---|---|
| Articles usable | 10/12 | 18/24 | **19/24** |
| Company pages usable | 8/8 (with page chrome) | 10/16 | **15/16** |
| X, LinkedIn, PDF (facts found) | 2/3 | **5/6** | 4/6 |
| Median time per page | 0.5s | **0.5–0.7s** | 2.5–3.5s |
| Memory · containers | – | **84 MB · 1** | ~3.7 GB · 6 |
| Image size | – | **186 MB** | ~5 GB across services |

- **Firecrawl renders JavaScript.** webclaw returned 11–238 words from Atoms, Artisan and Cofounder in main-content mode, and nothing from the USV blog. Turning main-content off recovered 960–1,746 words on the company sites, but still only 53 on USV.
- **webclaw produces cleaner articles.** Firecrawl's extra length (7,091 vs 1,034 words on Ars Technica) was mostly cookie-consent and navigation text; the article bodies matched.
- **Both fail on** Forbes (HTTP 403), Yahoo (consent wall) and Google News links (consent page).
- **Firecrawl was inconsistent:** Cybernews and Gamma failed on one pass and succeeded on the other.
- Cloud services were not tested. The article's author reported webclaw's cloud failed on the same bot-protected sites as its CLI.

### Cloud pricing (15 September 2026)

| | Free | Entry | Mid |
|---|---|---|---|
| webclaw | Article cites 3 runs a day; pricing page shows a card-required 7-day trial | Starter $19/mo, 5,000 credits | Pro $99/mo, 100,000 |
| Firecrawl | 1,000 credits/mo, no card | Hobby $16/mo annual, 5,000 | Standard $83/mo annual, 100,000 |

One credit is one page on both. Firecrawl offers zero data retention only on Enterprise; webclaw's pricing page makes no retention statement, and its FAQ says results "may be cached briefly".

### Recommendations

1. For the verification step (a few dozen article fetches a day), use **Firecrawl's free cloud tier**. Best success rate on the page types needed, and self-hosting six containers is not justified at this volume.
2. Keep **webclaw** for article-only, speed-sensitive jobs, run as the locked-down container above.
3. Neither tool fixes Google News links. That depends on the search-engine change in section 1.

---

## Sources

- [Exa search API](https://exa.ai/docs/reference/search) · [Exa pricing](https://exa.ai/pricing)
- [Brave News Search API](https://api-dashboard.search.brave.com/app/documentation/news-search/get-started) · [Brave pricing](https://brave.com/search/api/)
- [Tavily search API](https://docs.tavily.com/documentation/api-reference/endpoint/search) · [Tavily pricing](https://www.tavily.com/pricing)
- [Serper](https://serper.dev/)
- [GDELT DOC 2.0 API](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/)
- [Parallel Search quickstart](https://docs.parallel.ai/search/search-quickstart)
- [webclaw repository](https://github.com/0xMassi/webclaw) · [webclaw pricing](https://webclaw.io/pricing)
- [Firecrawl repository](https://github.com/firecrawl/firecrawl) · [Firecrawl pricing](https://www.firecrawl.dev/pricing)
- [OSV advisories](https://osv.dev): RUSTSEC-2026-0285, RUSTSEC-2025-0057, RUSTSEC-2026-0192
- Antonello Zanini, *Testing webclaw: A Firecrawl Alternative for Web Extraction in AI Agents*, The Web Scraping Club, 15 September 2026
