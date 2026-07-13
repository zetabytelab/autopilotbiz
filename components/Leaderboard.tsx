"use client";

import { useMemo, useState } from "react";
import type { Company, Source } from "@/lib/data";
import Logo from "@/components/Logo";

type SortKey = "name" | "raised" | "arr" | "perHuman";

function parseMoney(s: string | null): number {
  if (!s) return -1;
  const m = s.replace(/[~$,\s]/g, "").match(/^([\d.]+)([MBK]?)$/i);
  if (!m) return -1;
  const n = parseFloat(m[1]);
  const mult = m[2].toUpperCase() === "B" ? 1e9 : m[2].toUpperCase() === "M" ? 1e6 : m[2].toUpperCase() === "K" ? 1e3 : 1;
  return n * mult;
}

function perHuman(c: Company): number {
  if (c.metrics.arrUsd == null || !c.metrics.humans) return -1;
  return c.metrics.arrUsd / c.metrics.humans;
}

function fmtPerHuman(c: Company): string {
  const v = perHuman(c);
  if (v < 0) return "—";
  return v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${Math.round(v / 1e3)}K`;
}

// Tiny source link shown under a figure so every number is auditable.
function SourceRef({ source }: { source: Source | undefined }) {
  if (!source) return null;
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="mt-0.5 block text-[10px] font-normal text-zinc-600 underline decoration-zinc-800 hover:text-lime-400"
    >
      {source.name}
    </a>
  );
}

export default function Leaderboard({ companies }: { companies: Company[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("perHuman");
  const [desc, setDesc] = useState(true);

  const sorted = useMemo(() => {
    const arr = [...companies];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "raised") cmp = parseMoney(a.funding.totalRaised) - parseMoney(b.funding.totalRaised);
      else if (sortKey === "arr") cmp = (a.metrics.arrUsd ?? -1) - (b.metrics.arrUsd ?? -1);
      else cmp = perHuman(a) - perHuman(b);
      return desc ? -cmp : cmp;
    });
    return arr;
  }, [companies, sortKey, desc]);

  function header(label: string, key: SortKey, align: "left" | "right" = "right") {
    const active = sortKey === key;
    return (
      <th
        className={`cursor-pointer select-none px-3 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-300 ${
          align === "left" ? "text-left" : "text-right"
        } ${active ? "text-lime-400" : ""}`}
        onClick={() => {
          if (active) setDesc(!desc);
          else {
            setSortKey(key);
            setDesc(key !== "name");
          }
        }}
      >
        {label} {active ? (desc ? "↓" : "↑") : ""}
      </th>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-zinc-800">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">#</th>
            {header("Company", "name", "left")}
            <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              Humans
            </th>
            {header("ARR", "arr")}
            {header("Raised", "raised")}
            {header("ARR / human", "perHuman")}
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => (
            <tr key={c.slug} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/40">
              <td className="px-3 py-4 font-mono text-zinc-600">{i + 1}</td>
              <td className="px-3 py-4 text-left">
                <div className="flex items-center gap-2">
                  <Logo url={c.url} name={c.name} size={20} />
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-zinc-100 hover:text-lime-400">
                      {c.name}
                    </a>
                  ) : (
                    <span className="font-semibold text-zinc-100">{c.name}</span>
                  )}
                  {!c.verified && (
                    <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                      unverified
                    </span>
                  )}
                </div>
                <div className="mt-0.5 max-w-md text-xs text-zinc-500 pl-7">{c.tagline}</div>
              </td>
              <td className="px-3 py-4 font-mono text-zinc-300">
                {c.metrics.humans ?? "—"}
                <SourceRef source={c.metrics.sources?.humans} />
              </td>
              <td className="px-3 py-4 text-right font-mono text-zinc-300">
                {c.metrics.arr ?? "—"}
                <SourceRef source={c.metrics.sources?.arr} />
              </td>
              <td className="px-3 py-4 text-right font-mono text-zinc-300">
                {c.funding.totalRaised ?? "—"}
                <SourceRef source={c.metrics.sources?.raised} />
              </td>
              <td className="px-3 py-4 text-right font-mono font-semibold text-lime-400">{fmtPerHuman(c)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
