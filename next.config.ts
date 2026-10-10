import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

// Site-wide security headers. The public API (lib/api/http.ts) and MCP route
// set their own caching; these rules only add hardening plus no-store on the
// private and write surfaces.
//
// CSP is split in two:
// - Enforced: directives that cannot break rendering (framing, <base>, plugins,
//   form targets, mixed content).
// - Report-Only: the full allowlist. Next inlines hydration scripts, BotID runs
//   an obfuscated same-origin challenge, and Vercel previews inject the
//   vercel.live toolbar, none of which can be exercised locally. Watch the
//   browser console / reports on a preview deployment, then promote it to
//   Content-Security-Policy once it is clean.
const CSP_ENFORCED = [
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  // Logos come from Google's favicon service; edition covers are local.
  "img-src 'self' data: blob: https://www.google.com https://*.gstatic.com https://vercel.live https://vercel.com",
  "font-src 'self' data: https://vercel.live https://assets.vercel.com",
  "connect-src 'self' https://va.vercel-scripts.com https://vercel.live wss://ws-us3.pusher.com",
  "frame-src 'self' https://vercel.live",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = [
  // Vercel already sends max-age=63072000; this adds includeSubDomains.
  // "preload" is deliberately left out: it is a hard-to-undo commitment.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: CSP_ENFORCED },
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
];

const NO_STORE = [{ key: "Cache-Control", value: "private, no-store, max-age=0" }];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Private ops cockpit and write/RPC endpoints: never cached anywhere.
      { source: "/live", headers: NO_STORE },
      { source: "/live/:path*", headers: NO_STORE },
      { source: "/mcp", headers: NO_STORE },
      { source: "/api/submit", headers: NO_STORE },
      { source: "/api/subscribe", headers: NO_STORE },
    ];
  },
};

// withBotId appends its own header rule for its challenge path
// (X-Frame-Options SAMEORIGIN, frame-ancestors 'self'); being later, it wins
// there, so the BotID iframe keeps working.
export default withBotId(nextConfig);
