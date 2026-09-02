import { apiJson, preflight, methodNotAllowed, API_BASE } from "@/lib/api/http";

// OpenAPI 3.1 description of the public API. Served at /openapi.json.
const spec = {
  openapi: "3.1.0",
  info: {
    title: "The Autopilot Index API",
    version: "1.0.0",
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
          { name: "sort", in: "query", schema: { type: "string", enum: ["arr", "name"], default: "arr" } },
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
          metrics: { type: "object" },
          pricing: { type: ["string", "null"] },
          verified: { type: "boolean" },
          cohort: { type: ["string", "null"] },
          autopilot: { type: ["object", "null"] },
          href: { type: "string" },
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
