import { NextResponse } from "next/server";

// Shared HTTP concerns for the public data API and MCP server. Every response
// carries security headers; reads are cacheable at the CDN (the primary DoS
// defense for a read-only public API); errors are structured JSON that never
// leak internals.

export const API_BASE = "https://autopilotindex.com";
export const API_VERSION = "v1";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
};

function cors(methods: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version",
    "Access-Control-Max-Age": "86400",
  };
}

type JsonOpts = {
  status?: number;
  cache?: string;
  methods?: string;
};

// The data behind every GET changes at most once a day (the daily Pulse
// refresh commit triggers a deploy, and a deploy purges Vercel's CDN cache).
// So the CDN may hold a response for a day and keep serving it for another
// day while it revalidates in the background; browsers and API clients
// re-check after 5 minutes. Errors, MCP and POSTs stay no-store.
export const PUBLIC_GET_CACHE = "public, max-age=300, s-maxage=86400, stale-while-revalidate=86400";
const DEFAULT_CACHE = PUBLIC_GET_CACHE;

export function apiJson(data: unknown, opts: JsonOpts = {}): NextResponse {
  const { status = 200, cache = DEFAULT_CACHE, methods = "GET, OPTIONS" } = opts;
  return NextResponse.json(data, {
    status,
    headers: {
      ...SECURITY_HEADERS,
      ...cors(methods),
      "Cache-Control": cache,
      Vary: "Accept, Origin",
    },
  });
}

export function apiError(status: number, code: string, message: string, methods = "GET, OPTIONS"): NextResponse {
  return apiJson({ error: { code, message } }, { status, cache: "no-store", methods });
}

export function preflight(methods = "GET, OPTIONS"): NextResponse {
  return new NextResponse(null, { status: 204, headers: cors(methods) });
}

export function methodNotAllowed(allow = "GET, OPTIONS"): NextResponse {
  const res = apiError(405, "method_not_allowed", `Method not allowed. Allowed methods: ${allow}.`, allow);
  res.headers.set("Allow", allow);
  return res;
}
