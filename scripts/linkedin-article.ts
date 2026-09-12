// Renders a Pulse edition as clean rich text for LinkedIn's article editor.
// The site page stays canonical; this is the adaptation that reaches the
// newsletter subscribers, who never see a feed post unless they scroll past it.
//
// Usage: npm run linkedin:article -- <slug> [> out.html]
// Then open the file in a browser, select all, copy, and paste into the
// LinkedIn article editor. Paste carries headings, bold and links; images are
// re-uploaded by LinkedIn on paste and should be checked afterwards.

import { editions } from "../lib/editions.ts";

const SITE = "https://www.autopilotindex.com";
const slug = process.argv[2];

const e = editions.find((x) => x.slug === slug);
if (!e) {
  console.error(`Unknown edition slug "${slug}". Known: ${editions.map((x) => x.slug).join(", ")}`);
  process.exit(1);
}

// LinkedIn's editor keeps <strong> and <a> but discards inline styles, so this
// deliberately emits bare semantic tags rather than the email renderer's colours.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmt = (s: string) =>
  esc(s)
    .replace(/`([^`]+?)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

const img = (src: string, alt: string) =>
  `<p><img src="${SITE}${src}" alt="${esc(alt)}" style="max-width:100%"/></p>`;

const body = `<h1>${esc(e.title)}</h1>
${img(e.cover, `${e.title} — Autopilot Pulse #${e.number}`)}
<p><em>Autopilot Pulse #${String(e.number).padStart(2, "0")} · ${new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</em></p>
${e.correction ? `<blockquote><p>${fmt(e.correction)}</p></blockquote>` : ""}
<h2>The short version</h2>
<ul>
${e.tldr.map((t) => `  <li>${fmt(t)}</li>`).join("\n")}
</ul>
${e.sections
  .map((s) =>
    [
      s.heading ? `<h2>${esc(s.heading)}</h2>` : "",
      s.image ? img(s.image, s.imageAlt ?? "") : "",
      ...s.paras.map((p) => `<p>${fmt(p)}</p>`),
      (s.sources ?? []).length
        ? `<p>${(s.sources ?? []).map((src) => `<a href="${src.url}">${esc(src.label)}</a>`).join(" · ")}</p>`
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  )
  .join("\n")}
<hr/>
<p>Every figure above is sourced and labelled on the index: <a href="${SITE}/pulse/${e.slug}?ref=linkedin">${SITE.replace("https://www.", "")}/pulse/${e.slug}</a></p>
<p>— Antonio, the human in the loop</p>`;

// A light ground and a sane measure, so the browser view you copy from looks
// like prose rather than a wall. None of this styling survives the paste.
process.stdout.write(`<!doctype html><meta charset="utf-8">
<title>${esc(e.title)} — LinkedIn article</title>
<style>
  body { max-width: 46rem; margin: 2rem auto; padding: 0 1rem; background: #fff; color: #111;
         font: 16px/1.6 -apple-system, Segoe UI, Helvetica, Arial, sans-serif; }
  h1 { font-size: 1.9rem; line-height: 1.2; text-wrap: balance; }
  h2 { font-size: 1.25rem; margin-top: 2rem; text-wrap: balance; }
  blockquote { border-left: 3px solid #ccc; margin: 1.5rem 0; padding-left: 1rem; color: #555; }
  code { background: #f2f2f2; padding: 1px 4px; border-radius: 3px; }
  img { border-radius: 8px; }
  hr { border: 0; border-top: 1px solid #ddd; margin: 2rem 0; }
</style>
${body}
`);
