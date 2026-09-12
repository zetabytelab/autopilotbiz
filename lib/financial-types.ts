import type { Source } from "./data.ts";

export type FinancialKind = "arr" | "revenue" | "annual_run_rate" | "revenue_projection" | "unclassified";
export type MetricKind = FinancialKind | "headcount" | "contractors";
export type MetricObservation = {
  id: string;
  slug: string;
  kind: MetricKind;
  value: number | null;
  currency: "USD" | null;
  precision: "exact" | "approximate" | "lower_bound" | "range" | "unknown";
  display: string;
  asOf: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  scope: string | null;
  population: "employees_and_founders" | "employees" | "team_unspecified" | "contractors" | null;
  status: "reported" | "estimated" | "disputed" | "unclassified";
  source: Source | null;
  publishedAt: string | null;
  recordedAt: string;
  checkedAt: string | null;
  supersedes: string | null;
  notes: string;
};
