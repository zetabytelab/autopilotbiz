import { NextResponse } from "next/server";
import { companies } from "@/lib/data";
import { editions } from "@/lib/editions";
import { financialObservations } from "@/lib/financial-observations";
import { getDatabase, isDatabaseConfigured } from "@/lib/db/client";

export const runtime = "nodejs";

function authorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });

  const sql = getDatabase();
  const rows = await sql`
    SELECT slug, name, verified, cohort, section
    FROM autopilot_company
    ORDER BY slug
  `;
  const counts = await sql`
    SELECT
      (SELECT count(*)::int FROM autopilot_company) AS companies,
      (SELECT count(*)::int FROM autopilot_metric_observation) AS observations,
      (SELECT count(*)::int FROM autopilot_pulse_item) AS pulse_items,
      (SELECT count(*)::int FROM autopilot_candidate) AS candidates,
      (SELECT count(*)::int FROM autopilot_edition) AS editions,
      (SELECT count(*)::int FROM autopilot_source) AS sources
  `;

  const local = new Map(companies.map((company) => [company.slug, company]));
  const mismatches = rows.flatMap((row) => {
    const company = local.get(row.slug as string);
    if (!company) return [{ slug: row.slug, reason: "database_only" }];
    const expected = {
      name: company.name,
      verified: company.verified,
      cohort: company.cohort ?? null,
      section: company.autopilot?.section ?? null,
    };
    const actual = {
      name: row.name,
      verified: row.verified,
      cohort: row.cohort ?? null,
      section: row.section ?? null,
    };
    return JSON.stringify(expected) === JSON.stringify(actual)
      ? []
      : [{ slug: row.slug, reason: "company_projection_mismatch", expected, actual }];
  });
  for (const company of companies) {
    if (!rows.some((row) => row.slug === company.slug)) mismatches.push({ slug: company.slug, reason: "json_only" });
  }

  return NextResponse.json({
    ok: mismatches.length === 0
      && Number(counts[0]?.companies) === companies.length
      && Number(counts[0]?.observations) === financialObservations.length
      && Number(counts[0]?.editions) === editions.length,
    local: {
      companies: companies.length,
      observations: financialObservations.length,
      editions: editions.length,
    },
    database: counts[0],
    mismatches,
  });
}
