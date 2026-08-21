import type { Metadata } from "next";
import Link from "next/link";
import { companies } from "@/lib/data";

export const metadata: Metadata = {
  title: "AI Company Builders in 2026: Polsia, Cofounder, Atoms & Nanocorp compared",
  description:
    "An honest, sourced comparison of the AI platforms that build and run whole companies for you — Polsia, Cofounder, Atoms and Nanocorp. Funding, pricing, what they actually do, and what owners report. From The Autopilot Index.",
  alternates: { canonical: "/guides/ai-company-builders" },
};

const SLUGS = ["polsia", "cofounder", "atoms", "nanocorp"];
// Where a deeper first-party audit exists on the site.
const RECEIPTS: Record<string, { href: string; label: string }> = {
  polsia: { href: "/pulse/03-never-says-tomorrow", label: "Read the 90-day first-party audit →" },
};

export default function AiCompanyBuildersGuide() {
  const builders = SLUGS.map((s) => companies.find((c) => c.slug === s)).filter(Boolean) as typeof companies;

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
      <header className="py-12">
        <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">
          ← The Autopilot Index
        </Link>
        <p className="mb-2 mt-8 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">Guide · 2026</p>
        <h1 className="text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
          AI company builders, compared — honestly.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
          A new category arrived in 2026: platforms where you type an idea and an AI builds and runs the whole
          company — code, site, marketing, support, even the fundraise. Here are the four most-watched, side by
          side, with funding, pricing, and what owners actually report. Every figure is labeled{" "}
          <span className="text-lime-400">verified</span>, self-reported, or disputed — the rule the whole index
          runs on.
        </p>
      </header>

      {/* Comparison table */}
      <section className="mb-12 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left font-mono text-xs uppercase tracking-wide text-zinc-500">
              <th className="py-3 pr-4">Platform</th>
              <th className="py-3 pr-4">What it does</th>
              <th className="py-3 pr-4">Raised</th>
              <th className="py-3 pr-4">Pricing</th>
              <th className="py-3 pr-4">ARR claim</th>
              <th className="py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {builders.map((c) => (
              <tr key={c.slug} className="border-b border-zinc-900 align-top">
                <td className="py-3 pr-4 font-semibold text-zinc-100">{c.name}</td>
                <td className="py-3 pr-4 text-zinc-400">{c.tagline}</td>
                <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{c.funding.totalRaised ?? "—"}</td>
                <td className="py-3 pr-4 text-zinc-400">{c.pricing ?? "—"}</td>
                <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{c.metrics.arr ?? "—"}</td>
                <td className="py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                      c.verified
                        ? "border-lime-400/40 bg-lime-400/10 text-lime-400"
                        : "border-amber-400/30 bg-amber-400/10 text-amber-300"
                    }`}
                  >
                    {c.verified ? "verified" : "disputed"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Per-company */}
      <section className="space-y-6">
        {builders.map((c) => (
          <article key={c.slug} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-bold text-zinc-100">{c.name}</h2>
              {c.funding.valuation && (
                <span className="font-mono text-xs text-zinc-500">valuation {c.funding.valuation}</span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{c.description}</p>
            <div className="mt-4 grid gap-3 text-xs text-zinc-500 sm:grid-cols-2">
              <div>
                <span className="font-mono uppercase tracking-wide text-zinc-600">Founders</span>
                <p className="mt-1 text-zinc-400">
                  {c.founders.length ? c.founders.map((f) => f.name).join(", ") : "—"}
                </p>
              </div>
              <div>
                <span className="font-mono uppercase tracking-wide text-zinc-600">Stack</span>
                <p className="mt-1 text-zinc-400">{c.techStack.slice(0, 6).join(" · ") || "—"}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              {c.url && (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 underline hover:text-lime-400"
                >
                  Visit {c.name} ↗
                </a>
              )}
              <Link href={`/#${c.slug}`} className="text-xs text-zinc-400 underline hover:text-lime-400">
                See it on the index →
              </Link>
              {RECEIPTS[c.slug] && (
                <Link href={RECEIPTS[c.slug].href} className="text-xs font-semibold text-lime-400 hover:text-lime-300">
                  {RECEIPTS[c.slug].label}
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* How to choose */}
      <section className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
        <h2 className="text-lg font-bold text-zinc-100">How to choose (a builder's checklist)</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
          <li>• <b className="text-zinc-100">Instrument your own truth.</b> Wire a payment webhook and a real analytics event to a source the agent can&apos;t author — don&apos;t trust the agent&apos;s own summary.</li>
          <li>• <b className="text-zinc-100">Demand a gate</b> before anything irreversible ships in your name (outreach, ad spend, publishing).</li>
          <li>• <b className="text-zinc-100">Check ownership.</b> Can you export your repo and domain? If code vanishes when you cancel, that&apos;s lock-in.</li>
          <li>• <b className="text-zinc-100">Read the receipts,</b> not the launch post. Owner reports beat founder decks.</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="mt-12 rounded-2xl border border-lime-400/30 bg-lime-400/[0.06] p-6 text-center">
        <h2 className="text-lg font-bold text-zinc-100">Track this category as it moves.</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-400">
          The Autopilot Index tracks every company run by AI — and the stack behind them — with weekly first-party
          audits. Free.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/#leaderboard"
            className="rounded-full bg-lime-400 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-lime-300"
          >
            See the leaderboard →
          </Link>
          <Link
            href="/pulse"
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-500"
          >
            Read the editions
          </Link>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-zinc-600">
        Figures reflect the index as of the latest update; disputed claims are labeled. Not investment advice.
      </p>
    </main>
  );
}
