import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { companies, stackTools } from "../lib/data.ts";
import { editions } from "../lib/editions.ts";
import { financialObservations } from "../lib/financial-observations.ts";

type JsonRecord = Record<string, unknown>;
type Query = NeonQueryFunction<false, false>;

const ROOT = resolve(import.meta.dirname, "..");
const APPLY = process.argv.includes("--apply");

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function json(value: unknown): string {
  return JSON.stringify(value);
}

function isoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString();
}

function dateOrNull(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null;
}

function sourceKey(url: string): string {
  return sha256(url).slice(0, 40);
}

async function loadJson<T>(relativePath: string): Promise<T> {
  return JSON.parse(await readFile(resolve(ROOT, relativePath), "utf8")) as T;
}

async function execute(sql: Query, text: string, params: unknown[] = []): Promise<unknown> {
  return sql.query(text, params);
}

async function ensureSchema(sql: Query): Promise<void> {
  const schema = await readFile(resolve(ROOT, "db/schema.sql"), "utf8");
  for (const statement of schema.split(";").map((part) => part.trim()).filter(Boolean)) {
    await execute(sql, statement);
  }
}

function sourceRows(): Array<{ sourceKey: string; name: string | null; url: string; domain: string | null }> {
  const rows = new Map<string, { sourceKey: string; name: string | null; url: string; domain: string | null }>();
  const add = (name: string | null, url: unknown) => {
    if (typeof url !== "string" || !url.startsWith("http")) return;
    try {
      const parsed = new URL(url);
      rows.set(url, { sourceKey: sourceKey(url), name, url, domain: parsed.hostname });
    } catch {
      // Invalid source URLs remain in the source payload but are not indexed.
    }
  };

  for (const company of companies) {
    for (const source of [company.metrics.sources?.arr, company.metrics.sources?.humans, company.metrics.sources?.raised]) {
      add(source?.name ?? null, source?.url);
    }
    for (const item of company.news) add(null, item.url);
  }
  for (const observation of financialObservations) add(observation.source?.name ?? null, observation.source?.url);
  for (const edition of editions) {
    for (const section of edition.sections) {
      for (const source of section.sources ?? []) add(source.label, source.url);
    }
  }

  return [...rows.values()];
}

