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

const DEFAULT_CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

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
