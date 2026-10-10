# Business on Autopilot

A public research and intelligence project tracking AI-operated businesses — who they are, what evidence supports their claims, what they run on, how they make money, and where humans remain involved.

## What's inside

- **The autopilot index** — evidence-first comparison with separate ARR, revenue, run-rate and projection observations. Dates, source gaps, estimates and corrections remain visible. Financial ranking requires an eligible observation of the selected metric.
- **[The Autopilot Criteria](/#criteria)** — the published framework for who makes the list.
- **News pulse** (`/news`) — a heat-ranked live signal feed (funding, launches, interviews, social) aggregated from Google News, Hacker News, Techmeme and YouTube, plus a 📡 radar of unvetted new entrants discovered by keyword.
- **The autopilot stack** — the infrastructure pyramid under agent-run companies, with referral programs and credits for builders.
- **Field experiments** — agents doing real-world economic legwork (Guinndex, Le Baguette Index).
- **Why investors care** — verbatim, source-linked theses from the VCs on these cap tables.

## Submit a company

- Visual form: `/submit` on the site (anonymous, bot-protected).
- GitHub-native: [open a submission issue](../../issues/new/choose).

Every submission is researched against independent sources before it can be listed — see [docs/VETTING.md](docs/VETTING.md). Unvetted candidates appear on the radar, clearly labeled.

## Development

Requires Node 22 (the version CI and the Pulse workflow use).

```bash
npm ci
npm run dev             # develop on :3000
npm run test:pulse      # node:test suite (scripts/tests/*.test.mjs)
npx tsc --noEmit        # type check (next build also runs it)
npm run build           # production build
npm run pulse           # refresh data/pulse.json + data/candidates.json locally (keyless sources)
npm run gen:index       # regenerate the github.com/zetabytelab/autopilot README from lib/data.ts
```

There is no ESLint config; `tsc` and `next build` are the static checks.

## Operations and handover

Everything needed to run the site without prior context. Secrets are listed by **name only**; values live in Vercel project settings and GitHub Actions secrets, never in the repository.

### Architecture

| Layer | Where | Notes |
|---|---|---|
| Framework | Next.js 16 App Router, React 19, Tailwind 4 | Hosted on Vercel (project `autopilotbiz`), domain `autopilotindex.com` |
| Data (source of truth) | `lib/data.ts` (companies, stack tools), `lib/financial-observations.ts` (dated, sourced metric ledger, see `docs/FINANCIAL-DATA.md`), `lib/company-profiles.ts` (research findings), `lib/editions.ts` (Pulse editions) | Edited by hand and committed. No database on `main`; pages are statically generated at build |
| Generated data | `data/pulse.json`, `data/candidates.json`, `data/social-state.json`, `data/social-coverage.json` | Written by the daily Pulse workflow, committed by a bot |
| Other data | `data/ops.json` (the `/live` cockpit), `data/social-watchlist*.json` (social targets, see `docs/PULSE-COLLECTOR.md`), `data/*.json` guide datasets | |
| Pages | `app/` — index, `/companies/[slug]`, `/news`, `/pulse` (+ RSS `/pulse/feed.xml`), `/guides/*`, `/submit`, `/developers`, `/pricing`, `/about`, `/contact`, `/privacy`, `/experiments/atoms` | |
| Proxy (middleware) | `proxy.ts` | Basic Auth on `/live` (fails closed: 404 if `LIVE_PASSWORD` is unset), and `Accept: text/markdown` negotiation from `lib/agent-markdown.ts` |
| Public API | `app/api/v1/*`, shared logic in `lib/api/core.ts` (whitelisted DTOs, zod-validated queries) and `lib/api/http.ts` (headers, CORS, caching) | Read-only, no auth. OpenAPI 3.1 at `/openapi.json` (`app/openapi.json/route.ts`) |
| MCP server | `app/mcp/route.ts` | Hand-rolled JSON-RPC 2.0 over Streamable HTTP, protocol 2025-06-18, server version in `SERVER_INFO` (manifest: `public/.well-known/mcp.json`) |
| Write endpoints | `app/api/submit` (company submissions → GitHub issue via a GitHub App; signed form token, BotID, 3/10 min/IP), `app/api/subscribe` (Brevo double opt-in, 5/10 min/IP) | |
| Analytics | `@vercel/analytics` via `components/AnalyticsEvents.tsx`, production only, redaction policy in `lib/analytics-policy.ts` (see `docs/ANALYTICS.md`) | |
| Bot protection | `botid` (`instrumentation-client.ts`, `withBotId` in `next.config.ts`) | Only enforced on Vercel |

### Environment variables (names only)

Vercel project (Production; Preview as needed):

| Name | Used by | If missing |
|---|---|---|
| `LIVE_USER`, `LIVE_PASSWORD` | `proxy.ts` (`/live` Basic Auth) | `/live` returns 404 |
| `SUBMIT_FORM_SECRET` | `lib/submission.ts` (HMAC for the submit form token) | Falls back to a public dev value; **must be set in production** |
| `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY` (base64-encoded PEM), `GITHUB_APP_INSTALLATION_ID` | `app/api/submit` | Submissions return 503 |
| `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME` | `app/api/submit` (issue target) | Defaults to `zetabytelab/autopilotbiz` |
| `SUBMISSIONS_DRY_RUN` | `app/api/submit` (`1` = log instead of filing issues when the GitHub App is not configured) | |
| `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_DOI_TEMPLATE_ID` | `app/api/subscribe`; `BREVO_API_KEY` + `BREVO_LIST_ID` also for `npm run send:edition` | Subscribe returns 503 |
| `VERCEL`, `VERCEL_ENV` | Set by Vercel (BotID check, production-only analytics) | |

GitHub Actions secrets:

| Name | Used by |
|---|---|
| `APIFY_SECRET` | `.github/workflows/pulse.yml`, exposed to scripts as `APIFY_TOKEN` (X/LinkedIn collection, smoke test) |
| `GITHUB_TOKEN` | Automatic. Pulse needs `contents: write`; Alert needs `issues: write` |

Local-only / optional: `APIFY_TOKEN` (local pulse runs), `PULSE_SOCIAL_PLATFORMS`, `PULSE_SOCIAL_CONCURRENCY`, `PULSE_X_MAX_ITEMS`, `PULSE_LINKEDIN_MAX_POSTS`, `PULSE_X_MAX_CHARGE_USD`, `PULSE_LINKEDIN_MAX_CHARGE_USD`, `PULSE_SOCIAL_TIMEOUT_SECONDS`, `PULSE_SMOKE_DIR` (collector tuning, `scripts/pulse-social.mjs`); `BRAVE_API_KEY`, `EXA_API_KEY`, `SERPER_API_KEY`, `TAVILY_API_KEY`, `WEBCLAW_API_KEY`, `BENCH_OUT` (`npm run search:bench` only).

### Data pipeline

1. **Pulse (daily)** — `.github/workflows/pulse.yml`, Mon–Sat 06:17 UTC (X only) and Sunday 06:17 UTC (X + LinkedIn), plus manual `workflow_dispatch` (`mode`: full / smoke, `platforms`). Steps: `node scripts/update-pulse.mjs --social-plan` (validates the social plan), `node scripts/update-pulse.mjs --reddit` (Google News RSS, Hacker News, Techmeme, YouTube RSS, Reddit, and X/LinkedIn through Apify), a build gate (`npm ci && npm run build`), then commit `data/pulse.json`, `data/candidates.json`, `data/social-state.json`, `data/social-coverage.json` as "pulse: daily refresh" and push (3 rebase retries).
2. **Deploy** — the push to `main` triggers a Vercel production deploy via the git integration; each deploy purges Vercel's CDN cache.
3. **Weekly digest draft** — `.github/workflows/digest.yml`, Thursday 08:30 UTC: builds an editorial evidence packet as an artifact. It never emails, publishes or commits.
4. **Failure alerts** — `.github/workflows/alert.yml` opens a GitHub issue labelled `automation-failure` when CI or Pulse fails and closes it on the next success.
5. **Editorial data** — companies, observations and editions are edited by hand in `lib/` and shipped by a normal commit. Submissions arrive as GitHub issues and are vetted per `docs/VETTING.md`.

History: this used to run on the maintainer's Mac via launchd (`biz.autopilot.pulse` → `scripts/refresh.sh`: `update-pulse.mjs` then `npm run build`, daily 08:00 local). macOS privacy controls block that job from `~/Desktop` ("Operation not permitted"), so the GitHub workflow replaced it. `scripts/refresh.sh` remains for manual local runs.

### Deploy

- Production: push or merge to `main` → Vercel builds (`next build`) and promotes. Pull requests get preview deployments.
- CI (`.github/workflows/ci.yml`, Node 22): `npm ci`, `npm run test:pulse`, `npm run pulse:plan`, `npm run build`, `npm run gen:index`.
- Rollback: Vercel dashboard → Deployments → pick the last good deployment → "Promote to Production" (instant), then revert the offending commit on `main`.
- Response headers: API/MCP security headers, CORS and caching live in `lib/api/http.ts` (public GETs are CDN-cached, errors `no-store`); site-wide headers belong in `next.config.ts` `headers()`.

### Public API and MCP

Base URL `https://autopilotindex.com/api/v1`, read-only, CORS `*`, no auth. Docs at `/developers`, spec at `/openapi.json`.

| Endpoint | Returns | Query |
|---|---|---|
| `GET /api/v1` | Discovery document | |
| `GET /api/v1/companies` | `{ total, limit, offset, count, items: Company[] }` | `q`, `cohort`, `section`, `verified`, `sort` (`evidence` default, `arr`, `name`), `limit` ≤ 100, `offset` |
| `GET /api/v1/companies/{slug}` | `Company` (400 `invalid_slug`, 404 `not_found`) | |
| `GET /api/v1/stack` | `{ total, limit, offset, count, items: StackTool[] }` | `category`, `q`, `hasReferral`, `limit` ≤ 100, `offset` |
| `GET /api/v1/editions` | `{ total, items: Edition[] }`, newest first | |

Errors are `{ "error": { "code", "message" } }` with `Cache-Control: no-store`; other methods return 405. When a DTO in `lib/api/core.ts` changes, update the schema in `app/openapi.json/route.ts` in the same commit: the schemas are strict (every field required, no extra fields).

MCP: `POST https://autopilotindex.com/mcp` (JSON-RPC 2.0; `initialize`, `ping`, `tools/list`, `tools/call`; 64 KB body cap; no batching). Tools: `search_companies`, `get_company`, `list_stack_tools`, `list_editions`, all backed by the same query layer as REST. `GET /mcp` returns a descriptor. Bump `SERVER_INFO.version` in `app/mcp/route.ts` and `public/.well-known/mcp.json` together.

### Ops runbook

| Situation | Action |
|---|---|
| An `automation-failure` issue opened for **Pulse** | Open the run linked in the issue. A push rejection retries automatically, so check the logs. Rerun with Actions → Pulse → Run workflow (`mode: full`). For Apify problems run `mode: smoke` (4 accounts, artifact `social-smoke-evidence`, no commit). If X/LinkedIn keep failing, check the Apify balance and the `APIFY_SECRET` token; the keyless sources still refresh. |
| Pulse build gate failed | The new data broke the build, so nothing was committed and the site keeps yesterday's data. Reproduce locally with `npm run pulse && npm run build`. |
| **CI** red on `main` | Fix forward or revert. Vercel may still have deployed the commit: roll back in Vercel if the site is affected. |
| A bad data commit reached production | Vercel → promote the previous deployment, then `git revert <sha>` on `main`. |
| `/live` locked out or leaked | Change `LIVE_USER`/`LIVE_PASSWORD` in Vercel env, then redeploy (env changes need a new deployment). |
| Submissions return 503 | Check the `GITHUB_APP_*` env vars and that the GitHub App is still installed on the repo with Issues: write. |
| Subscribe returns 503 / 502 | Check `BREVO_*` env vars and the Brevo account/API status. |
| Add or correct a company | Edit `lib/data.ts` (and `lib/financial-observations.ts` for dated metrics, per `docs/FINANCIAL-DATA.md`), `npm run test:pulse && npm run build`, commit. Then `npm run gen:index` and update the github.com/zetabytelab/autopilot README. |
| Publish a Pulse edition | Add it to `lib/editions.ts` (cover image in `public/pulse/`), deploy, then optionally `npm run linkedin:article` and `npm run send:edition -- <slug> --test you@example.com` before the real send (needs `BREVO_API_KEY`, `BREVO_LIST_ID`). |
| Rotate the Apify token | Create a new token in Apify, update the `APIFY_SECRET` repo secret, run Pulse in `smoke` mode, then revoke the old token. |
| Dependency or security update | `npm audit`; for Next.js security releases bump `next` and rebuild. CI must pass before merging. |

## Licensing

- **Code:** [MIT](LICENSE)
- **Dataset** (`data/`, `lib/data.ts` content): [CC BY 4.0](data/LICENSE) — free to reuse with attribution.

Maintained by one human + agents. ☕ [Buy the human a coffee](https://buymeacoffee.com/serranox).
