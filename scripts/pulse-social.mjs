import { readFileSync } from "node:fs";

const DAY = 86_400_000;
const PLATFORMS = ["x", "linkedin"];
const ACCOUNT_STATUSES = new Set(["verified", "review", "missing", "inactive"]);
const RELATIONSHIPS = new Set(["associated", "former", "uncertain", "deceased"]);

export function linkedinKey(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || !/(^|\.)linkedin\.com$/.test(u.hostname)) return null;
    const match = u.pathname.match(/^\/(in|company|showcase)\/([^/]+)(?:\/posts)?\/?$/);
    return match ? `https://www.linkedin.com/${match[1]}/${match[2].toLowerCase()}/` : null;
  } catch { return null; }
}

export function readWatchlist(path, entities) {
  return validateWatchlist(JSON.parse(readFileSync(path, "utf8")), entities);
}

export function validateWatchlist(watchlist, entities) {
  if (watchlist.schemaVersion !== 1 || !Array.isArray(watchlist.subjects) || !watchlist.subjects.length) {
    throw new Error("Invalid or empty social watch list");
  }
  const slugs = new Set(entities.map((e) => e.slug));
  const ids = new Set();
  const accounts = new Set();
  for (const s of watchlist.subjects) {
    if (!s.id || ids.has(s.id) || !slugs.has(s.pulseSlug) || !["person", "company"].includes(s.kind) || !RELATIONSHIPS.has(s.relationship)) {
      throw new Error(`Invalid social subject or mapping: ${s.id}`);
    }
    ids.add(s.id);
    for (const platform of PLATFORMS) {
      const a = s[platform];
      if (!a || !ACCOUNT_STATUSES.has(a.status)) throw new Error(`Invalid ${platform} status: ${s.id}`);
      if (a.value) {
        if (platform === "x" ? !/^[a-z0-9_]{1,15}$/.test(a.value) : linkedinKey(a.value) !== a.value) {
          throw new Error(`Invalid ${platform} account: ${s.id}`);
        }
        if (platform === "linkedin" && !(s.kind === "person" ? /\/in\// : /\/(company|showcase)\//).test(a.value)) {
          throw new Error(`Wrong LinkedIn account type: ${s.id}`);
        }
      }
      if (a.status !== "verified") continue;
      if (!a.value || s.relationship === "deceased") throw new Error(`Unusable active account: ${s.id}`);
      // Never silently overwrite an account owned by two registry rows.
      const key = `${platform}:${a.value}`;
      if (accounts.has(key)) throw new Error(`Duplicate active social account: ${key}`);
      accounts.add(key);
    }
  }
  return watchlist;
}

export function socialTargets(watchlist, settings) {
  return (settings?.platforms ?? PLATFORMS).flatMap((platform) => watchlist.subjects
    .filter((s) => s[platform].status === "verified")
    .map((subject) => ({ id: `${platform}:${subject[platform].value}`, platform, value: subject[platform].value, subject })));
}

function numberSetting(env, key, fallback, min, max, integer = false) {
  const value = Number(env[key] ?? fallback);
  if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
    throw new Error(`${key} must be ${integer ? "an integer " : ""}between ${min} and ${max}`);
  }
  return value;
}

// Cadence control. X is cheap enough to poll daily; LinkedIn bills even for an
// account with no new posts, so a run may collect a subset of platforms.
function platformSetting(env, key) {
  const raw = String(env[key] ?? "").trim();
  if (!raw) return [...PLATFORMS];
  const chosen = raw.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!chosen.length || chosen.some((platform) => !PLATFORMS.includes(platform))) {
    throw new Error(`${key} must be a comma-separated subset of ${PLATFORMS.join(", ")}`);
  }
  return PLATFORMS.filter((platform) => chosen.includes(platform));
}

