import type { Metadata } from "next";
import Link from "next/link";
import SubscribeForm from "@/components/SubscribeForm";
import { companies, type Company, type Source } from "@/lib/data";
import { AUTONOMY_LABELS, EVIDENCE_LABELS, EVIDENCE_SCOPE_NOTE, compareEvidenceThenAutonomy } from "@/lib/autonomy";
import { METRIC_LABELS, financialSummary, latestObservation, observationDate } from "@/lib/financials";
import { financialObservations } from "@/lib/financial-observations";
import type { MetricObservation } from "@/lib/financial-types";
import { DEALROOM_PAGE_UPDATED } from "@/lib/dealroom";

// /dealroom: the Autopilot Leverage Screener landing page.
//
// Dealroom terms (see DEALROOM-TERMS-OVERRIDE): until Dealroom gives written
// permission this page shows OUR index data only. No Dealroom data, fields,
// logos or Dealroom-derived numbers; the Dataset JSON-LD describes our CC BY 4.0
// index only; the screener is described in words. Built at the Dealroom
// hackathon on 1 Oct 2026; page still shows index data only until Dealroom
// gives written permission to show joined fields. Every figure below is
// derived from lib/data.ts and lib/financial-observations.ts at build time,
// never typed by hand.

export const revalidate = 3600;

const BASE = "https://autopilotindex.com";
const URL_ = `${BASE}/dealroom`;
const OG_IMAGE = `${BASE}/og/dealroom.png`;

const TITLE = "Autopilot Leverage Screener: AI-run companies by funding per employee";
const DESCRIPTION =
  "Built at the Dealroom hackathon on 1 Oct 2026: Autopilot Index autonomy levels next to funding and revenue per employee. This page shows our own evidence-graded index data only.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: URL_ },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: URL_,
    siteName: "The Autopilot Index",
    title: "How much company does each employee buy?",
    description:
      "The Autopilot Leverage Screener: funding and revenue per employee vs autonomy level for AI-run companies. Built at the Dealroom hackathon on 1 Oct 2026. Index data only until Dealroom gives written permission for joined fields.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Autopilot Leverage Screener: funding per employee vs autonomy level, L2 to L5" }],
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    site: "@autopilotindex",
    title: "Autopilot Leverage Screener",
    description: "Funding and revenue per employee vs autonomy level for AI-run companies. Built at the Dealroom hackathon, 1 Oct 2026. Index data only on this page.",
    images: [OG_IMAGE],
  },
};

// Level names come from lib/autonomy.ts; the one-line definitions are the ones
// already published in the Autopilot Index README (scripts/generate-index-readme.ts).
const LEVELS: { level: string; name: string; definition: string; outOfScope?: boolean }[] = [
  { level: "L1", name: "Copilot", definition: "AI assists; humans operate", outOfScope: true },
  { level: "L2", name: AUTONOMY_LABELS.L2, definition: "AI runs whole functions end-to-end (support, growth, build) with human review" },
  { level: "L3", name: AUTONOMY_LABELS.L3, definition: "AI runs most core operations; human steers the big calls" },
  { level: "L4", name: AUTONOMY_LABELS.L4, definition: "Human sets goals & signs papers; AI operates the company day to day" },
  { level: "L5", name: AUTONOMY_LABELS.L5, definition: "AI runs the company including capital allocation" },
];

// Index section only: watchlist, enabler and caution rows are excluded.
const indexRows = companies.filter((c) => c.autopilot?.section === "index").sort(compareEvidenceThenAutonomy);

const graded = companies.map((c) => c.autopilot?.evidence).filter(Boolean);
const hardEvidence = graded.filter((g) => g === "A" || g === "B").length;
const claimsOnly = graded.filter((g) => g === "D").length;

// Latest research date recorded in the index (Dataset dateModified).
const datasetModified = financialObservations
  .flatMap((o) => [o.checkedAt, o.recordedAt])
  .filter((d): d is string => Boolean(d))
  .sort()
  .at(-1);

