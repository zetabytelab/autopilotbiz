import test from "node:test";
import assert from "node:assert/strict";
import { signupAttributes, postContactWithAttribution } from "../../lib/signup-attribution.ts";

test("UTMs on the page URL become SIGNUP_* attributes", () => {
  assert.deepEqual(
    signupAttributes({ utm_source: "linkedin", utm_campaign: "pulse11", utm_content: "top", page: "/pulse" }),
    { SIGNUP_SOURCE: "linkedin", SIGNUP_CAMPAIGN: "pulse11", SIGNUP_PLACEMENT: "top" },
  );
});

test("without UTMs, source is site and placement is the page path", () => {
  assert.deepEqual(signupAttributes({ page: "/pulse/11-can-it-pay-the-rent" }), {
    SIGNUP_SOURCE: "site",
    SIGNUP_PLACEMENT: "pulse/11-can-it-pay-the-rent",
  });
  assert.deepEqual(signupAttributes({ page: "/" }), { SIGNUP_SOURCE: "site", SIGNUP_PLACEMENT: "home" });
  assert.equal(signupAttributes({ utm_source: "<script>", page: "/news" }).SIGNUP_SOURCE, "script");
});

test("a Brevo 400 on the attributes retries once without them; other results pass through", async () => {
  const calls = [];
  const fake = (statuses) => async (_url, init) => {
    calls.push(JSON.parse(init.body));
    return new Response("{}", { status: statuses[calls.length - 1] });
  };
  const body = { email: "a@example.com", attributes: { SOURCE: "pulse" } };
  const extra = { SIGNUP_SOURCE: "site", SIGNUP_PLACEMENT: "pulse" };
  const warn = console.warn;
  console.warn = () => {};
  try {
    const res = await postContactWithAttribution(fake([400, 201]), "u", {}, body, extra);
    assert.equal(res.status, 201);
    assert.deepEqual(calls[0].attributes, { SOURCE: "pulse", ...extra });
    assert.deepEqual(calls[1].attributes, { SOURCE: "pulse" });
  } finally {
    console.warn = warn;
  }
  calls.length = 0;
  assert.equal((await postContactWithAttribution(fake([201]), "u", {}, body, extra)).status, 201);
  assert.equal(calls.length, 1);
  calls.length = 0;
  assert.equal((await postContactWithAttribution(fake([500]), "u", {}, body, extra)).status, 500);
  assert.equal(calls.length, 1);
});
