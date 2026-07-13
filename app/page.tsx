import Link from "next/link";
import Leaderboard from "@/components/Leaderboard";
import CompanyCard from "@/components/CompanyCard";
import StackPyramid from "@/components/StackPyramid";
import OpsTerminal from "@/components/OpsTerminal";
import { companies, playbook, hackathon, caseStudies, criteria, categories, investorTheses } from "@/lib/data";

function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">{kicker}</p>
      <h2 className="text-2xl font-bold text-zinc-100 sm:text-3xl">{title}</h2>
      {sub && <p className="mt-2 max-w-2xl text-sm text-zinc-400">{sub}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      {/* Hero */}
      <header className="grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 font-mono text-xs text-lime-400">
            tracking the autonomous-business era
          </span>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-zinc-50 sm:text-6xl">
            Business on <span className="text-lime-400">Autopilot</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            A tracker for the new class of companies where AI agents run the operations and humans set the
            direction. Who they are, what they run on, how they make money — and how you can build your own.
          </p>
          <p className="font-mono text-sm text-zinc-500">“{hackathon.motto}”</p>
          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <a
              href="#leaderboard"
              className="rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-lime-300"
            >
              View the leaderboard
            </a>
            <a
              href="#build"
              className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 hover:border-zinc-500"
            >
              Build your own →
            </a>
            <Link
              href="/news"
              className="rounded-full border border-lime-400/40 bg-lime-400/10 px-5 py-2.5 text-sm font-semibold text-lime-400 hover:bg-lime-400/20"
            >
              📡 News pulse — follow the story
            </Link>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <OpsTerminal />
        </div>
      </header>

      {/* Leaderboard */}
      <section id="leaderboard" className="scroll-mt-24 py-12">
        <SectionTitle
          kicker="01 · Leaderboard"
          title="The autopilot index"
          sub="The metric that matters in this category isn't headcount — it's how much business each human can orchestrate. Click a column to sort. Unverified rows are companies we're still researching."
        />
        <Leaderboard companies={companies} />
        <p className="mt-3 text-xs text-zinc-600">
          Each figure links to its data source (Crunchbase, LinkedIn, press) where one exists. Figures without a
          source are self-reported claims — treat as directional.
        </p>
      </section>

      {/* Companies */}
      <section id="companies" className="scroll-mt-24 py-12">
        <SectionTitle
          kicker="02 · Companies"
          title="The companies in autopilot"
          sub="The cohort surfaced at the Cursor Hands-Off Hackathon — each building toward businesses that run themselves."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {companies
            .filter((c) => c.cohort !== "expansion")
            .map((c) => (
              <CompanyCard key={c.slug} company={c} />
            ))}
        </div>
        <div className="mb-8 mt-14">
          <h3 className="text-xl font-bold text-zinc-100">The wider autopilot universe</h3>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Beyond the hackathon: superconnectors, lean-AI benchmarks, agent-run departments, the financial rails,
            a marketplace where the agents hire the humans — and one cautionary tale.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {companies
            .filter((c) => c.cohort === "expansion")
            .map((c) => (
              <CompanyCard key={c.slug} company={c} />
            ))}
        </div>
      </section>

      {/* Criteria */}
      <section id="criteria" className="scroll-mt-24 py-12">
        <SectionTitle
          kicker="03 · Framework"
          title="The Autopilot Criteria"
          sub="Who makes the list — published rules in the spirit of the Lean AI Leaderboard. Radar candidates are judged against these before promotion."
        />
        <ol className="space-y-3">
          {criteria.map((c, i) => (
            <li key={c.rule} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-lime-400/40 font-mono text-xs text-lime-400">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-zinc-100">{c.rule}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{c.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {categories.map((c) => (
            <div key={c.name} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="font-mono text-xs uppercase tracking-wider text-lime-400">{c.name}</p>
              <p className="mt-1.5 text-sm text-zinc-400">{c.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Playbook */}
      <section id="build" className="scroll-mt-24 py-12">
        <SectionTitle kicker="04 · Playbook" title="Steal the workflow" sub={playbook.source} />
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 sm:p-8">
          <ol className="space-y-4">
            {playbook.steps.map((s, i) => (
              <li key={s.step} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-lime-400/40 font-mono text-xs text-lime-400">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-zinc-100">{s.step}</p>
                  <p className="text-sm text-zinc-400">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-zinc-800 pt-5 text-center text-sm italic text-zinc-300">
            {playbook.punchline}
          </p>
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className="scroll-mt-24 py-12">
        <SectionTitle
          kicker="05 · Stack"
          title="The autopilot stack"
          sub="The architecture underneath agent-run companies, layer by layer — seeded from Polsia's public partner list. Tools with an 'offer' badge have referral programs, credits or discounts for builders."
        />
        <StackPyramid />
      </section>

      {/* Field experiments */}
      <section id="experiments" className="scroll-mt-24 py-12">
        <SectionTitle
          kicker="06 · Field experiments"
          title="Agents in the wild"
          sub="Small experiments that show where this goes: agents doing real-world legwork — calls, price checks, introductions — that used to need a human on the line. Also tracked in the News pulse."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {caseStudies.map((cs) => (
            <article key={cs.title} className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-zinc-100">{cs.title}</h3>
                {!cs.verified && (
                  <span className="shrink-0 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                    unverified
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-zinc-500">
                {cs.who}
                {cs.date ? ` · ${cs.date}` : ""}
              </p>
              <p className="text-sm leading-relaxed text-zinc-400">{cs.summary}</p>
              {cs.stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {cs.stack.map((t) => (
                    <span key={t} className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {cs.links.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {cs.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-lime-400 underline hover:text-lime-300"
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Investor theses */}
      <section id="investors" className="scroll-mt-24 py-12">
        <SectionTitle
          kicker="07 · The money's thesis"
          title="Why investors care"
          sub="Verbatim, source-linked statements from the VCs already on these cap tables — the category in their own words."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {investorTheses.map((t) => (
            <figure key={t.quote} className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
              <blockquote className="flex-1 text-sm leading-relaxed text-zinc-300">“{t.quote}”</blockquote>
              <figcaption className="mt-4 border-t border-zinc-800/80 pt-3 text-xs text-zinc-500">
                <span className="font-semibold text-zinc-300">{t.partner}</span> · {t.firm} → {t.portfolio}
                <a
                  href={t.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-lime-400 underline hover:text-lime-300"
                >
                  {t.source.name} ↗
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Hackathon origin */}
      <section id="origin" className="scroll-mt-24 py-12">
        <SectionTitle kicker="08 · Origin" title="Where this started" />
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">{hackathon.date}</p>
          <h3 className="mt-2 text-xl font-bold text-zinc-100">{hackathon.name}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">{hackathon.pitch}</p>
          <p className="mt-4 text-sm italic text-lime-400">“{hackathon.motto}”</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={hackathon.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-lime-400/50"
            >
              Hackathon site ↗
            </a>
            <a
              href={hackathon.video}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-lime-400/50"
            >
              Watch the Loom ↗
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 pt-8 text-center text-xs text-zinc-600">
        <p>
          Inspired by the{" "}
          <a href="https://leanaileaderboard.com/" className="text-zinc-400 underline hover:text-lime-400">
            Lean AI Leaderboard
          </a>{" "}
          by Henry Shi. Know a company running on autopilot?{" "}
          <Link href="/submit" className="text-lime-400 underline hover:text-lime-300">
            Submit it
          </Link>
          . Code MIT · data CC BY 4.0 —{" "}
          <a
            href="https://github.com/zetabytelab/autopilotbiz"
            className="text-zinc-400 underline hover:text-lime-400"
          >
            GitHub
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
