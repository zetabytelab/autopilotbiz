import { z } from "zod";
import { SIGNUP_PLACEMENTS } from "./signup-attribution.ts";

// Request body for POST /api/subscribe. Strict: unknown keys are rejected.
// `placement` names the box the reader used (see SIGNUP_PLACEMENTS). An
// unrecognised placement is dropped (treated as absent) rather than failing
// a real signup; it can never reach Brevo as free text.
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
  })
  .strict();

export type SubscribeBody = z.infer<typeof subscribeSchema>;
