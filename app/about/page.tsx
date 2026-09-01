import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — The Autopilot Index",
  description:
    "The Autopilot Index tracks companies run by AI and the tech stack behind them, and publishes Autopilot Pulse — a weekly newsletter on the autonomous-business era.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6">
      <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">
        ← The Autopilot Index
      </Link>
      <h1 className="mt-8 text-3xl font-black tracking-tight text-zinc-50">About The Autopilot Index</h1>

      <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-300">
        <p>
          The Autopilot Index tracks a new class of company: businesses run primarily by AI. One human, a fleet
          of agents, and — increasingly — real revenue with near-zero headcount. The org chart is becoming a
          prompt, and we document who is building this way, how their companies are structured, and the tech
          stack underneath them.
        </p>
        <p>
          The index covers the full stack of the autonomous-business era: AI gateways and model routing,
          workflow orchestration, scraping and data collection, voice agents, funding and referral programs.
          Every company is scored on how much of its operation actually runs on autopilot, and every tool we
          list is one a real AI-run business uses in production.
        </p>
        <p>
          Alongside the index we publish <Link href="/pulse" className="text-lime-400 hover:underline">Autopilot
          Pulse</Link>, a weekly newsletter, and a series of practical &ldquo;Proof of Stack&rdquo; build guides —
          concrete walkthroughs of how to solve one real problem with real tools, from lead generation to the
          code-versus-orchestration question every builder now faces.
        </p>
        <p>
          The project is built in public. The site itself runs on the same kind of stack it writes about —
          agents draft and ship, a human steers. If you run a business on autopilot, or you&apos;re building
          toward one, we&apos;d like to hear about it.
        </p>
        <p>
          <Link href="/submit" className="text-lime-400 hover:underline">Submit a company →</Link>
          <span className="text-zinc-500"> · </span>
          <Link href="/contact" className="text-lime-400 hover:underline">Contact →</Link>
        </p>
      </div>
    </main>
  );
}
