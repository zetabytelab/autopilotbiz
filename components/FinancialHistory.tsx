import { financialHistory, METRIC_LABELS, observationDate } from "@/lib/financials";

export default function FinancialHistory({ slug }: { slug: string }) {
  const history = financialHistory({ slug });
  if (!history.length) return <p className="mt-4 text-sm text-zinc-500">No financial or headcount observations recorded.</p>;
  const superseded = new Set(history.flatMap((entry) => entry.supersedes ? [entry.supersedes] : []));
  return <details className="mt-5 rounded-xl border border-zinc-800 p-4">
    <summary className="cursor-pointer text-sm font-medium text-lime-400">Financial and headcount history · {history.length} observations</summary>
    <p className="mt-3 text-xs leading-relaxed text-zinc-500">Recorded dates show when an entry was added to this history. Source-check dates show when the publication was read; they do not establish that the figure is current or audited. Earlier observations and corrections remain visible.</p>
    <ol className="mt-4 space-y-5">
      {[...history].reverse().map((entry) => <li key={entry.id} id={entry.id} className="border-t border-zinc-800 pt-4">
        <p className="text-sm font-medium text-zinc-200">{METRIC_LABELS[entry.kind]} · {entry.display}</p>
        <p className="mt-1 text-xs text-zinc-400">{observationDate(entry)} · {entry.status} · {entry.precision.replaceAll("_", " ")}{superseded.has(entry.id) ? " · superseded" : ""}</p>
        <p className="mt-1 text-xs text-zinc-500">Scope: {entry.scope ?? "unknown"}{entry.population ? ` · ${entry.population.replaceAll("_", " ")}` : ""} · Recorded {entry.recordedAt} · Source checked {entry.checkedAt ?? "not recorded"} · Published {entry.publishedAt ?? "date unknown"}</p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">{entry.notes}</p>
        {entry.source ? <a href={entry.source.url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-xs text-lime-400 underline">{entry.source.name} ↗</a> : <p className="mt-2 text-xs text-zinc-500">Source unknown</p>}
        {entry.supersedes && <a href={`#${entry.supersedes}`} className="mt-2 block text-xs text-zinc-400 underline">Replaces an earlier entry</a>}
      </li>)}
    </ol>
  </details>;
}
