import Link from "next/link";

// Style 3 — EDITORIAL. The aha moment: "1 HUMAN. $10,000,000." set like a
// magazine cover. Cream paper, brutalist black type, a ticker of the index.

const ticker = [
  "POLSIA — $10M ARR · 1 HUMAN",
  "MIDJOURNEY — $500M · ~60 PEOPLE",
  "BASE44 — $80M EXIT IN 6 MONTHS",
  "BOARDY — THE AI RAISED ITS OWN SEED",
  "NANOCORP — ONE PROMPT, ONE COMPANY",
  "RENTAHUMAN — AGENTS HIRING HUMANS",
  "GUINNDEX — 3,000 PUBS, ONE VOICE AGENT",
];

export default function EditorialStyle() {
  const strip = [...ticker, ...ticker];
  return (
    <main className="min-h-screen bg-[#f4efe6] text-[#111]">
      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes underline { from { width: 0; } to { width: 100%; } }
      `}</style>

      {/* Masthead */}
      <header className="border-b-4 border-[#111] px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.3em]">Vol. 1 — The Autonomous Economy</p>
          <p className="font-mono text-xs uppercase tracking-[0.3em]">Est. 2026</p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <h1 className="text-[13vw] font-black uppercase leading-[0.85] tracking-tighter sm:text-[9rem]">
          Business
          <br />
          on <span className="text-[#d93a1f]">auto</span>pilot
        </h1>

        <div className="mt-10 grid gap-10 border-t-2 border-[#111] pt-8 md:grid-cols-[2fr_3fr]">
          <div>
            <p className="text-lg font-medium leading-snug">
              The companies where software stopped being a tool and started being the staff. We track them, audit
              their numbers, and publish the playbooks.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/"
                className="border-2 border-[#111] bg-[#111] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#f4efe6] transition hover:bg-[#d93a1f] hover:border-[#d93a1f]"
              >
                Read the index
              </Link>
              <Link
                href="/styles"
                className="border-2 border-[#111] px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#111] hover:text-[#f4efe6]"
              >
                Styles
              </Link>
            </div>
          </div>

          {/* The cover stat */}
          <div className="border-4 border-[#111] bg-white p-8 shadow-[10px_10px_0_#111]">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#d93a1f]">The aha moment</p>
            <p className="mt-4 text-6xl font-black uppercase leading-none tracking-tight sm:text-7xl">
              1 human.
            </p>
            <p className="mt-2 text-6xl font-black uppercase leading-none tracking-tight text-[#d93a1f] sm:text-7xl">
              $10,000,000.
            </p>
            <p className="mt-6 border-t-2 border-[#111] pt-4 font-mono text-sm leading-relaxed">
              Polsia runs code, ads, support and its own fundraise with zero employees. The org chart is a prompt.
            </p>
          </div>
        </div>

        {/* Manifesto lines */}
        <ol className="mt-16 border-t-2 border-[#111]">
          {[
            "Headcount is a choice, not a law.",
            "The stack is the staff.",
            "Ship while you sleep.",
          ].map((line, i) => (
            <li
              key={line}
              className="group flex items-baseline gap-6 border-b-2 border-[#111] py-6 transition hover:bg-[#111] hover:text-[#f4efe6]"
            >
              <span className="font-mono text-sm">0{i + 1}</span>
              <span className="text-3xl font-black uppercase tracking-tight sm:text-5xl">{line}</span>
              <span className="ml-auto hidden font-mono text-sm uppercase group-hover:inline">→ read</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Ticker */}
      <div className="overflow-hidden border-y-4 border-[#111] bg-[#d93a1f] py-3">
        <div className="flex w-max whitespace-nowrap" style={{ animation: "ticker 30s linear infinite" }}>
          {strip.map((t, i) => (
            <span key={i} className="mx-6 font-mono text-sm font-bold uppercase tracking-wider text-[#f4efe6]">
              {t} <span className="ml-6">✦</span>
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
