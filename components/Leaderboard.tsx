"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AutopilotMeta, Company, Source } from "@/lib/data";
import {
  AUTONOMY_LABELS,
  EVIDENCE_LABELS,
  EVIDENCE_SCOPE_NOTE,
  SECTION_LABELS,
  compareCompanies,
  getAutonomyAssessment,
  reportedAnnualFigurePerHuman,
  type CompanySort,
} from "@/lib/autonomy";
import Logo from "@/components/Logo";
import { FINANCIAL_LABELS, financialSummary, latestObservation, METRIC_LABELS, observationDate } from "@/lib/financials";
import type { FinancialKind } from "@/lib/financial-types";

type SectionFilter = "all" | "unclassified" | AutopilotMeta["section"];
type LevelFilter = "all" | "unknown" | NonNullable<AutopilotMeta["level"]>;
type EvidenceFilter = "all" | "unknown" | NonNullable<AutopilotMeta["evidence"]>;

function fmtPerHuman(company: Company, kind: FinancialKind | "all"): string {
  const value = kind === "all" ? null : reportedAnnualFigurePerHuman(company, kind);
  if (value === null) return "Not comparable";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function SourceRef({ source }: { source: Source | undefined }) {
  if (!source) return null;
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-[10px] font-normal text-zinc-400 underline decoration-zinc-700 hover:text-lime-400">
      {source.name}
    </a>
  );
}

const selectClass = "mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400";

