import type { Metadata } from "next";
import Link from "next/link";
import { acceptanceChecks, atomsExperiment, experimentMetrics, experimentPhases, experimentSources, experimentStatusLabel } from "@/lib/atoms-experiment";

const title = "Can Atoms build a one-person business? An open experiment";
const description = `A documented Atoms experiment: build a Solo Revenue Planner, track human effort and costs, then measure real use. ${experimentStatusLabel}.`;

export const metadata: Metadata = {
  title: `${title} | The Autopilot Index`,
  description,
  alternates: { canonical: "/experiments/atoms" },
  openGraph: { title, description, url: "/experiments/atoms", images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Autopilot Index — Atoms field experiment" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function AtomsExperimentPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
      <header className="py-12 sm:py-16">
        <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">← The Autopilot Index</Link>
        <div className="mb-5 mt-8 flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className="uppercase tracking-[0.18em] text-lime-400">Field experiment 01</span>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-300">{experimentStatusLabel}</span>
        </div>
        <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-zinc-50 sm:text-5xl">Can Atoms build a<br className="hidden sm:block" /> one-person business?</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400">We will ask its AI team to build a useful small product, record every human intervention and follow what happens after launch.</p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-amber-200/80">{atomsExperiment.statusNote}</p>
        <p className="mt-5 max-w-2xl rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed text-amber-200/90">
          <span className="font-semibold text-amber-100">Disclosure.</span> Atoms carries a referral link on the stack
          page of this site, so a signup through that link can earn a commission. It earns nothing from this
          experiment, the result is published either way, and no money changed hands to run it. We are flagging it
          because grading other people&apos;s evidence only works if our own conflicts are on the page.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="/experiments/atoms/build-prompt.txt" download className="rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-lime-300">Download the exact build prompt</a>
          <a href="/experiments/atoms/ledger.json" download className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm text-zinc-200 hover:border-zinc-500">Download the evidence ledger</a>
        </div>
        <p className="mt-4 font-mono text-xs text-zinc-600">Protocol v{atomsExperiment.protocolVersion} · prepared {atomsExperiment.preparedOn} · tools and pricing checked on that date</p>
      </header>

      {atomsExperiment.events.length > 0 && (
        <section aria-labelledby="execution-title" className="mb-8 rounded-xl border border-zinc-800 p-5">
          <h2 id="execution-title" className="text-lg font-semibold text-zinc-100">Execution record</h2>
          <ol className="mt-3 space-y-4">
            {atomsExperiment.events.map((event) => (
              <li key={event.id}>
                <p className="font-mono text-xs text-zinc-500">{event.startedAt.slice(0, 10)} · {event.actor === "external-ai" ? "Browser agent" : event.actor}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-300">{event.outcome}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">Preflight entries are dated operator notes. An access dependency is separate from a product test result; automated browser activity is not measured human work.</p>
        </section>
      )}

      <section aria-labelledby="product-title" className="grid gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8 md:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-lime-400">The product</p>
          <h2 id="product-title" className="mt-2 text-2xl font-bold text-zinc-100">{atomsExperiment.product}</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">A free calculator for solo builders: enter a product price, costs and support workload to see break-even customer count and the human hours required. Save or export the assumptions to compare scenarios.</p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">The first question is whether Atoms can deliver a correct, usable product within a small time budget. Customer demand, paid conversion and ongoing autonomy require separate evidence after launch.</p>
        </div>
        <dl className="space-y-4 border-t border-zinc-800 pt-5 text-sm md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div><dt className="text-zinc-500">Intended user</dt><dd className="mt-1 text-zinc-200">A solo founder evaluating a small software business</dd></div>
          <div><dt className="text-zinc-500">First build limit</dt><dd className="mt-1 text-zinc-200">60 human minutes · up to five corrective prompts · available free credits</dd></div>
          <div><dt className="text-zinc-500">Initial offer</dt><dd className="mt-1 text-zinc-200">Free calculator; paid demand remains untested</dd></div>
          <div><dt className="text-zinc-500">Observation window</dt><dd className="mt-1 text-zinc-200">Seven days after a verified product launch</dd></div>
        </dl>
      </section>

      <section aria-labelledby="results-title" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3"><h2 id="results-title" className="text-2xl font-bold text-zinc-100">Results ledger</h2><span className="font-mono text-xs text-zinc-500">Unknown values stay empty</span></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {experimentMetrics.map((metric) => (
            <article key={metric.label} className="rounded-xl border border-zinc-800 p-5">
              <h3 className="text-sm text-zinc-400">{metric.label}</h3>
              <p className="mt-3 font-mono text-xl text-zinc-100">{metric.value === null ? "Not measured" : `${metric.value} ${metric.unit}`}</p>
              <p className="mt-3 text-xs leading-relaxed text-zinc-500">Evidence required: {metric.source}.</p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-zinc-500">Human time includes briefing, approvals, checking results, manual fixes and support. Cash spend and credits are tracked separately; subscription allocation, refunds and payment fees have their own ledger fields. Preparing this protocol is not included in an Atoms build result.</p>
      </section>

      <section aria-labelledby="protocol-title" className="mt-12">
        <h2 id="protocol-title" className="text-2xl font-bold text-zinc-100">The test, in four stages</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2">
          {experimentPhases.map((phase, index) => (
            <li key={phase.title} className="rounded-xl border border-zinc-800 p-5">
              <div className="flex items-center justify-between gap-3"><span className="font-mono text-lg text-lime-400">0{index + 1}</span><span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">{phase.status}</span></div>
              <h3 className="mt-3 font-semibold text-zinc-100">{phase.title}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-400">{phase.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="checks-title" className="mt-12">
        <h2 id="checks-title" className="text-2xl font-bold text-zinc-100">What counts as a working product?</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">These checks were defined before generation. Results require captured evidence from the actual product. A failed check stays visible; any fix and its author are logged.</p>
        <div className="mt-5 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {acceptanceChecks.map((check) => {
            const attempts = atomsExperiment.acceptanceResults.filter((result) => result.checkId === check.id);
            const latest = attempts.at(-1);
            return (
              <div key={check.id} className="grid gap-2 p-5 sm:grid-cols-[12rem_1fr]">
                <div><h3 className="text-sm font-semibold text-zinc-200"><span className="mr-2 font-mono text-lime-400">{check.id}</span>{check.name}</h3><p className="mt-2 font-mono text-xs text-zinc-500">{latest ? latest.status.replaceAll("_", " ") : "Not run"}</p></div>
                <div><p className="text-sm leading-relaxed text-zinc-400">{check.expected}</p>{latest && <p className="mt-2 text-xs leading-relaxed text-zinc-500">Recorded: {latest.observed} {attempts.length > 1 ? `${attempts.length} attempts retained in the ledger.` : ""}</p>}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="evidence-title" className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 id="evidence-title" className="text-xl font-bold text-zinc-100">Evidence before conclusions</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">We will retain the original prompt, agent transcript, billing evidence, test results, product URL and dated intervention log. Public receipts will exclude account secrets and customer data.</p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">A successful build supports a product-development claim. Repeated operation without intervention, real acquisition and verified payments are separate outcomes. This experiment alone will not establish that Atoms runs an autonomous business.</p>
          <a href="/experiments/atoms/runbook.md" download className="mt-4 inline-block text-sm text-lime-400 underline underline-offset-4 hover:text-lime-300">Download the runbook and logging rules</a>
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Why test Atoms?</h2>
          <ul className="mt-3 space-y-4">
            {experimentSources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-lime-400 underline underline-offset-4 hover:text-lime-300">{source.title} ↗</a><p className="mt-1 text-xs leading-relaxed text-zinc-500">{source.note}</p></li>)}
          </ul>
        </div>
      </section>

      <aside className="mt-12 rounded-2xl border border-lime-400/25 bg-lime-400/5 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">Follow the evidence as it arrives.</h2>
        <p className="mt-2 text-sm text-zinc-400">{atomsExperiment.statusNote} Build results and operational observations will be published with their supporting records.</p>
        <div className="mt-4 flex flex-wrap gap-5 text-sm"><Link href="/companies/atoms" className="text-lime-400 hover:underline">Read the Atoms company profile →</Link><Link href="/pulse" className="text-zinc-300 hover:text-lime-400">Read Autopilot Pulse →</Link></div>
      </aside>
    </main>
  );
}
