import test from "node:test";
import assert from "node:assert/strict";
import { editions } from "../../lib/editions.ts";
import { editionJsonLd, jsonLdScript } from "../../lib/edition-jsonld.ts";
import { llmsTxt } from "../../lib/llms.ts";

test("llms.txt lists every edition with title, URL and date, newest first", () => {
  const txt = llmsTxt();
  assert.match(txt, /## Autopilot Pulse editions/);
  assert.match(txt, /## When to use this site/);
  const latest = editions.slice().sort((a, b) => b.number - a.number)[0];
  assert.ok(txt.includes(`- [Autopilot Pulse #${latest.number}: ${latest.title}](https://autopilotindex.com/pulse/${latest.slug}) (${latest.date})`));
});

test("edition Article JSON-LD uses the edition date and canonical URL", () => {
  for (const e of editions) {
    const ld = JSON.parse(jsonLdScript(editionJsonLd(e)));
    assert.equal(ld["@type"], "Article");
    assert.equal(ld.datePublished, e.date);
    assert.equal(ld.dateModified, e.date);
    assert.equal(ld.mainEntityOfPage["@id"], `https://autopilotindex.com/pulse/${e.slug}`);
    assert.equal(ld.author.name, "Antonio Serrano");
    assert.ok(ld.description.length > 0);
  }
});
