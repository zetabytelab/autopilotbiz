"use client";

import { useEffect, useMemo, useState } from "react";
import { decayedScore, freshness, timeAgo, type PulseItem } from "@/lib/pulse";

const KINDS: { key: PulseItem["kind"] | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "funding", label: "💰 Funding" },
  { key: "product", label: "🚀 Product" },
  { key: "interview", label: "🎙 Interviews" },
  { key: "video", label: "▶ Video" },
  { key: "social", label: "💬 Social" },
  { key: "blog", label: "✍ Blogs" },
  { key: "other", label: "📰 Press" },
];

const TRACKS: { key: "all" | "company" | "stack"; label: string }[] = [
  { key: "all", label: "🛰 All signals" },
  { key: "company", label: "🤖 Index companies" },
  { key: "stack", label: "🧰 Stack providers" },
];

// Items written before the stack track existed carry no `track` — they were
// all company signals.
const trackOf = (i: PulseItem) => i.track ?? (i.companySlug?.startsWith("stack-") ? "stack" : "company");

// Publisher host for a source URL (drops www.; google-news redirects aren't
// useful publishers). Returns null when it can't be shown.
function hostLabel(url: string): string | null {
  try {
    const h = new URL(url).hostname.replace(/^www\./, "");
    if (h === "news.google.com") return null;
    return h;
  } catch {
    return null;
  }
}

// The distinct publisher sources to offer beyond the headline link, deduped by
// host and excluding the one the title already points at. Capped for tidiness.
function extraSources(i: PulseItem): { host: string; url: string }[] {
  const primary = (i.domain || "").replace(/^www\./, "");
  const seen = new Set<string>([primary]);
  const out: { host: string; url: string }[] = [];
  for (const s of i.sources) {
    const host = hostLabel(s.url);
    if (!host || seen.has(host)) continue;
    seen.add(host);
    out.push({ host, url: s.url });
    if (out.length >= 6) break;
  }
  return out;
}

type Props = {
  items: PulseItem[];
  companies: { slug: string; name: string }[];
  generatedAt: string;
};

