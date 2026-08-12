import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

// Same in-process throttle pattern as /api/submit: 5 attempts / 10 min / IP.
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

const schema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(200),
    // Honeypot — real users never fill this.
    website_url: z.string().max(0).optional().or(z.literal("")),
    // Attribution (both optional): ?ref= campaign tag + pathname the form was on.
    ref: z.string().max(100).optional(),
    page: z.string().max(200).optional(),
  })
  .strict();

// Collapse untrusted attribution input to a short [a-z0-9_-] slug.
const slug = (s: string | undefined) =>
  (s ?? "")
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 24);

export async function POST(req: Request) {
  if (rateLimited(req)) {
    return NextResponse.json({ ok: false, error: "too many attempts — try again later" }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    // Honeypot trips land here too — same generic success, teach bots nothing.
    if (raw && typeof raw === "object" && (raw as Record<string, unknown>).website_url) {
      return NextResponse.json({ ok: true, message: "You're on the list." });
    }
    return NextResponse.json({ ok: false, error: "enter a valid email" }, { status: 422 });
  }

  const { BREVO_API_KEY, BREVO_LIST_ID } = process.env;
  if (!BREVO_API_KEY || !BREVO_LIST_ID) {
    return NextResponse.json({ ok: false, error: "newsletter is warming up — check back soon" }, { status: 503 });
  }

  // e.g. "news", "news:li", "home:x" — page the form was on, plus campaign ref.
  const page = slug(parsed.data.page) || "news";
  const ref = slug(parsed.data.ref);
  const source = ref ? `${page}:${ref}` : page;

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "api-key": BREVO_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        email: parsed.data.email,
        listIds: [Number(BREVO_LIST_ID)],
        updateEnabled: true,
        attributes: { SOURCE: source },
      }),
    });
    // 201 created, 204 already existed & updated — both fine.
    if (!res.ok && res.status !== 204) {
      console.error("brevo contact create failed:", res.status, await res.text());
      return NextResponse.json({ ok: false, error: "could not subscribe, try again later" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, message: "You're on the list." });
  } catch (err) {
    console.error("brevo request failed:", err);
    return NextResponse.json({ ok: false, error: "could not subscribe, try again later" }, { status: 502 });
  }
}
