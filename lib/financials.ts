import type { Company } from "./data.ts";
import type { FinancialKind, MetricKind, MetricObservation } from "./financial-types.ts";
import { financialObservations } from "./financial-observations.ts";

export const FINANCIAL_LABELS: Record<FinancialKind, string> = {
  arr: "ARR", revenue: "Revenue", annual_run_rate: "Annual run rate",
  revenue_projection: "Revenue projection", unclassified: "Metric unclassified",
};
export const METRIC_LABELS: Record<MetricKind, string> = {
  ...FINANCIAL_LABELS, headcount: "Headcount", contractors: "Disclosed contractors",
};

export function financialHistory(company: Pick<Company, "slug">): MetricObservation[] {
  return financialObservations.filter((entry) => entry.slug === company.slug);
}

export function activeObservations(history: MetricObservation[]): MetricObservation[] {
  const replaced = new Set(history.flatMap((entry) => entry.supersedes ? [entry.supersedes] : []));
  return history.filter((entry) => !replaced.has(entry.id));
}

export function latestObservation(company: Pick<Company, "slug">, kind: MetricKind): MetricObservation | null {
  return activeObservations(financialHistory(company)).filter((entry) => entry.kind === kind)
    .sort((a, b) => (b.asOf ?? "").localeCompare(a.asOf ?? "") || b.recordedAt.localeCompare(a.recordedAt))[0] ?? null;
}

export function financialSummary(company: Pick<Company, "slug">, kind?: FinancialKind): MetricObservation | null {
  if (kind) return latestObservation(company, kind);
  // Projections are a separate series, never the default headline over realized/reported metrics.
  const entries = activeObservations(financialHistory(company)).filter((entry) => entry.kind in FINANCIAL_LABELS && entry.kind !== "revenue_projection");
  return entries.sort((a, b) => (b.asOf ?? "").localeCompare(a.asOf ?? "") || b.recordedAt.localeCompare(a.recordedAt))[0] ?? null;
}

export function observationDate(entry: MetricObservation): string {
  if (entry.periodStart && entry.periodEnd) return `${entry.periodStart} to ${entry.periodEnd}`;
  return entry.asOf ? `As of ${entry.asOf}` : "Observation date unknown";
}

export function financialText(company: Pick<Company, "slug">): string {
  const entry = financialSummary(company);
  return entry ? `${entry.display} · ${METRIC_LABELS[entry.kind]} · ${observationDate(entry)} · ${entry.status}${entry.checkedAt ? "" : " · source not rechecked"}` : "Not reported";
}

export function comparableValue(entry: MetricObservation | null): number | null {
  if (!entry || !entry.checkedAt || !entry.source || !entry.asOf || !entry.scope || entry.status !== "reported"
    || !["exact", "approximate"].includes(entry.precision) || entry.value === null || !Number.isFinite(entry.value) || entry.value < 0
    || entry.currency !== "USD" || !["arr", "revenue", "annual_run_rate"].includes(entry.kind)) return null;
  return entry.value;
}

export function metricPerHuman(financial: MetricObservation | null, headcount: MetricObservation | null, contractors: MetricObservation | null = null): number | null {
  const value = comparableValue(financial);
  if (value === null || !financial || !headcount || !headcount.checkedAt || !headcount.source || headcount.status !== "reported"
    || headcount.kind !== "headcount" || headcount.population !== "employees_and_founders" || headcount.precision !== "exact"
    || headcount.value === null || !Number.isInteger(headcount.value) || headcount.value <= 0
    || !headcount.asOf || headcount.asOf !== financial.asOf || headcount.scope !== financial.scope) return null;
  // Annual revenue needs an average labor denominator, which this point-in-time series does not provide.
  if (financial.kind === "revenue") return null;
  let people = headcount.value;
  if (contractors) {
    if (contractors.kind !== "contractors" || !contractors.checkedAt || !contractors.source || contractors.status !== "reported"
      || contractors.precision !== "exact" || contractors.value === null || !Number.isInteger(contractors.value) || contractors.value < 0
      || contractors.asOf !== headcount.asOf || contractors.scope !== headcount.scope) return null;
    people += contractors.value;
  }
  return value / people;
}
