import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { editions } from "@/lib/editions";
import SubscribeForm from "@/components/SubscribeForm";

export const metadata: Metadata = {
  title: "Autopilot Pulse — the newsletter",
  description:
    "Weekly signals from the businesses that run themselves — companies, field experiments, and the tech stacks they fly on. Every claim sourced: verified, self-reported, or disputed.",
  alternates: { canonical: "/pulse" },
};

export default function PulseArchive() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
      <header className="py-14">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">Autopilot Pulse</p>
        <h1 className="text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
          The newsletter, on its home turf.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
          Weekly signals from the businesses that run themselves — companies, field experiments, and the
          stacks they fly on. Published here first; adapted for{" "}
          <a
            href="https://www.linkedin.com/newsletters/autopilot-pulse-7494069864693850112/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lime-400 underline hover:text-lime-300"
          >
            LinkedIn
          </a>
          . Every claim labeled: verified, self-reported, or disputed.
        </p>
        <SubscribeForm />
      </header>

      <ol className="space-y-6">
        {editions.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/pulse/${e.slug}`}
              className="group block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 transition hover:border-lime-400/40"
            >
              <Image
                src={e.cover}
                alt={`Edition #${e.number} cover`}
                width={1080}
                height={1350}
                className="max-h-72 w-full object-cover object-top"
              />
              <div className="p-5">
                <p className="font-mono text-xs text-zinc-500">
                  #{String(e.number).padStart(2, "0")} · {e.date}
                </p>
                <h2 className="mt-1 text-xl font-bold text-zinc-100 group-hover:text-lime-400">{e.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{e.tldr[0]}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-center font-mono text-xs text-zinc-600">
        rss: <Link href="/pulse/feed.xml" className="text-lime-400 hover:underline">/pulse/feed.xml</Link> ·
        the agents have the night shift 🛩
      </p>
    </main>
  );
}