export function socialSettings(env = process.env) {
  return {
    platforms: platformSetting(env, "PULSE_SOCIAL_PLATFORMS"),
    concurrency: numberSetting(env, "PULSE_SOCIAL_CONCURRENCY", 3, 1, 10, true),
    xMaxItems: numberSetting(env, "PULSE_X_MAX_ITEMS", 10, 1, 100, true),
    linkedinMaxPosts: numberSetting(env, "PULSE_LINKEDIN_MAX_POSTS", 10, 1, 100, true),
    // Explicit per-target ceilings, including actor events, not price estimates.
    xMaxChargeUsd: numberSetting(env, "PULSE_X_MAX_CHARGE_USD", 0.01, 0.001, 1),
    linkedinMaxChargeUsd: numberSetting(env, "PULSE_LINKEDIN_MAX_CHARGE_USD", 0.03, 0.001, 1),
    timeoutSeconds: numberSetting(env, "PULSE_SOCIAL_TIMEOUT_SECONDS", 180, 1, 240, true),
    lookbackDays: 30,
    overlapHours: 48,
  };
}

export function collectionPlan(watchlist, settings) {
  const targets = socialTargets(watchlist, settings);
  return {
    platforms: settings.platforms,
    subjects: watchlist.subjects.length,
    entities: new Set(watchlist.subjects.map((s) => s.entitySlug)).size,
    xAccounts: targets.filter((t) => t.platform === "x").length,
    linkedinProfiles: targets.filter((t) => t.platform === "linkedin" && t.subject.kind === "person").length,
    linkedinCompanies: targets.filter((t) => t.platform === "linkedin" && t.subject.kind === "company").length,
    requests: targets.length,
    maxReturnedPosts: targets.reduce((n, t) => n + (t.platform === "x" ? settings.xMaxItems : settings.linkedinMaxPosts), 0),
    maxChargeUsd: Number(targets.reduce((n, t) => n + (t.platform === "x" ? settings.xMaxChargeUsd : settings.linkedinMaxChargeUsd), 0).toFixed(2)),
    concurrency: settings.concurrency,
    reviewAccounts: watchlist.subjects.reduce((n, s) => n + PLATFORMS.filter((p) => s[p].status === "review").length, 0),
    missingAccounts: watchlist.subjects.reduce((n, s) => n + PLATFORMS.filter((p) => s[p].status === "missing").length, 0),
    unresearchedEntities: watchlist.unresearchedEntities ?? [],
  };
}

export function inputForTarget(target, previous, now, settings) {
  const last = Date.parse(previous?.lastSuccessAt);
  const since = new Date(Math.max(now - settings.lookbackDays * DAY,
    Number.isFinite(last) && last <= now ? last - settings.overlapHours * 3_600_000 : 0)).toISOString();
  return target.platform === "x"
    ? { twitterHandles: [target.value], maxItems: settings.xMaxItems, sort: "Latest", start: since }
    : { targetUrls: [target.value], maxPosts: settings.linkedinMaxPosts, postedLimitDate: since,
        includeReposts: false, includeQuotePosts: true, scrapeComments: false, scrapeReactions: false };
}

export async function runApifyTarget(target, input, token, settings, fetchImpl = fetch) {
  const actor = target.platform === "x" ? "apidojo~tweet-scraper" : "harvestapi~linkedin-profile-posts";
  const maxItems = target.platform === "x" ? settings.xMaxItems : settings.linkedinMaxPosts;
  const maxCharge = target.platform === "x" ? settings.xMaxChargeUsd : settings.linkedinMaxChargeUsd;
  const url = new URL(`https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items`);
  url.search = new URLSearchParams({ timeout: String(settings.timeoutSeconds), maxItems: String(maxItems), limit: String(maxItems),
    maxTotalChargeUsd: String(maxCharge), restartOnError: "false" }).toString();
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout((settings.timeoutSeconds + 15) * 1000),
  });
  // Do not retry a run-start POST: a lost response can still represent a paid run.
  // Do not print vendor response bodies, which may contain request credentials.
  if (!response.ok) throw new Error(`Apify HTTP ${response.status}`);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error("Apify returned a non-array dataset");
  if (rows.some((r) => !r || typeof r !== "object" || r.error || r.errorMessage)) {
    throw new Error("Apify dataset contains an error record");
  }
  return rows;
}

function isoDate(raw) {
  if (raw === null || raw === undefined || raw === "") return null;
  const value = typeof raw === "number" && raw < 10_000_000_000 ? raw * 1000 : raw;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}

