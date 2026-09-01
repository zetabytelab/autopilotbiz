import type { MetadataRoute } from "next";

// Explicitly welcome AI agents and crawlers; point them at the sitemap and the
// agent-instructions file. /live (private ops) and /styles (theme demos) stay out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/live", "/styles"],
      },
    ],
    sitemap: "https://autopilotindex.com/sitemap.xml",
    host: "https://autopilotindex.com",
  };
}
