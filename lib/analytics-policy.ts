export type FunnelEvent = "profile_view" | "profile_engaged" | "experiment_view" | "calculation_completed" | "signup_request_accepted" | "affiliate_outbound";
export type AnalyticsContext = {
  production: boolean;
  hostname: string;
  pathname: string;
  search?: string;
  doNotTrack?: string | null;
  globalPrivacyControl?: boolean;
  webdriver?: boolean;
  optedOut?: boolean;
};

const publicHosts = new Set(["autopilotindex.com", "www.autopilotindex.com"]);
export const ANALYTICS_COMPANY_SLUGS = ["polsia", "nanocorp", "cofounder", "chainopera-ai", "wordware", "feltsense", "caffeine", "atoms", "semio", "boardy", "base44", "midjourney", "artisan", "lindy", "basis", "delphi", "payman", "rentahuman", "naive", "moritz", "minimal-ai", "lunavo", "beacon-health", "gamma", "retell-ai", "11x", "egbe", "medvi"];
export const ANALYTICS_EDITION_SLUGS = ["08-not-paying-for-speed", "07-the-gate-had-no-buyer", "06-throwaway-computer", "05-two-readers", "04-ai-gateway-wars", "03-never-says-tomorrow", "02-the-bill", "01-org-chart-prompt"];
const publicPaths = new Set([
  "/", "/companies", "/news", "/pulse", "/about", "/pricing", "/privacy", "/contact", "/developers", "/submit", "/experiments/atoms",
  ...ANALYTICS_COMPANY_SLUGS.map((slug) => `/companies/${slug}`),
  ...ANALYTICS_EDITION_SLUGS.map((slug) => `/pulse/${slug}`),
  ...["ai-company-builders", "apify-n8n-lead-machine", "is-n8n-obsolete", "agent-ready-web", "ai-gateways"].map((slug) => `/guides/${slug}`),
]);

export function analyticsAllowed(context: AnalyticsContext): boolean {
  return context.production && publicHosts.has(context.hostname)
    && context.doNotTrack !== "1" && !context.globalPrivacyControl && !context.webdriver && !context.optedOut
    && new URLSearchParams(context.search).get("analytics") !== "off"
    && safeAnalyticsPath(context.pathname) !== null;
}

/** Only public routes; queries, fragments and free-form path values never enter analytics. */
export function safeAnalyticsPath(pathname: string): string | null {
  return publicPaths.has(pathname) ? pathname : null;
}

export function funnelPayload(event: FunnelEvent, pathname: string, detail?: string): Record<string, string> | null {
  const page = safeAnalyticsPath(pathname);
  if (!page) return null;
  if ((event === "profile_view" || event === "profile_engaged") && !page.startsWith("/companies/")) return null;
  if (event === "experiment_view" && !page.startsWith("/experiments/")) return null;
  if (event === "signup_request_accepted") {
    return detail === "confirmation_requested" || detail === "subscribed" ? { page, status: detail } : null;
  }
  if (event === "affiliate_outbound") {
    try {
      const url = new URL(detail ?? "");
      return url.protocol === "https:" && !publicHosts.has(url.hostname) ? { page, destination: url.hostname } : null;
    } catch { return null; }
  }
  if (event === "calculation_completed") {
    return detail && /^[a-z0-9-]{1,50}$/.test(detail) ? { page, calculator: detail } : null;
  }
  return { page };
}
