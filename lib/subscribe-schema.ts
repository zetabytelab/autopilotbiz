import { z } from "zod";
import { SIGNUP_PLACEMENTS } from "./signup-attribution.ts";
import { LEAD_BUDGETS, LEAD_INTERESTS, LEAD_ROLES } from "./lead-score.ts";

const text = (max: number) => z.string().trim().max(max).optional();

// First-party on-site signals sent with a form (see lib/lead-signals.ts). Malformed → dropped.
export const leadSignalsSchema = z
  .object({
    sponsorDwell30s: z.boolean().optional(),
    pulseOpened: z.boolean().optional(),
    companyCardsViewed: z.number().int().min(0).max(1000).optional(),
    dealroomVisited: z.boolean().optional(),
  })
  .strict()
  .optional()
  .catch(undefined);

// Request body for POST /api/subscribe. Strict: unknown keys are rejected.
// `placement` names the box the reader used (see SIGNUP_PLACEMENTS). An
// unrecognised placement is dropped (treated as absent) rather than failing
// a real signup; it can never reach Brevo as free text.
// Qualifier fields (name, role, company, interest) are optional server-side so
// older cached forms still subscribe; the form marks name and role required.
export const subscribeSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(200),
    // Honeypot — real users never fill this.
    website_url: z.string().max(0).optional().or(z.literal("")),
    // Attribution (both optional): ?ref= campaign tag + pathname the form was on.
    ref: z.string().max(100).optional(),
    page: z.string().max(200).optional(),
    // Which signup box on the page was used (optional, fixed list).
    placement: z.enum(SIGNUP_PLACEMENTS).optional().catch(undefined),
    // UTMs from the form page's URL → SIGNUP_* Brevo attributes (optional).
    utm_source: z.string().max(100).optional(),
    utm_campaign: z.string().max(100).optional(),
    utm_content: z.string().max(100).optional(),
    // Lead score v0 qualifiers (optional). Unknown option values are dropped.
    name: text(100),
    company: text(120),
    role: z.enum(LEAD_ROLES).optional().catch(undefined),
    interest: z.enum(LEAD_INTERESTS).optional().catch(undefined),
    signals: leadSignalsSchema,
  })
  .strict();

export type SubscribeBody = z.infer<typeof subscribeSchema>;

// POST /api/sponsor-inquiry: the /sponsor form. All fields required except
// budget, which is required only when interest is a sponsor option.
export const sponsorInquirySchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(200),
    website_url: z.string().max(0).optional().or(z.literal("")),
    name: z.string().trim().min(1).max(100),
    company: z.string().trim().min(1).max(120),
    role: z.enum(LEAD_ROLES),
    interest: z.enum(LEAD_INTERESTS),
    budget: z.enum(LEAD_BUDGETS).optional(),
    message: text(1000),
    signals: leadSignalsSchema,
  })
  .strict()
  .refine((d) => !(d.interest === "founding_sponsor" || d.interest === "later_sponsor") || d.budget !== undefined, {
    message: "budget band is required for sponsor interest",
    path: ["budget"],
  });

export type SponsorInquiryBody = z.infer<typeof sponsorInquirySchema>;
