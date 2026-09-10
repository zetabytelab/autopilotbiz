import test from "node:test";
import assert from "node:assert/strict";
import { analyticsAllowed, funnelPayload, safeAnalyticsPath, ANALYTICS_COMPANY_SLUGS, ANALYTICS_EDITION_SLUGS } from "../../lib/analytics-policy.ts";
import { companies } from "../../lib/data.ts";
import { editions } from "../../lib/editions.ts";
import { configureAnalytics, trackFunnelEvent } from "../../lib/analytics.ts";

const production = { production: true, hostname: "autopilotindex.com", pathname: "/companies/atoms" };

test("analytics excludes development, previews, automated tests, and privacy opt-outs", () => {
  assert.equal(analyticsAllowed(production), true);
  for (const context of [{ production: false }, { hostname: "localhost" }, { hostname: "autopilotbiz-preview.vercel.app" }, { webdriver: true }, { doNotTrack: "1" }, { globalPrivacyControl: true }, { optedOut: true }, { search: "?analytics=off" }, { pathname: "/live" }]) {
    assert.equal(analyticsAllowed({ ...production, ...context }), false, JSON.stringify(context));
  }
});

test("only public route paths enter events, with no query strings or fragments", () => {
  assert.equal(safeAnalyticsPath("/experiments/atoms"), "/experiments/atoms");
  for (const path of ["/companies/atoms?email=private@example.com", "/companies/private-person", "/pulse/private-person", "/news#secret", "/api/subscribe", "/live", "/styles/radar", "/unknown/secret"]) assert.equal(safeAnalyticsPath(path), null);
});

test("signup acceptance is separate from confirmation and requires recognized provider status", () => {
  assert.deepEqual(funnelPayload("signup_request_accepted", "/news", "confirmation_requested"), { page: "/news", status: "confirmation_requested" });
  for (const value of [undefined, "confirmed", "1", "private@example.com"]) assert.equal(funnelPayload("signup_request_accepted", "/news", value), null);
});

test("affiliate events retain destination hostname only, never referral tokens", () => {
  assert.deepEqual(funnelPayload("affiliate_outbound", "/", "https://example.com/join?ref=secret#private"), { page: "/", destination: "example.com" });
  assert.equal(funnelPayload("affiliate_outbound", "/", "javascript:alert(1)"), null);
  assert.equal(funnelPayload("affiliate_outbound", "/", "https://autopilotindex.com/"), null);
});

test("engagement and completion contracts reject wrong pages and free-form inputs", () => {
  assert.equal(funnelPayload("profile_engaged", "/news"), null);
  assert.equal(funnelPayload("experiment_view", "/companies/atoms"), null);
  assert.deepEqual(funnelPayload("calculation_completed", "/experiments/atoms", "solo-margin-v1"), { page: "/experiments/atoms", calculator: "solo-margin-v1" });
  assert.equal(funnelPayload("calculation_completed", "/experiments/atoms", "customer@example.com"), null);
});

test("public analytics paths track canonical company and edition slugs", () => {
  assert.deepEqual([...ANALYTICS_COMPANY_SLUGS].sort(), companies.map((company) => company.slug).sort());
  assert.deepEqual([...ANALYTICS_EDITION_SLUGS].sort(), editions.map((edition) => edition.slug).sort());
});

test("the real Vercel SDK receives sanitized events, queues initial views, and blocks test traffic", () => {
  const originals = new Map(["window", "navigator", "localStorage"].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const delivered = [];
  try {
    Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { hostname: "autopilotindex.com", pathname: "/companies/atoms", search: "?email=private@example.com" } } });
    Object.defineProperty(globalThis, "navigator", { configurable: true, value: { webdriver: false } });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => null } });
    configureAnalytics(true);
    assert.equal(trackFunnelEvent("profile_view"), true);
    assert.equal(window.vaq[0][0], "beforeSend");
    assert.deepEqual(window.vaq[0][1]({ type: "event", url: "https://autopilotindex.com/companies/atoms?email=private@example.com#secret" }), { type: "event", url: "https://autopilotindex.com/companies/atoms" });
    assert.deepEqual(window.vaq[1], ["event", { name: "profile_view", data: { page: "/companies/atoms" }, options: undefined }]);
    window.va = (...args) => delivered.push(args);
    assert.equal(trackFunnelEvent("affiliate_outbound", "https://vendor.example/signup?ref=secret"), true);
    assert.deepEqual(delivered, [["event", { name: "affiliate_outbound", data: { page: "/companies/atoms", destination: "vendor.example" }, options: undefined }]]);
    navigator.webdriver = true;
    assert.equal(trackFunnelEvent("profile_view"), false);
    assert.equal(delivered.length, 1);
    navigator.webdriver = false;
    window.va = () => { throw new Error("blocked SDK"); };
    assert.doesNotThrow(() => trackFunnelEvent("profile_view"));
  } finally {
    configureAnalytics(false);
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
});
