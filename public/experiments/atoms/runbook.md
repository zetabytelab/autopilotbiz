# Atoms: Solo Revenue Planner runbook

Protocol v1.0, prepared 2026-09-09. Execution preflight on 2026-09-10 reached the Atoms sign-in page; paused awaiting authentication. An Atoms build has not been completed. The canonical ledger records current status.

## Purpose

Test whether one operator can use Atoms to build and publish a correct, useful calculator within a bounded effort budget. Then measure demand and operating effort during seven days of actual availability. A build is evidence of development capability only. This first free product does not by itself test willingness to pay or prove autonomous business operation.

## Pre-registered limits

- One operator. Record help from any other human or AI separately.
- Maximum 60 active human minutes from account inspection through verified initial publication; stop earlier if free credits are exhausted.
- Maximum five corrective prompts after the original build prompt. The initial plan approval counts as an intervention but not a corrective prompt.
- Use available free credits only. No new paid plan, credit purchase, domain purchase, ads or paid integration is included in this protocol.
- Keep failures and incomplete checks in the record. An over-budget working build can be reported as working, but it fails the time/iteration constraint.
- Existing subscription allocation and consumed credits are recorded separately from incremental cash spend; free credits are not equivalent to unlimited use.
- No account credentials, customer details or private billing identifiers in public records.

## Session 1: account and build

1. Open the operator's authenticated Atoms account. If login is required, record that as the next dependency. Do not create an account or accept terms on another person's behalf.
2. Start an active-time log before inspecting the account. Capture the current plan, available free credits and feature limitations; redact identifiers in any published evidence.
3. Record the protocol version, date, browser and initial credit balance. Save the exact original prompt from `build-prompt.txt`.
   Record automated browser operation as external AI activity, not measured human time. Keep elapsed agent time separate; leave actual human minutes unknown unless timed.
4. Submit that prompt. Save the planning response, then log the human review and plan approval as an intervention.
5. Let Atoms generate the preview. Record generation start/end timestamps and credit usage. Waiting counts toward elapsed build time but not active human minutes unless the operator is reviewing work.
6. Run A1–A6 from the prompt independently in the actual preview. Capture the inputs, outputs and screenshots. Validate export content and inspect network requests for any scenario data transmission.
7. For each failure, record a corrective prompt verbatim. Keep the original failure evidence. Log any human or external AI code edit with its author; do not attribute that edit to Atoms.
8. Stop at the first limit reached (60 active minutes, five corrections, exhausted free credits) and report the limitation. Never buy credits automatically.

## Session 2: verified publication

1. Publish only after the operator has reviewed the working artifact and requested publication. Use included hosting if available; record any platform restriction.
2. From a separate browser session, run A1–A6 on the actual public product URL (A7). Record the time, URL and any console errors. A protocol page on the Index is not the product URL.
3. Check code export availability (A8). If permitted by the account, export and verify the app runs locally. Save the repository commit or archive reference. A locked export is a reported limitation, never a passing result.
4. Calculate actual human minutes and intervention count from the event log. Reconcile credit balances with usage history and cash costs with receipts.
5. Before starting observation, agree a privacy-respecting measurement method. Prefer aggregate, first-party analytics that capture no scenario inputs. Add measurement explicitly and log the change; the initial build prompt deliberately includes no tracker.

## Session 3: seven-day observation

1. Set the observation start to the verified launch timestamp and the end to seven days later. Do not backdate the period to protocol preparation.
2. Link the live tool from the Index after publication is authorized. Do not conduct email outreach, contact people or run ads under this protocol.
3. Record aggregate unique visitors and completed-calculation events if measured. A completed calculation is a valid input change followed by a rendered result; deduplicate per anonymous session. Test sessions must be excluded or reported separately. If instrumentation is unavailable, leave these fields null.
4. Log defects, customer support, maintenance, operator minutes and every intervention each day. No observed incidents only counts as zero with a defined observation window and monitoring coverage.
5. The initial calculator is free. Set paying-customer and revenue measurements only if a real payment offer is introduced and verified processor records are available. Without that evidence, leave them null and state that monetization was not tested. Do not infer customers from visits or signup intent.
6. If payments are subsequently enabled, report completed non-test payments, distinct paying customers, gross receipts, refunds and fees separately. Do not extrapolate a week of receipts into ARR.
7. Publish the final artifact, test outcomes, evidence links, costs, effort and limitations. Distinguish app creation, demand, monetization and ongoing autonomous operation in the conclusion.

## Ledger rules

`ledger.json` is the published source of truth. Null means not measured. Numeric zero is allowed only when the record establishes an actual zero over an explicit measurement window. The page reads the same ledger; do not maintain a second set of totals.

Allowed status progression: prepared → building → verifying → observing → complete. Use `paused` when a time, credit, access or product limit prevents progress, with a factual `statusNote`. Refresh the public phase descriptions and status badge when the stage changes.

Each event should contain:

```json
{
  "id": "event-001",
  "startedAt": "ISO-8601 timestamp with timezone",
  "endedAt": "ISO-8601 timestamp with timezone",
  "stage": "build | verification | launch | operation",
  "actor": "human | atoms | external-ai",
  "action": "Brief factual description; include exact corrective prompt where applicable",
  "activeHumanMinutes": null,
  "isHumanIntervention": false,
  "creditsUsed": null,
  "cashSpendUsd": null,
  "outcome": "observed result",
  "evidenceIds": []
}
```

This is an example schema, not a measured event. Do not copy placeholder rows into completed results.

Each acceptance result should contain `checkId`, `status` (`pass`, `fail`, `not_run`, `unavailable`), `observedAt`, `observed`, `artifactVersion` and `evidenceIds`. Preserve failed attempts before corrected outcomes. Each evidence record needs an ID, type, timestamp, public/redacted URL or repository path, and a concise description. Private proof may be retained privately but must be described as unavailable for public inspection.

## Sources checked on 2026-09-09

- [Atoms product overview](https://atoms.dev/): company positioning and claimed product capabilities.
- [Atoms pricing](https://atoms.dev/pricing): free plan advertised; account entitlements must be verified live.
- [Atoms solo-founder vision](https://atoms.dev/blog/atoms-raises-31m-series-a-and-a-plus): the company's ambition to support research, build, launch and iteration.

Company marketing is rationale for the test, not a result of it.
