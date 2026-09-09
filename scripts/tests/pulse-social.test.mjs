import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCompanies, loadStackEntities } from "../pulse-entities.mjs";
import { main, itemRejectionReason } from "../update-pulse.mjs";
import {
  readWatchlist, validateWatchlist, socialTargets, socialSettings, collectionPlan,
  linkedinKey,
  inputForTarget, runApifyTarget, normalizeSocialRows, collectSocial,
  isTrustedSocial, restoreLegacySocial, validateSocialState,
} from "../pulse-social.mjs";

const entities = [...loadCompanies(), ...loadStackEntities()];
const bySlug = new Map(entities.map((e) => [e.slug, e]));
const watchlist = readWatchlist(new URL("../../data/social-watchlist.json", import.meta.url), entities);
const settings = socialSettings({});
const now = Date.now();
const publishedAt = new Date(now - 86_400_000).toISOString();
const cutoff = now - 30 * 86_400_000;
const targets = socialTargets(watchlist);
const targetFor = (id, platform) => targets.find((t) => t.subject.id === id && t.platform === platform);
const egbe = targetFor("company:egbe", "linkedin");
const ben = targetFor("person:polsia:Ben Cera", "x");
const former = targetFor("person:rentahuman:Patricia Tani", "linkedin");

function linkedInPost(target = egbe, id = "123456789", text = "A little look back at our team offsite in Tbilisi.") {
  return { type: "post", content: text, linkedinUrl: `https://www.linkedin.com/posts/${new URL(target.value).pathname.split("/")[2]}_activity-${id}-abcd`,
    author: { linkedinUrl: target.value }, postedAt: { date: publishedAt }, engagement: { likes: 7 } };
}

function tweet(target = ben, id = "123456789") {
  return { text: "Building something new", url: `https://x.com/${target.value}/status/${id}`,
    author: { userName: target.value.toUpperCase() }, createdAt: publishedAt, likeCount: 3 };
}

test("every usable registry account becomes exactly one target; uncertain accounts stay out", () => {
  assert.equal(watchlist.subjects.length, 245);
  assert.equal(new Set(watchlist.subjects.map((s) => s.entitySlug)).size, 67);
  const active = watchlist.subjects.reduce((n, s) => n + [s.x, s.linkedin].filter((a) => a.status === "verified").length, 0);
  assert.equal(targets.length, active);
  assert.equal(new Set(targets.map((t) => t.id)).size, active);
  for (const name of ["Jon Noronha", "Ambroz Bizjak", "Idan Raman", "Heikki Linnakangas"]) {
    assert.equal(targets.some((t) => t.subject.name === name && t.platform === "x"), false);
    assert.equal(targets.some((t) => t.subject.name === name && t.platform === "linkedin"), true);
  }
  assert.equal(targets.some((t) => t.subject.name === "Zhang Peng"), false);
  assert.equal(targets.find((t) => t.subject.name === "Jan Čurn").subject.pulseSlug, "stack-apify");
  assert.equal(targets.find((t) => t.subject.name === "Sam Altman").subject.pulseSlug, "stack-openai");
});

test("supplemental research preserves identity, former roles and unsupported account gaps", () => {
  const researched = ["nanocorp", "wordware", "feltsense", "caffeine", "atoms", "semio", "lunavo", "11x",
    "stack-sciforium", "stack-polar", "stack-agentmail", "stack-blaxel"];
  for (const slug of researched) {
    assert.ok(watchlist.subjects.some((s) => s.kind === "company" && s.pulseSlug === slug));
    assert.ok(!watchlist.unresearchedEntities.some((e) => e.slug === slug));
  }
  assert.equal(targetFor("company:nanocorp", "linkedin").value, "https://www.linkedin.com/company/nanocorphq/");
  assert.equal(targetFor("person:wordware:Filip Kozera", "linkedin").value, "https://www.linkedin.com/in/filipkozera/");
  const braden = targetFor("person:semio:Braden McDorman", "linkedin");
  assert.equal(braden.subject.relationship, "former");
  assert.equal(targetFor("company:semio", "x"), undefined);
  assert.equal(targetFor("company:atoms", "linkedin").value, "https://www.linkedin.com/showcase/atoms-dev/");
  assert.equal(watchlist.entityResearch.find((e) => e.pulseSlug === "atoms").officialLinkedinShowcase,
    "https://www.linkedin.com/showcase/atoms-dev/");
  assert.equal(watchlist.subjects.filter((s) => s.kind === "person" && s.pulseSlug === "stack-blaxel").length, 6);
});

