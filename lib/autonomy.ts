import type { AutopilotMeta, Company } from "./data.ts";

export const AUTONOMY_LABELS = {
  L2: "Function autopilot",
  L3: "Operational autopilot",
  L4: "Goal-level autopilot",
  L5: "Full autonomy",
} satisfies Record<NonNullable<AutopilotMeta["level"]>, string>;

export const EVIDENCE_LABELS = {
  A: "Audited or independently reviewed financials",
  B: "Public transaction or filing",
  C: "Press coverage with founder confirmation",
  D: "Founder claims only",
} satisfies Record<NonNullable<AutopilotMeta["evidence"]>, string>;

export const SECTION_LABELS = {
  index: "Index",
  watchlist: "Watchlist",
  caution: "Caution",
  enabler: "Enabler",
} satisfies Record<AutopilotMeta["section"], string>;

export const EVIDENCE_SCOPE_NOTE =
  "Evidence grades describe the sources behind reported facts, including financials. They do not certify autonomous operation. Levels are editorial assessments; human involvement still needs to be checked.";

export function getAutonomyAssessment(company: Company) {
  const meta = company.autopilot;
  return {
    levelLabel: meta?.level ? `${meta.level} · ${AUTONOMY_LABELS[meta.level]}` : "Not assessed",
    evidenceLabel: meta?.evidence ? `${meta.evidence} · ${EVIDENCE_LABELS[meta.evidence]}` : "Not graded",
    sectionLabel: meta ? SECTION_LABELS[meta.section] : "Unclassified",
    qualification:
      meta?.section === "watchlist"
        ? "Claimed capability · evidence still developing"
        : meta?.section === "enabler"
          ? "A tool for operators; its own business autonomy is not assessed"
          : meta?.section === "caution"
            ? "Material concerns · read the source notes"
            : meta?.level
              ? "Editorial assessment · not an autonomy audit"
              : "Autonomy has not been assessed",
  };
}

const EVIDENCE_ORDER = { A: 0, B: 1, C: 2, D: 3 };
const LEVEL_ORDER = { L5: 0, L4: 1, L3: 2, L2: 3 };

/** Evidence first, then assessed/claimed scope. Missing grades and levels sort last. */
export function compareEvidenceThenAutonomy(a: Company, b: Company): number {
  const evidenceA = a.autopilot?.evidence;
  const evidenceB = b.autopilot?.evidence;
  const evidenceDifference = (evidenceA ? EVIDENCE_ORDER[evidenceA] : 4) - (evidenceB ? EVIDENCE_ORDER[evidenceB] : 4);
  if (evidenceDifference) return evidenceDifference;
  const levelA = a.autopilot?.level;
  const levelB = b.autopilot?.level;
  const levelDifference = (levelA ? LEVEL_ORDER[levelA] : 4) - (levelB ? LEVEL_ORDER[levelB] : 4);
  return levelDifference || a.name.localeCompare(b.name) || a.slug.localeCompare(b.slug);
}

/** Do not convert mixed currencies, parent rounds, ranges or lifetime totals into USD. */
export function comparableFundingUsd(value: string | null): number | null {
  if (!value) return null;
  const match = value.trim().match(/^~?\$([\d]+(?:\.\d+)?)\s*([MBK]?)$/i);
  if (!match) return null;
  const multiplier = { B: 1e9, M: 1e6, K: 1e3, "": 1 }[match[2].toUpperCase()];
  return multiplier === undefined ? null : Number(match[1]) * multiplier;
}

export function reportedAnnualFigurePerHuman(company: Company): number | null {
  const { arrUsd, humans, disclosedContractors } = company.metrics;
  if (arrUsd === null || humans === null || !Number.isFinite(arrUsd) || !Number.isFinite(humans) || humans <= 0 || arrUsd < 0) return null;
  // Disclosed contractors do the work too. Counting only employees produces a figure
  // the company's own profile contradicts.
  const people = humans + (disclosedContractors ?? 0);
  return arrUsd / people;
}

export type CompanySort = "evidence" | "name" | "raised" | "annual" | "perHuman";

export function compareCompanies(a: Company, b: Company, sort: CompanySort): number {
  if (sort === "evidence") return compareEvidenceThenAutonomy(a, b);
  if (sort === "name") return a.name.localeCompare(b.name) || a.slug.localeCompare(b.slug);
  const value = (company: Company): number | null => {
    if (sort === "raised") return comparableFundingUsd(company.funding.totalRaised);
    if (sort === "perHuman") return reportedAnnualFigurePerHuman(company);
    return company.metrics.arrUsd;
  };
  const valueA = value(a);
  const valueB = value(b);
  if (valueA === null && valueB === null) return compareEvidenceThenAutonomy(a, b);
  if (valueA === null) return 1;
  if (valueB === null) return -1;
  return valueB - valueA || compareEvidenceThenAutonomy(a, b);
}
