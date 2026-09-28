import { getDatabase, isDatabaseConfigured } from "@/lib/db/client";
import {
  companyDTO,
  getCompany,
  listCompanies,
  listEditions,
  listStack,
  type ListCompaniesParams,
} from "@/lib/api/core";
import type { Company, StackTool } from "@/lib/data";
import type { Edition } from "@/lib/editions";
import type { MetricObservation } from "@/lib/financial-types";

export function databaseReadsEnabled(): boolean {
  return process.env.AUTOPILOT_DB_READS === "1" && isDatabaseConfigured();
}

async function companyDataset() {
  const sql = getDatabase();
  const [companyRows, observationRows] = await Promise.all([
    sql`SELECT payload FROM autopilot_company ORDER BY slug`,
    sql`SELECT company_slug, payload FROM autopilot_metric_observation ORDER BY company_slug, as_of DESC NULLS LAST`,
  ]);
  const companies = companyRows.map((row) => row.payload as Company);
  const observationsBySlug = new Map<string, MetricObservation[]>();
  for (const row of observationRows) {
    const observations = observationsBySlug.get(row.company_slug as string) ?? [];
    observations.push(row.payload as MetricObservation);
    observationsBySlug.set(row.company_slug as string, observations);
  }
  return { companies, observationsBySlug };
}

export async function listCompaniesFromDatabase(params: ListCompaniesParams) {
  const { companies, observationsBySlug } = await companyDataset();
  return listCompanies(params, companies, observationsBySlug);
}

export async function getCompanyFromDatabase(slug: string) {
  const { companies, observationsBySlug } = await companyDataset();
  return getCompany(slug, companies, observationsBySlug);
}

export async function listStackFromDatabase(params: Parameters<typeof listStack>[0]) {
  const sql = getDatabase();
  const rows = await sql`SELECT payload FROM autopilot_stack_tool ORDER BY name`;
  return listStack(params, rows.map((row) => row.payload as StackTool));
}

export async function listEditionsFromDatabase() {
  const sql = getDatabase();
  const rows = await sql`SELECT payload FROM autopilot_edition ORDER BY number DESC`;
  return listEditions(rows.map((row) => row.payload as Edition));
}

export async function getCompanyProjectionFromDatabase(slug: string) {
  const company = await getCompanyFromDatabase(slug);
  return company ? companyDTO(company as unknown as Company) : null;
}
