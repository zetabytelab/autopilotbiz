import type { NextRequest } from "next/server";
import { apiJson, apiError, preflight, methodNotAllowed } from "@/lib/api/http";
import { listStack, listStackSchema } from "@/lib/api/core";
import { databaseReadsEnabled, listStackFromDatabase } from "@/lib/db/projections";

export async function GET(request: NextRequest) {
  const parsed = listStackSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return apiError(400, "invalid_query", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
  return apiJson(databaseReadsEnabled() ? await listStackFromDatabase(parsed.data) : listStack(parsed.data));
}

export function OPTIONS() {
  return preflight();
}

export function POST() { return methodNotAllowed(); }
export function PUT() { return methodNotAllowed(); }
export function DELETE() { return methodNotAllowed(); }
export function PATCH() { return methodNotAllowed(); }
