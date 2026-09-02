import { z } from "zod";
import { companies, stackTools, type Company, type StackTool } from "@/lib/data";
import { editions, type Edition } from "@/lib/editions";
import { API_BASE } from "@/lib/api/http";

// ─────────────────────────────────────────────────────────────────────────────
// DTOs — EXPLICIT whitelists. We never spread raw internal objects into a
// response, so a future added field can't leak by accident. All data here is
// already public on the site.
// ─────────────────────────────────────────────────────────────────────────────

export function companyDTO(c: Company) {
  return {
    slug: c.slug,
    name: c.name,
    url: c.url,
    tagline: c.tagline,
    category: c.categoryClaim,
    description: c.description,
    techStack: c.techStack,
    funding: {
      totalRaised: c.funding.totalRaised,
      lastRound: c.funding.lastRound,
      date: c.funding.date,
      valuation: c.funding.valuation,
      investors: c.funding.investors,
    },
    founders: c.founders.map((f) => ({ name: f.name, background: f.background })),
    metrics: {
      arr: c.metrics.arr,
      arrUsd: c.metrics.arrUsd,
      humans: c.metrics.humans,
    },
    pricing: c.pricing,
    referralProgram: { exists: c.referralProgram.exists, notes: c.referralProgram.notes },
    verified: c.verified,
    cohort: c.cohort ?? null,
    autopilot: c.autopilot
      ? {
          level: c.autopilot.level ?? null,
          evidence: c.autopilot.evidence ?? null,
          section: c.autopilot.section,
          story: c.autopilot.story,
        }
      : null,
    href: `${API_BASE}/api/v1/companies/${c.slug}`,
  };
}

export function stackToolDTO(t: StackTool) {
  return {
    name: t.name,
    category: t.category,
    role: t.role,
    url: t.url,
    referralUrl: t.referralUrl ?? null,
    referralTerms: t.referral,
    usedBy: t.usedBy,
  };
}

export function editionDTO(e: Edition) {
  return {
    slug: e.slug,
    number: e.number,
    title: e.title,
    date: e.date,
    tldr: e.tldr,
    cover: e.cover.startsWith("http") ? e.cover : `${API_BASE}${e.cover}`,
    linkedinUrl: e.linkedinUrl || null,
    url: `${API_BASE}/pulse/${e.slug}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Query params — zod schemas with hard caps to prevent resource exhaustion.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_LIMIT = 100;
const MAX_Q = 120;

export const listCompaniesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(20),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
  q: z.string().trim().max(MAX_Q).optional(),
  cohort: z.enum(["hackathon", "expansion"]).optional(),
  section: z.enum(["index", "watchlist", "caution", "enabler"]).optional(),
  verified: z.enum(["true", "false"]).optional(),
  sort: z.enum(["arr", "name"]).default("arr"),
});
export type ListCompaniesParams = z.infer<typeof listCompaniesSchema>;

export const listStackSchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(50),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
  category: z.string().trim().max(40).optional(),
  q: z.string().trim().max(MAX_Q).optional(),
  hasReferral: z.enum(["true", "false"]).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Query functions — the single source of truth for REST + MCP.
// ─────────────────────────────────────────────────────────────────────────────

function matches(hay: (string | null | undefined)[], q: string): boolean {
  const needle = q.toLowerCase();
  return hay.some((h) => typeof h === "string" && h.toLowerCase().includes(needle));
}

export function listCompanies(p: ListCompaniesParams) {
  let rows = companies.slice();
  if (p.cohort) rows = rows.filter((c) => (c.cohort ?? "hackathon") === p.cohort);
  if (p.section) rows = rows.filter((c) => c.autopilot?.section === p.section);
  if (p.verified) rows = rows.filter((c) => c.verified === (p.verified === "true"));
  if (p.q) {
    const q = p.q;
    rows = rows.filter((c) => matches([c.name, c.tagline, c.description, c.categoryClaim, ...c.techStack], q));
  }
  if (p.sort === "name") {
    rows.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    rows.sort((a, b) => (b.metrics.arrUsd ?? -1) - (a.metrics.arrUsd ?? -1) || a.name.localeCompare(b.name));
  }
  const total = rows.length;
  const page = rows.slice(p.offset, p.offset + p.limit);
  return { total, limit: p.limit, offset: p.offset, count: page.length, items: page.map(companyDTO) };
}

export function getCompany(slug: string) {
  const c = companies.find((x) => x.slug === slug);
  return c ? companyDTO(c) : null;
}

export function listStack(p: z.infer<typeof listStackSchema>) {
  let rows = stackTools.slice();
  if (p.category) rows = rows.filter((t) => t.category.toLowerCase() === p.category!.toLowerCase());
  if (p.hasReferral) rows = rows.filter((t) => Boolean(t.referralUrl) === (p.hasReferral === "true"));
  if (p.q) {
    const q = p.q;
    rows = rows.filter((t) => matches([t.name, t.role, t.category, ...t.usedBy], q));
  }
  rows.sort((a, b) => a.name.localeCompare(b.name));
  const total = rows.length;
  const page = rows.slice(p.offset, p.offset + p.limit);
  return { total, limit: p.limit, offset: p.offset, count: page.length, items: page.map(stackToolDTO) };
}

export function listEditions() {
  const rows = editions.slice().sort((a, b) => b.number - a.number);
  return { total: rows.length, items: rows.map(editionDTO) };
}
