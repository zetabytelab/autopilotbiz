import { editions } from "@/lib/editions";

const SITE = "https://www.autopilotindex.com";
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const items = editions
    .map(
      (e) => `    <item>
      <title>${esc(`Autopilot Pulse #${e.number} — ${e.title}`)}</title>
      <link>${SITE}/pulse/${e.slug}</link>
      <guid>${SITE}/pulse/${e.slug}</guid>
      <pubDate>${new Date(e.date + "T08:00:00Z").toUTCString()}</pubDate>
      <description>${esc(e.tldr.join(" "))}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Autopilot Pulse</title>
    <link>${SITE}/pulse</link>
    <description>Weekly signals from the businesses that run themselves — companies, field experiments, and the tech stacks they fly on.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
