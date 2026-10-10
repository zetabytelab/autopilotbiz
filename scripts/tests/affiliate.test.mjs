import test from "node:test";
import assert from "node:assert/strict";
import { stackTools } from "../../lib/data.ts";
import { AFFILIATE_DISCLOSURE, affiliateDisclosure } from "../../lib/affiliate.ts";

const tool = (name) => stackTools.find((t) => t.name === name);

test("every affiliate link gets the disclosure; plain links get none", () => {
  for (const t of stackTools) {
    const text = affiliateDisclosure(t);
    if (t.referralUrl) assert.ok(text?.startsWith(AFFILIATE_DISCLOSURE), t.name);
    else assert.equal(text, null, t.name);
  }
});

test("only Atoms carries the index-independence note", () => {
  const withNote = stackTools.filter((t) => affiliateDisclosure(t)?.includes("listed in our index"));
  assert.deepEqual(withNote.map((t) => t.name), ["Atoms"]);
  assert.equal(
    affiliateDisclosure(tool("Atoms")),
    `${AFFILIATE_DISCLOSURE} Atoms is also listed in our index, and this link has no effect on its rating or rank.`,
  );
});

test("affiliate copy matches the programmes' current terms", () => {
  assert.equal(tool("Atoms").referral, "Referred users get 10 free credits (per Atoms' referral terms)");
  assert.equal(tool("Firecrawl").referral, "10% off your first purchase");
  assert.equal(tool("Vapi").referral, null);
  assert.ok(!JSON.stringify(tool("Vapi")).includes("15%"));
});
