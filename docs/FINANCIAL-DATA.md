# Financial observations

Implemented September 12, 2026. This is a normalization and targeted source-review pass, not a current financial audit of every company.

## Sources of truth

- `data/financial-baseline-2026-09-12.json` freezes every legacy financial/headcount record, including nulls, source links and contractor counts.
- `lib/financial-observations.ts` is the append-only observation ledger used by profiles, leaderboard, API/MCP, the company-builders guide and generated index README.
- `lib/data.ts` metrics are deprecated legacy inputs. Do not use them for new calculations. Historical editorial articles are not silently rewritten.

## Meaning of fields

ARR is distinct from revenue, annual run rate and revenue projection. Estimates and disputes are evidence statuses independent of metric type. Where the original record does not establish the metric type, retain `unclassified` rather than infer ARR from its old field name. Ranges and milestones are not exact values.

`asOf` is the metric's observation date with the precision the source supports. `periodStart` and `periodEnd` identify a covered revenue period. `publishedAt` is the publication date; `recordedAt` is the ledger insertion date; `checkedAt` means the publication was reviewed, not that the financials were audited. Importing records does not give them a source-check date.

Headcounts specify population, scope and date separately from financials. Unknown dates and populations remain explicit. Pre-acquisition and post-acquisition business scopes are separate.

## Updating a record

1. Read and link the source. Record its publication date only when supported.
2. Append a unique observation with the new period, business scope and evidence status.
3. For a correction to an existing observation, set `supersedes` to the old ID. Never delete the old entry. New periods can coexist without superseding earlier ones.
4. Explain conflicting sources in `notes`; differing counts are not automatically growth or decline.
5. Run the financial/autonomy tests and production build. Review the affected profile and API response.

## Comparison policy

Default ordering is evidence-first. All-measures view has no financial ranking. A selected metric can rank reviewed, dated, scoped USD reported point values; estimates, bounds, disputes, projections, unknown types and unreviewed records do not receive a numeric rank. Different dates remain visible: this is not a same-date benchmark.

Ratios require exact matching observation dates and business scope, reviewed founder-plus-employee headcount, and matching disclosed contractors. Annual revenue ratios are withheld because a point-in-time headcount does not establish average labor over a revenue period. Unknown outsourced work remains outside the denominator; ratios never certify total human effort or autonomy.

## Reviewed examples

- Polsia: Pulse2's May 25, 2026 report describes a founder claim approaching $10M annual run rate. It is neither ARR nor an exact $10M observation. A numerical rank is withheld.
- Base44: GetLatka explicitly describes the ~$3.5M acquisition-era ARR as unconfirmed. Wix's May 13, 2026 release separately reports ~$150M ARR in May. Acquisition-era headcount does not apply to the later business scope.
- Gamma: the November 10, 2025 founder announcement reports ARR above $100M and describes 50 employees. The legacy secondary record of 52 humans is retained; the difference is not treated as a measured decline. The ARR is a bound, not an exact point estimate.
- Medvi: the imported $401M 2025 sales record and $1.8B 2026 projection are separate. The original source has not been rechecked in this pass. Dates of the legacy employee and contractor counts remain unknown; no ratio is calculated.

## API compatibility

Public API metadata version is 1.1.0; routes remain `/api/v1`. The default sort changes from `arr` to `evidence`. `sort=arr` remains accepted but uses ARR only. `metrics.arr`/`arrUsd` are no longer aliases for mixed annual figures: non-ARR is null, and numeric values with insufficient evidence are null. Consumers must handle nulls and read `metrics.observations` for all values and history. `humans` is retained as a historical convenience field; `headcount` and `contractors` carry the necessary context. No paid product or internal commercial strategy is exposed.

## Verification

- Unit/regression checks: `node --experimental-strip-types --test scripts/tests/autonomy.test.mjs scripts/tests/financials.test.mjs`.
- Production build: `npm run build`.
- Start a local production server, then run `node scripts/verify-financial-http.mjs http://127.0.0.1:3094` to check REST, MCP, schema and rendered profiles.
- These HTTP checks do not replace visual and interactive browser verification.