test("Showcase roots and posts URLs preserve identity and reject other authors", () => {
  const atoms = targetFor("company:atoms", "linkedin");
  assert.equal(linkedinKey("https://www.linkedin.com/showcase/atoms-dev/posts/"), atoms.value);
  assert.equal(linkedinKey("https://linkedin.com.evil.test/showcase/atoms-dev/"), null);
  const post = linkedInPost(atoms);
  const identifierOnly = { ...post, author: { universalName: "atoms-dev" } };
  const wrong = { ...post, author: { linkedinUrl: "https://www.linkedin.com/company/unrelated/" } };
  const result = normalizeSocialRows(atoms, [post, identifierOnly, wrong], now, settings);
  assert.equal(result.items.length, 2);
  assert.equal(result.rejected["author-mismatch"], 1);
  assert.ok(result.items.every((i) => i.companySlug === "atoms"));
  assert.deepEqual(inputForTarget(atoms, undefined, now, settings).targetUrls, [atoms.value]);
  const bad = structuredClone(watchlist);
  bad.subjects.find((s) => s.id === "company:atoms").kind = "person";
  assert.throws(() => validateWatchlist(bad, entities), /Wrong LinkedIn/);
});

test("bad mappings, duplicate accounts, invalid settings and corrupt state fail before spending", () => {
  const bad = structuredClone(watchlist);
  bad.subjects[0].pulseSlug = "nonexistent";
  assert.throws(() => validateWatchlist(bad, entities), /mapping/);
  const duplicate = structuredClone(watchlist);
  duplicate.subjects.push({ ...duplicate.subjects.find((s) => s.x.status === "verified"), id: "duplicate" });
  assert.throws(() => validateWatchlist(duplicate, entities), /Duplicate active/);
  assert.throws(() => socialSettings({ PULSE_SOCIAL_CONCURRENCY: "0" }), /CONCURRENCY/);
  assert.throws(() => socialSettings({ PULSE_X_MAX_ITEMS: "Infinity" }), /MAX_ITEMS/);
  assert.throws(() => validateSocialState({ schemaVersion: 1, targets: { x: { lastSuccessAt: "bad" } } }), /lastSuccessAt/);
});

test("each account gets its own result allowance and an overlapping incremental window", () => {
  const plan = collectionPlan(watchlist, settings);
  assert.equal(plan.requests, targets.length);
  assert.equal(plan.linkedinCompanies, 61);
  assert.equal(plan.linkedinProfiles, 151);
  const first = inputForTarget(ben, undefined, now, settings);
  assert.deepEqual(first.twitterHandles, [ben.value]);
  assert.equal(first.maxItems, settings.xMaxItems);
  assert.equal(first.start, new Date(cutoff).toISOString());
  const previous = { lastSuccessAt: publishedAt };
  const next = inputForTarget(egbe, previous, now, settings);
  assert.deepEqual(next.targetUrls, [egbe.value]);
  assert.equal(next.postedLimitDate, new Date(Date.parse(publishedAt) - 48 * 3_600_000).toISOString());
  assert.equal(next.includeReposts, false);
});