const FAQ: { q: string; a: string }[] = [
  {
    q: "What is the Autopilot Leverage Screener?",
    a: "A screen designed at the Dealroom hackathon on 1 October 2026. It joins The Autopilot Index (companies that say AI runs them, each with an autonomy level and an evidence grade) to Dealroom's funding and headcount data, so funding per employee and revenue per employee can sit next to how much of the business AI actually runs. Until Dealroom gives written permission to show joined fields, this page shows our own index data only.",
  },
  {
    q: "What do L1 to L5 mean, and why is L1 left out?",
    a: "They're the Index's published autonomy levels: L2 Function autopilot, L3 Operational autopilot, L4 Goal-level autopilot and L5 Full autonomy. L1 Copilot covers tools that help a human work faster. The Index only tracks businesses where AI performs the work, so L1 is out of scope. The one-line definitions are in the table on this page. Levels are editorial assessments, not audits.",
  },
  {
    q: "Where do the numbers on this page come from?",
    a: "Every figure on this page comes from The Autopilot Index: dated, source-linked observations that we record ourselves. Nothing on this page comes from Dealroom. If a figure has no source it isn't shown, and a blank cell means not disclosed. We never fill a gap with an estimate or a zero.",
  },
  {
    q: "Can I use the data or query it from my own agent?",
    a: "Yes. The Index data is CC BY 4.0: use it and credit it. There's a free read-only REST API (/api/v1, OpenAPI at /openapi.json) and an MCP server at autopilotindex.com/mcp. No login. Both serve our index data only.",
  },
  {
    q: "What do I get if I sign up?",
    a: "Autopilot Pulse: weekly signals from the businesses that run themselves, with every claim labelled as verified, self-reported or disputed. It's free and you can unsubscribe in one click.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${URL_}#webpage`,
      url: URL_,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en-GB",
      isPartOf: { "@id": `${BASE}/#website` },
      publisher: { "@id": `${BASE}/#organization` },
      about: { "@id": `${BASE}/companies#dataset` },
      mainEntity: { "@id": `${BASE}/companies#dataset` },
      datePublished: DEALROOM_PAGE_UPDATED,
      dateModified: DEALROOM_PAGE_UPDATED,
      breadcrumb: { "@id": `${URL_}#breadcrumb` },
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE, width: 1200, height: 630 },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${URL_}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "The Autopilot Index", item: `${BASE}/` },
        { "@type": "ListItem", position: 2, name: "Leverage Screener", item: URL_ },
      ],
    },
    // Our CC BY 4.0 index only. Never describe Dealroom data here.
    {
      "@type": "Dataset",
      "@id": `${BASE}/companies#dataset`,
      name: "The Autopilot Index: companies run by AI",
      description:
        "Evidence-graded profiles of companies that claim to be run primarily by AI: editorial autonomy level, evidence grade (A–D), reported humans, dated and source-linked financial observations, and technology stack.",
      url: `${BASE}/companies`,
      creator: { "@id": `${BASE}/#organization` },
      license: "https://creativecommons.org/licenses/by/4.0/",
      isAccessibleForFree: true,
      keywords: ["AI-run companies", "autonomous companies", "revenue per employee", "autonomy levels", "AI agents"],
      ...(datasetModified ? { dateModified: datasetModified } : {}),
      distribution: [
        { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${BASE}/api/v1/companies` },
        { "@type": "DataDownload", encodingFormat: "application/vnd.oai.openapi+json", contentUrl: `${BASE}/openapi.json` },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${URL_}#faq`,
      mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ],
};

const NOT_DISCLOSED = <span className="text-zinc-600">not disclosed</span>;

function SourceLink({ source }: { source: Source | null | undefined }) {
  if (!source) return null;
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-zinc-400 underline decoration-zinc-700 hover:text-lime-400">
      {source.name}
    </a>
  );
}

// Shows a dated observation as recorded (ranges and lower bounds keep their
// wording), or "not disclosed" when nothing was disclosed. Never a zero.
function Observation({ entry, label }: { entry: MetricObservation | null; label?: boolean }) {
  if (!entry || !entry.display.trim() || entry.display.trim().toLowerCase() === "undisclosed") return NOT_DISCLOSED;
  return (
    <>
      <span className="text-zinc-200">{entry.display}</span>
      <span className="block text-[11px] text-zinc-500">
        {label ? `${METRIC_LABELS[entry.kind]} · ` : ""}
        {observationDate(entry)}
        {entry.status !== "reported" ? ` · ${entry.status}` : ""}
      </span>
      <SourceLink source={entry.source} />
    </>
  );
}

function Raised({ company }: { company: Company }) {
  const { totalRaised, date } = company.funding;
  if (!totalRaised) return NOT_DISCLOSED;
  return (
    <>
      <span className="text-zinc-200">{totalRaised}</span>
      <span className="block text-[11px] text-zinc-500">{date ? `As of ${date}` : "Date not recorded"}</span>
      <SourceLink source={company.metrics.sources?.raised} />
    </>
  );
}

