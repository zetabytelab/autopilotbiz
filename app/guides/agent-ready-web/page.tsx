import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import d from "@/data/agent-web.json";

export const metadata: Metadata = {
  title: "The Agent-Ready Web: a CTO's 0→1 playbook (Vercel, Cloudflare & Ora agent-readiness, compared)",
  description:
    "Your site has two readers now — one of them writes code. Every agent-readiness grader's categories in one table (Vercel is-agentic, Cloudflare, Ora, Glippy), a unified taxonomy, an L0→L5 maturity ladder, and the tiered 0→1 playbook to go from human-only to agent-native. From The Autopilot Index.",
  alternates: { canonical: "/guides/agent-ready-web" },
};

function Eyebrow({ children, tone = "lime" }: { children: React.ReactNode; tone?: "lime" | "amber" | "sky" | "dim" }) {
  const c = { lime: "text-lime-400", amber: "text-amber-400", sky: "text-sky-400", dim: "text-zinc-500" }[tone];
  return <p className={`font-mono text-xs uppercase tracking-[0.2em] ${c}`}>{children}</p>;
}

export default function AgentReadyWeb() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
      {/* Hero */}
      <header className="py-12">
        <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">
          ← The Autopilot Index
        </Link>
        <p className="mb-3 mt-8 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">
          The Agent-Ready Web · a 0→1 field guide · {d.updatedAt}
        </p>
        <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-zinc-50 sm:text-5xl">
          Your site has <span className="text-lime-400">two readers</span> now. One of them writes code.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400">
          In 2026 <span className="text-zinc-100">Vercel, Cloudflare, and Ora</span> all shipped a 0–100 score for how
          ready your site is for AI agents. They measure different things and disagree on what matters. This is the
          map — every grader&apos;s categories in one table — and the <span className="text-zinc-100">0→1 playbook</span>{" "}
          to take a site from human-only to agent-native.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
          {["for CTOs & AI builders", "5 graders compared", "6 unified categories", "L0→L5 maturity ladder"].map((t) => (
            <span key={t} className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-zinc-400">{t}</span>
          ))}
        </div>
      </header>

      {/* Point your agent here */}
      <section className="mb-10 rounded-2xl border border-lime-400/30 bg-lime-400/[0.05] p-6">
        <Eyebrow>Building with an agent? Point it here.</Eyebrow>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          This page is itself agent-native — request it with <code className="rounded bg-zinc-800 px-1 text-xs text-lime-400">Accept: text/markdown</code>{" "}
          and it serves a clean, executable checklist. In Claude Code, Codex, Hermes, or Antigravity, paste:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-zinc-800 bg-black/50 p-4 font-mono text-xs leading-relaxed text-zinc-300">
{`Read https://autopilotindex.com/guides/agent-ready-web and make my
site agent-ready — apply the 0→1 playbook, tier by tier, and open a PR.`}
        </pre>
        <p className="mt-3 text-sm text-zinc-400">
          Or automate the whole loop with{" "}
          <a href="https://github.com/zetabytelab/loop2agentic" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">loop2agentic</a>.
        </p>
      </section>

      {/* The shift */}
      <section className="mb-12">
        <Eyebrow tone="amber">The shift</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-zinc-100 sm:text-3xl">The web was built for eyes. Agents read differently.</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
          A human forgives a slow, JavaScript-heavy, click-to-reveal site. An agent arrives with a task, reads your raw
          HTTP response as data, and decides in one pass whether it can use you — or move to a competitor it{" "}
          <em>can</em>. The gap between those two readers is now measurable, and most of the web fails it.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-400/30 bg-zinc-950/60 p-5">
            <p className="font-mono text-xs uppercase tracking-wide text-amber-400">Reader 1 · Human</p>
            <h3 className="mt-2 text-lg font-bold text-zinc-100">Eyes, patience, a browser</h3>
            <ul className="mt-3 space-y-1 text-sm text-zinc-400">
              <li>Tolerates JS-only content</li><li>Reads visual hierarchy</li>
              <li>Navigates by exploring</li><li>Forgives missing structure</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-lime-400/30 bg-zinc-950/60 p-5">
            <p className="font-mono text-xs uppercase tracking-wide text-lime-400">Reader 2 · Agent</p>
            <h3 className="mt-2 text-lg font-bold text-zinc-100">A task, a token budget, code</h3>
            <ul className="mt-3 space-y-1 text-sm text-zinc-400">
              <li>Needs server-rendered content</li><li>Parses schema, not layout</li>
              <li>Navigates by sitemap &amp; llms.txt</li><li className="text-zinc-200">Wants to <b>call</b>, not just read</li>
            </ul>
          </div>
        </div>
      </section>

      {/* The landscape — table */}
      <section className="mb-12">
        <Eyebrow>The landscape</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-zinc-100 sm:text-3xl">Who measures what</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
          Five public graders, three philosophies: <b className="text-zinc-100">behavioral</b> (watch a real agent try a
          task), <b className="text-zinc-100">protocol</b> (do you speak the emerging standards), and{" "}
          <b className="text-zinc-100">GEO</b> (are you optimized for AI search). They overlap — and disagree.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-900/80 text-left font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="p-3 font-medium">Grader</th>
                <th className="p-3 font-medium">Method</th>
                <th className="p-3 font-medium">Checks</th>
                <th className="p-3 font-medium">Categories measured</th>
                <th className="p-3 font-medium">Signature signals</th>
                <th className="p-3 font-medium">Best for</th>
              </tr>
            </thead>
            <tbody>
              {d.graders.map((g) => (
                <tr key={g.name} className="border-t border-zinc-800 align-top">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Logo url={g.url} name={g.name} size={18} />
                      <span className="font-bold text-zinc-50">{g.name}</span>
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-zinc-600">{g.owner}</div>
                  </td>
                  <td className="p-3 text-zinc-300">
                    {g.method}
                    {g.methodNote && <div className="font-mono text-[11px] text-zinc-600">{g.methodNote}</div>}
                  </td>
                  <td className="p-3 font-mono font-semibold text-lime-400">{g.checks}</td>
                  <td className="p-3 text-zinc-400">
                    {g.categories}
                    {g.catNote && <div className="mt-1 font-mono text-[11px] text-zinc-600">{g.catNote}</div>}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {g.signals.map((s) => (
                        <span
                          key={s}
                          className={`whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                            g.signalsAccent === "sky"
                              ? "border-sky-400/30 text-sky-300"
                              : "border-zinc-700 text-zinc-400"
                          }`}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-zinc-400">{g.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-xs text-zinc-600">
          Behavioral graders (Ora / Vercel, agentchecker) test outcomes. Cloudflare tests protocol adoption. GEO tools
          (Glippy, aeojs) test AI-search visibility. A 100 on any one ≠ a 100 on the others.
        </p>
      </section>

      {/* Unified taxonomy */}
      <section className="mb-12">
        <Eyebrow>The map</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-zinc-100 sm:text-3xl">One taxonomy under all of them</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
          Strip away the branding and every grader tests the same six questions — plus one only a real agent can answer.
          Fix in this order; each layer assumes the one above.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {d.taxonomy.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl border p-5 ${t.beh ? "border-sky-400/30 bg-sky-400/[0.04] sm:col-span-2" : "border-zinc-800 bg-zinc-950/60"}`}
            >
              <span className={`font-mono text-sm font-bold ${t.beh ? "text-sky-400" : "text-lime-400"}`}>{t.n}</span>
              <h3 className="mt-1 text-base font-bold text-zinc-100">{t.name}</h3>
              <p className="mt-1 text-sm font-semibold text-zinc-200">{t.q}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Maturity ladder */}
      <section className="mb-12">
        <Eyebrow tone="sky">The ladder</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-zinc-100 sm:text-3xl">From invisible to transactable</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
          Six levels of agent-readiness. Most of the web sits at L0–L1. Being early to L4–L5 is cheap and rare.
        </p>
        <div className="mt-5 space-y-2">
          {d.ladder.map((r) => (
            <div
              key={r.lv}
              className={`flex overflow-hidden rounded-xl border ${r.on ? "border-lime-400/40" : "border-zinc-800"} bg-zinc-950/60`}
            >
              <div
                className={`flex w-16 shrink-0 items-center justify-center border-r font-mono text-xl font-black ${
                  r.on ? "border-lime-400/30 bg-lime-400/10 text-lime-400" : r.mid ? "border-zinc-800 bg-zinc-900 text-amber-400" : "border-zinc-800 bg-zinc-900 text-zinc-600"
                }`}
              >
                {r.lv}
              </div>
              <div className="p-4">
                <div className="font-bold text-zinc-100">
                  {r.t} <span className={`font-mono text-xs font-normal ${r.on ? "text-lime-400" : "text-zinc-500"}`}>{r.note}</span>
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-zinc-400">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Playbook tiers */}
      <section className="mb-12">
        <Eyebrow>The playbook</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-zinc-100 sm:text-3xl">0→1, in five tiers</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
          Ordered by impact-per-hour. Tiers 1–3 are an afternoon each and get you to &ldquo;strong.&rdquo; Tier 4 is the
          moat. Tier 5 is the frontier — only if you sell.
        </p>
        <div className="mt-5 space-y-4">
          {d.tiers.map((tier) => (
            <div
              key={tier.t}
              className={`overflow-hidden rounded-2xl border ${
                tier.kind === "moat" ? "border-lime-400/35" : tier.kind === "frontier" ? "border-sky-400/30" : "border-zinc-800"
              } bg-zinc-950/60`}
            >
              <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-zinc-800 p-5 ${tier.kind === "moat" ? "bg-lime-400/[0.05]" : "bg-zinc-900/50"}`}>
                <span className={`font-mono text-sm font-black ${tier.kind === "frontier" ? "text-sky-400" : "text-lime-400"}`}>{tier.t}</span>
                <h3 className="flex-1 text-lg font-bold text-zinc-100">{tier.title}</h3>
                <span className="font-mono text-xs text-zinc-500">{tier.eff}</span>
              </div>
              <div className="px-5">
                {tier.steps.map((s, i) => (
                  <div key={i} className="border-b border-zinc-800/70 py-4 last:border-none">
                    <div className="font-semibold text-zinc-50">{s.s1}</div>
                    <p className="mt-0.5 text-sm leading-relaxed text-zinc-400">{s.s2}</p>
                    <p className="mt-1.5 font-mono text-[11px] text-zinc-600">
                      satisfies <span className="text-lime-500">{s.sat}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The aha */}
      <section className="mb-12">
        <Eyebrow>The aha</Eyebrow>
        <div className="mt-3 rounded-2xl border border-lime-400/30 bg-lime-400/[0.05] p-6">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zinc-300 marker:text-lime-400 marker:font-mono">
            <li><b className="text-zinc-100">Most of the web is stuck at L0–L1.</b> The bar is on the floor, so the returns on getting to L2–L3 are enormous and the work is a couple of afternoons.</li>
            <li><b className="text-zinc-100">Readability is table stakes; being callable is the moat.</b> Anyone can add a sitemap. An API + MCP server changes your relationship with an agent from &ldquo;scraped&rdquo; to &ldquo;invoked&rdquo; — and almost no one has done it.</li>
            <li><b className="text-zinc-100">A 100 on any single grader is not success.</b> Scores fragment and each vendor is biased toward its own standards. Normalize across graders, then validate a real agent can complete a real task.</li>
            <li><b className="text-zinc-100">Being early is cheap and compounding.</b> Agents are becoming real traffic. The site an agent can <em>use</em> gets chosen over the ten that merely scored 100 on readability.</li>
          </ol>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["~4%", "of the top 200k domains support markdown content negotiation"],
              ["<15", "sites globally publish an MCP Server Card"],
              ["2", "infra giants (Vercel + Cloudflare) now score this — it's not a fad"],
            ].map(([big, lbl]) => (
              <div key={big} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="font-mono text-3xl font-black tracking-tight text-lime-400">{big}</div>
                <div className="mt-1 text-xs leading-snug text-zinc-400">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Glossary */}
      <section className="mb-12">
        <Eyebrow tone="dim">Reference</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-zinc-100 sm:text-3xl">The standards, decoded</h2>
        <div className="mt-5 grid gap-x-8 gap-y-0 sm:grid-cols-2">
          {d.glossary.map((g) => (
            <div key={g.term} className="border-b border-zinc-800 py-3">
              <div className="font-mono text-[13px] text-lime-500">{g.term}</div>
              <div className="mt-0.5 text-[13.5px] leading-snug text-zinc-400">{g.def}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 text-center">
        <p className="text-sm leading-relaxed text-zinc-300">
          Automate this whole loop:{" "}
          <a href="https://github.com/zetabytelab/loop2agentic" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">loop2agentic</a>{" "}
          scans every grader and applies the fixers. The Autopilot Index tracks companies run by AI — and the stack behind them.
        </p>
        <Link href="/pulse" className="mt-4 inline-block rounded-full bg-lime-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-lime-300">
          Read Autopilot Pulse →
        </Link>
      </section>
    </main>
  );
}
