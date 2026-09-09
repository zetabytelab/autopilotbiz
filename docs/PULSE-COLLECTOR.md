# Pulse social collection

The checked-in watch list contains the public tracking fields from the private
`autopilot-pulse/registry/people.csv` and `companies.csv` research. The scheduled
job reads this export; it does not need access to the private repository or a
developer's filesystem. Public supplemental findings in
`data/social-watchlist-research.json` add researched entities and account-level
source links. Source hashes identify both the CSV and supplemental versions.

Review all people, companies, platform verification and research gaps in
[PULSE-WATCHLIST.md](PULSE-WATCHLIST.md). A verified person does not automatically
make every account in that row verified. Specific unresolved accounts and
affiliations are recorded in `data/social-watchlist-overrides.json`, with reasons
for platform confidence overrides. The original private research notes are not
copied into this repository.

## Refresh the watch list

```sh
npm run pulse:watchlist -- /path/to/autopilot-pulse/registry
npm run pulse:watchlist -- /path/to/autopilot-pulse/registry --check
npm run pulse:plan
npm run test:pulse
```

The generator uses Python's standard CSV parser and Node, with no additional
dependencies. It maps organizations to Pulse's company/stack slugs and rejects
unmapped entities. The collector additionally rejects duplicate accounts, invalid
URLs, unknown statuses and unmapped Pulse slugs before making network requests.
The generator runs the same validation before writing and rejects overlapping
registry/supplement subject IDs so later CSV updates require explicit reconciliation.
Regenerate and commit both `data/social-watchlist.json` and the review document
after research changes; no live synchronization from the private repo is assumed.

## Collection behavior

- Each confirmed X account and LinkedIn profile/company page gets its own request
  and result allowance. Three requests run concurrently across both platforms.
- Requests start at the target's last successful check, with a 48-hour overlap,
  bounded to the last 30 days. New or failed targets retain a 30-day lookback.
- Defaults request up to 10 posts per account per refresh. This is bounded
  monitoring, not a complete historical archive. High-volume accounts can be
  truncated; reaching the item cap is reported as partial and does not advance
  that target's success cursor.
- Dates, returned authors (when available), post URLs and repost flags are checked.
  X handles match without case sensitivity. LinkedIn company and personal URL
  types remain distinct. Comments and reaction scraping are disabled.
- One failed target never discards another target's posts. An empty response,
  skipped credentials, partial response and failed request have distinct statuses.
- Run-start requests are not retried: a timed-out response may still represent a
  billable run. Timeouts are bounded, and errors redact the token.
- A target's confirmed identity permits its posts through ambiguous-name filters.
  Ordinary news still needs company disambiguation. Social provenance is checked
  again when retaining old posts, so removed accounts lose trust.
- Former or uncertain affiliations remain tracked as people; their posts have no
  automatic company tag and include an affiliation label. Association is based on
  the registry, not a fresh employment verification.
- Social posts deduplicate by URL, not similar titles. A short post such as
  “We are hiring” from two different founders remains two separate signals.

## Collection cadence

The LinkedIn actor charges for an account even when it has no new posts, so the
two platforms run on different schedules:

- Monday to Saturday, 07:00 UTC: X only, 157 accounts.
- Sunday, 07:00 UTC: X and LinkedIn, 369 accounts.

The workflow sets `PULSE_SOCIAL_PLATFORMS` from the cron that fired, and
`workflow_dispatch` exposes it as a choice input. Accounts on a platform that
sits out a run keep their `lastSuccessAt` cursor, so the next run of that
platform stays incremental instead of refetching the lookback window. Accounts
removed from the watch list still expire.

## Inspect before a paid run

`npm run pulse:plan` makes no network requests, needs no credentials, and writes
nothing. It reports coverage, request count, per-refresh result limits and the
sum of configured per-target charge ceilings. The default export currently
schedules 369 requests with a combined **$7.93 maximum charge per invocation**.
This is a ceiling, not an expected price or evidence that creator credits cover
daily runs. Repeated/manual invocations have separate ceilings. There is no
monthly account budget enforcement here.

Settings can be supplied as environment variables:

| Variable | Default | Meaning |
|---|---:|---|
| `PULSE_SOCIAL_PLATFORMS` | `x,linkedin` | Platforms this run collects. Others keep their cursor and are not billed |
| `PULSE_SOCIAL_CONCURRENCY` | 3 | Maximum simultaneous requests |
| `PULSE_X_MAX_ITEMS` | 10 | Maximum requested tweets per account |
| `PULSE_LINKEDIN_MAX_POSTS` | 10 | Maximum requested posts per profile/page |
| `PULSE_X_MAX_CHARGE_USD` | 0.01 | Per-X-target actor charge ceiling |
| `PULSE_LINKEDIN_MAX_CHARGE_USD` | 0.03 | Per-LinkedIn-target actor charge ceiling |
| `PULSE_SOCIAL_TIMEOUT_SECONDS` | 180 | Actor timeout; HTTP timeout adds 15 seconds |

The Apify API documents `maxTotalChargeUsd` as a run cost cap and distinguishes
the billed-item cap from the dataset return limit; the collector sends all three.
See [Apify run API](https://docs.apify.com/api/v2/actor-run-sync-get-dataset-items-post).
Provider-side charge limits may return fewer posts than requested, so a successful
response is not a guarantee of complete history.

The actor input fields follow the published schemas:
[X](https://apify.com/apidojo/tweet-scraper/input-schema) and
[LinkedIn](https://apify.com/harvestapi/linkedin-profile-posts/input-schema).

With `APIFY_TOKEN` available to the process, `npm run pulse -- --social-only`
collects social posts and retains prior feed/candidate data. The ordinary Pulse
command includes news and discovery. Credentials are sent in the Authorization
header. `APIFY_SECRET` remains the GitHub Actions secret mapped to `APIFY_TOKEN`.

## Operational evidence

After a refresh:

- `data/pulse.json` contains the published posts and source summary.
- `data/social-state.json` contains per-target successful/attempted check times.
- `data/social-coverage.json` records every active target's status, fetched count,
  rejected/filtered reasons, cap indication, and fresh published/retained counts.

The scheduled workflow commits all three plus candidates, serializes overlapping
runs, and prints the plan before collection. CI checks watch-list validity and
runs offline collector regression tests before the Next.js build. Tests exercise
the actual Pulse writer with an isolated temporary data directory; they do not
send email, contact social accounts, consume Apify credits or modify live data.

## Showcase pages and live smoke test

LinkedIn `/showcase/<name>/` pages are supported alongside personal and company pages. `/posts` suffixes are normalized for returned author URLs. Showcase identity stays distinct from company and personal URL namespaces.

Run `node scripts/smoke-social.mjs` with `APIFY_TOKEN`, or dispatch Pulse with `mode=smoke`. The test requests at most two posts from each of four account targets, with a combined $0.10 ceiling. It uses an isolated output directory and never modifies the public feed. Atoms’ quiet Showcase page is probed over 120 days to verify author and post parsing; the real writer still excludes posts older than 30 days. Results are saved as workflow artifacts.
