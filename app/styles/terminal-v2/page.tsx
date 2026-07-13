import Link from "next/link";

// Style 05 — TERMINAL v2 "Release". The same aha moment as Terminal v1 (a live
// ops feed with nobody at the keyboard) restyled in the July-2026 AI-lab
// release-page language, using tokens lifted from anthropic.com / claude.com's
// production CSS: ivory #faf9f5 / #f0eee6, ink #141413, clay #d97757 accent,
// serif display + mono-as-accent, hairline borders, quiet motion, soft grain.

const LOG = [
  ["02:14:07", "sales", "cold outreach batch #4,182 sent → 312 opens, 41 replies"],
  ["02:14:31", "dev", "PR #1,204 merged: checkout retry logic (opus reviewed, codex wrote)"],
  ["02:15:02", "support", "ticket #9,331 resolved · CSAT 5/5 · refund not required"],
  ["02:15:44", "ads", "meta campaign rebalanced: CAC $18.20 → $14.75"],
  ["02:16:19", "finance", "stripe payout reconciled · MRR +$1,240 tonight"],
  ["02:17:03", "research", "3 competitor launches summarized → memo in your inbox"],
  ["02:17:41", "infra", "db migration applied · 0 downtime · rollback plan archived"],
  ["02:18:22", "sales", "meeting booked: enterprise lead (Thu 10:00, brief attached)"],
  ["02:19:05", "ceo", "nightly report drafted · revenue ↑ 2.1% · nothing needs you"],
];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")";

export default function TerminalV2() {
  const lines = [...LOG, ...LOG];
  return (
    <main className="relative min-h-screen bg-[#faf9f5] text-[#141413]">
      <style>{`
        @keyframes v2-crawl { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @keyframes v2-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes v2-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .v2-up { opacity: 0; animation: v2-up .8s cubic-bezier(.2,.7,.2,1) forwards; }
        .v2-serif { font-family: ui-serif, Georgia, Cambria, "Times New Roman", serif; }
      `}</style>

      {/* soft grain, the 2026 texture signature */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: GRAIN }} />

      <section className="relative mx-auto max-w-[74.5rem] px-6 pb-28 pt-20 sm:pt-28">
        {/* Eyebrow */}
        <p className="v2-up mb-8 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-[#87867f]">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#d97757] align-middle" />
          Business on Autopilot · the autonomous-business index
        </p>

        {/* Serif hero */}
        <h1
          className="v2-serif v2-up mx-auto max-w-3xl text-center text-5xl font-medium leading-[1.06] tracking-[-0.02em] sm:text-7xl"
          style={{ animationDelay: ".08s" }}
        >
          The company works.
          <br />
          <em className="text-[#d97757]">The founder sleeps.</em>
        </h1>

        <p
          className="v2-up mx-auto mt-6 max-w-xl text-center text-lg leading-relaxed text-[#5e5d59]"
          style={{ animationDelay: ".16s" }}
        >
          19 companies where agents run sales, code, support and ads while one human sets the direction. Watch
          the feed — nobody is typing.
        </p>

        {/* CTAs */}
        <div className="v2-up mt-9 flex justify-center gap-3" style={{ animationDelay: ".24s" }}>
          <Link
            href="/"
            className="rounded-full bg-[#141413] px-7 py-3 text-sm font-medium text-[#faf9f5] transition hover:bg-[#3d3d3a]"
          >
            Explore the index
          </Link>
          <Link
            href="/styles"
            className="rounded-full border border-[#dedcd1] bg-white/60 px-7 py-3 text-sm font-medium text-[#141413] transition hover:border-[#b0aea5]"
          >
            All styles
          </Link>
        </div>

        {/* The terminal, framed like a release-page demo */}
        <div className="v2-up mx-auto mt-16 max-w-3xl" style={{ animationDelay: ".34s" }}>
          <div className="overflow-hidden rounded-2xl border border-[#dedcd1] bg-white shadow-[0_32px_64px_-24px_rgba(20,20,19,0.18)]">
            <div className="flex items-center justify-between border-b border-[#e8e6dc] px-5 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#d1cfc5]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#d1cfc5]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#d97757]" />
              </div>
              <p className="font-mono text-[11px] text-[#87867f]">polsia-ops · nobody@keyboard</p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#d97757]">live</p>
            </div>
            <div className="relative h-[300px] overflow-hidden bg-[#141413] px-5 py-4">
              <div className="space-y-2.5 font-mono text-[12.5px] leading-relaxed" style={{ animation: "v2-crawl 26s linear infinite" }}>
                {lines.map(([t, agent, msg], i) => (
                  <p key={i} className="whitespace-nowrap">
                    <span className="text-[#73726c]">{t}</span>{" "}
                    <span className="text-[#d97757]">{agent}</span>
                    <span className="text-[#73726c]"> ─ </span>
                    <span className="text-[#e8e6dc]">{msg}</span>
                  </p>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#141413] to-transparent" />
              <p className="absolute bottom-3 left-5 font-mono text-[12.5px]">
                <span className="text-[#d97757]">❯</span>{" "}
                <span
                  className="inline-block h-3.5 w-2 bg-[#d97757] align-middle"
                  style={{ animation: "v2-blink 1.1s step-end infinite" }}
                />
              </p>
            </div>
          </div>
          <p className="mt-3 text-center font-mono text-[11px] text-[#9c9a92]">
            Recorded from a real night at an agent-run company. The human read it at breakfast.
          </p>
        </div>

        {/* Stat strip, serif numerals on hairlines */}
        <div
          className="v2-up mx-auto mt-16 grid max-w-3xl grid-cols-3 divide-x divide-[#e8e6dc] rounded-2xl border border-[#e8e6dc] bg-[#f0eee6]/60"
          style={{ animationDelay: ".42s" }}
        >
          {[
            ["$10M", "ARR with one human"],
            ["19", "companies tracked"],
            ["0", "meetings on the calendar"],
          ].map(([v, k]) => (
            <div key={k} className="px-6 py-6 text-center">
              <p className="v2-serif text-3xl font-medium tracking-tight sm:text-4xl">{v}</p>
              <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-[#87867f]">{k}</p>
            </div>
          ))}
        </div>

        {/* Quiet company roll */}
        <p
          className="v2-up mx-auto mt-14 max-w-3xl text-center font-mono text-[11px] uppercase leading-6 tracking-[0.18em] text-[#b0aea5]"
          style={{ animationDelay: ".5s" }}
        >
          Polsia · Midjourney · Base44 · Nanocorp · Boardy · Lindy · RentAHuman · Artisan · Basis · Delphi ·
          Payman · Cofounder · Wordware · Caffeine · Atoms
        </p>
      </section>
    </main>
  );
}
