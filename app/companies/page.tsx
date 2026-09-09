import type { Metadata } from "next";
import Link from "next/link";
import { companies } from "@/lib/data";
import { featuredProfileSlugs, getProfileNotes } from "@/lib/company-profiles";
import { getAutonomyAssessment } from "@/lib/autonomy";

export const metadata: Metadata = {
  title: "AI company profiles — The Autopilot Index",
  description: "Explore AI business builders and agent services: autonomy assessments, evidence, human involvement, funding, reported pricing and source timelines.",
  alternates: { canonical: "/companies" },
  openGraph: { title: "AI company profiles — The Autopilot Index", url: "/companies", description: "Compare what AI companies claim, what the record supports and what still needs testing.", images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Autopilot Index — business on autopilot" }] },
  twitter: { title: "AI company profiles — The Autopilot Index", description: "Compare what AI companies claim, what the record supports and what still needs testing.", card: "summary_large_image", images: ["/og.png"] },
};

export default function CompaniesPage() {
  const featured = featuredProfileSlugs.flatMap((slug) => companies.filter((company) => company.slug === slug));
  const remaining = companies.filter((company) => !featured.some((entry) => entry.slug === company.slug)).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6">
      <Link href="/" className="font-mono text-xs text-zinc-400 hover:text-lime-400">← The Index</Link>
      <header className="mb-10 mt-8 max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-lime-400">{companies.length} company profiles</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-50">What can one human actually delegate?</h1>
        <p className="mt-4 leading-relaxed text-zinc-400">Explore the companies behind the one-person business thesis. Each profile separates the recorded proposition, evidence, human involvement and the questions that still need a real-world test.</p>
        <p className="mt-3 text-sm text-zinc-500">Existing source grades describe the strength of reported facts. They do not certify autonomous operation. Prices and figures are recorded research, with dates and gaps preserved.</p>
      </header>
      <section aria-labelledby="featured-profiles">
        <h2 id="featured-profiles" className="text-xl font-semibold text-zinc-100">Start with these 10</h2>
        <p className="mb-5 mt-2 text-sm text-zinc-400">An editorial selection spanning business builders, focused agents and a small-team exit. Selection is not an endorsement or a ranking.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {featured.map((company) => {
            const assessment = getAutonomyAssessment(company);
            return <article key={company.slug} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
              <p className="mb-3 font-mono text-xs text-lime-400">{assessment.levelLabel} · {assessment.evidenceLabel}</p>
              <h3 className="text-xl font-semibold text-zinc-100"><Link href={`/companies/${company.slug}`} className="hover:text-lime-400">{company.name} →</Link></h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{getProfileNotes(company).relevance}</p>
              <p className="mt-4 text-xs text-zinc-500">{assessment.sectionLabel}</p>
            </article>;
          })}
        </div>
      </section>
      <section aria-labelledby="more-profiles" className="mt-12">
        <h2 id="more-profiles" className="mb-5 text-xl font-semibold text-zinc-100">More companies in the research record</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {remaining.map((company) => <Link key={company.slug} href={`/companies/${company.slug}`} className="rounded-xl border border-zinc-800 p-4 hover:border-lime-400/50">
            <h3 className="font-semibold text-zinc-200">{company.name} →</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">{company.tagline}</p>
            <p className="mt-3 font-mono text-[11px] text-zinc-500">{getAutonomyAssessment(company).evidenceLabel}</p>
          </Link>)}
        </div>
      </section>
    </main>
  );
}