export default function PulseFeed({ items, companies, generatedAt }: Props) {
  const [kind, setKind] = useState<string>("all");
  const [track, setTrack] = useState<"all" | "company" | "stack">("all");
  const [companySlug, setCompanySlug] = useState<string>("all");
  const [hotOnly, setHotOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"heat" | "newest">("heat");
  const [query, setQuery] = useState("");
  const [votes, setVotes] = useState<Record<string, 1>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setVotes(JSON.parse(localStorage.getItem("pulse-votes") ?? "{}"));
    } catch {}
  }, []);

  function toggleVote(id: string) {
    setVotes((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      localStorage.setItem("pulse-votes", JSON.stringify(next));
      return next;
    });
  }

  const companyName = useMemo(() => new Map(companies.map((c) => [c.slug, c.name])), [companies]);
  const activeSlugs = useMemo(() => {
    const withNews = new Set(
      items
        .filter((i) => track === "all" || trackOf(i) === track)
        .map((i) => i.companySlug)
        .filter(Boolean) as string[],
    );
    return companies.filter((c) => withNews.has(c.slug));
  }, [items, companies, track]);

  const filtered = useMemo(() => {
    const now = Date.now();
    let out = items.filter((i) => {
      if (track !== "all" && trackOf(i) !== track) return false;
      if (kind !== "all" && i.kind !== kind) return false;
      if (companySlug !== "all" && i.companySlug !== companySlug) return false;
      if (hotOnly && !i.hot) return false;
      if (query && !i.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sortBy === "newest") return b.publishedAt.localeCompare(a.publishedAt);
      const va = decayedScore(a.baseScore, a.publishedAt, now) + (votes[a.id] ? 0.5 : 0);
      const vb = decayedScore(b.baseScore, b.publishedAt, now) + (votes[b.id] ? 0.5 : 0);
      return vb - va;
    });
    return out;
  }, [items, track, kind, companySlug, hotOnly, query, sortBy, votes]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs transition ${
      active
        ? "border-lime-400 bg-lime-400/15 text-lime-300"
        : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-600"
    }`;

  return (
    <div>
      {/* Filter bar */}
      <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {TRACKS.map((t) => (
            <button
              key={t.key}
              className={chip(track === t.key)}
              onClick={() => {
                setTrack(t.key);
                setCompanySlug("all");
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {KINDS.map((k) => (
            <button key={k.key} className={chip(kind === k.key)} onClick={() => setKind(k.key)}>
              {k.label}
            </button>
          ))}
          <button className={chip(hotOnly)} onClick={() => setHotOnly(!hotOnly)}>
            🔥 Hot only
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button className={chip(companySlug === "all")} onClick={() => setCompanySlug("all")}>
            {track === "stack" ? "All providers" : track === "company" ? "All companies" : "Everyone"}
          </button>
          {activeSlugs.map((c) => (
            <button key={c.slug} className={chip(companySlug === c.slug)} onClick={() => setCompanySlug(c.slug)}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search signals…"
            className="w-full max-w-xs rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-lime-400/50 focus:outline-none"
          />
          <div className="ml-auto flex gap-1.5">
            <button className={chip(sortBy === "heat")} onClick={() => setSortBy("heat")}>
              Sort: heat
            </button>
            <button className={chip(sortBy === "newest")} onClick={() => setSortBy("newest")}>
              newest
            </button>
          </div>
        </div>
      </div>

      {/* Items */}
      <ul className="mt-4 space-y-2">
        {filtered.map((i) => {
          const fresh = mounted ? freshness(i.publishedAt) : "older";
          return (
            <li
              key={i.id}
              className="group flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 transition hover:border-zinc-700"
            >
              <button
                onClick={() => toggleVote(i.id)}
                title="Upvote (stored in your browser)"
                className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-xs transition ${
                  votes[i.id] ? "bg-lime-400/20 text-lime-300" : "text-zinc-600 hover:text-lime-400"
                }`}
              >
                ▲
              </button>
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  fresh === "fresh" ? "bg-green-400" : fresh === "today" ? "bg-lime-400/70" : "bg-zinc-700"
                }`}
                title={fresh === "fresh" ? "under 6h old" : fresh === "today" ? "under 24h old" : ""}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">
                  {i.hot && <span title="hot signal">🔥 </span>}
                  <a
                    href={i.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-zinc-200 hover:text-lime-400"
                  >
                    {i.title}
                  </a>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500">
                  {mounted && <span className="font-mono">{timeAgo(i.publishedAt)}</span>}
                  {i.domain && <span className="font-mono text-zinc-600">{i.domain}</span>}
                  {i.companySlug && (
                    <span
                      className={`rounded-full border px-2 py-0.5 ${
                        trackOf(i) === "stack" ? "border-sky-400/30 text-sky-300" : "border-zinc-800 text-lime-400"
                      }`}
                    >
                      {trackOf(i) === "stack" && "🧰 "}
                      {companyName.get(i.companySlug) ?? i.companySlug.replace(/^stack-/, "")}
                    </span>
                  )}
                  <span className="rounded-full bg-zinc-900 px-2 py-0.5 uppercase tracking-wide text-zinc-500">
                    {i.kind}
                  </span>
                </p>
                {(() => {
                  const extra = extraSources(i);
                  if (extra.length === 0) return null;
                  return (
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-600">
                      <span className="text-zinc-700">also via</span>
                      {extra.map((s, idx) => (
                        <span key={s.url} className="inline-flex items-center gap-2">
                          {idx > 0 && <span className="text-zinc-800">·</span>}
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-zinc-500 underline decoration-zinc-800 hover:text-lime-400"
                          >
                            {s.host}
                          </a>
                        </span>
                      ))}
                    </p>
                  );
                })()}
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="rounded-xl border border-zinc-800 p-6 text-center text-sm text-zinc-500">
            No signals match those filters.
          </li>
        )}
      </ul>

      <p className="mt-4 text-center font-mono text-[11px] text-zinc-600">
        {filtered.length} signals · refreshed {generatedAt.slice(0, 16).replace("T", " ")} UTC · ▲ votes are stored
        in your browser
      </p>
    </div>
  );
}
