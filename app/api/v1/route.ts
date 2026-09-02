import { apiJson, preflight, methodNotAllowed, API_BASE } from "@/lib/api/http";

// API discovery root — lets an agent enumerate the surface programmatically.
export function GET() {
  return apiJson({
    name: "The Autopilot Index API",
    version: "v1",
    description:
      "Read-only public API over The Autopilot Index: companies run by AI, their tech stacks, and the weekly editions. All data is public; no authentication required.",
    documentation: `${API_BASE}/developers`,
    openapi: `${API_BASE}/openapi.json`,
    mcp: `${API_BASE}/mcp`,
    endpoints: {
      companies: `${API_BASE}/api/v1/companies`,
      company: `${API_BASE}/api/v1/companies/{slug}`,
      stack: `${API_BASE}/api/v1/stack`,
      editions: `${API_BASE}/api/v1/editions`,
    },
  });
}

export function OPTIONS() {
  return preflight();
}

export function POST() { return methodNotAllowed(); }
export function PUT() { return methodNotAllowed(); }
export function DELETE() { return methodNotAllowed(); }
export function PATCH() { return methodNotAllowed(); }
