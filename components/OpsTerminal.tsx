// The hero's "computer running on autopilot": a live ops feed with nobody at
// the keyboard. Phosphor CRT styling — green glow, scanlines, blinking cursor.

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

export default function OpsTerminal() {
  const lines = [...LOG, ...LOG]; // duplicated for a seamless scroll loop
  return (
    <div className="w-full max-w-xl">
      <style>{`
        @keyframes ops-crawl { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @keyframes ops-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes ops-scanline { from { background-position-y: 0; } to { background-position-y: 6px; } }
        .ops-crt {
          background-image: repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 1px, transparent 1px 3px);
          animation: ops-scanline 1s linear infinite;
        }
      `}</style>
      <div className="ops-crt overflow-hidden rounded-2xl border border-[#1f5228] bg-[#020a04] shadow-[0_0_60px_rgba(46,160,67,0.18)]">
        <div className="flex items-center justify-between border-b border-[#1f5228] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1f5228]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#1f5228]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#7ee787]" />
          </div>
          <p className="font-mono text-[11px] text-[#5e8f66]">polsia-ops · nobody@keyboard</p>
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#7ee787] [text-shadow:0_0_10px_rgba(126,231,135,.6)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7ee787]" />
            live
          </p>
        </div>
        <div className="relative h-[280px] overflow-hidden px-4 py-3 text-left">
          <div className="space-y-2.5 font-mono text-[12px] leading-relaxed" style={{ animation: "ops-crawl 26s linear infinite" }}>
            {lines.map(([t, agent, msg], i) => (
              <p key={i} className="whitespace-nowrap">
                <span className="text-[#3f6b47]">{t}</span>{" "}
                <span className="text-[#7ee787] [text-shadow:0_0_8px_rgba(126,231,135,.45)]">{agent}</span>
                <span className="text-[#3f6b47]"> ─ </span>
                <span className="text-[#b7e8bd]">{msg}</span>
              </p>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#020a04] to-transparent" />
          <p className="absolute bottom-3 left-4 font-mono text-[12px]">
            <span className="text-[#7ee787]">❯</span>{" "}
            <span
              className="inline-block h-3.5 w-2 bg-[#7ee787] align-middle [box-shadow:0_0_10px_rgba(126,231,135,.7)]"
              style={{ animation: "ops-blink 1.1s step-end infinite" }}
            />
          </p>
        </div>
      </div>
      <p className="mt-3 text-center font-mono text-[11px] text-zinc-600">
        A night at an agent-run company. The human reads it at breakfast.
      </p>
    </div>
  );
}