async function main(): Promise<void> {
  const pulse = await loadJson<JsonRecord>("data/pulse.json");
  const candidates = await loadJson<JsonRecord>("data/candidates.json");
  const socialState = await loadJson<JsonRecord>("data/social-state.json");
  const socialCoverage = await loadJson<JsonRecord>("data/social-coverage.json");
  const snapshots = [
    { dataset: "pulse", payload: pulse },
    { dataset: "candidates", payload: candidates },
    { dataset: "social-state", payload: socialState },
    { dataset: "social-coverage", payload: socialCoverage },
  ];
  const manifest = {
    generatedAt: new Date().toISOString(),
    companies: companies.length,
    stackTools: stackTools.length,
    metricObservations: financialObservations.length,
    editions: editions.length,
    pulseItems: Array.isArray(pulse.items) ? pulse.items.length : 0,
    candidates: Array.isArray(candidates.candidates) ? candidates.candidates.length : 0,
    sources: sourceRows().length,
    snapshots: snapshots.map(({ dataset, payload }) => ({
      dataset,
      sha256: sha256(json(payload)),
    })),
  };

  console.log(JSON.stringify(manifest, null, 2));
  if (!APPLY) {
    console.log("Dry run only. Re-run with --apply and DATABASE_URL to write Postgres.");
    return;
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required with --apply");

  const sql = neon(process.env.DATABASE_URL);
  const runId = `import-${Date.now()}-${sha256(json(manifest)).slice(0, 12)}`;
  await ensureSchema(sql);
  await execute(sql, "INSERT INTO autopilot_migration_run (id, status, manifest) VALUES ($1, 'running', $2::jsonb)", [runId, json(manifest)]);

  try {
    for (const { dataset, payload } of snapshots) {
      await execute(sql, `
        INSERT INTO autopilot_snapshot (dataset, content_sha256, generated_at, payload)
        VALUES ($1, $2, $3, $4::jsonb)
        ON CONFLICT (dataset, content_sha256) DO NOTHING
      `, [dataset, sha256(json(payload)), isoOrNull(payload.generatedAt), json(payload)]);
    }

    for (const source of sourceRows()) {
      await execute(sql, `
        INSERT INTO autopilot_source (source_key, name, url, domain)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (source_key) DO UPDATE SET name = EXCLUDED.name, last_seen_at = now()
      `, [source.sourceKey, source.name, source.url, source.domain]);
    }

    for (const company of companies) {
      await execute(sql, `
        INSERT INTO autopilot_company (slug, name, verified, cohort, section, payload)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          verified = EXCLUDED.verified,
          cohort = EXCLUDED.cohort,
          section = EXCLUDED.section,
          payload = EXCLUDED.payload,
          imported_at = now()
      `, [company.slug, company.name, company.verified, company.cohort ?? null, company.autopilot?.section ?? null, json(company)]);
    }

    for (const tool of stackTools) {
      await execute(sql, `
        INSERT INTO autopilot_stack_tool (name, category, payload)
        VALUES ($1, $2, $3::jsonb)
        ON CONFLICT (name) DO UPDATE SET
          category = EXCLUDED.category,
          payload = EXCLUDED.payload,
          imported_at = now()
      `, [tool.name, tool.category, json(tool)]);
    }

    for (const observation of financialObservations) {
      await execute(sql, `
        INSERT INTO autopilot_metric_observation
          (id, company_slug, kind, value, currency, precision, display, as_of,
           period_start, period_end, scope, population, status, source_key,
           published_at, recorded_at, checked_at, supersedes, notes, payload)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                $14, $15, $16, $17, $18, $19, $20::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          value = EXCLUDED.value,
          display = EXCLUDED.display,
          status = EXCLUDED.status,
          payload = EXCLUDED.payload
      `, [
        observation.id,
        observation.slug,
        observation.kind,
        observation.value,
        observation.currency,
        observation.precision,
        observation.display,
        dateOrNull(observation.asOf),
        dateOrNull(observation.periodStart),
        dateOrNull(observation.periodEnd),
        observation.scope,
        observation.population,
        observation.status,
        observation.source ? sourceKey(observation.source.url) : null,
        isoOrNull(observation.publishedAt),
        isoOrNull(observation.recordedAt),
        isoOrNull(observation.checkedAt),
        observation.supersedes,
        observation.notes,
        json(observation),
      ]);
    }

    const pulseItems = Array.isArray(pulse.items) ? pulse.items as JsonRecord[] : [];
    for (const item of pulseItems) {
      await execute(sql, `
        INSERT INTO autopilot_pulse_item (id, company_slug, published_at, domain, track, payload)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          company_slug = EXCLUDED.company_slug,
          published_at = EXCLUDED.published_at,
          domain = EXCLUDED.domain,
          track = EXCLUDED.track,
          payload = EXCLUDED.payload,
          imported_at = now()
      `, [item.id, item.companySlug ?? null, isoOrNull(item.publishedAt), item.domain ?? null, item.track ?? null, json(item)]);
      const sources = Array.isArray(item.sources) ? item.sources as JsonRecord[] : [];
      for (const itemSource of sources) {
        const url = typeof itemSource.url === "string" ? itemSource.url : null;
        if (!url) continue;
        const key = sourceKey(url);
        await execute(sql, `
          INSERT INTO autopilot_source (source_key, url, domain)
          VALUES ($1, $2, $3)
          ON CONFLICT (source_key) DO NOTHING
        `, [key, url, new URL(url).hostname]);
        await execute(sql, `
          INSERT INTO autopilot_pulse_item_source (pulse_item_id, source_key, url, points, comments)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (pulse_item_id, url) DO UPDATE SET points = EXCLUDED.points, comments = EXCLUDED.comments
        `, [item.id, key, url, itemSource.points ?? null, itemSource.comments ?? null]);
      }
    }

    const candidateRows = Array.isArray(candidates.candidates) ? candidates.candidates as JsonRecord[] : [];
    for (const candidate of candidateRows) {
      await execute(sql, `
        INSERT INTO autopilot_candidate (id, name, status, first_seen_at, score, payload)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          status = EXCLUDED.status,
          score = EXCLUDED.score,
          payload = EXCLUDED.payload
      `, [candidate.id, candidate.name ?? null, candidate.status, isoOrNull(candidate.firstSeen), candidate.score ?? null, json(candidate)]);
    }

    for (const edition of editions) {
      await execute(sql, `
        INSERT INTO autopilot_edition (slug, number, date, title, payload)
        VALUES ($1, $2, $3, $4, $5::jsonb)
        ON CONFLICT (slug) DO UPDATE SET
          number = EXCLUDED.number,
          date = EXCLUDED.date,
          title = EXCLUDED.title,
          payload = EXCLUDED.payload
      `, [edition.slug, edition.number, edition.date, edition.title, json(edition)]);
    }

    await execute(sql, "UPDATE autopilot_migration_run SET status = 'completed', completed_at = now() WHERE id = $1", [runId]);
    console.log(`Imported ${runId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await execute(sql, "UPDATE autopilot_migration_run SET status = 'failed', completed_at = now(), error = $2 WHERE id = $1", [runId, message]);
    throw error;
  }
}

await main();