export default function Leaderboard({ companies }: { companies: Company[] }) {
  const [sort, setSort] = useState<CompanySort>("evidence");
  const [metric, setMetric] = useState<FinancialKind | "all">("all");
  const [section, setSection] = useState<SectionFilter>("index");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [evidence, setEvidence] = useState<EvidenceFilter>("all");

  const sorted = useMemo(() => companies.filter((company) => {
    const meta = company.autopilot;
    return (metric === "all" || latestObservation(company, metric) !== null)
      && (section === "all" || (section === "unclassified" ? !meta : meta?.section === section))
      && (level === "all" || (level === "unknown" ? !meta?.level : meta?.level === level))
      && (evidence === "all" || (evidence === "unknown" ? !meta?.evidence : meta?.evidence === evidence));
  }).sort((a, b) => compareCompanies(a, b, metric === "all" && (sort === "annual" || sort === "perHuman") ? "evidence" : sort, metric === "all" ? "arr" : metric)), [companies, sort, section, level, evidence, metric]);

  function reset() {
    setSort("evidence");
    setMetric("all");
    setSection("index");
    setLevel("all");
    setEvidence("all");
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60">
      <div className="space-y-4 border-b border-zinc-800 p-4 sm:p-5">
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">
          Start with source strength, then the scope of AI operation. The Index is selected by default; use the collection filter to explore claims, tools and caution cases.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-medium text-zinc-400">
            Financial measure
            <select value={metric} onChange={(event) => { setMetric(event.target.value as FinancialKind | "all"); setSort("evidence"); }} className={selectClass}>
              <option value="all">All measures · no financial ranking</option>
              {Object.entries(FINANCIAL_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-zinc-400">
            Collection
            <select value={section} onChange={(event) => setSection(event.target.value as SectionFilter)} className={selectClass}>
              <option value="index">Index</option>
              <option value="watchlist">Watchlist · claims under review</option>
              <option value="enabler">Enablers · tools for operators</option>
              <option value="caution">Caution cases</option>
              <option value="unclassified">Unclassified</option>
              <option value="all">All companies</option>
            </select>
          </label>
          <label className="text-xs font-medium text-zinc-400">
            Autonomy level
            <select value={level} onChange={(event) => setLevel(event.target.value as LevelFilter)} className={selectClass}>
              <option value="all">All levels</option>
              {Object.entries(AUTONOMY_LABELS).map(([key, label]) => <option key={key} value={key}>{key} · {label}</option>)}
              <option value="unknown">Not assessed</option>
            </select>
          </label>
          <label className="text-xs font-medium text-zinc-400">
            Evidence grade
            <select value={evidence} onChange={(event) => setEvidence(event.target.value as EvidenceFilter)} className={selectClass}>
              <option value="all">All grades</option>
              {Object.entries(EVIDENCE_LABELS).map(([key, label]) => <option key={key} value={key}>{key} · {label}</option>)}
              <option value="unknown">Not graded</option>
            </select>
          </label>
          <label className="text-xs font-medium text-zinc-400">
            Sort by
            <select value={sort} onChange={(event) => setSort(event.target.value as CompanySort)} className={selectClass}>
              <option value="evidence">Evidence, then autonomy</option>
              <option value="name">Company name · A–Z</option>
              <option value="annual" disabled={metric === "all" || metric === "revenue_projection" || metric === "unclassified"}>Selected measure · highest eligible value</option>
              <option value="perHuman" disabled={metric !== "arr" && metric !== "annual_run_rate"}>Selected measure / disclosed person</option>
              <option value="raised">Funding in USD · highest</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <p aria-live="polite" className="text-zinc-400">Showing {sorted.length} of {companies.length} companies</p>
          <button type="button" onClick={reset} className="rounded px-2 py-1 text-lime-400 underline decoration-lime-400/40 hover:text-lime-300 focus-visible:outline-2 focus-visible:outline-lime-400">Reset to evidence-first Index</button>
        </div>
      </div>

      <div className="overflow-x-auto" role="region" aria-label="Company evidence and autonomy comparison" tabIndex={0}>
        <table className="w-full min-w-[1050px] text-sm">
          <caption className="sr-only">Companies ordered by the selected sort. Evidence grades reflect source strength, not proof of autonomous operation.</caption>
          <thead className="border-b border-zinc-800 text-xs font-medium uppercase tracking-wider text-zinc-500">
            <tr>
              <th scope="col" className="px-3 py-3 text-left">Company</th>
              <th scope="col" className="px-3 py-3 text-left">Evidence</th>
              <th scope="col" className="px-3 py-3 text-left">Autonomy</th>
              <th scope="col" className="px-3 py-3 text-right">Reported humans</th>
              <th scope="col" className="px-3 py-3 text-right">{metric === "all" ? "Financial observation" : FINANCIAL_LABELS[metric]}</th>
              <th scope="col" className="px-3 py-3 text-right">Raised</th>
              <th scope="col" className="px-3 py-3 text-right">Selected measure / disclosed person</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((company) => {
              const assessment = getAutonomyAssessment(company);
              const meta = company.autopilot;
              const financial = financialSummary(company, metric === "all" ? undefined : metric);
              const headcount = latestObservation(company, "headcount");
              const contractors = latestObservation(company, "contractors");
              return (
                <tr key={company.slug} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/40">
                  <th scope="row" className="min-w-64 px-3 py-4 text-left font-normal">
                    <div className="flex items-center gap-2">
                      <Logo url={company.url} name={company.name} size={20} />
                      <Link href={`/companies/${company.slug}`} className="font-semibold text-zinc-100 hover:text-lime-400">{company.name}</Link>
                    </div>
                    <div className="mt-1 pl-7 text-[10px] uppercase tracking-wide text-zinc-400">{meta ? SECTION_LABELS[meta.section] : "Unclassified"}</div>
                    <p className="mt-1 max-w-xs pl-7 text-xs leading-relaxed text-zinc-500">{company.tagline}</p>
                    {meta?.flags ? <p className="mt-2 max-w-xs pl-7 text-xs leading-relaxed text-amber-300/80">{meta.flags}</p> : null}
                  </th>
                  <td className="min-w-40 px-3 py-4 align-top">
                    <span className={`inline-flex rounded border px-2 py-0.5 font-mono text-xs ${meta?.evidence === "A" || meta?.evidence === "B" ? "border-lime-400/30 text-lime-400" : "border-zinc-700 text-zinc-300"}`}>
                      {meta?.evidence ? `Grade ${meta.evidence}` : "Not graded"}
                    </span>
                    <p className="mt-2 max-w-44 text-xs text-zinc-400">{meta?.evidence ? EVIDENCE_LABELS[meta.evidence] : "No evidence grade assigned"}</p>
                  </td>
                  <td className="min-w-44 px-3 py-4 align-top">
                    <p className="font-medium text-zinc-200">{assessment.levelLabel}</p>
                    <p className="mt-2 max-w-48 text-xs text-zinc-400">{assessment.qualification}</p>
                  </td>
                  <td className="px-3 py-4 text-right align-top font-mono text-zinc-300">
                    {headcount?.display ?? "—"}
                    <p className="mt-1 text-[10px] text-zinc-500">{headcount ? observationDate(headcount) : "Date unknown"}</p>
                    <SourceRef source={headcount?.source ?? undefined} />
                    {contractors && <p className="mt-1 text-[10px] text-zinc-500">Contractors: {contractors.display} · {observationDate(contractors)}</p>}
                  </td>
                  <td className="px-3 py-4 text-right align-top font-mono text-zinc-300">
                    {financial?.display ?? "—"}
                    {financial && <p className="mt-1 text-[10px] text-zinc-500">{METRIC_LABELS[financial.kind]} · {observationDate(financial)} · {financial.status}{financial.checkedAt ? "" : " · source not rechecked"}</p>}
                    <SourceRef source={financial?.source ?? undefined} />
                  </td>
                  <td className="px-3 py-4 text-right align-top font-mono text-zinc-300">
                    {company.funding.totalRaised ?? "—"}
                    <SourceRef source={company.metrics.sources?.raised} />
                  </td>
                  <td className="px-3 py-4 text-right align-top font-mono text-zinc-300">{fmtPerHuman(company, metric)}</td>
                </tr>
              );
            })}
            {sorted.length === 0 ? <tr><td colSpan={7} className="px-5 py-10 text-center text-zinc-400">No companies match these filters. Try another collection or reset the filters.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <div className="space-y-2 border-t border-zinc-800 p-4 text-xs leading-relaxed text-zinc-400 sm:p-5">
        <p>{EVIDENCE_SCOPE_NOTE} <Link href="/#criteria" className="text-lime-400 underline decoration-lime-400/40">Read the criteria</Link>.</p>
        <p>Select one financial measure to rank eligible USD observations. Dates can still differ: these are historical records, not a same-date benchmark. Estimates, disputes, bounds, projections and unchecked or undated observations are excluded from numeric ranking. Per-person values require matching dates, business scope and a sourced founder-and-employee count; disclosed contractors must also match. Unknown outsourced work remains outside the denominator. Annual revenue needs average labor data, so no per-person ratio is shown. Open a profile for history and corrections.</p>
      </div>
    </div>
  );
}
