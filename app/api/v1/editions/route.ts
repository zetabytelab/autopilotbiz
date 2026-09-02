import { apiJson, preflight, methodNotAllowed } from "@/lib/api/http";
import { listEditions } from "@/lib/api/core";

export function GET() {
  return apiJson(listEditions());
}

export function OPTIONS() {
  return preflight();
}

export function POST() { return methodNotAllowed(); }
export function PUT() { return methodNotAllowed(); }
export function DELETE() { return methodNotAllowed(); }
export function PATCH() { return methodNotAllowed(); }
