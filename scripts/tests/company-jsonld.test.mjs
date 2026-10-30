import test from "node:test";
import assert from "node:assert/strict";
import { companies } from "../../lib/data.ts";
import { companyJsonLd, serializeJsonLd } from "../../lib/company-jsonld.ts";

test("every company gets an Organization and a 3-step BreadcrumbList", () => {
  for (const company of companies) {
    const ld = companyJsonLd(company);
    assert.equal(ld["@context"], "https://schema.org");
    const [org, crumbs] = ld["@graph"];
    assert.equal(org["@type"], "Organization");
    assert.equal(org.name, company.name);
    assert.equal(crumbs["@type"], "BreadcrumbList");
    assert.deepEqual(crumbs.itemListElement.map((i) => i.position), [1, 2, 3]);
    assert.equal(crumbs.itemListElement[2].item, `https://autopilotindex.com/companies/${company.slug}`);
  }
});

test("Organization only carries values present in lib/data.ts", () => {
  const allowed = new Set(["@type", "@id", "name", "description", "url", "slogan", "founder"]);
  for (const company of companies) {
    const org = companyJsonLd(company)["@graph"][0];
    for (const key of Object.keys(org)) assert.ok(allowed.has(key), `${company.slug}: unexpected ${key}`);
    assert.equal(org.description, company.description);
    assert.equal(org.url, company.url ?? undefined, `${company.slug}: url must mirror data.ts`);
    if (company.tagline) assert.equal(org.slogan, company.tagline);
    assert.deepEqual((org.founder ?? []).map((f) => f.name), company.founders.map((f) => f.name));
  }
});

test("serialized JSON-LD cannot close its script tag", () => {
  const out = serializeJsonLd({ x: "</script><script>alert(1)</script>" });
  assert.ok(!out.includes("</script"));
  assert.deepEqual(JSON.parse(out), { x: "</script><script>alert(1)</script>" });
});
