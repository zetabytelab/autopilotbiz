import { apiJson, preflight, methodNotAllowed, API_BASE } from "@/lib/api/http";

// OpenAPI 3.1 description of the public API. Served at /openapi.json.
const spec = {
  openapi: "3.1.0",
  info: {
    title: "The Autopilot Index API",
    version: "1.1.0",
    description:
      "Read-only public API over The Autopilot Index: companies run by AI, their tech stacks, and the weekly editions. All data is public; no authentication required.",
    contact: { name: "The Autopilot Index", url: `${API_BASE}/contact` },
    license: { name: "Public data — see /privacy", url: `${API_BASE}/privacy` },
  },
  servers: [{ url: `${API_BASE}/api/v1`, description: "Production" }],
  paths: {
    "/companies": {
      get: {
        operationId: "listCompanies",
        summary: "List companies run by AI",
        parameters: [
          { name: "q", in: "query", schema: { type: "string", maxLength: 120 }, description: "Full-text search across name, tagline, description, tech stack." },
          { name: "cohort", in: "query", schema: { type: "string", enum: ["hackathon", "expansion"] } },
          { name: "section", in: "query", schema: { type: "string", enum: ["index", "watchlist", "caution", "enabler"] } },
          { name: "verified", in: "query", schema: { type: "string", enum: ["true", "false"] } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["arr", "name", "evidence"], default: "evidence" }, description: "Evidence-first by default. ARR sorts only eligible dated, source-reviewed reported USD ARR point estimates; other records follow. Dates may differ." },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0, maximum: 10000, default: 0 } },
        ],
        responses: {
          "200": { description: "A page of companies", content: { "application/json": { schema: { $ref: "#/components/schemas/CompanyList" } } } },
          "400": { description: "Invalid query", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/companies/{slug}": {
      get: {
        operationId: "getCompany",
        summary: "Get one company by slug",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string", pattern: "^[a-z0-9-]{1,64}$" } }],
        responses: {
          "200": { description: "The company", content: { "application/json": { schema: { $ref: "#/components/schemas/Company" } } } },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/stack": {
      get: {
        operationId: "listStackTools",
        summary: "List tools in the autopilot tech stack",
        parameters: [
          { name: "category", in: "query", schema: { type: "string", maxLength: 40 } },
          { name: "q", in: "query", schema: { type: "string", maxLength: 120 } },
          { name: "hasReferral", in: "query", schema: { type: "string", enum: ["true", "false"] } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 50 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0, maximum: 10000, default: 0 } },
        ],
        responses: { "200": { description: "A page of stack tools", content: { "application/json": { schema: { $ref: "#/components/schemas/StackList" } } } } },
      },
    },
    "/editions": {
      get: {
        operationId: "listEditions",
        summary: "List Autopilot Pulse newsletter editions",
        responses: { "200": { description: "All editions", content: { "application/json": { schema: { $ref: "#/components/schemas/EditionList" } } } } },
      },
    },
  },
  components: {
    schemas: {
      Error: { type: "object", properties: { error: { type: "object", properties: { code: { type: "string" }, message: { type: "string" } }, required: ["code", "message"] } } },
      Company: {
        type: "object",
        properties: {
          slug: { type: "string" },
          name: { type: "string" },
          url: { type: ["string", "null"] },
          tagline: { type: "string" },
          category: { type: ["string", "null"] },
          description: { type: "string" },
          techStack: { type: "array", items: { type: "string" } },
          funding: { type: "object" },
          founders: { type: "array", items: { type: "object" } },
          metrics: { type: "object", properties: {
            arr: { type: ["string", "null"], description: "ARR-only display. No revenue, projections or annual run rates. May describe a bound or estimate; read observations." },
            arrUsd: { type: ["number", "null"], description: "Eligible reported ARR point value only; null for bounds, estimates, disputes, missing dates or unchecked sources." },
            humans: { type: ["integer", "null"], description: "Historical count; see headcount for date, scope and population. Never assume compatibility with ARR." },
            headcount: { anyOf: [{ $ref: "#/components/schemas/MetricObservation" }, { type: "null" }] },
            contractors: { anyOf: [{ $ref: "#/components/schemas/MetricObservation" }, { type: "null" }] },
            observations: { type: "array", items: { $ref: "#/components/schemas/MetricObservation" } },
            note: { type: "string" },
          } },
          pricing: { type: ["string", "null"], description: "Latest researched pricing summary, including uncertainty where unresolved. When pricingCheckedAt is null, this is a historical registry entry without a verification date." },
          pricingCheckedAt: { type: ["string", "null"], format: "date", description: "Date the cited pricing publications were checked, not a checkout validation or price-change date." },
          pricingSources: { type: "array", description: "First-party publications supporting the latest pricing summary; empty for historical entries without current research.", items: { type: "object", properties: { name: { type: "string" }, url: { type: "string", format: "uri" } }, required: ["name", "url"] } },
          verified: { type: "boolean" },
          cohort: { type: ["string", "null"] },
          autopilot: { type: ["object", "null"] },
          href: { type: "string" },
        },
      },
      MetricObservation: {
        type: "object",
        required: ["id", "slug", "kind", "value", "currency", "precision", "display", "asOf", "periodStart", "periodEnd", "scope", "population", "status", "source", "publishedAt", "recordedAt", "checkedAt", "supersedes", "notes"],
        properties: {
          id: { type: "string" }, slug: { type: "string" },
          kind: { type: "string", enum: ["arr", "revenue", "annual_run_rate", "revenue_projection", "unclassified", "headcount", "contractors"] },
          value: { type: ["number", "null"] }, currency: { enum: ["USD", null] },
          precision: { enum: ["exact", "approximate", "lower_bound", "range", "unknown"] },
          display: { type: "string" }, asOf: { type: ["string", "null"], description: "Observed date with source precision: year, month or day. Null means unknown." },
          periodStart: { type: ["string", "null"] }, periodEnd: { type: ["string", "null"] }, scope: { type: ["string", "null"] },
          population: { enum: ["employees_and_founders", "employees", "team_unspecified", "contractors", null] },
          status: { enum: ["reported", "estimated", "disputed", "unclassified"] },
          source: { type: ["object", "null"], properties: { name: { type: "string" }, url: { type: "string", format: "uri" } } },
          publishedAt: { type: ["string", "null"] }, recordedAt: { type: "string", format: "date" },
          checkedAt: { type: ["string", "null"], description: "Publication review date, not audit date or date the metric was observed." },
          supersedes: { type: ["string", "null"], description: "Earlier observation ID corrected by this entry; the earlier entry is retained." }, notes: { type: "string" },
        },
      },
      CompanyList: {
        type: "object",
        properties: { total: { type: "integer" }, limit: { type: "integer" }, offset: { type: "integer" }, count: { type: "integer" }, items: { type: "array", items: { $ref: "#/components/schemas/Company" } } },
      },
      StackTool: {
        type: "object",
        properties: { name: { type: "string" }, category: { type: "string" }, role: { type: "string" }, url: { type: "string" }, referralUrl: { type: ["string", "null"] }, referralTerms: { type: ["string", "null"] }, usedBy: { type: "array", items: { type: "string" } } },
      },
      StackList: { type: "object", properties: { total: { type: "integer" }, items: { type: "array", items: { $ref: "#/components/schemas/StackTool" } } } },
      Edition: { type: "object", properties: { slug: { type: "string" }, number: { type: "integer" }, title: { type: "string" }, date: { type: "string" }, tldr: { type: "array", items: { type: "string" } }, url: { type: "string" } } },
      EditionList: { type: "object", properties: { total: { type: "integer" }, items: { type: "array", items: { $ref: "#/components/schemas/Edition" } } } },
    },
  },
};

export function GET() {
  return apiJson(spec);
}
export function OPTIONS() {
  return preflight();
}
export function POST() { return methodNotAllowed(); }