function socialUrl(value, platform) {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return null;
    const valid = platform === "x"
      ? /^(www\.)?(x|twitter)\.com$/.test(u.hostname) && /^\/[\w]+\/status\/\d+/.test(u.pathname)
      : /(^|\.)linkedin\.com$/.test(u.hostname) && /^\/(posts\/|feed\/update\/)/.test(u.pathname);
    if (!valid) return null;
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch { return null; }
}

export function normalizeSocialRows(target, rows, now, settings) {
  const { subject, platform } = target;
  const items = [];
  const rejected = {};
  const drop = (reason) => { rejected[reason] = (rejected[reason] ?? 0) + 1; };
  for (const r of rows) {
    if (r.noResults === true) continue;
    if (r.isRetweet || r.isRepost || (platform === "x" && /^RT @/.test(r.text ?? ""))) { drop("repost"); continue; }
    if (platform === "linkedin" && r.type && r.type !== "post") { drop("not-post"); continue; }
    if (platform === "x") {
      const author = String(r.author?.userName ?? r.author?.username ?? "").toLowerCase();
      if (author !== target.value) { drop("author-mismatch"); continue; }
    } else {
      // A single target per run makes attribution unambiguous even if the actor
      // omits author data. When present, it must match the verified account.
      const rawAuthor = r.author?.linkedinUrl;
      const identifier = r.author?.publicIdentifier ?? r.author?.universalName;
      const accountType = new URL(target.value).pathname.split("/")[1];
      const author = rawAuthor ? linkedinKey(rawAuthor) : identifier
        ? linkedinKey(`https://www.linkedin.com/${accountType}/${identifier}/`) : null;
      if ((rawAuthor || identifier) && author !== target.value) { drop("author-mismatch"); continue; }
    }
    const text = String(r.content ?? r.text ?? r.fullText ?? "").replace(/\s+/g, " ").trim();
    const url = socialUrl(r.linkedinUrl ?? r.postUrl ?? r.url ?? r.twitterUrl, platform);
    const publishedAt = isoDate(platform === "x" ? r.createdAt : r.postedAt?.date ?? r.postedAt?.timestamp ?? r.postedAt ?? r.date);
    if (!text || !url || !publishedAt) { drop("malformed"); continue; }
    if (Date.parse(publishedAt) < now - settings.lookbackDays * DAY || Date.parse(publishedAt) > now + 300_000) { drop("date-window"); continue; }
    const prefix = platform === "x" ? `@${target.value}` : `LinkedIn · ${subject.name}`;
    const historical = ["former", "uncertain"].includes(subject.relationship);
    const label = historical ? ` [${subject.relationship === "former" ? "formerly" : "affiliation under review:"} ${subject.entityName}]` : "";
    const points = platform === "x" ? r.likeCount : r.engagement?.likes ?? r.reactionsCount ?? r.likesCount;
    items.push({
      title: `${prefix}${label}: ${text.length > 160 ? text.slice(0, 157) + "…" : text}`,
      url, domain: platform === "x" ? "x.com" : "linkedin.com", publishedAt, sourceId: platform,
      companySlug: historical ? null : subject.pulseSlug,
      ...(Number.isFinite(points) && points >= 0 ? { points } : {}),
      social: { targetId: target.id, subjectId: subject.id, relationship: subject.relationship },
    });
  }
  return { items, rejected };
}

