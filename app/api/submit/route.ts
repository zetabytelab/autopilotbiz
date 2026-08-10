import { NextResponse } from "next/server";
import { checkBotId } from "botid/server";
import { App } from "octokit";
import { companies } from "@/lib/data";
import { buildIssueBody, signFormToken, submissionSchema, verifyFormToken } from "@/lib/submission";
import candidatesData from "@/data/candidates.json";

export const runtime = "nodejs";

// GET — mint a signed form token (page is static; token must be fresh).
export async function GET() {
  return NextResponse.json({ token: signFormToken() }, { headers: { "cache-control": "no-store" } });
}

const GENERIC_OK = { ok: true, message: "Thanks! Your submission is queued for review." };

// In-process fixed-window rate limit: 3 submissions / 10 min / IP. Best-effort —
// state lives on the warm function instance (Fluid Compute reuses instances), so
// it resets on cold starts and isn't shared across regions. Good enough as a free
// throttle on top of the token/BotID/honeypot layers.
const RL_WINDOW_MS = 10 * 60 * 1000;
const RL_MAX = 3;
const rlHits = new Map<string, { count: number; reset: number }>();
function rateLimited(req: Request): boolean {
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
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

function domainOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  // ⓪ Rate limit before any work.
  if (rateLimited(req)) {
    return NextResponse.json({ ok: false, error: "too many submissions — try again later" }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  // ① Honeypot: pretend success, create nothing (don't teach bots they failed).
  if (raw && typeof raw === "object" && (raw as Record<string, unknown>).website_url) {
    return NextResponse.json(GENERIC_OK);
  }

  // ② Signed form token: min fill time 4s, 1h expiry, HMAC-verified.
  const token = (raw as Record<string, unknown>)?.token;
  const tokenCheck = typeof token === "string" ? verifyFormToken(token) : { ok: false as const, reason: "missing" };
  if (!tokenCheck.ok) {
    return NextResponse.json({ ok: false, error: `form token rejected (${tokenCheck.reason})` }, { status: 403 });
  }

  // ③ BotID: deny classified bots AND verified AI agents (Operator etc.).
  // Only available on Vercel infrastructure — locally the remaining layers
  // (token, honeypot, validation, rate limit) still apply.
  if (process.env.VERCEL) {
    const verdict = await checkBotId();
    if (verdict.isBot || verdict.isVerifiedBot) {
      return NextResponse.json({ ok: false, error: "automated clients cannot submit" }, { status: 403 });
    }
  }

  // ④ Strict validation.
  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation failed", issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) },
      { status: 422 },
    );
  }
  const sub = parsed.data;

  // ⑤ Dedupe against tracked companies and radar candidates.
  const dom = domainOf(sub.url);
  const known = new Set(
    [
      ...companies.map((c) => (c.url ? domainOf(c.url) : null)),
      ...candidatesData.candidates.flatMap((c) => c.evidence.map((e) => domainOf(e.url))),
    ].filter(Boolean) as string[],
  );
  const trackedNames = new Set(companies.map((c) => c.name.toLowerCase().replace(/\s*\(.*\)/, "")));
  if ((dom && known.has(dom) && companies.some((c) => c.url && domainOf(c.url) === dom)) || trackedNames.has(sub.name.toLowerCase())) {
    return NextResponse.json({ ok: false, error: "already tracked — thanks anyway!" }, { status: 409 });
  }

  // ⑥ Create the GitHub issue (App auth: ~1h installation tokens, Issues-only).
  const { GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, GITHUB_APP_INSTALLATION_ID, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } =
    process.env;

  const { title, body } = buildIssueBody(sub);

  if (!GITHUB_APP_ID || !GITHUB_APP_PRIVATE_KEY || !GITHUB_APP_INSTALLATION_ID) {
    if (process.env.SUBMISSIONS_DRY_RUN === "1") {
      console.log("[submit dry-run]", title, "\n", body.slice(0, 400));
      return NextResponse.json({ ...GENERIC_OK, issueUrl: null, dryRun: true });
    }
    return NextResponse.json({ ok: false, error: "submissions are temporarily offline" }, { status: 503 });
  }

  try {
    const app = new App({
      appId: GITHUB_APP_ID,
      privateKey: Buffer.from(GITHUB_APP_PRIVATE_KEY, "base64").toString("utf8"),
    });
    const octokit = await app.getInstallationOctokit(Number(GITHUB_APP_INSTALLATION_ID));
    const res = await octokit.rest.issues.create({
      owner: GITHUB_REPO_OWNER ?? "zetabytelab",
      repo: GITHUB_REPO_NAME ?? "autopilotbiz",
      title,
      body,
      labels: ["submission", "unverified"],
    });
    return NextResponse.json({ ...GENERIC_OK, issueUrl: res.data.html_url });
  } catch (err) {
    console.error("issue creation failed:", err);
    return NextResponse.json({ ok: false, error: "could not queue submission, try again later" }, { status: 502 });
  }
}
