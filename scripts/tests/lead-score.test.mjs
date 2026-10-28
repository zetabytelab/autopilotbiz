import test from "node:test";
import assert from "node:assert/strict";
import { leadScore, leadAttributes } from "../../lib/lead-score.ts";
import { sponsorInquirySchema, subscribeSchema } from "../../lib/subscribe-schema.ts";

const base = { email: "a@acme.io", name: "Ada Lovelace", company: "Acme", role: "founder_ceo", interest: "founding_sponsor", budget: "500" };

test("full sponsor form from a founder with budget is qualified (>=60)", () => {
  const r = leadScore({ email: base.email, formComplete: true, role: "founder_ceo", interest: "founding_sponsor", budget: "500" });
  assert.deepEqual(r, { score: 70, status: "qualified" });
});
test("first-party signals add 5 each; cards OR dealroom counts once", () => {
  const r = leadScore({ email: base.email, formComplete: true, signals: { sponsorDwell30s: true, pulseOpened: true, companyCardsViewed: 3, dealroomVisited: true } });
  assert.equal(r.score, 55);
});
test("newsletter-only is capped at 40; disposable is ignored", () => {
  assert.equal(leadScore({ email: base.email, formComplete: true, role: "investor", budget: "750_plus", interest: "newsletter" }).score, 40);
  assert.equal(leadScore({ email: "x@mailinator.com", formComplete: true, role: "investor", budget: "500" }).status, "ignore");
});
test("budget is required only for sponsor interest", () => {
  const { budget, ...noBudget } = base;
  assert.equal(sponsorInquirySchema.safeParse(noBudget).success, false);
  assert.equal(sponsorInquirySchema.safeParse({ ...noBudget, interest: "partnership" }).success, true);
  assert.equal(sponsorInquirySchema.safeParse(base).success, true);
});
test("subscribe accepts optional qualifiers and drops unknown options", () => {
  const r = subscribeSchema.safeParse({ email: "r@x.com", name: "R", role: "ceo-ish", signals: { evil: 1 } });
  assert.equal(r.success, true);
  assert.equal(r.data.role, undefined);
  assert.equal(r.data.signals, undefined);
});
test("attributes split name and never include a qualified ad event", () => {
  const a = leadAttributes({ name: "Ada Lovelace", role: "founder_ceo" }, { score: 70, status: "qualified" });
  assert.deepEqual(a, { LEAD_SCORE: 70, LEAD_STATUS: "qualified", FIRSTNAME: "Ada", LASTNAME: "Lovelace", ROLE: "founder_ceo" });
});
