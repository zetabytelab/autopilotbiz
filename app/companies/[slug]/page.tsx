import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { companies, type Source } from "@/lib/data";
import { getAutonomyAssessment } from "@/lib/autonomy";
import { getCompanyResearch, getCompanySources, getProfileNotes, type ResearchFinding } from "@/lib/company-profiles";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return companies.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = companies.find((entry) => entry.slug === slug);
  if (!company) notFound();
  const title = `${company.name}: autonomy, evidence & human involvement — Autopilot Index`;
  const description = `${company.name}: ${getProfileNotes(company).relevance} Explore recorded funding, pricing, limitations and sources.`;
  return {
    title, description,
    alternates: { canonical: `/companies/${company.slug}` },
    openGraph: { title, description, url: `/companies/${company.slug}`, type: "article", images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Autopilot Index — business on autopilot" }] },
    twitter: { title, description, card: "summary_large_image", images: ["/og.png"] },
  };
}

function Citation({ source }: { source?: Source }) {
  return source
    ? <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-xs text-lime-400 underline decoration-lime-400/30 hover:text-lime-300">Source: {source.name} ↗</a>
    : <p className="mt-2 text-xs text-zinc-500">No field-specific source recorded.</p>;
}

function FindingSources({ finding }: { finding: ResearchFinding }) {
  return <div className="mt-3 space-y-1">
    <p className="font-mono text-[11px] text-zinc-400">{finding.status}</p>
    {finding.sources.map((source) => <Citation key={source.url} source={source} />)}
  </div>;
}

