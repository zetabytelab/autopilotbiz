"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { recordLeadSignal } from "@/lib/lead-signals";
import { canTrackAnalytics, configureAnalytics, redactAnalyticsEvent, trackFunnelEvent } from "@/lib/analytics";

export default function AnalyticsEvents({ production }: { production: boolean }) {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const lastView = useRef<string | null>(null);

  useEffect(() => {
    configureAnalytics(production);
    // Lead score v0: first-party signals kept in this browser (lib/lead-signals.ts),
    // independent of Vercel Analytics, sent only with a form the reader submits.
    if (pathname.startsWith("/companies/")) recordLeadSignal("company", pathname.slice("/companies/".length));
    if (pathname.startsWith("/pulse/")) recordLeadSignal("pulse_open");
    if (pathname === "/dealroom") recordLeadSignal("dealroom");
    let sponsorTimer: ReturnType<typeof setTimeout> | undefined;
    if (pathname === "/sponsor") sponsorTimer = setTimeout(() => { recordLeadSignal("sponsor_dwell"); trackFunnelEvent("sponsor_engaged"); }, 30_000);
    const clearSponsor = () => { if (sponsorTimer) clearTimeout(sponsorTimer); };
    setEnabled(canTrackAnalytics());
    if (!canTrackAnalytics()) return clearSponsor;
    if (lastView.current !== pathname) {
      lastView.current = pathname;
      if (pathname.startsWith("/companies/")) trackFunnelEvent("profile_view");
      if (pathname.startsWith("/experiments/")) trackFunnelEvent("experiment_view");
    }

    // Count 30 seconds of visible reading, once per profile visit.
    let remaining = 30_000;
    let started = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => {
      if (timer) { clearTimeout(timer); timer = undefined; remaining -= Date.now() - started; }
    };
    const start = () => {
      if (timer || remaining <= 0 || document.visibilityState !== "visible" || !pathname.startsWith("/companies/")) return;
      started = Date.now();
      timer = setTimeout(() => { remaining = 0; timer = undefined; trackFunnelEvent("profile_engaged"); }, remaining);
    };
    const visibility = () => { if (document.visibilityState === "visible") start(); else stop(); };
    const outbound = (event: MouseEvent) => {
      if (!event.isTrusted || (event.type === "auxclick" && event.button !== 1)) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[rel~='sponsored']") : null;
      if (link) trackFunnelEvent("affiliate_outbound", link.href);
    };
    start();
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("click", outbound);
    document.addEventListener("auxclick", outbound);
    return () => { clearSponsor(); stop(); document.removeEventListener("visibilitychange", visibility); document.removeEventListener("click", outbound); document.removeEventListener("auxclick", outbound); };
  }, [pathname, production]);

  if (!enabled) return null;
  return <Analytics mode="production" beforeSend={redactAnalyticsEvent} />;
}
