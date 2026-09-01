import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { stackTools } from "@/lib/data";

export const metadata: Metadata = {
  title: "Lead generation on autopilot: Apify × n8n (scrape → orchestrate → CRM)",
  description:
    "A practical playbook for a self-running lead machine: Apify's Google Maps Scraper pulls the leads, n8n orchestrates it on a schedule with retries and enrichment, and the rows land in your sheet or CRM — no human in the loop. Part of The Autopilot Index Proof of Stack series.",
  alternates: { canonical: "/guides/apify-n8n-lead-machine" },
};

// Affiliate links come from the single source in lib/data.ts so they never drift.
const tool = (name: string) => stackTools.find((t) => t.name === name)!;
const apify = tool("Apify");
const n8n = tool("n8n");

const STEPS = [
  {
    n: "1",
    tool: "Apify",
    title: "Apify scrapes the leads",
    body:
      "Point Apify's Google Maps Scraper at a query like “dentists in Manchester” and it returns structured rows — name, address, phone, website, rating, category — as clean JSON. No proxies to babysit, no HTML to parse. You pay per result, and one Actor run replaces a browser-automation project you'd otherwise build and maintain.",
    detail:
      "Swap the Actor for the job: Google Maps Scraper for local businesses, an Apollo/company scraper for B2B, Website Content Crawler to enrich each domain. Same pattern, different input.",
  },
  {
    n: "2",
    tool: "n8n",
    title: "n8n runs it — on schedule, with a memory",
    body:
      "An n8n workflow triggers the Actor on a cron, waits for the run to finish, then dedupes against what you've already seen, enriches (validate the email, guess the domain, score the fit), and only keeps rows worth your time. When a run fails at 3am, n8n retries the branch and pings you — it doesn't silently stop.",
    detail:
      "This is the orchestration layer: scheduling, retries with backoff, credential storage, and an execution log you can open to see exactly what happened to any single lead.",
  },
  {
    n: "3",
    tool: null,
    title: "The rows land where you work",
    body:
      "n8n writes the survivors straight into Google Sheets, Airtable, or your CRM, tags the source and date, and drops you a one-line summary: “37 new leads, 4 flagged, 0 errors.” You wake up to a filled pipeline, not a task list.",
    detail:
      "Every step is deterministic. The only place an LLM belongs here is one optional node — scoring or drafting a first-line — never deciding whether the machine runs.",
  },
];

