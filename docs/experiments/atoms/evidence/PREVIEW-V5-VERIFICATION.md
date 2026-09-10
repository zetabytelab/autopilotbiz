# Atoms preview v5: captured numerical verification

Actual preview captures on 2026-09-10 were normalized and compared with the frozen fixture set. **All 13 captured scenarios passed the numerical/validation verifier**: eight valid calculations and five invalid-input cases. No numerical mismatch was found in the captured on-screen JSON.

## Evidence and method

- `preview-v5-captures.json`: byte-for-byte copy of the coordinating browser agent's raw DOM and on-screen JSON captures, including the unsuccessful first blank-entry attempt and retry.
- Raw capture SHA-256: `888d9e6b19ef69171eb43a53cb9e04ac3332818e4523d1457c164811e9c7a0e9`.
- `normalize-preview-v5.py`: reproducible field mapping from observed visible textboxes and on-screen JSON to verifier fields. It checks all eight actual DOM inputs against each intended fixture, and for valid cases checks JSON input values against those observed textboxes. It copies actual JSON outputs; it does not calculate or fill expected outputs.
- `preview-v5-observations.json`: normalized observations with timestamps and pointers back to each raw capture.
- `preview-v5-verifier-report.json`: saved independent verifier output; status pass for all 13 cases.

Run again from the repository root:

```sh
python3 docs/experiments/atoms/evidence/normalize-preview-v5.py
node scripts/verify-atoms.mjs docs/experiments/atoms/evidence/preview-v5-observations.json
```

## Blank-entry attempt retained

At **2026-09-10T12:14:20.507Z**, the requested blank-price fixture did not actually clear the previous `-1` value: the captured price textbox still contained `-1`, and the application correctly showed the negative-value error. The coordinating browser agent reported that its initial `fill('')` action had not cleared the field. This attempt does not test blank handling and is not counted as a product failure or a passing blank test.

The separate retry at **2026-09-10T12:14:37.869Z** captured the price textbox with no value and the visible message: “Enter a value for price per customer per month. A blank field is not read as zero, so type 0 if you mean zero.” The results-unavailable region was visible; the scenario results region and JSON preview were absent; the download button was disabled. This real retry supplies the normalized blank case. Both attempts remain in the raw evidence.

## What these results establish

The observed version-5 preview produced the expected arithmetic for the eight specified valid scenarios. In the five invalid scenarios, visible validation messages, suppressed results and disabled download controls were captured. The original blank-entry action was a test-input limitation resolved by an observed retry.

The captured JSON was shown inside the application's interface. **No downloaded file is represented by this evidence.** The captured URL identifies an Atoms preview; this is not proof of a public product launch. UI text asserting local privacy is not a network inspection result.

These records do not establish A5–A8: mobile/keyboard checks, actual file download and privacy inspection, public publication, code export and ownership require their own evidence. Representative invalid-input cases also do not establish every boundary on every field. No ledger, acceptance grade, customer, revenue or observation-window state was changed by this evidence conversion.
