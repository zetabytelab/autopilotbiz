import Link from "next/link";

// Style 4 — AURORA. The aha moment: a solar system — one founder in the
// center, departments as agents orbiting them. Drifting aurora blobs + glass.

const orbits = [
  { r: 120, dur: "14s", agents: ["Sales", "Code"] },
  { r: 185, dur: "22s", agents: ["Support", "Ads", "Finance"] },
  { r: 250, dur: "34s", agents: ["Research", "Ops"] },
];

export default function AuroraStyle() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07060f] text-zinc-100">
      <style>{`
        @keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(90px,60px) scale(1.15); } }
        @keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1.1); } 50% { transform: translate(-80px,40px) scale(.95); } }
        @keyframes drift3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-70px) scale(1.2); } }
        @keyframes orbit { to { transform: rotate(360deg); } }
        @keyframes counter { to { transform: rotate(-360deg); } }
        @keyframes breathe { 0%,100% { box-shadow: 0 0 40px 6px rgba(167,139,250,.35); } 50% { box-shadow: 0 0 70px 14px rgba(167,139,250,.55); } }
        .glass { background: rgba(255,255,255,.05); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.12); }
      `}</style>

      {/* Aurora background */}
      <div aria-hidden className="absolute inset-0">
        <div
          className="absolute -top-32 left-[10%] h-[480px] w-[480px] rounded-full opacity-50 blur-[110px]"
          style={{ background: "#7c3aed", animation: "drift1 18s ease-in-out infinite" }}
        />
        <div
          className="absolute right-[5%] top-[20%] h-[420px] w-[420px] rounded-full opacity-40 blur-[110px]"
          style={{ background: "#0ea5e9", animation: "drift2 22s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[-10%] left-[35%] h-[460px] w-[460px] rounded-full opacity-35 blur-[120px]"
          style={{ background: "#10b981", animation: "drift3 26s ease-in-out infinite" }}
        />
      </div>

      <section className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-2">
        <div>
          <p className="glass mb-6 inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-violet-200">
            ✨ the calm company
          </p>
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            You are the sun.
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
              Everything else orbits.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-zinc-400">
            Sales, code, support, finance — autonomous agents circling one founder's intent. This is what a
            company looks like now.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-gradient-to-r from-violet-500 to-sky-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110"
            >
              Explore the universe →
            </Link>
            <Link href="/styles" className="glass rounded-full px-7 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/10">
              Back to styles
            </Link>
          </div>
          <div className="mt-10 flex gap-4">
            {[
              ["$10M", "ARR per founder"],
              ["19", "companies"],
              ["0", "meetings held"],
            ].map(([v, k]) => (
              <div key={k} className="glass rounded-2xl px-5 py-4">
                <p className="text-2xl font-bold text-white">{v}</p>
                <p className="mt-0.5 text-xs text-zinc-400">{k}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Orbit system */}
        <div className="relative mx-auto hidden aspect-square w-full max-w-[540px] sm:block">
          {/* center: the human */}
          <div
            className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-sky-500 text-center"
            style={{ animation: "breathe 4s ease-in-out infinite" }}
          >
            <div>
              <p className="text-2xl">🧑‍🚀</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/90">1 human</p>
            </div>
          </div>
          {orbits.map((o) => (
            <div key={o.r}>
              {/* ring */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
                style={{ width: o.r * 2, height: o.r * 2 }}
              />
              {/* rotating carrier */}
              <div
                className="absolute left-1/2 top-1/2"
                style={{ animation: `orbit ${o.dur} linear infinite` }}
              >
                {o.agents.map((a, i) => {
                  const angle = (360 / o.agents.length) * i;
                  return (
                    <div
                      key={a}
                      className="absolute"
                      style={{ transform: `rotate(${angle}deg) translateX(${o.r}px)` }}
                    >
                      {/* undo the placement angle so labels stay level, then counter-spin the orbit */}
                      <div style={{ transform: `rotate(${-angle}deg)` }}>
                        <div
                          className="glass -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-100"
                          style={{ animation: `counter ${o.dur} linear infinite` }}
                        >
                          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" />
                          {a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
