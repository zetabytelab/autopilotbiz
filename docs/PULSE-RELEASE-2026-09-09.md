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

- Production release [842e6a3](https://github.com/zetabytelab/autopilotbiz/commit/842e6a3c625412ae272f3990f3b847621833c99d) deployed READY at [autopilotindex.com](https://autopilotindex.com/#atoms).
- [CI passed](https://github.com/zetabytelab/autopilotbiz/actions/runs/34349920161).
- Browser verification confirmed the rendered Atoms proposition and all six article links. No browser JavaScript errors were reported. The production deployment returned no runtime error logs during the check.
- The generated public [GitHub Index](https://github.com/zetabytelab/autopilot/commit/bc8bbce) was synchronized.
- [Full production collection](https://github.com/zetabytelab/autopilotbiz/actions/runs/34349945121) completed successfully across 369 account targets in about 22 minutes and published [feed commit 778ec11](https://github.com/zetabytelab/autopilotbiz/commit/778ec11).
- Normal cadence remains X daily and LinkedIn weekly (Sunday), at 07:00 UTC.

## Full production coverage

- 2,069 rows fetched; 1,242 fetched social posts published (629 X, 613 LinkedIn).
- 72 targets completed with posts; 105 returned no publishable recent posts; 183 were partial; 9 failed.
- Partial results reflect result caps or rejected rows, not a claim of complete account history. Their success cursors do not advance.
- Nine failed X targets: `akshat_b`, `chainopera_ai`, `javypalafox`, `matiii`, `ms_base44`, `pamirehsas`, `runpod_io`, `teknium1`, `vyahhi`. Two returned HTTP 502; seven returned actor error records. No failed run-start POST was retried automatically.
- All 212 LinkedIn targets completed without provider errors. Atoms’ Showcase and founder LinkedIn had no publishable posts in the 30-day window. The Atoms brand X account published one recent post.
- Full feed after refresh: 2,661 items, including 1,283 social items (1,242 from this fetch and 41 retained).
- Coverage evidence: [social-coverage.json](../data/social-coverage.json). Failed targets and Semio’s unresolved identity/status fields remain visible for follow-up; initial entity research coverage is complete.
