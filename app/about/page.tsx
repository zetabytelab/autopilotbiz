import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — The Autopilot Index",
  description:
    "The Autopilot Index is a public research and intelligence project tracking AI-operated businesses, their evidence and the systems behind them.",
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
          The Autopilot Index is a public research and intelligence project tracking AI-operated businesses,
          lean AI companies and the systems behind them. We record what companies claim, what independent
          sources support, where humans remain involved and what still needs to be tested.
        </p>
        <p>
          The index covers the full stack of the autonomous-business era: AI gateways and model routing,
          workflow orchestration, scraping and data collection, voice agents, funding and referral programs.
          Autonomy levels are editorial assessments, not audits. Financial evidence and operational autonomy
          are kept separate, and unknown or disputed values remain visible. The result is a reusable public
          index rather than a claim that every company has been independently verified.
        </p>
        <p>
          Alongside the index we publish <Link href="/pulse" className="text-lime-400 hover:underline">Autopilot
          Pulse</Link>, a weekly newsletter, and a series of practical &ldquo;Proof of Stack&rdquo; build guides —
          concrete walkthroughs of how to solve one real problem with real tools, from lead generation to the
          code-versus-orchestration question every builder now faces.
        </p>
        <p>
          The project is built in public. Agents help collect, structure and draft research while a human
          reviews the evidence and releases it. Our goal is to help readers compare claims, understand
          where human work remains and make informed decisions about AI tools and businesses.
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
