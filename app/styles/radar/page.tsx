import Link from "next/link";

// Style 2 — RADAR. The aha moment: "AUTOPILOT ENGAGED" flight deck — a live
// radar sweep with the tracked companies as blips. Humans set the heading.

const blips = [
  { name: "Polsia", top: "22%", left: "58%", delay: "0s" },
  { name: "Boardy", top: "38%", left: "24%", delay: ".6s" },
  { name: "Base44", top: "62%", left: "70%", delay: "1.2s" },
  { name: "Nanocorp", top: "70%", left: "38%", delay: "1.8s" },
  { name: "Lindy", top: "30%", left: "78%", delay: "2.4s" },
  { name: "RentAHuman", top: "55%", left: "14%", delay: "3s" },
];

export default function RadarStyle() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-200">
      <style>{`
        @keyframes sweep { to { transform: rotate(360deg); } }
        @keyframes ping2 { 0% { transform: scale(.6); opacity: .9; } 80%, 100% { transform: scale(2.4); opacity: 0; } }
        @keyframes flicker { 0%, 100% { opacity: 1; } 92% { opacity: 1; } 93% { opacity: .4; } 94% { opacity: 1; } }
        .grid-bg {
          background-image:
            linear-gradient(rgba(56,189,248,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,.07) 1px, transparent 1px);
          background-size: 48px 48px;
        }
      `}</style>

      <section className="grid-bg mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <p
            className="mb-5 inline-flex items-center gap-2 rounded border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.3em] text-cyan-300"
            style={{ animation: "flicker 5s linear infinite" }}
          >
            <span className="h-2 w-2 rounded-full bg-cyan-300" /> autopilot engaged
          </p>
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-50 sm:text-7xl">
            Set the
            <br />
            heading.
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-sky-500 bg-clip-text text-transparent">
              Release the yoke.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-slate-400">
            A control tower for the companies flying themselves: who's airborne, what they run on, and how far
            one human can go.
          </p>

          {/* Flight-deck telemetry */}
          <div className="mt-8 grid max-w-md grid-cols-3 divide-x divide-cyan-400/20 rounded-lg border border-cyan-400/20 bg-slate-950/60 font-mono">
            {[
              ["ALT", "$10M ARR"],
              ["CREW", "1 human"],
              ["FLEET", "19 tracked"],
            ].map(([k, v]) => (
              <div key={k} className="px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-cyan-500">{k}</p>
                <p className="mt-1 text-sm font-bold text-cyan-200">{v}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex gap-3">
            <Link
              href="/"
              className="rounded bg-cyan-400 px-6 py-3 text-sm font-bold uppercase tracking-wider text-slate-950 hover:bg-cyan-300"
            >
              Open the tower
            </Link>
            <Link
              href="/styles"
              className="rounded border border-slate-700 px-6 py-3 text-sm uppercase tracking-wider text-slate-300 hover:border-cyan-400/50"
            >
              Back to styles
            </Link>
          </div>
        </div>

        {/* The radar */}
        <div className="relative mx-auto aspect-square w-full max-w-[480px]">
          <div className="absolute inset-0 rounded-full border border-cyan-400/30" />
          <div className="absolute inset-[16%] rounded-full border border-cyan-400/20" />
          <div className="absolute inset-[32%] rounded-full border border-cyan-400/15" />
          <div className="absolute inset-[48%] rounded-full border border-cyan-400/10" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-400/10" />
          <div className="absolute left-0 top-1/2 h-px w-full bg-cyan-400/10" />
          {/* sweep */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, rgba(34,211,238,.5), rgba(34,211,238,.08) 60deg, transparent 90deg)",
              animation: "sweep 5s linear infinite",
            }}
          />
          {/* blips */}
          {blips.map((b) => (
            <div key={b.name} className="absolute" style={{ top: b.top, left: b.left }}>
              <span
                className="absolute -inset-1.5 rounded-full bg-cyan-300/60"
                style={{ animation: `ping2 2.4s ease-out ${b.delay} infinite` }}
              />
              <span className="relative block h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(103,232,249,.9)]" />
              <span className="absolute left-3 top-[-3px] font-mono text-[10px] uppercase tracking-wider text-cyan-300/90">
                {b.name}
              </span>
            </div>
          ))}
          <p className="absolute bottom-[-2.5rem] w-full text-center font-mono text-xs uppercase tracking-[0.35em] text-cyan-600">
            contacts: 19 · all autonomous
          </p>
        </div>
      </section>
    </main>
  );
}
