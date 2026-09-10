"""Convert captured UI evidence; never compute product outputs or substitute expected values."""
import json
import re
from pathlib import Path

directory = Path(__file__).resolve().parent
raw = json.loads((directory / "preview-v5-captures.json").read_text())
fixtures = json.loads((directory.parent / "fixtures.json").read_text())
input_map = {
    "price": ("Price per customer per month", "pricePerCustomerPerMonthUsd"),
    "variableCost": ("Variable cost per customer per month", "variableCostPerCustomerPerMonthUsd"),
    "feePercent": ("Payment processing fee", "paymentFeePercentOfRevenue"),
    "fixedCosts": ("Fixed monthly costs", "fixedMonthlyCostsUsd"),
    "customers": ("Customer count", "customers"),
    "supportMinutes": ("Human support minutes per customer per month", "humanSupportMinutesPerCustomerPerMonth"),
    "fixedHumanHours": ("Fixed human hours per month", "fixedHumanHoursPerMonth"),
    "hourlyValue": ("Value of your time per hour", "operatorTimeValueUsdPerHour"),
}
output_map = {
    "contributionPerCustomer": "contributionPerCustomerUsd",
    "revenue": "revenueUsd",
    "paymentFees": "paymentFeesUsd",
    "breakEvenCustomers": "breakEvenCustomers",
    "operatingSurplus": "operatingSurplusBeforeOwnerTimeUsd",
    "humanHours": "humanHoursPerMonth",
    "economicSurplus": "economicSurplusAfterOwnerTimeUsd",
}


def dom_inputs(capture, expected):
    values = {}
    for key, (label, _) in input_map.items():
        pattern = r'^\s*- textbox "' + re.escape(label) + r'"(?: \[[^\]]+\])*(?:: (.*))?$'
        matches = list(re.finditer(pattern, capture["dom"], re.MULTILINE))
        assert len(matches) == 1, (capture["fixtureId"], key, "missing or duplicate DOM input")
        value = matches[0].group(1)
        text = json.loads(value) if value is not None else ""
        # A numeric fixture expects a displayed numeric string. Invalid text is preserved verbatim.
        actual = float(text) if isinstance(expected[key], (int, float)) else text
        assert actual == expected[key], (capture["fixtureId"], key, "actual entered DOM value differs", actual, expected[key])
        values[key] = actual
    return values


record = {
    "fixtureVersion": fixtures["version"],
    "productUrl": raw["productUrl"],
    "artifactVersion": raw["artifactVersion"],
    "captureMethod": "Coordinating browser agent captured actual preview DOM and the on-screen JSON contents. This is not a downloaded export or public launch. Input values cross-checked against visible textboxes; blank case uses the retained keyboard-clear retry.",
    "observations": [],
}

for fixture in fixtures["cases"]:
    capture = next(item for item in raw["captures"] if item["fixtureId"] == fixture["id"])
    pointer = f"/captures/{raw['captures'].index(capture)}"
    if fixture["id"] == "invalid-blank":
        capture = raw["blankRetry"]
        pointer = "/blankRetry"
    expected_inputs = fixtures["defaultInputs"] | fixture["overrides"]
    actual_inputs = dom_inputs(capture, expected_inputs)
    observation = {
        "fixtureId": fixture["id"],
        "observedAt": capture["observedAt"],
        "evidenceRefs": [f"docs/experiments/atoms/evidence/preview-v5-captures.json#{pointer}"],
        "inputs": actual_inputs,
    }
    if fixture.get("invalid"):
        alerts = re.findall(r'^\s*- alert:\n\s+- generic: (.+)$', capture["dom"], re.MULTILINE)
        assert alerts, (fixture["id"], "no visible validation alert")
        visible_error = " ".join(json.loads(alert) if alert.startswith('"') else alert for alert in alerts)
        suppressed = (
            '- region "Results unavailable":' in capture["dom"]
            and '- region "Scenario results":' not in capture["dom"]
            and '- button "Download scenario JSON" [disabled]:' in capture["dom"]
            and capture["json"] == []
        )
        observation["validation"] = {"inputRejected": bool(visible_error) and suppressed, "visibleError": visible_error, "resultsSuppressed": suppressed}
    else:
        assert len(capture["json"]) == 1, (fixture["id"], "expected exactly one on-screen JSON object")
        actual_json = json.loads(capture["json"][0])
        for key, (_, json_key) in input_map.items():
            assert actual_json["inputs"][json_key] == actual_inputs[key], (fixture["id"], key, "JSON preview and DOM inputs differ")
        observation["outputs"] = {key: actual_json["outputs"][json_key] for key, json_key in output_map.items()}
        observation["breakEvenExplanation"] = actual_json["outputs"]["breakEvenNote"]
    record["observations"].append(observation)

(directory / "preview-v5-observations.json").write_text(json.dumps(record, indent=2) + "\n")
print(f"Normalized {len(record['observations'])} actual captured cases; inputs cross-checked against DOM. No expected outputs used.")
