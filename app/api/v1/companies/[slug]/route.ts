import type { NextRequest } from "next/server";
import { z } from "zod";
import { apiJson, apiError, preflight, methodNotAllowed } from "@/lib/api/http";
import { getCompany } from "@/lib/api/core";

// Validate the slug shape before touching data — bounded, charset-restricted.
const slugSchema = z.string().regex(/^[a-z0-9-]{1,64}$/);

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return apiError(400, "invalid_slug", "Slug must be 1–64 lowercase letters, digits, or hyphens.");
  }
  const company = getCompany(parsed.data);
  if (!company) {
    return apiError(404, "not_found", `No company with slug '${parsed.data}'.`);
  }
  return apiJson(company);
}

export function OPTIONS() {
  return preflight();
}

export function POST() { return methodNotAllowed(); }
export function PUT() { return methodNotAllowed(); }
export function DELETE() { return methodNotAllowed(); }
export function PATCH() { return methodNotAllowed(); }
