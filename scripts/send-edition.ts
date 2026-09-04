// Brevo email mirror for a Pulse edition. The site page is canonical; this
// sends the edition to the owned email list (Brevo list BREVO_LIST_ID).
// Usage: BREVO_API_KEY=... BREVO_LIST_ID=4 npm run send:edition -- <slug> [--test you@x.com]
//        npm run send:edition -- <slug> --html   (print email HTML, no key, no send)
// Runs on plain Node: node --experimental-strip-types scripts/send-edition.ts <slug>

import { editions } from "../lib/editions.ts";

const SITE = "https://www.autopilotindex.com";
const slug = process.argv[2];
const testIdx = process.argv.indexOf("--test");
const testEmail = testIdx > -1 ? process.argv[testIdx + 1] : null;
const htmlOnly = process.argv.includes("--html");

const e = editions.find((x) => x.slug === slug);
if (!e) {
  console.error(`Unknown edition slug "${slug}". Known: ${editions.map((x) => x.slug).join(", ")}`);
  process.exit(1);
}

// Inline markdown → email HTML: bold, italic, and code spans.
const fmt = (s: string) =>
  s
    .replace(/`([^`]+?)`/g, "<code style='background:#1e1e22;padding:1px 5px;border-radius:4px;font-family:monospace;color:#d4d4d8'>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong style='color:#e4e4e7'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em style='color:#d4d4d8'>$1</em>");

const html = `<!doctype html><html><body style="margin:0;padding:0;background:#09090b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b"><tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="font-family:'Courier New',monospace;font-size:18px;font-weight:bold;color:#f4f4f5;padding-bottom:18px">autopilot<span style="color:#a3e635">index</span></td></tr>
<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a3e635;padding-bottom:6px">Autopilot Pulse · #${String(e.number).padStart(2, "0")}</td></tr>
<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:26px;font-weight:bold;color:#fafafa;padding-bottom:16px">${e.title}</td></tr>
<tr><td style="padding-bottom:20px"><img src="${SITE}${e.cover}" width="600" style="width:100%;border-radius:12px" alt="Edition cover"/></td></tr>
<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#a3e635;padding-bottom:8px">TL;DR</td></tr>
${e.tldr.map((t) => `<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#d4d4d8;padding-bottom:6px">→ ${fmt(t)}</td></tr>`).join("\n")}
${e.sections
  .map(
    (s) => `
${s.heading ? `<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:19px;font-weight:bold;color:#fafafa;padding:22px 0 8px">${s.heading}</td></tr>` : ""}
${s.image ? `<tr><td style="padding:4px 0 10px"><img src="${SITE}${s.image}" width="600" style="width:100%;border-radius:10px" alt=""/></td></tr>` : ""}
${s.paras.map((p) => `<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:14.5px;line-height:1.65;color:#a1a1aa;padding-bottom:12px">${fmt(p)}</td></tr>`).join("\n")}`,
  )
  .join("\n")}
<tr><td style="border-top:1px solid #27272a;padding-top:18px;font-family:'Courier New',monospace;font-size:13px;color:#a1a1aa">Keep building — the agents have the night shift. 🛩<br/>— Antonio, the human in the loop</td></tr>
<tr><td style="padding-top:14px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#71717a">Read on the web: <a href="${SITE}/pulse/${e.slug}?ref=email" style="color:#a3e635">${SITE.replace("https://www.", "")}/pulse/${e.slug}</a> · Every claim sourced &amp; labeled on <a href="${SITE}/?ref=email" style="color:#a3e635">the index</a>.</td></tr>
</table></td></tr></table></body></html>`;

if (htmlOnly) {
  process.stdout.write(html);
  process.exit(0);
}

const { BREVO_API_KEY, BREVO_LIST_ID } = process.env;
if (!BREVO_API_KEY || !BREVO_LIST_ID) {
  console.error("BREVO_API_KEY and BREVO_LIST_ID required (locally: pull from Vercel env).");
  process.exit(1);
}

const headers = { "api-key": BREVO_API_KEY, "content-type": "application/json" } as Record<string, string>;

async function main() {
  const create = await fetch("https://api.brevo.com/v3/emailCampaigns", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: `Pulse #${e!.number} — ${e!.title}`,
      subject: `Autopilot Pulse #${e!.number}: ${e!.title}`,
      sender: { name: "Autopilot Pulse", email: "pulse@autopilotindex.com" },
      type: "classic",
      htmlContent: html,
      recipients: { listIds: [Number(BREVO_LIST_ID)] },
    }),
  });
  if (!create.ok) throw new Error(`campaign create failed: ${create.status} ${await create.text()}`);
  const { id } = (await create.json()) as { id: number };
  console.log(`Campaign #${id} created.`);

  if (testEmail) {
    const t = await fetch(`https://api.brevo.com/v3/emailCampaigns/${id}/sendTest`, {
      method: "POST",
      headers,
      body: JSON.stringify({ emailTo: [testEmail] }),
    });
    console.log(t.ok ? `Test sent to ${testEmail}. Review, then send via Brevo UI or sendNow.` : `test failed: ${await t.text()}`);
    return;
  }

  const send = await fetch(`https://api.brevo.com/v3/emailCampaigns/${id}/sendNow`, { method: "POST", headers });
  if (!send.ok) throw new Error(`sendNow failed: ${send.status} ${await send.text()}`);
  console.log("Sent to the list. 🛩");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
