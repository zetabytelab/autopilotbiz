import type { Company } from "@/lib/data";
import { getCompanyResearch } from "@/lib/company-profiles";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function CompanyCard({ company: c }: { company: Company }) {
  const research = getCompanyResearch(c.slug);
  return (
    <article id={c.slug} className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2.5 text-lg font-semibold text-zinc-100">
            <Logo url={c.url} name={c.name} size={24} />
            <Link href={`/companies/${c.slug}`} className="hover:text-lime-400">{c.name}</Link>
          </h3>
          <p className="mt-0.5 text-sm italic text-zinc-400">“{c.tagline}”</p>
        </div>
        {!c.verified && (
          <span className="shrink-0 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
            unverified
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-zinc-400">{c.description}</p>

      {c.founders.length > 0 && (
        <div className="text-sm text-zinc-400">
          <span className="font-medium text-zinc-300">Founder{c.founders.length > 1 ? "s" : ""}:</span>{" "}
          {c.founders.map((f) => f.name).join(", ")}
        </div>
      )}

      {c.funding.totalRaised && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-sm">
          <span className="font-mono font-semibold text-lime-400">{c.funding.totalRaised}</span>
          <span className="text-zinc-400">
            {" "}
            raised{c.funding.valuation ? ` at ${c.funding.valuation} valuation` : ""}
            {c.funding.date ? ` (${c.funding.date})` : ""}
          </span>
          {c.funding.investors.length > 0 && (
            <div className="mt-1 text-xs text-zinc-500">{c.funding.investors.join(" · ")}</div>
          )}
        </div>
      )}

      {c.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {c.techStack.map((t) => (
            <span key={t} className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400">
              {t}
            </span>
          ))}
        </div>
      )}

      {(research || c.pricing) && <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-3">
        <p className="text-xs font-medium text-zinc-300">Pricing and commercial terms</p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">{research?.pricing.summary ?? c.pricing}</p>
        {research ? <>
          <p className="mt-2 font-mono text-[11px] text-zinc-400">{research.pricing.status} · checked <time dateTime={research.checkedAt}>{research.checkedAt}</time></p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {research.pricing.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-lime-400 underline decoration-lime-400/30 hover:text-lime-300">{source.name} ↗</a>)}
          </div>
        </> : <p className="mt-2 text-[11px] leading-relaxed text-amber-200/80">Historical research · pricing verification date not recorded. Confirm current terms with the provider.</p>}
      </div>}

      {c.news.length > 0 && (
        <ul className="space-y-1.5 border-t border-zinc-800/80 pt-3">
          {c.news.map((n) => (
            <li key={n.headline} className="flex gap-2 text-xs text-zinc-500">
              <span className="shrink-0 font-mono text-zinc-600">{n.date}</span>
              {n.url ? (
                <a href={n.url} target="_blank" rel="noopener noreferrer" className="underline decoration-zinc-700 hover:text-lime-400">
                  {n.headline}
                </a>
              ) : <span>{n.headline}</span>}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex flex-wrap gap-4 border-t border-zinc-800/80 pt-3 text-xs">
        <Link href={`/companies/${c.slug}`} className="font-medium text-lime-400 hover:underline">Evidence & full profile →</Link>
        {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-100">Company website ↗</a>}
      </div>
    </article>
  );
}