function H2({ id, kicker, children }: { id?: string; kicker: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">{kicker}</p>
      <h2 id={id} className="text-2xl font-bold text-zinc-100 sm:text-3xl">{children}</h2>
    </div>
  );
}

export default function DealroomPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="pt-10 font-mono text-xs text-zinc-500">
        <Link href="/" className="hover:text-lime-400">The Autopilot Index</Link> / <span className="text-zinc-400">Leverage Screener</span>
      </nav>

      {/* 1. Hero */}
      <header className="py-14 sm:py-20">
        <p className="inline-block rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 font-mono text-xs text-lime-400">
          Built at the Dealroom hackathon · 1 Oct 2026 · London
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-zinc-50 sm:text-6xl">
          How much company does each employee buy?
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          At the Dealroom hackathon on 1 October 2026 we designed one screen: funding per employee and revenue per
          employee, set against how much of the business AI actually runs (L2 to L5), by joining The Autopilot Index
          to Dealroom&apos;s company data. Until Dealroom gives written permission to show joined fields, this page
          shows our own index data, and every figure on it has a source and a date.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#signup" className="rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-lime-300">
            Get Autopilot Pulse
          </a>
          <a href="#screener" className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 hover:border-zinc-500">
            What the screener does
          </a>
          <a href="#leaderboard" className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 hover:border-zinc-500">
            See the index leaderboard
          </a>
        </div>
        <p className="mt-5 text-xs text-zinc-500">
          {companies.length} companies tracked · {hardEvidence} on audited or filed evidence · {claimsOnly} on founder claims alone
        </p>
      </header>

      {/* 2. What the screener does */}
      <section aria-labelledby="screener" className="scroll-mt-24 border-t border-zinc-900 py-12">
        <H2 id="screener" kicker="The screener">What the screener does</H2>
        <ol className="grid gap-4 sm:grid-cols-3">
          <li className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
            <p className="font-semibold text-zinc-100">Joins two datasets</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Matching each company in The Autopilot Index (autonomy level, evidence grade, reported humans,
              dated financial observations) by domain to Dealroom&apos;s records for funding rounds and headcount.
            </p>
          </li>
          <li className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
            <p className="font-semibold text-zinc-100">Computes leverage</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Funding per employee and revenue per employee, each shown with the date and source of both the numerator
              and the denominator. If either side is missing or undated, the ratio stays blank. It is never estimated.
            </p>
          </li>
          <li className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
            <p className="font-semibold text-zinc-100">Ranks it against autonomy</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Companies sit in bands by their published autonomy level (L2 to L5). L1 Copilot is out of scope: the
              Index only covers businesses where AI does the work, not tools that help a human go faster.
            </p>
          </li>
        </ol>
        <p className="mt-4 text-sm text-zinc-500">
          Nothing on this page comes from Dealroom. The leaderboard below uses only The Autopilot Index&apos;s own data.
        </p>

        <h3 className="mt-10 text-lg font-semibold text-zinc-100">Ask the index from your agent</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Our public MCP server serves the index data on this page through read-only tools (
          <code className="text-zinc-200">search_companies</code>, <code className="text-zinc-200">get_company</code>,{" "}
          <code className="text-zinc-200">list_stack_tools</code>, <code className="text-zinc-200">list_editions</code>). No login.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-zinc-800 bg-black/50 p-4 font-mono text-xs text-zinc-300">
          {`{ "mcpServers": { "autopilot-index": { "type": "http", "url": "https://autopilotindex.com/mcp" } } }`}
        </pre>
        <p className="mt-2 text-xs text-zinc-500">
          More in the <Link href="/developers" className="text-lime-400 hover:underline">developer docs</Link>.
        </p>

        <h3 className="mt-10 text-lg font-semibold text-zinc-100">What the levels mean</h3>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th scope="col" className="px-4 py-3">Level</th>
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Definition</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map((l) => (
                <tr key={l.level} className="border-b border-zinc-900 last:border-0">
                  <th scope="row" className="px-4 py-3 font-mono font-semibold text-lime-400">{l.level}</th>
                  <td className="px-4 py-3 text-zinc-200">{l.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{l.outOfScope ? `Out of scope. ${l.definition}` : l.definition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Autonomy levels are editorial assessments, not audits. Evidence grades record source strength, not proof of
          autonomous operation. Evidence grades: {Object.entries(EVIDENCE_LABELS).map(([k, v]) => `${k} ${v}`).join(" · ")}.
        </p>
      </section>

      {/* 4. Index-only leaderboard (plain SSR table) */}
      <section aria-labelledby="leaderboard" className="scroll-mt-24 border-t border-zinc-900 py-12">
        <H2 id="leaderboard" kicker="Leaderboard">The index leaderboard</H2>
        <p className="mb-5 max-w-2xl text-sm text-zinc-400">
          Index companies only (not the watchlist), ordered by evidence first, then autonomy. Our own dated, source-linked
          data; a blank cell means not disclosed.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-zinc-800" role="region" aria-label="Index leaderboard" tabIndex={0}>
          <table className="w-full min-w-[860px] text-left text-sm">
            <caption className="sr-only">
              Autopilot Index companies (Index section only), ordered by evidence grade then autonomy level.
            </caption>
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th scope="col" className="px-4 py-3">Company</th>
                <th scope="col" className="px-4 py-3">Level</th>
                <th scope="col" className="px-4 py-3">Evidence</th>
                <th scope="col" className="px-4 py-3">Reported humans</th>
                <th scope="col" className="px-4 py-3">Latest financial observation</th>
                <th scope="col" className="px-4 py-3">Total raised</th>
              </tr>
            </thead>
            <tbody>
              {indexRows.map((c) => {
                const meta = c.autopilot;
                return (
                  <tr key={c.slug} className="border-b border-zinc-900 align-top last:border-0">
                    <th scope="row" className="px-4 py-3 font-normal">
                      <Link href={`/companies/${c.slug}`} className="font-semibold text-zinc-100 hover:text-lime-400">{c.name}</Link>
                    </th>
                    <td className="px-4 py-3 text-zinc-300">
                      {meta?.level ? <><span className="font-mono text-lime-400">{meta.level}</span> {AUTONOMY_LABELS[meta.level]}</> : "Not assessed"}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {meta?.evidence ? <><span className="font-mono">Grade {meta.evidence}</span><span className="block text-[11px] text-zinc-500">{EVIDENCE_LABELS[meta.evidence]}</span></> : "Not graded"}
                    </td>
                    <td className="px-4 py-3"><Observation entry={latestObservation(c, "headcount")} /></td>
                    <td className="px-4 py-3"><Observation entry={financialSummary(c)} label /></td>
                    <td className="px-4 py-3"><Raised company={c} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-zinc-500">{EVIDENCE_SCOPE_NOTE}</p>
        <p className="mt-2 text-xs text-zinc-500">
          Data: The Autopilot Index (CC BY 4.0). Download: <a href="/api/v1/companies?section=index" className="text-lime-400 hover:underline">JSON API</a> ·{" "}
          <a href="/openapi.json" className="text-lime-400 hover:underline">OpenAPI</a> ·{" "}
          <Link href="/developers" className="text-lime-400 hover:underline">MCP</Link>. Full profiles and the watchlist are on{" "}
          <Link href="/companies" className="text-lime-400 hover:underline">/companies</Link>.
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Cite this: The Autopilot Index, Autopilot Leverage Screener, autopilotindex.com/dealroom, accessed &lt;date&gt;.
        </p>
      </section>

      {/* 5. Signup */}
      <section aria-labelledby="signup" className="scroll-mt-24 border-t border-zinc-900 py-12">
        <H2 id="signup" kicker="Newsletter">Get Autopilot Pulse</H2>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Weekly signals from the businesses that run themselves: companies, field experiments and the tech stacks they
          run on. Every claim is labelled verified, self-reported or disputed. Free, and you can unsubscribe in one click.
        </p>
        {/* Posts page=/dealroom, so the signup is attributed to this placement; UTMs ride along where the form supports them. */}
        <SubscribeForm />
      </section>

      {/* 6. FAQ */}
      <section aria-labelledby="faq" className="scroll-mt-24 border-t border-zinc-900 py-12">
        <H2 id="faq" kicker="FAQ">Questions</H2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <summary className="cursor-pointer list-none">
                <h3 className="inline text-base font-semibold text-zinc-100">{q}</h3>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 7. Footer strip */}
      <footer className="border-t border-zinc-900 pt-8 text-xs leading-relaxed text-zinc-500">
        <p>
          Built at the Dealroom hackathon, 1 Oct 2026 · Data CC BY 4.0 ·{" "}
          <Link href="/about" className="text-lime-400 hover:underline">Methodology</Link> ·{" "}
          <Link href="/submit" className="text-lime-400 hover:underline">Submit a correction</Link>
        </p>
        <p className="mt-2">
          Dealroom and Phoenix Court are named here only as hackathon hosts. They have not reviewed or endorsed The
          Autopilot Index.
        </p>
      </footer>
    </main>
  );
}
