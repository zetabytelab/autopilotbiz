# Atoms preview verification — 2026-09-10

Recorded at 12:18:52 UTC. The experiment is **verifying** a real Atoms version-5 preview. The earlier free-quota interruption remains part of the record.

## What was observed

- The user reported receiving 25 Discord bonus credits. The coordinating browser agent saw a user `CONTINUE` message displayed at 13:09 in the Atoms transcript. That display time has no established timezone in this record; it is not converted into an invented UTC event time.
- Atoms reported completion and 66 passing checks. Those are **Atoms' own reported results**, separate from the independent checks below. The exact build-completion timestamp and final credit balance have not been independently established.
- A working version-5 preview was inspected. `previewUrl` identifies that preview; `productUrl` remains empty because publication has not been verified.
- Thirteen independently captured numerical/validation scenarios matched the frozen verifier expectations. The original unsuccessful blank-entry action and successful retry remain preserved in the raw captures.
- Additional DOM captures show all eight fields with their own negative-value errors when all were set to `-1`, and their own blank-value errors when all were cleared. Results were suppressed and export disabled. These are per-field errors in two combined invalid-input states; the capture is not represented as sixteen separately isolated runs.

## Acceptance state

| Check | State | Evidence and limits |
| --- | --- | --- |
| A1 | Pass | Captured arithmetic, including baseline, exact break-even, rounding up and zero fixed cost, matched the independent verifier. |
| A2 | Pass | Baseline human workload 4.5 hours and economic surplus $11.50 matched. |
| A3 | Pass | Zero/negative contribution and 100% processing fee produced unavailable break-even with explanations. |
| A4 | Pass | Zero customers, representative non-finite/fee/fractional-input cases and individual blank/negative errors for all eight fields were captured. |
| A5 | Not run in full | Keyboard traversal captured seven inputs following the initial price field, both action buttons and summary controls with a lime focus shadow. Mobile verification remains outstanding: two requested 375px viewports still reported actual width 1594px, a browser-control limitation. |
| A6 | Not run in full | An actual downloaded baseline JSON file matches the baseline inputs and outputs, with schema version and generation timestamp. Privacy/network behavior and complete reset/persistence checks remain unverified. |
| A7 | Not run | Atoms editor share interactions repeatedly timed out. No publishing action completed and no public product URL was verified. |
| A8 | Not run | Original project code export and independent local execution remain unverified. |

## Retained artifacts

- `evidence/preview-v5-captures.json`, `preview-v5-observations.json` and `preview-v5-verifier-report.json`: actual preview captures, normalized observations and thirteen passing verifier cases.
- `evidence/preview-v5-all-field-validation.json`: captured at 12:15:30.497 UTC; negative and blank validation for all eight fields.
- `evidence/preview-v5-downloaded-baseline.json`: byte-exact copy of the actual downloaded scenario file. Its embedded generation timestamp is 12:15:44.428 UTC; this is not asserted to be the filesystem download-completion time.
- `evidence/preview-v5-keyboard.json`: captured focus sequence and CSS focus styling. The source file has no capture timestamp; this note records its review time without inventing one.

The raw on-screen JSON captures remain distinct from the subsequently downloaded file. UI text asserting that data stays local does not establish network privacy. Keyboard coverage does not establish mobile layout.

Only `acceptanceChecksPassed` is now measured as 4. Cash spend, allocated subscription cost, credits consumed, human minutes, elapsed build time, interventions, customers and revenue remain unknown. The user-reported bonus allocation is not a verified final credit balance or a measured total cost. Seven-day observation has not started.
