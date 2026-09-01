import type { Metadata } from "next";
import Link from "next/link";
import d from "@/data/n8n-debate.json";

export const metadata: Metadata = {
  title: "Is n8n obsolete? What 72 builders actually argued (n8n vs code in the agentic era)",
  description:
    "Agentic coding was supposed to kill n8n. We mapped a 72-comment r/n8n debate by community weight — the six camps, the winning reframe, and where the code-vs-orchestration boundary really moved in 2026. From The Autopilot Index.",
  alternates: { canonical: "/guides/is-n8n-obsolete" },
};

export default function IsN8nObsolete() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
      <header className="py-12">
        <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">
          ← The Autopilot Index
        </Link>
        <p className="mb-2 mt-8 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">
          Signal · from the field · {d.updatedAt}
        </p>
        <h1 className="text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
          Is n8n obsolete? The boundary moved, it didn&apos;t vanish.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">{d.spark}</p>
        <p className="mt-4 font-mono text-xs text-zinc-600">
          Source: {d.source} · {d.totalComments} comments analysed · top comment +{d.topScore}
        </p>
      </header>

      {/* The camps */}
      <section className="mb-4">
        <h2 className="text-xl font-bold text-zinc-100">The debate, mapped by community weight</h2>
        <p className="mb-6 mt-1 max-w-2xl text-sm text-zinc-400">
          Six camps emerged. We ranked them by the upvotes the community actually gave — not by who posted loudest.
        </p>
      </section>

      <div className="space-y-6">
        {d.camps.map((c) => (
          <section key={c.key} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-bold text-zinc-100">{c.label}</h3>
              <span className="font-mono text-xs uppercase tracking-wide text-lime-400">{c.weight}</span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{c.blurb}</p>
            <ul className="mt-4 space-y-3">
              {c.voices.map((v, i) => (
                <li key={i} className="border-l-2 border-zinc-800 pl-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-zinc-300">u/{v.who}</span>
                    <span className="font-mono text-[11px] text-zinc-600">+{v.score}</span>
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-zinc-400">{v.point}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Synthesis */}
      <section className="mt-12 rounded-2xl border border-lime-400/25 bg-lime-400/[0.05] p-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-lime-400">The Autopilot Index read</h2>
        <ol className="mt-4 space-y-3">
          {d.synthesis.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
              <span className="font-mono text-lime-400">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Meta note */}
      <p className="mt-8 max-w-2xl text-sm italic leading-relaxed text-zinc-500">{d.meta}</p>

      {/* Internal link + CTA */}
      <section className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
        <p className="text-sm leading-relaxed text-zinc-300">
          Want to see the &ldquo;specify and review&rdquo; split in practice? Here&apos;s a working build:{" "}
          <Link href="/guides/apify-n8n-lead-machine" className="text-lime-400 underline-offset-2 hover:underline">
            the autopilot lead machine
          </Link>{" "}
          — Apify scrapes, n8n orchestrates, the leads land while you sleep.
        </p>
        <p className="mt-4 text-sm text-zinc-400">
          The Autopilot Index tracks companies run by AI — and the stack behind them. Get the weekly teardown by
          email.
        </p>
        <Link
          href="/pulse"
          className="mt-4 inline-block rounded-full bg-lime-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-lime-300"
        >
          Read Autopilot Pulse →
        </Link>
      </section>
    </main>
  );
}
