import type { MetadataRoute } from "next";
import { editions } from "@/lib/editions";

const BASE = "https://autopilotindex.com";

// Static, indexable routes. /live (private) and /styles (theme demos) are excluded.
const STATIC_PATHS = [
  "",
  "/pulse",
  "/news",
  "/submit",
  "/about",
  "/contact",
  "/privacy",
  "/guides/ai-gateways",
  "/guides/ai-company-builders",
  "/guides/apify-n8n-lead-machine",
  "/guides/is-n8n-obsolete",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/news" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const editionEntries: MetadataRoute.Sitemap = editions.map((e) => ({
    url: `${BASE}/pulse/${e.slug}`,
    lastModified: e.date ? new Date(e.date) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...editionEntries];
}
