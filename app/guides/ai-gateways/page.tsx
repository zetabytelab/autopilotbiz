import type { Metadata } from "next";
import Link from "next/link";
import gw from "@/data/ai-gateways.json";

export const metadata: Metadata = {
  title: "AI Gateways in 2026: the model-routing layer, mapped (OpenRouter, Vercel, Cloudflare & more)",
  description:
    "A living map of the AI gateway / LLM model-routing layer in 2026 — who owns it, what each does, and who's buying whom (Stripe→OpenRouter, Vercel, Databricks, Cloudflare, Ramp). The pick-and-shovels of the autopilot economy, tracked by The Autopilot Index.",
  alternates: { canonical: "/guides/ai-gateways" },
};

const STATUS: Record<string, string> = {
  acquired: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  active: "border-lime-400/40 bg-lime-400/10 text-lime-400",
  watch: "border-sky-400/30 bg-sky-400/10 text-sky-300",
};

export default function AiGatewaysGuide() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
      <header className="py-12">
        <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">
          ← The Autopilot Index
        </Link>
        <p className="mb-2 mt-8 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">
          Stack map · updated {gw.updatedAt}
        </p>
        <h1 className="text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
          The AI gateway wars, mapped.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
          The <span className="text-zinc-100">gateway layer</span> — the routing, caching, fallback and spend
          control between your app and the models — is consolidating fast in 2026. Stripe is folding in OpenRouter;
          Vercel, Databricks, Cloudflare and even Ramp are building their own. It&apos;s the least glamorous and
          most strategic part of the AI stack: whoever owns the meter owns the margin. Here&apos;s who&apos;s
          competing, segmented by who they really are.
        </p>
        <p className="mt-3 font-mono text-xs text-zinc-600">{gw.note}</p>
      </header>

      {/* Segments */}
      {gw.segments.map((seg) => (
        <section key={seg.key} className="mb-10">
          <h2 className="text-xl font-bold text-zinc-100">{seg.label}</h2>
          <p className="mb-4 mt-1 max-w-2xl text-sm text-zinc-400">{seg.blurb}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {seg.gateways.map((g) => (
              <article key={g.name} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-zinc-100">{g.name}</h3>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                      STATUS[g.status] ?? "border-zinc-700 text-zinc-500"
                    }`}
                  >
                    {g.status}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-zinc-500">{g.owner}</p>
                <p className="mt-2 text-xs leading-snug text-zinc-400">{g.does}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-zinc-600">{g.model}</p>
              </article>
            ))}
          </div>
        </section>
      ))}

      {/* Investor radar */}
      <section className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
        <h2 className="text-lg font-bold text-zinc-100">Investor radar — who&apos;s funding the layer</h2>
        <p className="mb-4 mt-1 text-sm text-zinc-400">
          The money backing the gateway/routing layer — worth tracking, because they signal where the next moat
          forms.
        </p>
        <ul className="space-y-2.5">
          {gw.investors.map((inv) => (
            <li key={inv.firm} className="flex flex-col gap-0.5 border-b border-zinc-900 pb-2.5 last:border-0">
              <span className="text-sm font-semibold text-zinc-100">{inv.firm}</span>
              <span className="text-xs text-zinc-400">
                {inv.bets}
                {inv.note ? <span className="text-zinc-600"> · {inv.note}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Builder takeaway */}
      <section className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
        <h2 className="text-lg font-bold text-zinc-100">Why a builder should care</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
          <li>• <b className="text-zinc-100">Cost-routing is the biggest lever.</b> Routing routine calls to cheaper models (Sapiom/Sciforium-style) can cut a model bill ~10×. The gateway is where you pull that lever.</li>
          <li>• <b className="text-zinc-100">Neutrality is now a strategic choice.</b> An independent gateway keeps you portable; a platform-owned one trades neutrality for convenience and lock-in.</li>
          <li>• <b className="text-zinc-100">Own your fallback.</b> When a provider degrades or a deal closes (see Stripe↔OpenRouter), your gateway is what keeps you running. Don&apos;t single-thread it.</li>
          <li>• <b className="text-zinc-100">Whoever owns the meter owns the margin.</b> Payments/fintech entrants (Stripe, Ramp) understand this — watch the metering layer, not just the models.</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-lime-400/30 bg-lime-400/[0.06] p-6 text-center">
        <h2 className="text-lg font-bold text-zinc-100">Track the stack as it consolidates.</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-400">
          The Autopilot Index tracks the tech stack behind companies run by AI — gateways, agents, sandboxes and
          the money moving them. Weekly, sourced, free.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/news" className="rounded-full bg-lime-400 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-lime-300">
            See live stack signals →
          </Link>
          <Link href="/pulse" className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-500">
            Read the editions
          </Link>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-zinc-600">
        A living map, updated as the space moves. Deal figures are labeled and sourced in the companion edition. Not
        investment advice.
      </p>
    </main>
  );
}
