import test from "node:test";
import assert from "node:assert/strict";
import { subscribeSchema } from "../../lib/subscribe-schema.ts";
import { SIGNUP_PLACEMENTS, signupAttributes } from "../../lib/signup-attribution.ts";

const base = { email: "Reader@Example.com", website_url: "", page: "/" };

test("every known placement is accepted and kept", () => {
  for (const placement of ["home_hero", "header", "company_profile", "pulse_top"]) {
    assert.ok(SIGNUP_PLACEMENTS.includes(placement), placement);
    const r = subscribeSchema.safeParse({ ...base, placement });
    assert.equal(r.success, true, placement);
    assert.equal(r.data.placement, placement);
    assert.equal(r.data.email, "reader@example.com");
  }
});

test("placement is optional, so older forms still subscribe", () => {
  const r = subscribeSchema.safeParse(base);
  assert.equal(r.success, true);
  assert.equal(r.data.placement, undefined);
});

test("an unknown or unsafe placement is dropped, never passed through", () => {
  for (const placement of ["sidebar", "HOME_HERO", "<script>", "home_hero; drop", 42, "x".repeat(500)]) {
    const r = subscribeSchema.safeParse({ ...base, placement });
    assert.equal(r.success, true, String(placement));
    assert.equal(r.data.placement, undefined, String(placement));
  }
});

test("the schema stays strict: other unknown keys are still rejected", () => {
  assert.equal(subscribeSchema.safeParse({ ...base, placement: "home_hero", campaign: "x" }).success, false);
  assert.equal(subscribeSchema.safeParse({ ...base, email: "not-an-email" }).success, false);
  assert.equal(subscribeSchema.safeParse({ ...base, website_url: "http://spam" }).success, false);
});

test("placement becomes SIGNUP_PLACEMENT, ahead of utm_content and the page path", () => {
  assert.deepEqual(signupAttributes({ page: "/", placement: "home_hero" }), { SIGNUP_SOURCE: "site", SIGNUP_PLACEMENT: "home_hero" });
  assert.deepEqual(
    signupAttributes({ page: "/pulse/11-can-it-pay-the-rent", placement: "pulse_top", utm_source: "linkedin", utm_campaign: "pulse-11", utm_content: "post" }),
    { SIGNUP_SOURCE: "linkedin", SIGNUP_PLACEMENT: "pulse_top", SIGNUP_CAMPAIGN: "pulse-11" },
  );
  assert.equal(signupAttributes({ page: "/companies/atoms", utm_content: "top" }).SIGNUP_PLACEMENT, "top");
  assert.equal(signupAttributes({ page: "/companies/atoms" }).SIGNUP_PLACEMENT, "companies/atoms");
});
