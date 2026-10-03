import type { Company } from "./data";

// schema.org structured data for a company profile page. Every value comes
// straight from lib/data.ts; fields that are null/empty there are omitted, and
// nothing is derived or inferred (no funding, headcount or ratings: those are
// dated, sourced observations that schema.org Organization can't qualify).
const SITE = "https://autopilotindex.com";

export function companyJsonLd(company: Company) {
  const pageUrl = `${SITE}/companies/${company.slug}`;
  const organization: Record<string, unknown> = {
    "@type": "Organization",
    "@id": `${pageUrl}#organization`,
    name: company.name,
    description: company.description,
  };
  if (company.url) organization.url = company.url;
  if (company.tagline) organization.slogan = company.tagline;
  if (company.founders.length > 0) {
    organization.founder = company.founders.map((founder) => ({ "@type": "Person", name: founder.name }));
  }

  const breadcrumbs = {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumbs`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "The Autopilot Index", item: SITE },
      { "@type": "ListItem", position: 2, name: "Company profiles", item: `${SITE}/companies` },
      { "@type": "ListItem", position: 3, name: company.name, item: pageUrl },
    ],
  };

  return { "@context": "https://schema.org", "@graph": [organization, breadcrumbs] };
}

// Safe to drop into <script type="application/ld+json">: a "</script>" inside
// any string can't close the tag early.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
