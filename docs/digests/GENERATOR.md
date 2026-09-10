# Repeatable Pulse candidate packets

The generator reads the existing collected feed and produces local editorial candidates. It makes no network requests, publishes no pages and sends no newsletter.

```sh
node scripts/draft-pulse-digest.mjs --days 7 --limit 25 --per-entity 3
```

Default input: `data/pulse.json`. Default output: `docs/digests/candidates-YYYY-MM-DD.json` and `.md`. Rerunning for the same UTC date replaces that date's generated candidate packet, not an authored digest. Use `--output-dir` to retain separate attempts. Set an explicit `--as-of 2026-09-10T10:43:38Z` for repeatable selection; `--input` can point to an archived feed.

Processing:

1. Include only valid HTTP(S) sources in the chosen lookback window; exclude future-dated rows.
   Assess source freshness using the feed's `generatedAt` timestamp relative to the requested window end. A snapshot over 48 hours old, missing/invalid timestamp or future-dated snapshot produces a warning in JSON and Markdown. An empty or stale packet never establishes that there were no new developments.
2. Remove tracking parameters/fragments and normalize common host variants. Preserve query parameters that may identify different content.
3. Merge canonical URL duplicates and long exact normalized headlines within the same entity. Retain original feed IDs, headlines and all source references.
4. Prefer collected product/funding categories, then recency, with a per-entity cap. Categories are collection labels, not verified descriptions of events.
5. Leave `verifiedChange`, `businessImplication` and `reviewer` null. An editor must read sources, check dates and evidence, and author those fields before using a candidate in published content.

The candidate packet is neither an autonomous business recommendation nor a verified roundup. Multiple collected source references can repeat one original statement. Older useful background can be cited in an authored digest but must not be represented as a new event because it was recently discovered.

Tests: `node --test scripts/tests/atoms-digest.test.mjs`. They cover URL normalization, duplicate provenance, recency, malformed sources, future dates and entity diversity.
