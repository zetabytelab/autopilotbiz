# Pulse / Atoms release — 9 September 2026

## Scope

- Collector: complete social watch list, isolated account requests, incremental state, attribution checks, bounded costs, Showcase URLs and platform cadence.
- Atoms: one-person-business proposition, founder alias, funding correction, six linked articles and explicit source types.
- Research: 245 subjects across 67 organizations; Claude Code and Codex use existing parent-account coverage. All 69 tracked entities have an initial research record.
- Semio: unreliable historical website link withheld; former CTO affiliation corrected. Current commercial availability and company X identity remain unverified.

## Live integration evidence

- [Initial smoke run](https://github.com/zetabytelab/autopilotbiz/actions/runs/34349135285): valid X, LinkedIn profile and company posts. Showcase had no posts within 30 days; test correctly failed its original freshness assertion.
- [Successful smoke run](https://github.com/zetabytelab/autopilotbiz/actions/runs/34349507259): all four account types validated. A 120-day Showcase probe verified historical posts; the production writer retained its 30-day filter and excluded old posts.
- Each run made four bounded requests with a combined $0.10 ceiling. That ceiling is not an actual billing statement.
- Raw response shape diagnostics and the isolated output feed are available as GitHub Actions artifacts. Live tests do not write the production feed.

## Checks

- 14 offline collector tests passed, including Showcase URL/author validation, failure isolation, feed persistence and platform cadence.
- Production Next.js build and TypeScript check passed.
- Watch-list regeneration check and generated Index README preview passed.

## Release status

Production deployment and a scheduled-workflow refresh are pending verification.
