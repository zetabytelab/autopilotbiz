"use client";

import { track, type BeforeSendEvent } from "@vercel/analytics";
import { analyticsAllowed, funnelPayload, safeAnalyticsPath, type FunnelEvent } from "./analytics-policy.ts";

let productionEnabled = false;

export function configureAnalytics(production: boolean) {
  productionEnabled = production;
}

export function canTrackAnalytics(): boolean {
  if (typeof window === "undefined") return false;
  let optedOut = false;
  try { optedOut = localStorage.getItem("autopilot-analytics") === "off"; } catch { return false; }
  return analyticsAllowed({
    production: productionEnabled,
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    search: window.location.search,
    doNotTrack: navigator.doNotTrack,
    globalPrivacyControl: (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl,
    webdriver: navigator.webdriver,
    optedOut,
  });
}

export function trackFunnelEvent(event: FunnelEvent, detail?: string): boolean {
  if (!canTrackAnalytics()) return false;
  const payload = funnelPayload(event, window.location.pathname, detail);
  if (!payload) return false;
  try {
    // Route effects can run before the SDK component loads its script. Use its
    // documented queue contract so the first profile view is not silently lost.
    if (!window.va) {
      window.va = (name, properties) => { (window.vaq ??= []).push([name, properties]); };
      window.va("beforeSend", redactAnalyticsEvent);
    }
    track(event, payload);
    return true;
  } catch { return false; }
}

export function redactAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  if (!canTrackAnalytics()) return null;
  try {
    const path = safeAnalyticsPath(new URL(event.url).pathname);
    return path ? { ...event, url: `https://autopilotindex.com${path}` } : null;
  } catch { return null; }
}

/** Call only after a future calculator successfully renders a result; never pass inputs. */
export function trackCalculationCompleted(calculatorId: string): boolean {
  return trackFunnelEvent("calculation_completed", calculatorId);
}
