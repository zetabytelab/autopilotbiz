import type { Metadata } from "next";
import Link from "next/link";
import { companies, caseStudies } from "@/lib/data";
import type { Candidate, PulseItem, SourceRun } from "@/lib/pulse";
import PulseFeed from "@/components/pulse/PulseFeed";
import pulse from "@/data/pulse.json";
import candidatesData from "@/data/candidates.json";

export const metadata: Metadata = {
  title: "News pulse — Business on Autopilot",
  description:
    "Live signals from the autopilot companies: funding, launches, interviews, social chatter — plus a radar of possible new entrants. Built for angels and VCs who want to know first.",
};

const MONTHS: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

// Case-study dates are human-readable ("March 2026") — normalize for sorting.
function toIso(date: string | null): string {
  if (!date) return "";
  const m = date.toLowerCase().match(/([a-z]+)\s+(\d{4})/);
  if (m && MONTHS[m[1]]) return `${m[2]}-${MONTHS[m[1]]}`;
  return date;
}

type FeedItem = {
  date: string;
  label: string;
  headline: string;
  kind: "company" | "experiment";
  links: { label: string; url: string }[];
};

export default function NewsPage() {
  const items = pulse.items as PulseItem[];
  const sourcesRun = pulse.sourcesRun as SourceRun[];
  const candidates = (candidatesData.candidates as Candidate[]).filter((c) => c.status === "new").slice(0, 12);

  const curated: FeedItem[] = [
    ...companies.flatMap((c) =>
      c.news.map((n) => ({
        date: n.date,
        label: c.name,
        headline: n.headline,
        kind: "company" as const,
        links: c.url ? [{ label: "Site", url: c.url }] : [],
      })),
    ),
    ...caseStudies.map((cs) => ({
      date: toIso(cs.date),
      label: cs.title,
      headline: cs.summary,
      kind: "experiment" as const,
      links: cs.links,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
      <header className="py-14">
        <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">
          ← Back to the tracker
        </Link>
        <p className="mb-2 mt-8 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">News pulse</p>
        <h1 className="text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
          Know first. Every signal from the autopilot economy.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Funding, launches, interviews, videos and social chatter for every tracked company — aggregated from
          Google News, Hacker News, Techmeme and YouTube, deduplicated, and heat-ranked. LinkedIn has no open
          feed; its chatter shows up here via the sources that do.
        </p>
        <a
          href="mailto:antonio.serrano@alteryx.com?subject=Subscribe%20me%20to%20the%20Autopilot%20News%20Pulse"
          className="mt-5 inline-block rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-lime-300"
        >
          Get the pulse in your inbox →
        </a>
      </header>

      {/* Live signals */}
      <section id="signals" className="scroll-mt-24">
        <h2 className="mb-4 flex items-baseline gap-3 text-xl font-bold text-zinc-100">
          Live signals
          <span className="font-mono text-xs font-normal text-zinc-500">heat-ranked · cools in real time</span>
        </h2>
        <PulseFeed
          items={items}
          companies={companies.map((c) => ({ slug: c.slug, name: c.name }))}
          generatedAt={pulse.generatedAt}
        />
        <p className="mt-2 text-center font-mono text-[11px] text-zinc-700">
          sources:{" "}
          {sourcesRun.map((s) => `${s.id} ${s.failed === 0 ? "✓" : `⚠ ${s.failed} failed`} ${s.items}`).join(" · ")}
        </p>
      </section>

      {/* Radar */}
      <section id="radar" className="mt-16 scroll-mt-24">
        <h2 className="mb-1 text-xl font-bold text-zinc-100">📡 Radar — possible new entrants</h2>
        <p className="mb-4 max-w-2xl text-sm text-zinc-400">
          Unvetted candidates surfaced by keyword discovery ("autonomous company", "AI employees", "one-person
          unicorn"…). Nothing here is verified yet — promotion requires passing{" "}
          <Link href="/#criteria" className="text-lime-400 underline hover:text-lime-300">
            the Autopilot Criteria
          </Link>
          .
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {candidates.map((c) => (
            <article key={c.id} className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-200">{c.name ?? "Unnamed signal"}</h3>
                <span className="shrink-0 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                  unvetted
                </span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {c.evidence.slice(0, 2).map((e) => (
                  <li key={e.url} className="text-xs leading-snug">
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 underline decoration-zinc-800 hover:text-lime-400"
                    >
                      {e.title}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-mono text-[10px] text-zinc-600">
                matched: {[...new Set(c.evidence.flatMap((e) => e.matchedKeywords))].join(" · ").slice(0, 80)}
              </p>
            </article>
          ))}
          {candidates.length === 0 && (
            <p className="text-sm text-zinc-500">Radar is quiet — no new candidates this run.</p>
          )}
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          Know a company that belongs here?{" "}
          <Link href="/submit" className="text-lime-400 underline hover:text-lime-300">
            Submit it — 3 steps, live preview
          </Link>
          .
        </p>
      </section>

      {/* Curated milestones */}
      <section id="milestones" className="mt-16 scroll-mt-24">
        <h2 className="mb-4 flex items-baseline gap-3 text-xl font-bold text-zinc-100">
          Curated milestones
          <span className="font-mono text-xs font-normal text-zinc-500">hand-verified · the canonical story</span>
        </h2>
        <ol className="relative space-y-6 border-l border-zinc-800 pl-6">
          {curated.map((n) => (
            <li key={`${n.label}-${n.headline.slice(0, 40)}`} className="relative">
              <span
                className={`absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full ${
                  n.kind === "experiment" ? "bg-lime-400" : "bg-zinc-600"
                }`}
              />
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-zinc-500">{n.date}</span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs ${
                      n.kind === "experiment"
                        ? "border-lime-400/40 bg-lime-400/10 text-lime-400"
                        : "border-zinc-800 text-lime-400"
                    }`}
                  >
                    {n.label}
                  </span>
                  {n.kind === "experiment" && (
                    <span className="text-[10px] uppercase tracking-wide text-zinc-500">field experiment</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">{n.headline}</p>
                {n.links.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-3">
                    {n.links.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-lime-400 underline hover:text-lime-300"
                      >
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
