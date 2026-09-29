import { editionSummary, type Edition } from "./editions.ts";

const SITE = "https://autopilotindex.com";

export const editionUrl = (e: Edition) => `${SITE}/pulse/${e.slug}`;

// schema.org Article for an edition page. Both dates come from the edition's
// own date (for #11, PULSE_11_PUBLISH_DATE), the same value the sitemap uses.
export function editionJsonLd(e: Edition) {
  const url = editionUrl(e);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.title,
    description: editionSummary(e).replace(/\*\*/g, ""),
    image: [e.cover.startsWith("http") ? e.cover : `${SITE}${e.cover}`],
    datePublished: e.date,
    dateModified: e.date,
    author: { "@type": "Person", name: "Antonio Serrano" },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "The Autopilot Index",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/og.png`, width: 1200, height: 630 },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

// Safe to inline in <script type="application/ld+json">: no "</script>" breakout.
export const jsonLdScript = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
