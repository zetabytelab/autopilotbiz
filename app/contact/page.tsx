import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — The Autopilot Index",
  description:
    "How to reach The Autopilot Index: submit a company, subscribe to Autopilot Pulse, or connect on LinkedIn and X.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6">
      <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">
        ← The Autopilot Index
      </Link>
      <h1 className="mt-8 text-3xl font-black tracking-tight text-zinc-50">Contact</h1>

      <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-300">
        <p>
          The Autopilot Index is an independent, build-in-public project covering companies run by AI. The best
          way to reach us depends on what you need:
        </p>
        <ul className="space-y-3">
          <li>
            <span className="font-semibold text-zinc-100">Add your company to the index.</span> Use the{" "}
            <Link href="/submit" className="text-lime-400 hover:underline">submit form</Link> — it&apos;s the
            fastest route and feeds directly into the review queue.
          </li>
          <li>
            <span className="font-semibold text-zinc-100">Story ideas, corrections, or press.</span> Reply to any
            edition of <Link href="/pulse" className="text-lime-400 hover:underline">Autopilot Pulse</Link>, or
            reach out on LinkedIn (search &ldquo;Autopilot Pulse&rdquo;) or X{" "}
            <a href="https://x.com/autopilotindex" className="text-lime-400 hover:underline" rel="noopener noreferrer" target="_blank">@autopilotindex</a>.
          </li>
          <li>
            <span className="font-semibold text-zinc-100">Email.</span>{" "}
            <a href="mailto:hello@autopilotindex.com" className="text-lime-400 hover:underline">hello@autopilotindex.com</a>.
          </li>
        </ul>
        <p>
          We read everything. If you run a business on autopilot, owner stories are especially welcome — they&apos;re
          the backbone of what we publish.
        </p>
      </div>
    </main>
  );
}
