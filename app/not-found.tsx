import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found — The Autopilot Index",
  robots: { index: false, follow: true },
};

// Renders with a real HTTP 404 status (Next serves app/not-found with 404).
// The body gives humans and agents a recoverable path: where to look next.
export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col px-4 py-24 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime-400">404 · not found</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-50">This page doesn&apos;t exist.</h1>
      <p className="mt-4 text-base leading-relaxed text-zinc-400">
        The URL you requested isn&apos;t part of The Autopilot Index. Here&apos;s where to look next:
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        <li>
          <Link href="/" className="text-lime-400 hover:underline">The index (home)</Link>
          <span className="text-zinc-500"> — companies run by AI and the stack behind them</span>
        </li>
        <li>
          <Link href="/pulse" className="text-lime-400 hover:underline">Autopilot Pulse</Link>
          <span className="text-zinc-500"> — the weekly editions</span>
        </li>
        <li>
          <Link href="/news" className="text-lime-400 hover:underline">News pulse</Link>
          <span className="text-zinc-500"> — daily signals</span>
        </li>
        <li>
          <Link href="/submit" className="text-lime-400 hover:underline">Submit a company</Link>
        </li>
        <li>
          <a href="/sitemap.xml" className="text-lime-400 hover:underline">/sitemap.xml</a>
          <span className="text-zinc-500"> · </span>
          <a href="/llms.txt" className="text-lime-400 hover:underline">/llms.txt</a>
          <span className="text-zinc-500"> — the full URL list and agent guidance</span>
        </li>
      </ul>
    </main>
  );
}
