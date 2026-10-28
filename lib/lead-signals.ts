"use client";

// First-party lead signals (lead score v0). Stored only in this browser's
// localStorage and sent to our own /api routes when the reader submits a form.
// Never sent to analytics or an ad platform. Respects Do Not Track, Global
// Privacy Control and the site's analytics opt-out.
import type { LeadSignals } from "./lead-score.ts";

const KEY = "ap_lead_signals";
type Stored = { sponsorDwell30s?: boolean; pulseOpened?: boolean; companies?: string[]; dealroomVisited?: boolean };

function allowed(): boolean {
  try {
    if (navigator.doNotTrack === "1") return false;
    if ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return false;
    if (localStorage.getItem("autopilot-analytics") === "off") return false;
    return true;
  } catch { return false; }
}
function read(): Stored {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Stored; } catch { return {}; }
}
function write(s: Stored) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function recordLeadSignal(kind: "sponsor_dwell" | "pulse_open" | "dealroom" | "company", slug?: string) {
  if (typeof window === "undefined" || !allowed()) return;
  const s = read();
  if (kind === "sponsor_dwell") s.sponsorDwell30s = true;
  if (kind === "pulse_open") s.pulseOpened = true;
  if (kind === "dealroom") s.dealroomVisited = true;
  if (kind === "company" && slug && /^[a-z0-9-]{1,60}$/.test(slug)) {
    const set = new Set(s.companies ?? []);
    set.add(slug);
    s.companies = [...set].slice(0, 100);
  }
  write(s);
}

export function readLeadSignals(): LeadSignals | undefined {
  if (typeof window === "undefined" || !allowed()) return undefined;
  const s = read();
  return {
    sponsorDwell30s: Boolean(s.sponsorDwell30s),
    pulseOpened: Boolean(s.pulseOpened),
    companyCardsViewed: (s.companies ?? []).length,
    dealroomVisited: Boolean(s.dealroomVisited),
  };
}
