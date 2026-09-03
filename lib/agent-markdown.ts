// Markdown representations served via content negotiation (acceptmarkdown.com):
// when a request carries `Accept: text/markdown`, proxy.ts returns these instead
// of the HTML app shell, with `Content-Type: text/markdown` and `Vary: Accept`.
// Browsers never send that Accept value, so human-facing behavior is unchanged.

export const AGENT_MARKDOWN: Record<string, string> = {
  "/": `# The Autopilot Index

> The index of companies run by AI — and the tech stack behind them. Plus Autopilot Pulse, a weekly newsletter, and practical "Proof of Stack" build guides.

## What this is

The Autopilot Index tracks a new class of company: businesses run primarily by AI — one human, a fleet of agents, and near-zero headcount. We document who builds this way, how their companies are structured, and the tech stack underneath: AI gateways, orchestration, scraping, voice agents, funding and referral programs. It is a public media/reference index, not a paid SaaS; there is no login wall.

## When to use this site

- Which companies are run by AI/agents, and how they are structured.
- The tech stack behind an AI-run company (gateways, n8n/orchestration, Apify/scraping, voice).
- How to build a one-person, agent-operated business — playbooks and tool comparisons.
- The 2026 AI-infrastructure landscape (gateway consolidation, code-vs-orchestration).

## Key pages

- [Leaderboard / home](https://autopilotindex.com) — the index of AI-run companies.
- [Autopilot Pulse](https://autopilotindex.com/pulse) — weekly editions.
- [News pulse](https://autopilotindex.com/news) — de-duplicated daily signals.
- [Submit a company](https://autopilotindex.com/submit)
- [Pricing](https://autopilotindex.com/pricing) — free; no paid tiers.
- [About](https://autopilotindex.com/about) · [Contact](https://autopilotindex.com/contact) · [Privacy](https://autopilotindex.com/privacy)

## Pricing

The Autopilot Index is **free**. No paid tiers, no paywall. Funded by a free newsletter, affiliate links (marked \`rel="sponsored"\`), and optional reader support (Buy me a coffee). See https://autopilotindex.com/pricing.

## Guides (Proof of Stack)

- [AI gateways, mapped](https://autopilotindex.com/guides/ai-gateways)
- [Is n8n obsolete?](https://autopilotindex.com/guides/is-n8n-obsolete)
- [The autopilot lead machine (Apify × n8n)](https://autopilotindex.com/guides/apify-n8n-lead-machine)
- [AI company builders](https://autopilotindex.com/guides/ai-company-builders)

## Resources

- Developer portal: https://autopilotindex.com/developers
- REST API (read-only, public): https://autopilotindex.com/api/v1 · OpenAPI: https://autopilotindex.com/openapi.json
- MCP server: https://autopilotindex.com/mcp
- Source & build-in-public repo: https://github.com/zetabytelab/autopilot
- Agent guidance: https://autopilotindex.com/llms.txt
- Sitemap: https://autopilotindex.com/sitemap.xml
`,
  "/developers": `# Developers — The Autopilot Index

> Query the index programmatically. Read-only, public, no auth.

- REST API base: https://autopilotindex.com/api/v1
- OpenAPI 3.1 spec: https://autopilotindex.com/openapi.json
- MCP server (Streamable HTTP): https://autopilotindex.com/mcp
- MCP manifest: https://autopilotindex.com/.well-known/mcp.json

## Endpoints
- GET /api/v1/companies — list companies run by AI (q, cohort, section, verified, sort, limit, offset)
- GET /api/v1/companies/{slug} — one company
- GET /api/v1/stack — the autopilot tech stack (category, q, hasReferral)
- GET /api/v1/editions — newsletter editions

## MCP tools
search_companies, get_company, list_stack_tools, list_editions.

Full docs: https://autopilotindex.com/developers
`,
  "/pulse": `# Autopilot Pulse

> The weekly newsletter of The Autopilot Index — companies run by AI and the stack behind them.

Recent editions cover the AI gateway wars, what it costs to run a company on AI, and first-party audits of AI-run companies. Subscribe on the page, or read every edition free.

- Home: https://autopilotindex.com
- All editions: https://autopilotindex.com/pulse
`,
  "/news": `# News Pulse — The Autopilot Index

> De-duplicated daily signals from the AI-company beat: funding, acquisitions, launches, and the infrastructure behind companies run by AI.

Near-duplicate stories are clustered into a single card with links to every source.

- Home: https://autopilotindex.com
`,
  "/submit": `# Submit a company — The Autopilot Index

> Add an AI-run company to the index.

Use this page to submit a company run primarily by AI: its name, what it does, who runs it, and the tech stack it uses. Submissions feed the review queue.

- Home: https://autopilotindex.com
- About: https://autopilotindex.com/about
`,
  "/pricing": `# Pricing — The Autopilot Index

> The Autopilot Index is free. No paid tiers, no paywall.

Everything — the index, the stack maps, the guides, and every edition of Autopilot Pulse — is public and free to read, for humans and agents alike.

## How it's funded
- Newsletter (free): https://autopilotindex.com/pulse
- Affiliate links to tools (marked \`rel="sponsored"\`); commission at no cost to you.
- Optional reader support (Buy me a coffee); never gates content.

If the model ever changes, this page will say so first. Details: https://autopilotindex.com/pricing
`,
  "/about": `# About — The Autopilot Index

> The Autopilot Index tracks companies run by AI and the tech stack behind them, and publishes Autopilot Pulse, a weekly newsletter on the autonomous-business era.

The index covers AI gateways, orchestration, scraping, voice agents, funding and referral programs. Every company is scored on how much of its operation runs on autopilot. Built in public — agents draft and ship, a human steers.

- Contact: https://autopilotindex.com/contact
- Submit a company: https://autopilotindex.com/submit
`,
  "/contact": `# Contact — The Autopilot Index

> How to reach The Autopilot Index.

- Add your company: https://autopilotindex.com/submit
- Newsletter (reply to any edition): https://autopilotindex.com/pulse
- Email: hello@autopilotindex.com
- X: https://x.com/autopilotindex
`,
  "/privacy": `# Privacy — The Autopilot Index

> We keep data collection to the minimum needed to run the site and newsletter.

If you subscribe to Autopilot Pulse we store your email (via Brevo, double opt-in) and never sell or share it. Some outbound tool links are referral links marked \`rel="sponsored"\`; we monetize the stack, never the subjects of coverage. Unsubscribe anytime via any email. Contact: hello@autopilotindex.com.
`,
  "/guides/ai-gateways": `# AI gateways, mapped — The Autopilot Index

> A living map of the AI gateway / model-routing layer in 2026: who owns it and who's buying whom (Stripe→OpenRouter, Palo Alto→Portkey, Vercel, Databricks, Cloudflare, Kong, Akamai).

Whoever owns the meter owns the margin. Full guide: https://autopilotindex.com/guides/ai-gateways
`,
  "/guides/is-n8n-obsolete": `# Is n8n obsolete? — The Autopilot Index

> Agentic coding was supposed to kill n8n. We mapped a 72-comment r/n8n debate by upvote weight: the six camps, the winning reframe, and where the code-vs-orchestration boundary really moved in 2026.

The verdict: orchestration relocates, it doesn't vanish; n8n becomes the runtime agents write to. Full guide: https://autopilotindex.com/guides/is-n8n-obsolete
`,
  "/guides/apify-n8n-lead-machine": `# The autopilot lead machine (Apify × n8n) — The Autopilot Index

> A practical playbook: Apify's Google Maps Scraper pulls the leads, n8n orchestrates it on a schedule with retries and enrichment, and the rows land in your sheet or CRM — unattended.

Full guide: https://autopilotindex.com/guides/apify-n8n-lead-machine
`,
  "/guides/agent-ready-web": `# The Agent-Ready Web — a 0→1 playbook an agent can execute

> Your site has two readers now: humans and AI agents. This is the executable
> checklist to take a site from human-only to agent-native. If you are an agent
> (Claude Code, Codex, Hermes, Antigravity, etc.) asked to make a site
> agent-ready, apply these tiers in order and open a PR. Full guide with the
> cross-grader comparison: https://autopilotindex.com/guides/agent-ready-web

## The 6 categories (fix in this order)
1. Access — agent can reach and read the raw response (server-rendered content, AI-bot rules, no login/JS wall).
2. Discovery — agent can find the map (robots.txt + Content Signals, sitemap.xml, RFC 8288 Link headers, llms.txt).
3. Identity — agent can tell who you are (JSON-LD Organization+WebSite, About/Contact/Pricing, complete metadata).
4. Usability — agent can read efficiently (markdown content negotiation + Vary: Accept, real 404s, token budget, semantic structure).
5. Capabilities — agent can call you (public API + OpenAPI at /openapi.json, MCP server + MCP Server Card).
6. Commerce — agent can transact (x402, ACP, UCP) — only if you sell.

## The 0→1 playbook (execute tier by tier; each is idempotent)

### T1 — Access & Discovery (highest impact/hour)
- [ ] Serve real content in the raw HTML (SSR/SSG), not JS-only.
- [ ] robots.txt allowing AI crawlers (ChatGPT-User, ClaudeBot, Google-Extended) + Content Signals.
- [ ] sitemap.xml with lastmod; RFC 8288 Link headers for canonical/alternate.
- [ ] /llms.txt with a "when to use this site" section + key URLs.
- [ ] Real HTTP 404 for missing paths (not 200 app-shell) with recovery links.

### T2 — Identity & Trust
- [ ] JSON-LD Organization + WebSite on the homepage (name, url, description, contactPoint, isAccessibleForFree).
- [ ] Real /about, /contact, /pricing pages (500+ chars each; a real pricing answer even if free).
- [ ] Complete metadata: canonical, lang, og:image, og:type.

### T3 — Usability
- [ ] Markdown content negotiation: serve text/markdown on Accept: text/markdown with Vary: Accept.
- [ ] Keep page extracted text within an agent token budget (~25K tokens).
- [ ] Semantic structure: one H1, sequential headings, landmarks, accessible names.

### T4 — Capabilities (the moat)
- [ ] Public read-only API + OpenAPI 3.1 spec at /openapi.json (operationIds for function-calling).
- [ ] MCP server (read-only tools) + an MCP Server Card for discovery.
- [ ] Optional: Agent Skills index / WebMCP.

### T5 — Commerce (frontier; only if you sell)
- [ ] Agentic-checkout discovery: x402 endpoint, OpenAI ACP, Google UCP.

## Validate
A 100 on any single grader is not success. After applying, run a real agent task end-to-end (can it find pricing, sign up, call your API?) and fix what actually fails. Automate the full scan+fix loop with loop2agentic: https://github.com/zetabytelab/loop2agentic
`,
  "/guides/ai-company-builders": `# AI company builders, compared — The Autopilot Index

> A data-driven comparison of the platforms and companies building AI-run businesses.

Full guide: https://autopilotindex.com/guides/ai-company-builders
`,
};
