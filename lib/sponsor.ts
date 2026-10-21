// Sponsorship constants for /sponsor, /pricing and edition sponsor placements.
// Source for every figure: /workspace/sponsor/2026-10-19-sponsor-page-draft.md (v2).

/** Founding slots still unsold. Edit this one number when a founding slot sells (0–3). */
export const FOUNDING_SLOTS_LEFT = 3;
export const FOUNDING_SLOTS_TOTAL = 3;

export const SPONSOR_EMAIL = "partners@autopilotindex.com";
export const SPONSOR_MAILTO = `mailto:${SPONSOR_EMAIL}?subject=Sponsor%20Autopilot%20Pulse`;

export const PRICES = {
  founding: { edition: 500, bundle3: 1350, bundle3Each: 450 },
  standard: { edition: 750, bundle3: 2025, bundle3Each: 675 },
  bundleDiscountPct: 10,
} as const;

/** The only audience figures allowed on the sponsor page, each with its date. */
export const AUDIENCE = {
  linkedinSubscribers: { value: "1,015", asOf: "19 Oct 2026" },
  founderShare: { value: "14%", asOf: "1 Sep 2026" },
} as const;

export const SPONSOR_REL = "sponsored noopener noreferrer";

/** Adds utm_source=autopilotindex&utm_medium=newsletter unless the sponsor sent their own UTM tags. */
export function sponsorUrl(url: string): string {
  try {
    const u = new URL(url);
    if ([...u.searchParams.keys()].some((k) => k.startsWith("utm_"))) return url;
    u.searchParams.set("utm_source", "autopilotindex");
    u.searchParams.set("utm_medium", "newsletter");
    return u.toString();
  } catch {
    return url;
  }
}

export function slotsLine(left = FOUNDING_SLOTS_LEFT): string {
  return `${left} of ${FOUNDING_SLOTS_TOTAL} founding slots left`;
}