export default async function CompanyProfile({ params }: Props) {
  const { slug } = await params;
  const company = companies.find((entry) => entry.slug === slug);
  if (!company) notFound();
  const assessment = getAutonomyAssessment(company);
  const notes = getProfileNotes(company);
  const research = getCompanyResearch(company.slug);
  const sources = getCompanySources(company);
  const timeline = [...company.news].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-12 sm:px-6">
      <Link href="/companies" className="font-mono text-xs text-zinc-400 hover:text-lime-400">← All company profiles</Link>
      <header className="mb-9 mt-8">
        <p className="font-mono text-xs uppercase tracking-widest text-lime-400">Company research · {assessment.sectionLabel}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-50 sm:text-5xl">{company.name}</h1>
        <p className="mt-4 text-lg text-zinc-300">{notes.relevance}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-lime-400/30 bg-lime-400/5 px-3 py-1.5 text-lime-300">{assessment.levelLabel}</span>
          <span className="rounded-full border border-zinc-700 px-3 py-1.5 text-zinc-300">{assessment.evidenceLabel}</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">{assessment.qualification}</p>
        {research && <p className="mt-3 text-xs leading-relaxed text-zinc-400">Primary sources checked <time dateTime={research.checkedAt}>{research.checkedAt}</time>. Published claims and terms reviewed; no independent product or financial audit.</p>}
        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          {company.url ? <a href={company.url} target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">Visit company website ↗</a> : <span className="text-amber-300">Company website withheld pending verification</span>}
          <a href="#sources" className="text-zinc-400 hover:text-zinc-100">Audit the sources ↓</a>
          <Link href="/submit" className="text-zinc-400 hover:text-zinc-100">Submit a correction →</Link>
        </div>
      </header>

      {company.slug === "atoms" && <aside className="mb-8 rounded-xl border border-lime-400/30 bg-lime-400/5 p-5">
        <p className="font-semibold text-zinc-100">Follow the Atoms field experiment</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">A public test protocol and measurement log for an actual build. Check its current status, spending and interventions before drawing conclusions about the outcome.</p>
        <Link href="/experiments/atoms" className="mt-3 inline-block text-sm text-lime-400 hover:underline">Read the experiment protocol →</Link>
      </aside>}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6" aria-labelledby="proposition">
        <h2 id="proposition" className="text-xl font-semibold text-zinc-100">The recorded proposition</h2>
        {!research && company.categoryClaim && <div className="mt-4 border-l-2 border-lime-400/40 pl-4"><p className="text-zinc-300">{company.categoryClaim}</p><p className="mt-2 text-xs text-zinc-500">Index summary of the positioning; not an independent finding.</p></div>}
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">{research?.capabilities.summary ?? company.description}</p>
        {research && <FindingSources finding={research.capabilities} />}
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2" aria-label="Human involvement and evidence gaps">
        <div className="rounded-2xl border border-zinc-800 p-5"><h2 className="text-lg font-semibold text-zinc-100">Where humans remain involved</h2><p className="mt-3 text-sm leading-relaxed text-zinc-400">{research?.humanInvolvement.summary ?? notes.humanRole}</p>{research && <FindingSources finding={research.humanInvolvement} />}</div>
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5"><h2 className="text-lg font-semibold text-amber-200">What still needs evidence</h2><p className="mt-3 text-sm leading-relaxed text-zinc-400">{notes.nextEvidence}</p>{company.autopilot?.flags && <p className="mt-3 text-sm leading-relaxed text-amber-200/80">Recorded caveat: {company.autopilot.flags}</p>}</div>
      </section>

      {research && <section className="mt-8 rounded-2xl border border-zinc-800 p-5 sm:p-6" aria-labelledby="customer-evidence">
        <h2 id="customer-evidence" className="text-xl font-semibold text-zinc-100">Customer evidence and its limits</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">{research.customerEvidence.summary}</p>
        <FindingSources finding={research.customerEvidence} />
        <p className="mt-4 text-sm leading-relaxed text-amber-200/80">{research.limitation}</p>
      </section>}

      <section className="mt-10" aria-labelledby="economics">
        <h2 id="economics" className="text-xl font-semibold text-zinc-100">Financial and team context</h2>
        <p className="mb-4 mt-2 text-sm text-zinc-500">Reported figures retain their original scope. Revenue periods and headcount dates may differ; these are not a current audited financial statement.</p>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 p-4"><dt className="text-xs text-zinc-400">Revenue / ARR as recorded</dt><dd className="mt-2 font-mono text-sm text-zinc-100">{company.metrics.arr ?? "Not reported"}<Citation source={company.metrics.sources?.arr} /></dd></div>
          <div className="rounded-xl border border-zinc-800 p-4"><dt className="text-xs text-zinc-400">Company human headcount</dt><dd className="mt-2 font-mono text-sm text-zinc-100">{company.metrics.humans ?? "Not reported"}<Citation source={company.metrics.sources?.humans} /></dd></div>
          <div className="rounded-xl border border-zinc-800 p-4"><dt className="text-xs text-zinc-400">Funding as recorded</dt><dd className="mt-2 font-mono text-sm text-zinc-100">{company.funding.totalRaised ?? "Not reported"}<Citation source={company.metrics.sources?.raised} /></dd></div>
        </dl>
        {(company.funding.lastRound || company.funding.date || company.funding.valuation || company.funding.investors.length > 0) && <div className="mt-4 space-y-2 rounded-xl bg-zinc-900/40 p-4 text-sm text-zinc-400">
          {company.funding.lastRound && <p><span className="text-zinc-200">Round / transaction: </span>{company.funding.lastRound}</p>}
          {company.funding.date && <p><span className="text-zinc-200">Recorded date: </span>{company.funding.date}</p>}
          {company.funding.valuation && <p><span className="text-zinc-200">Valuation: </span>{company.funding.valuation}</p>}
          {company.funding.investors.length > 0 && <p><span className="text-zinc-200">Investors / backers: </span>{company.funding.investors.join(" · ")}</p>}
        </div>}
      </section>

      <section className="mt-10" aria-labelledby="costs">
        <h2 id="costs" className="text-xl font-semibold text-zinc-100">Pricing and commercial terms</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">{research?.pricing.summary ?? company.pricing ?? "Pricing not recorded."}</p>
        {research ? <><FindingSources finding={research.pricing} /><p className="mt-2 text-xs leading-relaxed text-zinc-500">Published information checked {research.checkedAt}; taxes, account eligibility and checkout terms may differ. Unresolved pricing is explicitly marked above.</p></> : <p className="mt-2 text-xs leading-relaxed text-zinc-500">Historical research snapshot. A pricing verification date is not recorded; confirm current plans, usage limits and additional costs with the provider before purchasing.</p>}
        {company.referralProgram.notes && <p className="mt-4 text-sm text-zinc-400"><span className="font-medium text-zinc-200">Recorded referral terms: </span>{company.referralProgram.notes} These terms have not been revalidated for this profile.</p>}
      </section>

      <section className="mt-10 grid gap-8 sm:grid-cols-2" aria-label="People and technology">
        <div><h2 className="text-xl font-semibold text-zinc-100">Founders and recorded roles</h2>{company.founders.length ? <ul className="mt-4 space-y-4">{company.founders.map((founder) => <li key={founder.name}><h3 className="text-sm font-medium text-zinc-200">{founder.name}</h3><p className="mt-1 text-sm leading-relaxed text-zinc-400">{founder.background}</p></li>)}</ul> : <p className="mt-3 text-sm text-zinc-500">Not recorded.</p>}</div>
        <div><h2 className="text-xl font-semibold text-zinc-100">Recorded technology stack</h2>{company.techStack.length ? <ul className="mt-4 flex flex-wrap gap-2">{company.techStack.map((tool) => <li key={tool} className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400">{tool}</li>)}</ul> : <p className="mt-3 text-sm text-zinc-500">No stack details recorded.</p>}<p className="mt-3 text-xs text-zinc-500">Components listed in the research record; integrations have not been independently tested here.</p></div>
      </section>

      <section className="mt-10" aria-labelledby="timeline">
        <h2 id="timeline" className="text-xl font-semibold text-zinc-100">Research timeline</h2>
        {timeline.length ? <ol className="mt-4 space-y-4 border-l border-zinc-800 pl-5">{timeline.map((item) => <li key={`${item.date}-${item.headline}`}><p className="font-mono text-xs text-lime-400">{item.date}</p><p className="mt-1 text-sm leading-relaxed text-zinc-400">{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline decoration-zinc-700 hover:text-lime-400">{item.headline} ↗</a> : item.headline}</p>{!item.url && <p className="mt-1 text-xs text-zinc-600">Direct article link not recorded.</p>}</li>)}</ol> : <p className="mt-3 text-sm text-zinc-500">No dated developments recorded.</p>}
      </section>

      <section id="sources" className="mt-10 scroll-mt-24 border-t border-zinc-800 pt-8" aria-labelledby="sources-heading">
        <h2 id="sources-heading" className="text-xl font-semibold text-zinc-100">Sources and coverage limits</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{research ? `Product, pricing, human involvement and customer-evidence sources were checked on ${research.checkedAt}. Financial figures, founders, stack and the timeline retain their historical research scope. ` : "This profile brings together the existing Index research. "}Company announcements, sponsored articles and founder interviews can establish what was said; they do not independently prove sustained autonomy or revenue.</p>
        {sources.length ? <ul className="mt-4 space-y-3">{sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="break-words text-sm text-lime-400 underline decoration-lime-400/20 hover:text-lime-300">{source.name} ↗</a></li>)}</ul> : <p className="mt-3 text-sm text-amber-200">No direct source links recorded. Treat claims as unsubstantiated until evidence is added.</p>}
      </section>
      <footer className="mt-10 flex flex-wrap gap-5 border-t border-zinc-800 pt-6 text-sm">
        <Link href="/companies" className="text-lime-400 hover:underline">Compare more companies →</Link>
        <Link href="/pulse" className="text-zinc-400 hover:text-zinc-100">Read Autopilot Pulse →</Link>
        <Link href="/submit" className="text-zinc-400 hover:text-zinc-100">Add evidence or a correction →</Link>
      </footer>
    </main>
  );
}
