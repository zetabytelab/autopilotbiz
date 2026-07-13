import type { Company } from "@/lib/data";
import Logo from "@/components/Logo";

export default function CompanyCard({ company: c }: { company: Company }) {
  return (
    <article id={c.slug} className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2.5 text-lg font-semibold text-zinc-100">
            <Logo url={c.url} name={c.name} size={24} />
            {c.url ? (
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-lime-400">
                {c.name} <span className="text-zinc-600">↗</span>
              </a>
            ) : (
              c.name
            )}
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

      {c.news.length > 0 && (
        <ul className="space-y-1.5 border-t border-zinc-800/80 pt-3">
          {c.news.map((n) => (
            <li key={n.headline} className="flex gap-2 text-xs text-zinc-500">
              <span className="shrink-0 font-mono text-zinc-600">{n.date}</span>
              <span>{n.headline}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
