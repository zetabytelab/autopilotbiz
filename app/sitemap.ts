import type { MetadataRoute } from "next";
import { editions } from "@/lib/editions";
import { companies } from "@/lib/data";
import { DEALROOM_PAGE_UPDATED } from "@/lib/dealroom";

const BASE = "https://autopilotindex.com";

// Pages whose lastmod is the date their content last changed, not the build time.
const CONTENT_DATES: Record<string, string> = { "/dealroom": DEALROOM_PAGE_UPDATED };

// Static, indexable routes. /live (private) and /styles (theme demos) are excluded.
const STATIC_PATHS = [
  "",
  "/pulse",
  "/news",
  "/companies",
  "/experiments/atoms",
  "/submit",
  "/pricing",
  "/developers",
  "/dealroom",
  "/about",
  "/contact",
  "/privacy",
  "/guides/ai-gateways",
  "/guides/ai-company-builders",
  "/guides/apify-n8n-lead-machine",
  "/guides/is-n8n-obsolete",
  "/guides/agent-ready-web",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: CONTENT_DATES[path] ?? now,
    changeFrequency: path === "" || path === "/news" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const editionEntries: MetadataRoute.Sitemap = editions.map((e) => ({
    url: `${BASE}/pulse/${e.slug}`,
    lastModified: e.date ? new Date(e.date) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const companyEntries: MetadataRoute.Sitemap = companies.map(({ slug }) => ({
    url: `${BASE}/companies/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...companyEntries, ...editionEntries];
}
