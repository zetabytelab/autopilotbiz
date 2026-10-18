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
          "400": { description: "Invalid query (code invalid_query)", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
          "400": { description: "Invalid slug (code invalid_slug)", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Not found (code not_found)", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/stack": {
      get: {
        operationId: "listStackTools",
        summary: "List tools in the autopilot tech stack",
        parameters: [
          { name: "category", in: "query", schema: { type: "string", maxLength: 40 }, description: "Case-insensitive match on StackTool.category (intelligence, agents, sandboxes, code-deploy, data, ops, rails, payments, distribution)." },
          { name: "q", in: "query", schema: { type: "string", maxLength: 120 } },
          { name: "hasReferral", in: "query", schema: { type: "string", enum: ["true", "false"] }, description: "Filter on whether referralUrl is set." },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 50 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0, maximum: 10000, default: 0 } },
        ],
        responses: {
          "200": { description: "A page of stack tools, sorted by name", content: { "application/json": { schema: { $ref: "#/components/schemas/StackList" } } } },
          "400": { description: "Invalid query (code invalid_query)", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
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
      // Every schema below mirrors a DTO in lib/api/core.ts field by field
      // (companyDTO, stackToolDTO, editionDTO and the list wrappers). Fields are
      // always present (null when unknown), so all are required and nothing else
      // is emitted. Update both together.
      Error: {
        type: "object",
        required: ["error"],
        additionalProperties: false,
        properties: { error: { type: "object", required: ["code", "message"], additionalProperties: false, properties: { code: { type: "string" }, message: { type: "string" } } } },
      },
      Source: {
        type: "object",
        required: ["name", "url"],
        additionalProperties: false,
        properties: { name: { type: "string" }, url: { type: "string", format: "uri" } },
      },
      Company: {
        type: "object",
        required: ["slug", "name", "url", "tagline", "category", "description", "techStack", "funding", "founders", "metrics", "pricing", "pricingCheckedAt", "pricingSources", "referralProgram", "verified", "cohort", "autopilot", "href"],
        additionalProperties: false,
        properties: {
          slug: { type: "string" },
          name: { type: "string" },
          url: { type: ["string", "null"], format: "uri", description: "Null when the website is withheld pending verification." },
          tagline: { type: "string" },
          category: { type: ["string", "null"], description: "The company's own category claim." },
          description: { type: "string" },
          techStack: { type: "array", items: { type: "string" } },
          funding: {
            type: "object",
            required: ["totalRaised", "lastRound", "date", "valuation", "investors"],
            additionalProperties: false,
            description: "Historical display strings as recorded; not normalised amounts.",
            properties: {
              totalRaised: { type: ["string", "null"] },
              lastRound: { type: ["string", "null"] },
              date: { type: ["string", "null"] },
              valuation: { type: ["string", "null"] },
              investors: { type: "array", items: { type: "string" } },
            },
          },
          founders: {
            type: "array",
            items: { type: "object", required: ["name", "background"], additionalProperties: false, properties: { name: { type: "string" }, background: { type: "string" } } },
          },
          metrics: {
            type: "object",
            required: ["arr", "arrUsd", "humans", "headcount", "contractors", "observations", "note"],
            additionalProperties: false,
            properties: {
              arr: { type: ["string", "null"], description: "ARR-only display. No revenue, projections or annual run rates. May describe a bound or estimate; read observations." },
              arrUsd: { type: ["number", "null"], description: "Eligible reported ARR point value only; null for bounds, estimates, disputes, missing dates or unchecked sources." },
              humans: { type: ["integer", "null"], description: "Value of the latest headcount observation; see headcount for date, scope and population. Never assume compatibility with ARR." },
              headcount: { anyOf: [{ $ref: "#/components/schemas/MetricObservation" }, { type: "null" }] },
              contractors: { anyOf: [{ $ref: "#/components/schemas/MetricObservation" }, { type: "null" }] },
              observations: { type: "array", items: { $ref: "#/components/schemas/MetricObservation" }, description: "Full append-only history, including superseded entries." },
              note: { type: "string" },
            },
          },
          pricing: { type: ["string", "null"], description: "Latest researched pricing summary, including uncertainty where unresolved. When pricingCheckedAt is null, this is a historical registry entry without a verification date." },
          pricingCheckedAt: { type: ["string", "null"], format: "date", description: "Date the cited pricing publications were checked, not a checkout validation or price-change date." },
          pricingSources: { type: "array", description: "First-party publications supporting the latest pricing summary; empty for historical entries without current research.", items: { $ref: "#/components/schemas/Source" } },
          referralProgram: {
            type: "object",
            required: ["exists", "notes"],
            additionalProperties: false,
            description: "Whether the company runs a referral programme for its own customers (recorded research, not revalidated per profile).",
            properties: { exists: { type: ["boolean", "null"] }, notes: { type: ["string", "null"] } },
          },
          verified: { type: "boolean" },
          cohort: { type: ["string", "null"], enum: ["hackathon", "expansion", null] },
          autopilot: {
            oneOf: [
              {
                type: "object",
                required: ["level", "evidence", "section", "story"],
                additionalProperties: false,
                properties: {
                  level: { type: ["string", "null"], enum: ["L2", "L3", "L4", "L5", null], description: "L2 function autopilot · L3 operational · L4 goal-level · L5 full autonomy." },
                  evidence: { type: ["string", "null"], enum: ["A", "B", "C", "D", null], description: "A third-party audited · B public transaction/filing · C credible press · D founder claims only." },
                  section: { type: "string", enum: ["index", "watchlist", "caution", "enabler"] },
                  story: { type: "string" },
                },
              },
              { type: "null" },
            ],
          },
          href: { type: "string", format: "uri" },
        },
      },
      MetricObservation: {
        type: "object",
        required: ["id", "slug", "kind", "value", "currency", "precision", "display", "asOf", "periodStart", "periodEnd", "scope", "population", "status", "source", "publishedAt", "recordedAt", "checkedAt", "supersedes", "notes"],
        additionalProperties: false,
        properties: {
          id: { type: "string" }, slug: { type: "string" },
          kind: { type: "string", enum: ["arr", "revenue", "annual_run_rate", "revenue_projection", "unclassified", "headcount", "contractors"] },
          value: { type: ["number", "null"] }, currency: { enum: ["USD", null] },
          precision: { enum: ["exact", "approximate", "lower_bound", "range", "unknown"] },
          display: { type: "string" }, asOf: { type: ["string", "null"], description: "Observed date with source precision: year, month or day. Null means unknown." },
          periodStart: { type: ["string", "null"] }, periodEnd: { type: ["string", "null"] }, scope: { type: ["string", "null"] },
          population: { enum: ["employees_and_founders", "employees", "team_unspecified", "contractors", null] },
          status: { enum: ["reported", "estimated", "disputed", "unclassified"] },
          source: { anyOf: [{ $ref: "#/components/schemas/Source" }, { type: "null" }] },
          publishedAt: { type: ["string", "null"] }, recordedAt: { type: "string", format: "date" },
          checkedAt: { type: ["string", "null"], description: "Publication review date, not audit date or date the metric was observed." },
          supersedes: { type: ["string", "null"], description: "Earlier observation ID corrected by this entry; the earlier entry is retained." }, notes: { type: "string" },
        },
      },
      CompanyList: {
        type: "object",
        required: ["total", "limit", "offset", "count", "items"],
        additionalProperties: false,
        properties: { total: { type: "integer" }, limit: { type: "integer" }, offset: { type: "integer" }, count: { type: "integer" }, items: { type: "array", items: { $ref: "#/components/schemas/Company" } } },
      },
      StackTool: {
        type: "object",
        required: ["name", "category", "role", "url", "referralUrl", "referralTerms", "usedBy"],
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          category: { type: "string", enum: ["intelligence", "agents", "sandboxes", "code-deploy", "data", "ops", "rails", "payments", "distribution"] },
          role: { type: "string" },
          url: { type: "string", format: "uri" },
          referralUrl: { type: ["string", "null"], format: "uri", description: "The Index's affiliate link (rendered with rel=\"sponsored\"); null when there is none." },
          referralTerms: { type: ["string", "null"], description: "What a referred user gets, or the programme terms as recorded." },
          usedBy: { type: "array", items: { type: "string" } },
        },
      },
      StackList: {
        type: "object",
        required: ["total", "limit", "offset", "count", "items"],
        additionalProperties: false,
        properties: { total: { type: "integer" }, limit: { type: "integer" }, offset: { type: "integer" }, count: { type: "integer" }, items: { type: "array", items: { $ref: "#/components/schemas/StackTool" } } },
      },
      Edition: {
        type: "object",
        required: ["slug", "number", "title", "date", "tldr", "cover", "linkedinUrl", "url"],
        additionalProperties: false,
        properties: {
          slug: { type: "string" },
          number: { type: "integer" },
          title: { type: "string" },
          date: { type: "string", format: "date" },
          tldr: { type: "array", items: { type: "string" } },
          cover: { type: "string", format: "uri", description: "Absolute URL of the cover image." },
          linkedinUrl: { type: ["string", "null"], format: "uri", description: "LinkedIn newsletter URL of the edition, null if not published there." },
          url: { type: "string", format: "uri", description: "Canonical edition page." },
        },
      },
      EditionList: {
        type: "object",
        required: ["total", "items"],
        additionalProperties: false,
        properties: { total: { type: "integer" }, items: { type: "array", items: { $ref: "#/components/schemas/Edition" }, description: "Newest first." } },
      },
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
