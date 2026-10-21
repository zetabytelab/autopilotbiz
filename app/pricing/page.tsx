import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — The Autopilot Index (free)",
  description:
    "The Autopilot Index is free. No paid tiers, no paywall. Funded by labelled Autopilot Pulse sponsors, affiliate links to tools, and optional reader support.",
  alternates: { canonical: "/pricing" },
};

export default function Pricing() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6">
      <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">
        ← The Autopilot Index
      </Link>
      <h1 className="mt-8 text-3xl font-black tracking-tight text-zinc-50">Pricing</h1>
      <p className="mt-4 text-xl font-semibold text-lime-400">The Autopilot Index is free.</p>

      <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-300">
        <p>
          There are no paid tiers, no subscription and no paywall. Everything is public and free to read, for
          humans and agents alike: the index of AI-run companies, the tech-stack maps, the guides, and every edition
          of Autopilot Pulse.
        </p>
        <h2 className="pt-2 text-lg font-bold text-zinc-100">How it&apos;s funded</h2>
        <ul className="space-y-2">
          <li>
            <span className="font-semibold text-zinc-100">Sponsors.</span> Each edition of{" "}
            <Link href="/pulse" className="text-lime-400 hover:underline">Autopilot Pulse</Link> can carry one sponsor, with a
            bonus mention on the homepage during that week. Sponsored placements are always labelled &ldquo;Sponsored&rdquo;, and
            their links use <code className="rounded bg-zinc-800 px-1 text-xs text-lime-400">rel=&quot;sponsored&quot;</code>.
            Sponsors never affect a company&apos;s level, evidence grade, ranking or coverage. If a sponsor is also a company in
            the index, we say so on its profile.{" "}
            <Link href="/sponsor" className="text-lime-400 hover:underline">Sponsor an edition</Link>.
          </li>
          <li>
            <span className="font-semibold text-zinc-100">Affiliate links.</span> Some links to tools are
            referral links, marked <code className="rounded bg-zinc-800 px-1 text-xs text-lime-400">rel=&quot;sponsored&quot;</code>.
            If you sign up through one, the index may earn a commission at no extra cost to you. When the tool is also a
            company in the index, that&apos;s disclosed, and it has no effect on its rating.
          </li>
          <li>
            <span className="font-semibold text-zinc-100">Optional reader support.</span> A{" "}
            <a href="https://buymeacoffee.com/serranox" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">
              Buy me a coffee
            </a>{" "}
            link. It&apos;s entirely optional and never gates any content.
          </li>
        </ul>
        <p>Reading stays free. If the way the site is funded changes, this page will say so first.</p>
        <p className="text-sm text-zinc-500">
          Questions about how the index works? See <Link href="/about" className="text-lime-400 hover:underline">About</Link> or{" "}
          <Link href="/contact" className="text-lime-400 hover:underline">Contact</Link>.
        </p>
      </div>
    </main>
  );
}
