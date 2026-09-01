import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — The Autopilot Index (free)",
  description:
    "The Autopilot Index is free. No paid tiers, no paywall. Funded by a free newsletter, affiliate links to tools, and optional reader support.",
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
          There are no paid tiers, no subscription, and no paywall. Everything — the index of AI-run companies,
          the tech-stack maps, the guides, and every edition of Autopilot Pulse — is public and free to read,
          for humans and agents alike.
        </p>
        <h2 className="pt-2 text-lg font-bold text-zinc-100">How it&apos;s funded</h2>
        <ul className="space-y-2">
          <li>
            <span className="font-semibold text-zinc-100">Newsletter (free).</span>{" "}
            <Link href="/pulse" className="text-lime-400 hover:underline">Autopilot Pulse</Link> is a free weekly
            email. No paid edition.
          </li>
          <li>
            <span className="font-semibold text-zinc-100">Affiliate links.</span> Some links to tools are
            referral links, marked <code className="rounded bg-zinc-800 px-1 text-xs text-lime-400">rel=&quot;sponsored&quot;</code>.
            If you sign up through one, the index may earn a commission at no extra cost to you. We monetize the
            stack, never the subjects of coverage.
          </li>
          <li>
            <span className="font-semibold text-zinc-100">Optional reader support.</span> A{" "}
            <a href="https://buymeacoffee.com/serranox" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">
              Buy me a coffee
            </a>{" "}
            link — entirely optional, never gates any content.
          </li>
        </ul>
        <p>
          That&apos;s the whole model: free to read, funded by tools and optional support. If that ever changes,
          this page will say so first.
        </p>
        <p className="text-sm text-zinc-500">
          Questions about how the index works? See <Link href="/about" className="text-lime-400 hover:underline">About</Link> or{" "}
          <Link href="/contact" className="text-lime-400 hover:underline">Contact</Link>.
        </p>
      </div>
    </main>
  );
}
