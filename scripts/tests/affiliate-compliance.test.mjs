import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const DISCLOSURE =
  "Some tool links are affiliate links. We may earn a commission at no cost to you. It never affects inclusion or grading.";
const REL = "sponsored nofollow noopener noreferrer";

test("affiliate disclosure text is identical in lib/data.ts, the registry source and the runtime bundle", () => {
  for (const f of ["lib/data.ts", "lib/registry-source/polish.js", "public/registry/runtime.js"]) {
    assert.ok(read(f).includes(DISCLOSURE), `${f} is missing the disclosure text`);
  }
  assert.ok(read("public/registry/runtime.js").includes('class="affiliate-disclosure"'));
});

test("every affiliate link template uses rel=sponsored nofollow noopener noreferrer", () => {
  const polish = read("lib/registry-source/polish.js");
  assert.ok(polish.includes(`'${REL}'`), "registry toolAnchor rel");
  assert.ok(!/noopener noreferrer\$\{toolAffiliate\(t\)\?' sponsored'/.test(polish));
  for (const f of ["app/guides/apify-n8n-lead-machine/page.tsx", "components/StackPyramid.tsx"]) {
    const s = read(f);
    assert.ok(s.includes(`t.referralUrl ? "${REL}"`), `${f} rel`);
    assert.ok(!s.includes('"noopener noreferrer sponsored"'), `${f} still has the old rel`);
  }
  assert.ok(read("app/guides/apify-n8n-lead-machine/page.tsx").includes("AFFILIATE_DISCLOSURE"));
});

test("stack tool referral copy and URLs match between lib/data.ts and content.js", () => {
  const content = read("lib/registry-source/content.js");
  const json = JSON.parse(content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1));
  const data = read("lib/data.ts");
  for (const t of json.stackTools) {
    if (t.referral) assert.ok(data.includes(JSON.stringify(t.referral)), `${t.name} referral copy differs: ${t.referral}`);
    if (t.referralUrl) assert.ok(data.includes(JSON.stringify(t.referralUrl)), `${t.name} referralUrl differs`);
  }
});
