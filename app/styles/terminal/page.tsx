import Link from "next/link";

// Style 1 — TERMINAL. The aha moment: a live ops feed scrolling forever with
// no human at the keyboard. CRT green, phosphor glow, blinking cursor.

const LOG = [
  ["02:14:07", "sales-agent", "cold outreach batch #4,182 sent → 312 opens, 41 replies"],
  ["02:14:31", "dev-agent", "PR #1,204 merged: checkout retry logic (opus reviewed, codex wrote)"],
  ["02:15:02", "support-agent", "ticket #9,331 resolved · CSAT 5/5 · refund not required"],
  ["02:15:44", "ads-agent", "meta campaign rebalanced: CAC $18.20 → $14.75"],
  ["02:16:19", "finance-agent", "stripe payout reconciled · MRR +$1,240 tonight"],
  ["02:17:03", "research-agent", "3 competitor launches summarized → memo in your inbox"],
  ["02:17:41", "infra-agent", "db migration applied · 0 downtime · rollback plan archived"],
  ["02:18:22", "sales-agent", "meeting booked: enterprise lead (Thu 10:00, brief attached)"],
  ["02:19:05", "ceo-agent", "nightly report drafted · revenue ↑ 2.1% · nothing needs you"],
];

export default function TerminalStyle() {
  const lines = [...LOG, ...LOG]; // duplicated for a seamless scroll loop
  return (
    <main className="min-h-screen bg-black text-[#c8facc]">
      <style>{`
        @keyframes crawl { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes scanline { from { background-position-y: 0; } to { background-position-y: 6px; } }
        .crt {
          background-image: repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 1px, transparent 1px 3px);
          animation: scanline 1s linear infinite;
        }
        .glow { text-shadow: 0 0 12px rgba(74, 222, 128, .45); }
      `}</style>

      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <p className="mb-4 inline-block border border-[#2f7a3a] px-3 py-1 font-mono text-xs uppercase tracking-[0.3em] text-[#7ee787]">
            ● system: autonomous
          </p>
          <h1 className="glow font-mono text-4xl font-bold leading-tight sm:text-6xl">
            Your company
            <br />
            is running.
            <br />
            <span className="text-[#7ee787]">You are not.</span>
          </h1>
          <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-[#8fbf96]">
            19 companies where agents do the work and humans set the direction. Watch the ops feed — nobody is
            typing.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 font-mono text-sm">
            <div>
              <p className="glow text-2xl font-bold text-[#7ee787]">$10M</p>
              <p className="text-[#5e8f66]">ARR, 1 human</p>
            </div>
            <div>
              <p className="glow text-2xl font-bold text-[#7ee787]">19</p>
              <p className="text-[#5e8f66]">companies tracked</p>
            </div>
            <div>
              <p className="glow text-2xl font-bold text-[#7ee787]">24/7</p>
              <p className="text-[#5e8f66]">uptime, zero standup</p>
            </div>
          </div>
          <div className="mt-10 flex gap-3 font-mono">
            <Link href="/" className="bg-[#7ee787] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#a5f3ac]">
              [ view the index ]
            </Link>
            <Link href="/styles" className="border border-[#2f7a3a] px-5 py-2.5 text-sm text-[#7ee787] hover:bg-[#0a1f0d]">
              [ back to styles ]
            </Link>
          </div>
        </div>

        {/* The live console */}
        <div className="crt overflow-hidden rounded-lg border border-[#1f5228] bg-[#020a04] shadow-[0_0_60px_rgba(46,160,67,0.15)]">
          <div className="flex items-center gap-2 border-b border-[#1f5228] px-4 py-2.5 font-mono text-xs text-[#5e8f66]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1f5228]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#1f5228]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#7ee787]" />
            <span className="ml-2">polsia-ops — nobody@keyboard — 80×24</span>
          </div>
          <div className="relative h-[380px] overflow-hidden px-4 py-3">
            <div className="space-y-2 font-mono text-[13px] leading-relaxed" style={{ animation: "crawl 24s linear infinite" }}>
              {lines.map(([t, agent, msg], i) => (
                <p key={i} className="whitespace-nowrap">
                  <span className="text-[#3f6b47]">{t}</span>{" "}
                  <span className="text-[#7ee787]">[{agent}]</span>{" "}
                  <span className="text-[#b7e8bd]">{msg}</span>
                </p>
              ))}
            </div>
            <p className="absolute bottom-3 left-4 font-mono text-[13px]">
              <span className="text-[#7ee787]">$</span>{" "}
              <span className="inline-block h-4 w-2.5 bg-[#7ee787] align-middle" style={{ animation: "blink 1.1s step-end infinite" }} />
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
