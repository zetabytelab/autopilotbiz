# Autopilot Index Vercel migration

This document is the implementation boundary for the two-project migration.

## Projects

- `autopilotbiz`: public Next.js site, read APIs, submissions, newsletter, and
  scheduled entrypoints.
- `autopilot-content-agent`: Eve agent, research orchestration, source review,
  and bounded Jev decisions.

## Migration order

1. Keep the checked-in JSON feed as the read-only source of truth while the
   database schema and import are built.
2. Add Postgres tables for companies, claims, evidence, sources, metric
   observations, reviews, decisions, and publications.
3. Import existing `data/*.json` with stable source hashes and idempotent keys.
4. Run collection through a Vercel Cron entrypoint that starts a durable
   Workflow; each provider call and AI decision is an isolated step.
5. Shadow-compare database reads with the existing JSON API before switching
   public reads behind a feature flag.
6. Retire GitHub Actions only after two clean scheduled shadow cycles and a
   manual rollback has been verified.

## Safety rules

- Do not publish a claim without a stored source URL, fetched timestamp, and
  evidence excerpt or structured source payload.
- Use Jev only for bounded classification, routing, approval, and confidence
  decisions; use a writer/research model for synthesis and source discovery.
- Keep human review for material claims, low-confidence evidence, and any
  publication or outbound action.
- Preserve the current untracked `docs/pulse/11-review/` and
  `docs/pulse/BACKLOG.md` files during migration.

## First implementation slice

The first code change should be additive: schema/types, an idempotent import
command, and a feature-flagged read adapter. It must not change public API
responses or disable the existing Pulse workflow.

The Workflow boundary now exists at `POST /api/internal/pulse/start`, protected
by `CRON_SECRET`. It returns an accepted run only; provider steps remain gated
until Neon/Blob and the provider spend guard are configured. No `vercel.json`
cron schedule is enabled yet, so the existing GitHub Actions schedule remains
the only collector scheduler.

The protected `GET /api/internal/db/shadow` endpoint compares the canonical
company projection and key counts against the current checked-in dataset. It is
the gate for enabling database-backed public reads.
