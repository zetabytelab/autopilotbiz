import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AGENT_MARKDOWN } from "@/lib/agent-markdown";

// Two jobs:
// 1. Gate the private ops cockpit (/live) behind HTTP Basic Auth (fails closed).
// 2. Markdown content negotiation (acceptmarkdown.com): when a request carries
//    `Accept: text/markdown`, serve a markdown representation with the correct
//    Content-Type and `Vary: Accept`. Browsers never send that Accept value, so
//    human-facing behavior and Next's RSC navigation are untouched.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 1. Private /live gate ---
  if (pathname === "/live" || pathname.startsWith("/live/")) {
    const user = process.env.LIVE_USER || "";
    const password = process.env.LIVE_PASSWORD || "";
    if (!password) return new NextResponse("Not found", { status: 404 });

    const auth = request.headers.get("authorization") || "";
    if (auth.startsWith("Basic ")) {
      try {
        const [u, p] = atob(auth.slice(6)).split(":");
        if (u === user && p === password) return NextResponse.next();
      } catch {
        /* malformed header → challenge */
      }
    }
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Autopilot Index ops", charset="UTF-8"' },
    });
  }

  // --- 2. Markdown content negotiation ---
  const accept = request.headers.get("accept") || "";
  if (accept.includes("text/markdown")) {
    const md = AGENT_MARKDOWN[pathname];
    if (md) {
      return new NextResponse(md, {
        status: 200,
        headers: {
          "content-type": "text/markdown; charset=utf-8",
          vary: "Accept, Accept-Encoding",
          "x-content-type-options": "nosniff",
          "cache-control": "public, max-age=0, must-revalidate",
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/live",
    "/live/:path*",
    "/pulse",
    "/pulse/:path*",
    "/news",
    "/submit",
    "/about",
    "/contact",
    "/privacy",
    "/guides/:path*",
  ],
};
