// Derives the homepage registry "Pulse News" list (window.SIGNALS) from
// data/pulse.json, which the daily Pulse workflow keeps fresh. Nothing is
// written by hand: items, links, dates and scores are copied from the data.
export const SIGNAL_KINDS = ["funding", "product", "acquisition", "revenue"];
export const SIGNAL_WINDOW_DAYS = 14;
export const SIGNAL_LIMIT = 18;
export const SIGNAL_SELECTION =
  "Auto-selected from the daily Pulse feed; source claim not independently confirmed";

export function buildSignals(pulse) {
  if (!pulse || typeof pulse.generatedAt !== "string" || !Array.isArray(pulse.items)) {
    throw new Error("registry signals: data/pulse.json has no generatedAt/items");
  }
  const end = Date.parse(pulse.generatedAt);
  if (!Number.isFinite(end)) throw new Error("registry signals: invalid generatedAt");
  const start = end - SIGNAL_WINDOW_DAYS * 864e5;
  const seen = new Set();
  const items = pulse.items
    .filter((i) => {
      const t = Date.parse(i.publishedAt);
      return (
        SIGNAL_KINDS.includes(i.kind) &&
        !i.social && // collected X/LinkedIn posts are not news items
        i.title && i.url && Number.isFinite(t) && t >= start && t <= end
      );
    })
    .sort((a, b) => (b.baseScore || 0) - (a.baseScore || 0) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter((i) => {
      const k = i.title.trim().toLowerCase();
      if (seen.has(i.id) || seen.has(k)) return false;
      seen.add(i.id);
      seen.add(k);
      return true;
    })
    .slice(0, SIGNAL_LIMIT)
    .map((i) => ({
      id: i.id,
      title: i.title,
      url: i.url,
      domain: i.domain,
      publishedAt: i.publishedAt,
      companySlug: i.companySlug,
      kind: i.kind,
      sources: i.sources,
      baseScore: i.baseScore,
      track: i.track,
      hot: !!i.hot,
      selection: SIGNAL_SELECTION,
    }));
  return { generatedAt: pulse.generatedAt, items };
}

export function signalsScript(pulse) {
  return `window.SIGNALS=${JSON.stringify(buildSignals(pulse))};`;
}
