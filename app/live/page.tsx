import type { Metadata } from "next";
import Link from "next/link";
import { companies, caseStudies, stackTools } from "@/lib/data";
import { editions } from "@/lib/editions";
import ops from "@/data/ops.json";

export const metadata: Metadata = {
  title: "Live — Autopilot Index ops",
  description:
    "The Autopilot Index, building in public. Live view of what's shipping, the numbers, the tech stack in use, and the growth actions — one operator, agents on the night shift.",
  alternates: { canonical: "/live" },
  // Private ops cockpit for now — reachable by direct URL, but unlisted and not
  // indexed until the numbers are a flex, not a tell.
  robots: { index: false, follow: false },
};

const TAG_COLORS: Record<string, string> = {
  EDITION: "text-lime-400 border-lime-400/30",
  RESEARCH: "text-sky-300 border-sky-400/30",
  PRODUCT: "text-violet-300 border-violet-400/30",
  GROWTH: "text-amber-300 border-amber-400/30",
  SERIES: "text-emerald-300 border-emerald-400/30",
};

const STATE_COLORS: Record<string, string> = {
  active: "text-lime-400",
  live: "text-lime-400",
  pending: "text-amber-300",
  review: "text-sky-300",
  warming: "text-zinc-400",
};

function fmtUpdated(iso: string): string {
  return iso.slice(0, 16).replace("T", " ") + " UTC";
}

export default function LivePage() {
  const indexCount = companies.length;
  const experimentCount = caseStudies.length;
  const stackCount = stackTools.length;
  const editionCount = editions.length;
  const r = ops.dailyReport;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
      {/* Hero */}
      <header className="border-b border-zinc-900 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-bold tracking-tight text-zinc-100">
                autopilot<span className="text-lime-400">index</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 font-mono text-xs text-lime-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
                </span>
                LIVE
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
              Building in public — the whole machine, one page.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              {ops.statusNote}. One operator, agents on the night shift.{" "}
              <span className="text-zinc-500">Updated {fmtUpdated(ops.updatedAt)}.</span>
            </p>
          </div>
          <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">
            ← the index
          </Link>
        </div>
      </header>

      {/* Metrics grid */}
      <section className="grid grid-cols-2 gap-3 py-8 sm:grid-cols-3">
        {ops.metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="font-mono text-3xl font-bold tracking-tight text-lime-400">{m.value}</div>
            <div className="mt-2 text-sm text-zinc-300">{m.label}</div>
            {m.delta && <div className="mt-1 font-mono text-[11px] text-zinc-500">{m.delta}</div>}
          </div>
        ))}
      </section>

      {/* Index at a glance */}
      <section className="mb-8 flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-5 py-4 text-sm text-zinc-400">
        <span>
          <b className="font-mono text-zinc-100">{indexCount}</b> companies tracked
        </span>
        <span>
          <b className="font-mono text-zinc-100">{experimentCount}</b> field experiments
        </span>
        <span>
          <b className="font-mono text-zinc-100">{stackCount}</b> stack tools watched
        </span>
        <span>
          <b className="font-mono text-zinc-100">{editionCount}</b> editions shipped
        </span>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {/* CEO daily report */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-lime-400">Daily report</h2>
            <span className="font-mono text-[11px] text-zinc-600">{r.date}</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-100">{r.title}</h3>
          <p className="mt-2 font-mono text-xs uppercase tracking-wide text-zinc-500">What shipped</p>
          <ul className="mt-1.5 space-y-1.5">
            {r.shipped.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-zinc-300">
                <span className="text-lime-400">✓</span>
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-xs uppercase tracking-wide text-zinc-500">The math</p>
          <p className="mt-1 font-mono text-sm text-zinc-300">{r.math}</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-wide text-zinc-500">Next</p>
          <p className="mt-1 text-sm text-zinc-300">{r.next}</p>
        </section>

        {/* The drill / focus */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">The drill — next up</h2>
          <ul className="space-y-2.5">
            {ops.focus.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-snug text-zinc-300">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    f.status === "next" ? "bg-lime-400" : "bg-zinc-700"
                  }`}
                />
                {f.text}
              </li>
            ))}
          </ul>
        </section>

        {/* Actions feed */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 md:col-span-2">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">Actions — what I'm doing</h2>
          <ul className="space-y-3">
            {ops.actions.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-mono text-[11px] text-zinc-600">{a.at.slice(5)}</span>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                    TAG_COLORS[a.tag] ?? "text-zinc-400 border-zinc-700"
                  }`}
                >
                  {a.tag}
                </span>
                <span className="text-sm leading-snug text-zinc-300">{a.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Tech stack */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">Tech stack in use</h2>
          <ul className="space-y-3">
            {ops.stack.map((s) => (
              <li key={s.layer}>
                <div className="font-mono text-[11px] uppercase tracking-wide text-zinc-500">{s.layer}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {s.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[11px] text-zinc-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Channels */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">Distribution</h2>
          <ul className="space-y-2.5">
            {ops.channels.map((c) => (
              <li key={c.name} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-zinc-300">
                  {c.name}
                  <span className="ml-2 text-[11px] text-zinc-500">{c.detail}</span>
                </span>
                <span className={`font-mono text-[10px] uppercase ${STATE_COLORS[c.state] ?? "text-zinc-500"}`}>
                  {c.state}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Affiliates / monetization */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 md:col-span-2">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">
            Monetization — affiliate rails
          </h2>
          <p className="mb-3 text-sm text-zinc-400">
            Monetize the stack, never the subjects of coverage. Referral links support the index; they never buy
            placement.
          </p>
          <div className="flex flex-wrap gap-2">
            {ops.affiliates.map((a) => (
              <span
                key={a.name}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-sm text-zinc-300"
              >
                {a.name}
                <span className={`font-mono text-[10px] uppercase ${STATE_COLORS[a.state] ?? "text-zinc-500"}`}>
                  {a.state}
                </span>
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* Footer note */}
      <p className="mt-10 text-center font-mono text-[11px] text-zinc-700">
        The Autopilot Index tracks companies run by AI — and runs itself in public.{" "}
        <Link href="/news" className="text-zinc-500 hover:text-lime-400">
          live signals →
        </Link>
      </p>
    </main>
  );
}
