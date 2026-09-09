# Atoms one-person business experiment

Prepared 2026-09-09. Public route: `/experiments/atoms`.

## Deliverables

- `app/experiments/atoms/page.tsx`: public protocol, honest status, results ledger, acceptance criteria and source links.
- `lib/atoms-experiment.ts`: typed presentation data and pre-registered checks.
- `public/experiments/atoms/build-prompt.txt`: exact ready-to-submit Atoms prompt for Solo Revenue Planner.
- `public/experiments/atoms/runbook.md`: execution protocol, evidence rules and event schema.
- `public/experiments/atoms/ledger.json`: canonical public measurements; all unmeasured outcomes are null.

## Selected product

Solo Revenue Planner is a browser-only calculator for break-even customer count, monthly contribution and remaining human workload. Its scope gives a small build objective, a relevant audience and independently checkable output. The first offer is free; monetization and autonomous operation remain separate tests.

## Current evidence boundary

The protocol and site implementation were prepared with Codex. No Atoms-generated artifact, product URL, revenue, customer activity or operating result has been recorded in this ledger. Atoms use requires an authenticated account with available free credits. Official pricing advertises free access; actual account entitlements have not been established by this preparation work.

The next execution step is opening that account and submitting the supplied prompt. Retain proof of the live session. Do not create a replacement product with another coding tool and label it an Atoms result.

## Maintaining the record

Update the canonical ledger as evidence arrives, retaining the prompt version and original failures. The page reads metrics from that JSON. Its narrative, phase badges and metadata must also be updated if the experiment moves past preparation. Follow `runbook.md` for privacy, time accounting and outcome definitions.

Evidence references may point to a published repository artifact or redacted screenshot. Keep secrets and customer identifiers outside the public repository. No subscription, ad spend or outreach is part of the initial experiment.

## Acceptance fixture arithmetic

For a $20 monthly price, $4 per-customer variable cost, 3% processing fee, $30 fixed cost and 10 customers:

- Contribution: 20 × 0.97 − 4 = $15.40/customer.
- Break-even: ceil(30 / 15.40) = 2 customers.
- Operating surplus: 15.40 × 10 − 30 = $124/month.
- At 15 support minutes/customer plus 2 fixed hours, human time is 4.5 hours/month.
- At $25/hour, economic surplus: 124 − 4.5 × 25 = $11.50/month.

These are test fixtures, not observed business results or forecasts.
