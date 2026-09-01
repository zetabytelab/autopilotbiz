import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Gate the private ops cockpit (/live) behind HTTP Basic Auth. Only requests
// carrying the correct credentials get through; everyone else gets a browser
// login prompt. Fails CLOSED — if LIVE_PASSWORD is unset, /live is denied to
// all, so a misconfigured deploy never leaks the numbers.
//
// Set in Vercel (Project → Settings → Environment Variables) and in .env.local:
//   LIVE_USER=antonio
//   LIVE_PASSWORD=<a long random string>
export function proxy(request: NextRequest) {
  const user = process.env.LIVE_USER || "";
  const password = process.env.LIVE_PASSWORD || "";

  // No password configured → deny everyone (fail closed).
  if (!password) {
    return new NextResponse("Not found", { status: 404 });
  }

  const auth = request.headers.get("authorization") || "";
  if (auth.startsWith("Basic ")) {
    try {
      const [u, p] = atob(auth.slice(6)).split(":");
      if (u === user && p === password) {
        return NextResponse.next();
      }
    } catch {
      // malformed header → fall through to challenge
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Autopilot Index ops", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/live", "/live/:path*"],
};
