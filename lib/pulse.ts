// Shared types + scoring math for the pulse feed. The script stores baseScore;
// the client recomputes time decay so items cool between rebuilds.

export type PulseSource = { id: string; url: string; points?: number; comments?: number };

export type PulseItem = {
  id: string;
  title: string;
  url: string;
  domain: string;
  publishedAt: string;
  companySlug: string | null;
  kind: "funding" | "product" | "interview" | "video" | "social" | "blog" | "other";
  sources: PulseSource[];
  baseScore: number;
  hot?: boolean;
};

export type CandidateEvidence = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  matchedKeywords: string[];
};

export type Candidate = {
  id: string;
  name: string | null;
  evidence: CandidateEvidence[];
  firstSeen: string;
  score: number;
  status: "new" | "reviewed" | "added" | "rejected";
};

export type SourceRun = { id: string; ok: number; failed: number; items: number };

// Mirrors the script: ~33h half-life on a 48h scale.
export function decayedScore(baseScore: number, publishedAt: string, now = Date.now()): number {
  const ageHours = Math.max(0, (now - Date.parse(publishedAt)) / 3.6e6);
  return baseScore * Math.exp(-ageHours / 48);
}

export function freshness(publishedAt: string, now = Date.now()): "fresh" | "today" | "older" {
  const h = (now - Date.parse(publishedAt)) / 3.6e6;
  return h < 6 ? "fresh" : h < 24 ? "today" : "older";
}

export function timeAgo(publishedAt: string, now = Date.now()): string {
  const mins = Math.max(1, Math.round((now - Date.parse(publishedAt)) / 60_000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
