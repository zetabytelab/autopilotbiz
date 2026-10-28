// Lead score v0 (spec: monetisation/2026-10-27-lead-score-v0.md, approved 27 Oct 2026,
// legitimate interests, no consent checkbox). First-party signals only. The score and
// the "qualified" flag are written to our own Brevo contact attributes and nowhere
// else: never sent to an ad platform or an analytics event.
// Enrichment rows (+10 domain match, +5 employee band) are NOT implemented: they wait
// until the privacy section is live and a provider is chosen.

export const LEAD_ROLES = ["founder_ceo", "operator", "investor", "marketer", "engineer", "other"] as const;
export const LEAD_INTERESTS = ["founding_sponsor", "later_sponsor", "newsletter", "partnership"] as const;
export const LEAD_BUDGETS = ["under_500", "500", "750_plus", "not_sure"] as const;
export type LeadRole = (typeof LEAD_ROLES)[number];
export type LeadInterest = (typeof LEAD_INTERESTS)[number];
export type LeadBudget = (typeof LEAD_BUDGETS)[number];

export const ROLE_LABELS: Record<LeadRole, string> = {
  founder_ceo: "Founder/CEO", operator: "Operator", investor: "Investor", marketer: "Marketer", engineer: "Engineer", other: "Other",
};
export const INTEREST_LABELS: Record<LeadInterest, string> = {
  founding_sponsor: "Founding sponsor ($500)", later_sponsor: "Later / $750 band", newsletter: "Newsletter only", partnership: "Partnership or affiliate",
};
export const BUDGET_LABELS: Record<LeadBudget, string> = {
  under_500: "Under $500", "500": "$500", "750_plus": "$750+", not_sure: "Not sure",
};
export const isSponsorInterest = (i?: LeadInterest) => i === "founding_sponsor" || i === "later_sponsor";

/** First-party on-site signals, kept in the reader's own browser until they submit a form. */
export type LeadSignals = {
  sponsorDwell30s?: boolean;
  pulseOpened?: boolean;
  companyCardsViewed?: number;
  dealroomVisited?: boolean;
};

export type LeadInput = {
  email: string;
  formComplete: boolean; // all required /sponsor fields present
  role?: LeadRole;
  interest?: LeadInterest;
  budget?: LeadBudget;
  signals?: LeadSignals;
};

// Small built-in list; a fuller disposable/bounce check needs a provider (later phase).
const DISPOSABLE = new Set(["mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com", "temp-mail.org", "yopmail.com", "trashmail.com", "sharklasers.com", "getnada.com", "dispostable.com"]);
export const isDisposableEmail = (email: string) => DISPOSABLE.has(email.split("@")[1]?.toLowerCase() ?? "");

export type LeadStatus = "qualified" | "nurture" | "ignore";
export const QUALIFIED_THRESHOLD = 60;

export function leadScore(input: LeadInput): { score: number; status: LeadStatus } {
  let s = 0;
  if (input.formComplete) s += 40;
  if (input.role === "founder_ceo" || input.role === "investor") s += 15;
  if (input.budget === "500" || input.budget === "750_plus") s += 15;
  const sig = input.signals ?? {};
  if (sig.sponsorDwell30s) s += 5;
  if (sig.pulseOpened) s += 5;
  if ((sig.companyCardsViewed ?? 0) >= 3 || sig.dealroomVisited) s += 5;
  const disposable = isDisposableEmail(input.email);
  if (disposable) s -= 30;
  if (input.interest === "newsletter") s = Math.min(s, 40);
  const score = Math.max(0, Math.min(100, s));
  const status: LeadStatus = disposable || score < 20 ? "ignore" : score >= QUALIFIED_THRESHOLD ? "qualified" : "nurture";
  return { score, status };
}

/** Brevo contact attributes (all ours). Text attributes except LEAD_SCORE (number). */
export function leadAttributes(p: { name?: string; company?: string; role?: LeadRole; interest?: LeadInterest; budget?: LeadBudget }, scored: { score: number; status: LeadStatus }): Record<string, string | number> {
  const a: Record<string, string | number> = { LEAD_SCORE: scored.score, LEAD_STATUS: scored.status };
  if (p.name) {
    const [first, ...rest] = p.name.trim().split(/\s+/);
    a.FIRSTNAME = first;
    if (rest.length) a.LASTNAME = rest.join(" ");
  }
  if (p.company) a.COMPANY = p.company;
  if (p.role) a.ROLE = p.role;
  if (p.interest) a.INTEREST = p.interest;
  if (p.budget) a.BUDGET_BAND = p.budget;
  return a;
}
