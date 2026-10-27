import { NextResponse } from "next/server";
import { postContactWithAttribution } from "@/lib/signup-attribution";
import { sponsorInquirySchema } from "@/lib/subscribe-schema";
import { isSponsorInterest, leadAttributes, leadScore } from "@/lib/lead-score";

export const runtime = "nodejs";

// POST /api/sponsor-inquiry — the /sponsor qualifier form (lead score v0).
// Creates or updates a Brevo contact with the qualifier fields and the
// first-party score. It does NOT add the contact to the newsletter list
// (BREVO_SPONSOR_LIST_ID, if set, is a separate inquiries list), does not
// call any enrichment provider, and sends nothing to any ad platform.
const RL_WINDOW_MS = 10 * 60 * 1000;
const RL_MAX = 5;
const rlHits = new Map<string, { count: number; reset: number }>();
function rateLimited(req: Request): boolean {
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown").trim();
  const now = Date.now();
  if (rlHits.size > 5000) for (const [k, v] of rlHits) if (v.reset < now) rlHits.delete(k);
  const entry = rlHits.get(ip);
  if (!entry || entry.reset < now) {
    rlHits.set(ip, { count: 1, reset: now + RL_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RL_MAX;
}

const FALLBACK = "could not send — please email partners@autopilotindex.com";

export async function POST(req: Request) {
  if (rateLimited(req)) return NextResponse.json({ ok: false, error: "too many attempts — try again later" }, { status: 429 });
  let raw: unknown;
  try { raw = await req.json(); } catch { return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 }); }

  const parsed = sponsorInquirySchema.safeParse(raw);
  if (!parsed.success) {
    if (raw && typeof raw === "object" && (raw as Record<string, unknown>).website_url) {
      return NextResponse.json({ ok: true, message: "Thanks — we'll reply by email." });
    }
    return NextResponse.json({ ok: false, error: "please fill in every required field" }, { status: 422 });
  }
  const d = parsed.data;
  const budget = isSponsorInterest(d.interest) ? d.budget : undefined;
  const scored = leadScore({ email: d.email, formComplete: true, role: d.role, interest: d.interest, budget, signals: d.signals });

  const { BREVO_API_KEY, BREVO_SPONSOR_LIST_ID } = process.env;
  if (!BREVO_API_KEY) return NextResponse.json({ ok: false, error: FALLBACK }, { status: 503 });

  const attributes: Record<string, string | number> = { SOURCE: "sponsor", ...leadAttributes({ name: d.name, company: d.company, role: d.role, interest: d.interest, budget }, scored) };
  if (d.message) attributes.INQUIRY_NOTE = d.message;
  const body: Record<string, unknown> = { email: d.email, updateEnabled: true, attributes: { SOURCE: "sponsor" } };
  if (BREVO_SPONSOR_LIST_ID) body.listIds = [Number(BREVO_SPONSOR_LIST_ID)];

  try {
    const res = await postContactWithAttribution(
      fetch, "https://api.brevo.com/v3/contacts",
      { "api-key": BREVO_API_KEY, "content-type": "application/json" },
      body as { attributes: Record<string, string> },
      attributes,
    );
    if (!res.ok && res.status !== 204) {
      console.error("brevo sponsor inquiry failed:", res.status, await res.text());
      return NextResponse.json({ ok: false, error: FALLBACK }, { status: 502 });
    }
    // Internal only: status shows up in our logs / Brevo, not in the response.
    if (scored.status === "qualified") console.info("sponsor inquiry qualified (internal)", { score: scored.score });
    return NextResponse.json({ ok: true, message: "Thanks — Antonio will reply by email." });
  } catch (err) {
    console.error("brevo sponsor inquiry request failed:", err);
    return NextResponse.json({ ok: false, error: FALLBACK }, { status: 502 });
  }
}