test("normalization checks author, dates and post URL; LinkedIn engagement uses the documented shape", () => {
  const result = normalizeSocialRows(egbe, [linkedInPost(),
    { ...linkedInPost(), postedAt: null },
    { ...linkedInPost(), linkedinUrl: "javascript:alert(1)" },
    { ...linkedInPost(), author: { linkedinUrl: "https://www.linkedin.com/company/unrelated/" } },
    { ...linkedInPost(), postedAt: { date: new Date(now + 86_400_000).toISOString() } },
  ], now, settings);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].points, 7);
  assert.equal(result.rejected.malformed, 2);
  assert.equal(result.rejected["author-mismatch"], 1);
  assert.equal(result.rejected["date-window"], 1);
  assert.equal(normalizeSocialRows(ben, [tweet()], now, settings).items.length, 1);
  assert.equal(normalizeSocialRows(ben, [{ ...tweet(), author: { userName: "someoneelse" } }], now, settings).items.length, 0);
});

test("verified Egbe posts survive disambiguation on fresh and retained paths; unrelated news stays rejected", () => {
  const raw = normalizeSocialRows(egbe, [linkedInPost()], now, settings).items[0];
  assert.equal(itemRejectionReason(raw, bySlug, cutoff, watchlist), null);
  const retained = { ...raw, sourceId: undefined, sources: [{ id: "linkedin", url: raw.url }] };
  assert.equal(itemRejectionReason(retained, bySlug, cutoff, watchlist), null);
  const news = { ...raw, social: undefined, sourceId: "gnews", title: "Egbe community holds annual festival", domain: "news.example" };
  assert.equal(itemRejectionReason(news, bySlug, cutoff, watchlist), "ambiguous-company");
  assert.equal(itemRejectionReason({ ...raw, social: undefined }, bySlug, cutoff, watchlist), "unverified-social-account");
});

test("former founders remain tracked without assigning their new projects to their former employer", () => {
  const raw = normalizeSocialRows(former, [linkedInPost(former, "123", "Designing a new product at Whop")], now, settings).items[0];
  assert.equal(raw.companySlug, null);
  assert.match(raw.title, /formerly RentAHuman/);
  assert.equal(isTrustedSocial(raw, watchlist), true);
  assert.equal(isTrustedSocial({ ...raw, companySlug: "rentahuman" }, watchlist), false);
  const changed = structuredClone(watchlist);
  changed.subjects.find((s) => s.id === former.subject.id).linkedin.status = "review";
  assert.equal(isTrustedSocial(raw, changed), false);
});

test("old verified X posts get provenance from the URL; spoofed social URLs cannot acquire trust", () => {
  const old = { title: "@Bencera: hello", url: "https://x.com/Bencera/status/123", companySlug: "polsia", publishedAt,
    sources: [{ id: "x", url: "https://x.com/Bencera/status/123" }] };
  const upgraded = restoreLegacySocial(old, watchlist);
  assert.equal(isTrustedSocial(upgraded, watchlist), true);
  assert.equal(itemRejectionReason(upgraded, bySlug, cutoff, watchlist), null);
  assert.equal(restoreLegacySocial({ ...old, url: "https://x.com.evil.example/Bencera/status/123" }, watchlist).social, undefined);
});

test("one failed target preserves the others, bounds concurrency and retains its successful cursor", async () => {
  const small = { ...watchlist, subjects: watchlist.subjects.filter((s) => [egbe.subject.id, ben.subject.id, former.subject.id].includes(s.id)) };
  const previous = { schemaVersion: 1, targets: { [egbe.id]: { lastSuccessAt: publishedAt } } };
  let running = 0, peak = 0;
  const visited = new Set();
  const result = await collectSocial({ watchlist: small, token: "fixture-secret", state: previous, now, settings: { ...settings, concurrency: 2 },
    runTarget: async (target) => {
      visited.add(target.id); running++; peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 5)); running--;
      if (target.id === egbe.id) throw new Error("transport failed fixture-secret");
      return target.platform === "x" ? [tweet(target)] : [linkedInPost(target)];
    } });
  assert.equal(visited.size, socialTargets(small).length);
  assert.equal(peak, 2);
  assert.equal(result.items.length, visited.size - 1);
  assert.equal(result.state.targets[egbe.id].lastSuccessAt, publishedAt);
  assert.match(result.runs.find((r) => r.id === egbe.id).reason, /\[redacted\]/);
  assert.equal(JSON.stringify(result.report).includes("fixture-secret"), false);
});

