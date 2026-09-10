# Funnel measurement

## Existing provider and access

On 2026-09-10 the Vercel API confirmed `zeta-flow` is already on Pro and Web Analytics is already enabled for `autopilotbiz` (`webAnalytics.enabledAt: 1788339450124`). The repository previously had no analytics SDK. Production environment names show Brevo and GitHub credentials, with no existing database or event storage service. This implementation reuses Vercel Web Analytics; it creates no provider account, database, paid plan, or add-on.

Read the real data in the [project Web Analytics dashboard](https://vercel.com/zeta-flow/autopilotbiz/analytics). Select Production and the same date range for every comparison. Custom event properties are limited to two, compatible with the existing Pro entitlement.

There is **no measured funnel baseline yet**. Instrumentation does not imply that production events have been ingested. Establish the first seven complete days after deployment as the baseline; do not report missing historical events as zero traffic. No in-memory counters or invented dashboard totals are used.

Vercel meters existing Pro analytics usage: its [current pricing documentation](https://vercel.com/docs/analytics/limits-and-pricing) lists $0.03 per 1,000 events, subject to the team's usage credit. This implementation adds events to that existing metered service; it is not an unlimited free analytics service. Review usage in Vercel, with no plan or add-on upgrade required.

## Events and interpretation

| Event | Trigger | Properties | Meaning |
|---|---|---|---|
| Page view | Vercel SDK public route view | Sanitized URL | Denominator; filtered traffic only |
| `profile_view` | Company profile route enters | `page` | One view per navigation |
| `profile_engaged` | Profile is visible for a cumulative 30 seconds | `page` | Reading proxy, once per visit; does not prove intent |
| `experiment_view` | Experiment route enters | `page` | Reader visits experiment documentation |
| `signup_request_accepted` | Newsletter API returns HTTP success and provider-backed `subscriptionStatus` | `page`, `status` | Brevo accepted a request; `confirmation_requested` requires DOI confirmation, `subscribed` is direct list addition/update |
| `affiliate_outbound` | Trusted click or middle-click on an external `rel="sponsored"` link | `page`, `destination` | Outbound intent; hostname only, not sales or affiliate commission |
| `calculation_completed` | Future caller explicitly invokes the integration hook after successful calculation | `page`, `calculator` | Contract only; **not currently emitted by a calculator** |

`?confirmed=1` controls a confirmation UI message only and never establishes a confirmed subscriber event. Honeypot successes lack `subscriptionStatus` and produce no signup event. Existing subscribers can receive an accepted response, so accepted requests are not counts of newly acquired subscribers. Brevo's confirmed list is the source of truth for subscriptions; there is no implemented confirmation webhook attribution.

The original Atoms experiment has no tracker in its product specification. The exported `trackCalculationCompleted("stable-calculator-id")` hook is reserved for a separately documented instrumented variant after the real product exists. A future caller must deduplicate completions once per calculator per session, according to that variant's measurement rules; the hook does not currently maintain session state. Do not pass calculator inputs, outputs, names, emails, or financial values.

## Privacy and exclusions

- Collection requires a production deployment and `autopilotindex.com` or `www.autopilotindex.com`; localhost, preview aliases and webdriver traffic are excluded.
- Do Not Track, Global Privacy Control and `?analytics=off` prevent collection. Persistent owner exclusion: run `localStorage.setItem("autopilot-analytics", "off")` in the site browser, then reload. Remove that key to restore collection.
- Only explicitly listed public paths are allowed; `/live`, `/api`, `/styles`, unknown slugs, query strings and fragments are excluded. URLs sent to the provider are normalized to the canonical origin plus public pathname. Update the allowlist when adding a public company, edition or guide; tests check company and edition parity.
- Events contain only public paths, fixed status values, calculator IDs or outbound hostnames. No emails, form contents, referral codes, user IDs or calculator inputs are supplied.
- These are provider-aggregated events, without an application-created identity or cross-session funnel join. Event ratios are directional, not exact person-level conversion rates. Vercel's [privacy documentation](https://vercel.com/docs/analytics/privacy-policy) describes its own processing.
- Ad blockers, privacy preferences and browser delivery failures reduce observed totals. SDK failures never block product actions.

## Verification and baseline procedure

1. Run `node --test scripts/tests/analytics.test.mjs`. It checks production exclusions, privacy boundaries, acceptance semantics, allowlist parity and event delivery through the installed Vercel SDK into a mocked transport/initialization queue, without contacting Brevo or the analytics provider. A successful hook return means an eligible SDK call was attempted, not that the provider ingested it.
2. Browser QA must use localhost, a preview deployment, webdriver, or `?analytics=off`; it must generate no real production analytics traffic. Never submit a real test subscription.
3. After deployment, inspect normal production traffic in the dashboard. Confirm a real route view and the expected event properties. Do not claim successful ingestion based only on an SDK call.
4. Record the first full seven-day window: public page views; profile views and engaged events; experiment views; accepted signup requests by status; sponsored outbound clicks by hostname. Record the confirmed subscriber total from Brevo separately.
5. Compare subsequent weeks with the same filters and distinguish activity from conversion. Calculation completion remains pending until an instrumented product is actually released.

## Layout integration

Mount `<AnalyticsEvents production={process.env.VERCEL_ENV === "production"} />` once inside the root layout body. The component owns SDK loading and route/click tracking. Local builds deliberately collect nothing.
