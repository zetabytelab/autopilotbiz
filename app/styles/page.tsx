import Link from "next/link";

const styles = [
  {
    href: "/styles/terminal-v2",
    name: "05 · Terminal v2 — Release",
    vibe: "AI-lab launch page (July 2026)",
    desc: "The terminal aha, reskinned with the real design tokens of the Fable 5 / Codex 5.6 era: ivory paper, ink serif, clay accent, hairline borders, soft grain, quiet motion.",
  },
  {
    href: "/styles/terminal",
    name: "01 · Terminal",
    vibe: "Live-ops console",
    desc: "The company runs itself in front of you — a streaming agent log, CRT green, blinking cursor. The aha: you're watching the business operate with nobody at the keyboard.",
  },
  {
    href: "/styles/radar",
    name: "02 · Radar",
    vibe: "Autopilot cockpit",
    desc: "Aviation HUD: a sweeping radar with the companies as blips, flight-deck telemetry for ARR. The aha: 'autopilot engaged' — humans just set the heading.",
  },
  {
    href: "/styles/editorial",
    name: "03 · Editorial",
    vibe: "Brutalist print",
    desc: "Cream paper, massive black type, a ticker marquee of the index. The aha: '1 HUMAN. $10,000,000.' set like a magazine cover you can't ignore.",
  },
  {
    href: "/styles/aurora",
    name: "04 · Aurora",
    vibe: "Glass & orbit",
    desc: "Drifting aurora gradients behind glass cards, and a solar system of agents orbiting one founder. The aha: you are the sun; the departments revolve around you.",
  },
];

export default function StylesIndex() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">Style lab</p>
      <h1 className="text-3xl font-black text-zinc-50 sm:text-5xl">Four ways to feel the autopilot</h1>
      <p className="mt-3 max-w-2xl text-zinc-400">
        Same story — a business that runs itself — told in four visual languages. Open each one full screen.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {styles.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 transition hover:border-lime-400/50 hover:bg-zinc-900/60"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 group-hover:text-lime-400">
              {s.vibe}
            </p>
            <h2 className="mt-1 text-xl font-bold text-zinc-100">{s.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.desc}</p>
            <p className="mt-4 text-sm font-semibold text-lime-400">Open →</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