test("missing credentials are visible and invoke no actors; truncated responses do not advance the cursor", async () => {
  const small = { ...watchlist, subjects: [egbe.subject] };
  let calls = 0;
  const skipped = await collectSocial({ watchlist: small, token: "", settings, runTarget: async () => { calls++; return []; } });
  assert.equal(calls, 0);
  assert.ok(skipped.runs.every((r) => r.status === "skipped"));
  const result = await collectSocial({ watchlist: small, token: "fixture", settings: { ...settings, linkedinMaxPosts: 1 }, now,
    runTarget: async (t) => t.platform === "linkedin" ? [linkedInPost()] : [] });
  assert.equal(result.runs.find((r) => r.id === egbe.id).status, "partial");
  assert.equal(result.state.targets[egbe.id].lastSuccessAt, undefined);
});

test("Apify requests have timeouts and spend ceilings, keep secrets out of URLs, and never retry run-start POSTs", async () => {
  let calls = 0;
  await assert.rejects(runApifyTarget(ben, inputForTarget(ben, undefined, now, settings), "fixture-secret", settings, async (url, options) => {
    calls++;
    assert.equal(url.searchParams.has("token"), false);
    assert.equal(url.searchParams.get("maxTotalChargeUsd"), String(settings.xMaxChargeUsd));
    assert.equal(options.headers.authorization, "Bearer fixture-secret");
    assert.ok(options.signal instanceof AbortSignal);
    return { ok: false, status: 408 };
  }), /408/);
  assert.equal(calls, 1);
  await assert.rejects(runApifyTarget(ben, {}, "fixture", settings, async () => ({ ok: true, json: async () => [{ error: "actor failed" }] })), /error record/);
  await assert.rejects(runApifyTarget(ben, {}, "fixture", settings, async () => ({ ok: true, json: async () => ({ items: [] }) })), /non-array/);
});

test("actual pipeline writes posts and coverage, deduplicates repeats and keeps verified posts during an outage", async () => {
  const dir = mkdtempSync(join(tmpdir(), "pulse-social-test-"));
  try {
    const small = { ...watchlist, subjects: [egbe.subject, ben.subject, former.subject] };
    writeFileSync(join(dir, "social-watchlist.json"), JSON.stringify(small));
    const json = (name) => JSON.parse(readFileSync(join(dir, name), "utf8"));
    const runSocial = (args) => collectSocial({ ...args, token: "fixture", runTarget: async (t) =>
      t.id === egbe.id ? [linkedInPost(), linkedInPost()] : t.id === former.id ? [linkedInPost(former, "555", "Building at Whop")] : [] });
    await main({ dataDir: dir, flags: new Set(["--social-only"]), runSocial });
    const first = json("pulse.json");
    assert.equal(first.items.length, 2);
    assert.equal(first.items.find((i) => i.companySlug === "egbe").kind, "social");
    assert.equal(json("social-coverage.json").targets.find((r) => r.id === egbe.id).published, 1);
    await main({ dataDir: dir, flags: new Set(["--social-only"]), runSocial });
    assert.equal(json("pulse.json").items.length, 2);
    await main({ dataDir: dir, flags: new Set(["--social-only"]), runSocial: (args) => collectSocial({ ...args, token: "fixture",
      runTarget: async () => { throw new Error("Apify HTTP 503"); } }) });
    assert.equal(json("pulse.json").items.length, 2);
    assert.equal(json("social-coverage.json").targets.find((r) => r.id === egbe.id).retained, 1);
    assert.ok(json("social-coverage.json").targets.every((r) => r.status === "failed"));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