export async function collectSocial({ watchlist, token, state = { targets: {} }, settings = socialSettings(), now = Date.now(), runTarget = runApifyTarget }) {
  const targets = socialTargets(watchlist, settings);
  const items = [];
  const runs = [];
  const nextState = { schemaVersion: 1, targets: {} };
  const checkedAt = new Date(now).toISOString();
  // An account whose platform sits out this run keeps its incremental cursor.
  // Dropping it would refetch the whole lookback window on the next cadence,
  // which is exactly the charge the split cadence exists to avoid.
  const running = new Set(targets.map((target) => target.id));
  for (const target of socialTargets(watchlist)) {
    const carried = state.targets?.[target.id];
    if (!running.has(target.id) && carried) nextState.targets[target.id] = carried;
  }
  let cursor = 0;
  async function worker() {
    while (cursor < targets.length) {
      const target = targets[cursor++];
      const previous = state.targets?.[target.id];
      if (!token) {
        runs.push({ id: target.id, status: "skipped", ok: false, items: 0, reason: "APIFY_TOKEN is not configured" });
        if (previous) nextState.targets[target.id] = previous;
        continue;
      }
      const started = Date.now();
      try {
        const rows = await runTarget(target, inputForTarget(target, previous, now, settings), token, settings);
        const normalized = normalizeSocialRows(target, rows, now, settings);
        const cap = target.platform === "x" ? settings.xMaxItems : settings.linkedinMaxPosts;
        const hitLimit = rows.length >= cap;
        const partial = hitLimit || Boolean(normalized.rejected["author-mismatch"] || normalized.rejected.malformed);
        items.push(...normalized.items);
        runs.push({ id: target.id, status: partial ? "partial" : normalized.items.length ? "ok" : "empty", ok: !partial,
          items: normalized.items.length, fetched: rows.length, hitLimit, rejected: normalized.rejected, ms: Date.now() - started });
        // A capped or malformed response is not evidence of complete coverage.
        nextState.targets[target.id] = { ...(previous ?? {}), lastAttemptAt: checkedAt,
          ...(!partial ? { lastSuccessAt: checkedAt } : {}) };
      } catch (error) {
        // Sanitize unexpected transport errors too; never persist the token.
        const reason = String(error?.message ?? error).split(token).join("[redacted]").slice(0, 240);
        runs.push({ id: target.id, status: "failed", ok: false, items: 0, reason, ms: Date.now() - started });
        nextState.targets[target.id] = { ...(previous ?? {}), lastAttemptAt: checkedAt };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(settings.concurrency, targets.length) }, worker));
  runs.sort((a, b) => a.id.localeCompare(b.id));
  return { items, state: nextState, report: { generatedAt: checkedAt, plan: collectionPlan(watchlist, settings), targets: runs }, runs };
}

// A source label alone is insufficient: re-check saved social provenance against
// the current watch list, including removals and corrected affiliations.
export function isTrustedSocial(item, watchlist) {
  const subject = watchlist.subjects.find((s) => s.id === item.social?.subjectId);
  if (!subject) return false;
  const platform = item.social.targetId?.split(":")[0];
  const account = subject[platform];
  if (!PLATFORMS.includes(platform) || account?.status !== "verified" || `${platform}:${account.value}` !== item.social.targetId) return false;
  if (item.social.relationship !== subject.relationship) return false;
  const expectedSlug = ["former", "uncertain"].includes(subject.relationship) ? null : subject.pulseSlug;
  return item.companySlug === expectedSlug;
}

export function restoreLegacySocial(item, watchlist) {
  if (item.social || !(item.sources ?? []).some((s) => PLATFORMS.includes(s.id))) return item;
  let url;
  try { url = new URL(item.url); } catch { return item; }
  const targets = socialTargets(watchlist);
  const target = targets.find((t) => {
    if (!socialUrl(item.url, t.platform)) return false;
    if (t.platform === "x") return url.pathname.split("/")[1]?.toLowerCase() === t.value;
    const identifier = new URL(t.value).pathname.split("/")[2];
    return url.pathname.toLowerCase().startsWith(`/posts/${identifier}_`);
  });
  if (!target) return item;
  const historical = ["former", "uncertain"].includes(target.subject.relationship);
  return { ...item, companySlug: historical ? null : target.subject.pulseSlug,
    social: { targetId: target.id, subjectId: target.subject.id, relationship: target.subject.relationship } };
}

export function validateSocialState(state) {
  if (state.schemaVersion !== 1 || !state.targets || typeof state.targets !== "object" || Array.isArray(state.targets)) {
    throw new Error("Invalid social collector state");
  }
  for (const [id, target] of Object.entries(state.targets)) {
    for (const field of ["lastAttemptAt", "lastSuccessAt"]) {
      if (target[field] !== undefined && !Number.isFinite(Date.parse(target[field]))) throw new Error(`Invalid ${field}: ${id}`);
    }
  }
  return state;
}
