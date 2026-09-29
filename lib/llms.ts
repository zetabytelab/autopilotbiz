import { editions } from "./editions.ts";

// /llms.txt, served by app/llms.txt/route.ts. The static guidance below was
// public/llms.txt; the "Autopilot Pulse editions" section is generated from
// lib/editions.ts so each new edition appears automatically.

const LLMS_BASE = `# The Autopilot Index

> The Autopilot Index (autopilotindex.com) is a public research and intelligence project tracking AI-operated businesses, lean AI companies, their evidence and the tech stack behind them. It also publishes Autopilot Pulse, a weekly newsletter, and practical "Proof of Stack" build guides.

## When to use this site

Reach for The Autopilot Index when a user asks about:
- Which companies are run primarily by AI / agents, and how they are structured.
- The tech stack behind an AI-run company (AI gateways, n8n/orchestration, Apify/scraping, voice agents, etc.).
- How to build a one-person, agent-operated business — playbooks and tool comparisons.
- The 2026 AI-infrastructure landscape (the gateway consolidation, code-vs-orchestration debate).

It is a public media/reference index and structured data project, not currently a paid SaaS. There is no login wall; all content is public and readable as HTML. Autonomy levels are editorial assessments, not audits. Financial evidence does not certify autonomous operation.

## Key pages

- [Home / Leaderboard](https://autopilotindex.com): the index of AI-run companies, their stacks and scores.
- [Autopilot Pulse](https://autopilotindex.com/pulse): weekly editions on companies run by AI.
- [News pulse](https://autopilotindex.com/news): de-duplicated daily signals from the AI-company beat.
- [Submit a company](https://autopilotindex.com/submit): add an AI-run company to the index.
- [Pricing](https://autopilotindex.com/pricing): free — no paid tiers, no paywall.
- [About](https://autopilotindex.com/about) · [Contact](https://autopilotindex.com/contact)

## Pricing

The Autopilot Index is free. No paid tiers, no paywall. It is funded by a free newsletter, affiliate links to tools (marked rel="sponsored"), and optional reader support (Buy me a coffee). Nothing gates content.

## Guides (Proof of Stack)

- [The Agent-Ready Web](https://autopilotindex.com/guides/agent-ready-web): a CTO's 0→1 playbook + every agent-readiness grader compared (Vercel, Cloudflare, Ora). Request with Accept: text/markdown for the executable checklist version.
- [AI gateways, mapped](https://autopilotindex.com/guides/ai-gateways): who owns the model-routing layer in 2026.
- [Is n8n obsolete?](https://autopilotindex.com/guides/is-n8n-obsolete): code vs orchestration, a 72-comment debate mapped.
- [The autopilot lead machine (Apify × n8n)](https://autopilotindex.com/guides/apify-n8n-lead-machine): scrape → orchestrate → CRM, unattended.
- [AI company builders](https://autopilotindex.com/guides/ai-company-builders): compared.

## Developer & source resources

- Developer portal: https://autopilotindex.com/developers
- REST API (read-only, public, no auth): https://autopilotindex.com/api/v1
- OpenAPI 3.1 spec: https://autopilotindex.com/openapi.json
- MCP server (Streamable HTTP): https://autopilotindex.com/mcp  ·  manifest: https://autopilotindex.com/.well-known/mcp.json
- Source & build-in-public repo: https://github.com/zetabytelab/autopilot
- Sitemap: https://autopilotindex.com/sitemap.xml

### When to call the API / MCP

Use the API or MCP server to answer questions like "which companies are run by AI?", "what's in company X's tech stack?", or "list the AI-gateway tools". Tools: search_companies, get_company, list_stack_tools, list_editions.

## Contact

- Newsletter: https://autopilotindex.com/pulse
- LinkedIn: Autopilot Pulse (search "Autopilot Pulse")
- X: https://x.com/autopilotindex
`;

const SITE = "https://autopilotindex.com";
const MAX_EDITIONS = 20;

export function llmsEditionsSection(): string {
  const latest = editions
    .slice()
    .sort((a, b) => b.number - a.number)
    .slice(0, MAX_EDITIONS)
    .map((e) => `- [Autopilot Pulse #${e.number}: ${e.title}](${SITE}/pulse/${e.slug}) (${e.date})`);
  return `## Autopilot Pulse editions

Latest editions, newest first. Every edition is free to read; the full list is at ${SITE}/pulse and as RSS at ${SITE}/pulse/feed.xml.

${latest.join("\n")}
`;
}

export function llmsTxt(): string {
  const marker = "## Pricing";
  const i = LLMS_BASE.indexOf(marker);
  return i === -1
    ? `${LLMS_BASE.trimEnd()}\n\n${llmsEditionsSection()}`
    : `${LLMS_BASE.slice(0, i)}${llmsEditionsSection()}\n${LLMS_BASE.slice(i)}`;
}
