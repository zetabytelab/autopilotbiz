// Run against an already-running local production server.
// node scripts/verify-financial-http.mjs http://127.0.0.1:3094
import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://127.0.0.1:3094";
async function json(path) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  return response.json();
}
const [ranked, defaultList, base44, polsia, gamma, medvi, spec] = await Promise.all([
  json("/api/v1/companies?sort=arr&limit=100"), json("/api/v1/companies?limit=100"),
  ...["base44", "polsia", "gamma", "medvi"].map((slug) => json("/api/v1/companies/" + slug)),
  json("/openapi.json"),
]);
assert.equal(ranked.items[0].slug, "base44");
assert.equal(defaultList.items[0].slug, "medvi");
assert.equal(base44.metrics.arrUsd, 150e6);
assert.equal(base44.metrics.headcount.asOf, "2025-06-18");
assert.ok(base44.metrics.observations.some((entry) => entry.kind === "arr" && entry.status === "estimated" && entry.value === 3.5e6));
assert.equal(polsia.metrics.arrUsd, null);
assert.equal(polsia.metrics.arr, null);
assert.equal(gamma.metrics.arrUsd, null);
assert.equal(gamma.metrics.headcount.value, 50);
assert.equal(medvi.metrics.arrUsd, null);
assert.ok(medvi.metrics.observations.some((entry) => entry.kind === "revenue_projection"));
assert.equal(spec.paths["/companies"].get.parameters.find((p) => p.name === "sort").schema.default, "evidence");
assert.ok(spec.components.schemas.MetricObservation);

for (const [path, expected] of [
  ["/", ["Financial measure", "All measures", "Not comparable", "Source not rechecked"]],
  ["/companies/base44", ["Financial and headcount history", "base44-under-wix", "2025-06-18", "unconfirmed estimate"]],
  ["/companies/gamma", ["50 employees", "superseded", "2025-11-10"]],
  ["/companies/medvi", ["Revenue projection", "2025-01-01", "Observation date unknown"]],
  ["/guides/ai-company-builders", ["Financial observation", "Approaching"]],
]) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  const html = await response.text();
  for (const text of expected) assert.ok(html.toLowerCase().includes(text.toLowerCase()), path + ": " + text);
}
const mcpResponse = await fetch(new URL("/mcp", base), {
  method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "get_company", arguments: { slug: "polsia" } } }),
});
assert.equal(mcpResponse.status, 200);
const mcp = await mcpResponse.json();
assert.ok(!mcp.error, JSON.stringify(mcp));
assert.ok(!mcp.result.isError);
const payload = JSON.parse(mcp.result.content.find((entry) => entry.type === "text").text);
assert.equal(payload.metrics.arrUsd, null);
assert.ok(payload.metrics.observations.some((entry) => entry.kind === "annual_run_rate"));
console.log("PASS: ARR-only ranking, evidence default, dated financial/headcount history, OpenAPI, five rendered pages and MCP response.");