export default function ApifyN8nGuide() {
  const affTools = [apify, n8n];
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
      <header className="py-12">
        <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">
          ← The Autopilot Index
        </Link>
        <p className="mb-2 mt-8 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">
          Proof of Stack · Playbook
        </p>
        <h1 className="text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
          The autopilot lead machine.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
          Lead generation is the perfect first thing to put on autopilot: a boring, repetitive job with a clear
          input and a clear output. The trick is splitting it in two —{" "}
          <span className="text-zinc-100">Apify does the scraping</span>, and{" "}
          <span className="text-zinc-100">n8n runs the whole thing unattended</span>. Scrape → orchestrate → CRM,
          no human in the loop. Here&apos;s the build.
        </p>
      </header>

      {/* The problem */}
      <section className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">The problem</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          You need a steady list of qualified prospects. Doing it by hand is soul-crushing; writing a one-off
          scraper means owning proxies, browser automation, retries and a place to run it. The autopilot version
          keeps the two hard parts where they belong: the <em>scraping</em> on a marketplace of maintained Actors,
          and the <em>orchestration</em> on a runtime that already solves scheduling, credentials and “tell me when
          it breaks.”
        </p>
      </section>

      {/* The stack — affiliate cards */}
      <section className="mb-12">
        <h2 className="mb-1 text-xl font-bold text-zinc-100">The stack</h2>
        <p className="mb-4 text-sm text-zinc-400">Two tools. Each does one job well.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {affTools.map((t) => (
            <a
              key={t.name}
              href={t.referralUrl ?? t.url}
              target="_blank"
              rel={t.referralUrl ? "noopener noreferrer sponsored" : "noopener noreferrer"}
              className="group flex flex-col gap-2 rounded-2xl border border-lime-400/30 bg-lime-400/[0.04] p-5 transition hover:border-lime-400 hover:bg-lime-400/[0.08]"
            >
              <div className="flex items-center gap-2">
                <Logo url={t.url} name={t.name} size={20} />
                <span className="text-lg font-bold text-zinc-100 group-hover:text-zinc-50">{t.name}</span>
                {t.referral && (
                  <span className="ml-auto rounded-full bg-lime-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime-400">
                    pilot&nbsp;perk
                  </span>
                )}
              </div>
              <p className="text-sm leading-snug text-zinc-400">{t.role}</p>
              {t.referral && <p className="font-mono text-[11px] text-lime-400/80">{t.referral}</p>}
            </a>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-bold text-zinc-100">The build, in three moves</h2>
        <div className="space-y-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-2xl font-black text-lime-400">{s.n}</span>
                <h3 className="text-lg font-bold text-zinc-100">{s.title}</h3>
                {s.tool && (
                  <span className="ml-auto font-mono text-xs text-zinc-500">{s.tool}</span>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{s.body}</p>
              <p className="mt-2 border-l-2 border-zinc-800 pl-3 text-sm leading-relaxed text-zinc-500">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The flow, at a glance */}
      <section className="mb-12 overflow-x-auto rounded-2xl border border-zinc-800 bg-black/40 p-6">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">The flow</h2>
        <pre className="font-mono text-xs leading-relaxed text-zinc-300">{`  cron (every morning)
        │
        ▼
  ┌───────────────┐     run + wait      ┌──────────────────┐
  │  n8n trigger  │ ──────────────────▶ │  Apify Actor     │
  └───────────────┘                     │  Google Maps     │
        ▲                               │  Scraper → JSON  │
        │                               └──────────────────┘
        │  retry on fail                        │
        │                                       ▼
  ┌───────────────┐   dedupe · enrich · score  ┌──────────────┐
  │  alert / log  │ ◀───────────────────────── │  n8n logic   │
  └───────────────┘                            └──────────────┘
                                                       │ keep the good ones
                                                       ▼
                                            ┌────────────────────┐
                                            │  Sheet / Airtable  │
                                            │  / CRM             │
                                            └────────────────────┘`}</pre>
      </section>

      {/* Where orchestration lives */}
      <section className="mb-12 rounded-2xl border border-lime-400/25 bg-lime-400/[0.05] p-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-lime-400">Where the orchestration lives</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          You could write this whole thing as one Python script — and for a developer, sometimes that&apos;s the
          right call. But the script is never the work: the scheduling, the retries with backoff, the credential
          storage and the “ping me when it silently stops” end up longer than the logic. That scaffolding{" "}
          <span className="text-zinc-100">is</span> orchestration. Here we let a runtime own it, and keep the
          scraping on a marketplace — so the only thing you maintain is the part that&apos;s actually yours: which
          leads count.
        </p>
      </section>

      {/* Disclosure */}
      <p className="mb-10 max-w-2xl text-xs leading-relaxed text-zinc-500">
        <span className="rounded-full bg-lime-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime-400">
          pilot&nbsp;perk
        </span>{" "}
        The Apify and n8n links above are referral links: they get you the current sign-up perk and they support
        the index at no cost to you. We monetize the stack, never the subjects of coverage — referral links never
        buy placement or a kinder write-up.
      </p>

      {/* CTA */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 text-center">
        <p className="text-sm text-zinc-300">
          The Autopilot Index tracks companies run by AI — and the stack behind them. Get the playbooks and the
          weekly teardown by email.
        </p>
        <Link
          href="/pulse"
          className="mt-4 inline-block rounded-full bg-lime-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-lime-300"
        >
          Read Autopilot Pulse →
        </Link>
      </section>
    </main>
  );
}
