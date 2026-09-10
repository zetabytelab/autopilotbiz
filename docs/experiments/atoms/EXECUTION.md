# Execute and independently verify the Atoms experiment

Prepared 2026-09-10. This file contains procedures, not results. Only the coordinating operator controls the browser.

## Capture before generation

1. Open the authenticated account and capture the visible plan, free credit balances, relevant entitlements and UTC time. Retain a redacted screenshot. A visible balance alone does not prove which credits are free: inspect the breakdown before consuming existing paid credits.
2. Save the exact initial prompt and hash it (the canonical file is `public/experiments/atoms/build-prompt.txt`). Record the Atoms workspace/project URL separately from the eventual public product URL.
3. Submit the prompt; capture the plan and approval. Record each browser action performed by Codex as `actor: external-ai`, not as human work. Actual human time remains unknown unless measured. Keep elapsed machine/agent time separate from human minutes.
4. Record each corrective prompt, credit usage, version and failed result. A successful later correction never deletes the original failure.

## Capture actual numerical observations

Create an empty local observation file:

```sh
node scripts/verify-atoms.mjs --template > /tmp/atoms-observations.json
```

The file starts with empty outputs and timestamps. Never fill outputs from the expected values or from Atoms' self-reported testing summary. Fill them from the real preview or actual downloaded exports, retaining screenshots/export paths in `evidenceRefs`. Identify the capture method, actual product URL and artifact version. Use one file per tested build version.

Run the eight valid scenarios and five invalid scenarios in `fixtures.json`. Input names are canonical; record any mapping from the app's visible labels/export keys in the evidence note. Each scenario includes all eight inputs by merging `defaultInputs` with `overrides`.

Start with `baseline`, `zero-customers`, `zero-contribution` and `invalid-fractional-customers` to find common failures quickly. Complete the remaining cases before calling numerical acceptance complete.

For invalid cases, retain the actual message and whether the input was rejected and misleading results were suppressed. A browser may prevent entry of `1e309`; document the visible rejection rather than pretending the app accepted the value. For blank and negative tests, also inspect each of the eight inputs; the numerical verifier's representative cases do not replace that coverage.

```sh
node scripts/verify-atoms.mjs /tmp/atoms-observations.json
```

Exit 0 means every recorded numerical fixture matched; exit 1 means a mismatch/provenance omission; exit 2 means incomplete or unreadable observations. The verifier cannot authenticate screenshots or establish usability, privacy, export ownership or actual launch. Its synthetic unit tests are never experiment evidence.

Money comparisons allow half a cent for display rounding. Human hours allow 0.000001; break-even customer count is exact. Compare UI and JSON export separately if they differ. Keep exact unrounded export values where available.

## Complete A5–A8 separately

| Check | Essential browser work | Required evidence |
| --- | --- | --- |
| A5 | Set viewport to 375px; inspect overflow. Use Tab through every control; change values; trigger validation. | Mobile screenshot, keyboard/focus notes and visible error captures. |
| A6 | Export baseline, inspect JSON inputs/results/version/timestamp. Reset and reload after local save. Watch network requests while changing distinctive values; confirm entered assumptions are absent. | Original export, network inspection notes, reset before/after captures. |
| A7 | Publish the reviewed product using the account's included hosting if authorized. Open the actual public URL in a separate session and repeat A1–A6. | URL, UTC timestamp, result captures, console errors and tested artifact version. |
| A8 | Inspect project export availability. Export code if included, retain the original, and run its documented local command. | Original archive/repository revision, run output, provenance note for any subsequent edits. |

Do not equate the Atoms editor preview, the Index protocol page or an Atoms screenshot with a verified public product. If publishing/export requires a paid upgrade, record the restriction and leave that check unavailable.

## Seven-day demand measurement

The observation clock starts after verified publication and a measurement setup has actually been checked. Record that timestamp and a scheduled end seven days later. No future observation can be marked complete now.

- Initial offer: free calculator. One owned placement on the Index can introduce the product after publication authorization; no paid ads or unsolicited messages.
- Use aggregate first-party events only if an actual supported measurement method is present. Define `calculator_completed` as a valid user-driven calculation; deduplicate per anonymous session and exclude the operator's test traffic. Do not transmit the numerical scenario, exports, email, fingerprints or persistent personal identifiers.
- Record visits and sessions according to the provider's actual definition; do not rename sessions as people. If unique visitors cannot be established, leave the `uniqueVisitors` metric null and report the available session aggregate separately.
- Denominator: eligible observed sessions; activation: sessions with at least one completed calculation. Do not report a conversion percentage until the same interval, exclusions and source are recorded for numerator and denominator.
- Daily observation: source coverage, visits/activations if measured, defects, support requests, active human work, agent work and interventions. A monitoring gap remains a gap rather than a zero.
- Day seven: report actual totals, source exports, product changes, outages and human burden. Demand evidence requires observed usage; a working deployment proves neither demand nor willingness to pay.

## Possible paid follow-up (not enabled)

A useful candidate is a saved scenario comparison report for operators managing several small products. Before charging, check whether visitors repeatedly compare/export scenarios and whether requests identify a concrete missing workflow. This is a product hypothesis, not established demand.

A proposed first price test is a one-time $9 report; that number is an experimental choice, not researched market pricing or a revenue prediction. Keep the core calculator free. An upgraded report must deliver added value (multiple scenarios, explicit assumptions and a reusable report), not merely lock the existing export.

Do not add a fake checkout or count interest clicks as customers. A live paid test requires a functioning deliverable, reviewed terms/refund/support process, an authorized payment account and a real checkout. Count only completed non-test payments; report refunds, fees and operator fulfillment time. Manual delivery must be attributed to the human, not treated as autonomous Atoms operation.

## Ledger maintenance

`ledger.schema.json` documents the record shape. Keep unknown measurements null. Use evidence IDs to join raw receipts, events and acceptance results. Preserve all attempts; the latest verified artifact version determines current acceptance. Update the page's narrative/status only from observed evidence.

Record actual Atoms contribution and outside coding assistance explicitly. A Codex-generated replacement product would not answer this experiment's question.
