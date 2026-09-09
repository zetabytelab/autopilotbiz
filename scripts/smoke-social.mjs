// Four live, bounded requests. Uses the real writer in an isolated directory.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { main } from "./update-pulse.mjs";
import { loadCompanies, loadStackEntities } from "./pulse-entities.mjs";
import { readWatchlist, validateWatchlist, collectionPlan, socialSettings, collectSocial, runApifyTarget } from "./pulse-social.mjs";

const dir = resolve(process.env.PULSE_SMOKE_DIR ?? ".smoke-social");
mkdirSync(dir, { recursive: true });
const entities = [...loadCompanies(), ...loadStackEntities()];
const full = readWatchlist(new URL("../data/social-watchlist.json", import.meta.url), entities);
const selected = new Map([
  ["company:atoms", ["x", "linkedin"]],
  ["person:nanocorp:Pierre-Louis Biojout", ["linkedin"]],
  ["company:nanocorp", ["linkedin"]],
]);
const subjects = structuredClone(full.subjects.filter((s) => selected.has(s.id)));
for (const s of subjects) for (const platform of ["x", "linkedin"]) {
  if (!selected.get(s.id).includes(platform)) s[platform].status = "inactive";
}
const watchlist = validateWatchlist({ ...full, subjects }, entities);
const settings = socialSettings({ PULSE_X_MAX_ITEMS: "2", PULSE_LINKEDIN_MAX_POSTS: "2" });
const plan = collectionPlan(watchlist, settings);
if (plan.requests !== 4 || plan.maxChargeUsd > 0.1) throw new Error("Unexpected smoke-test scope");
if (!process.env.APIFY_TOKEN) throw new Error("APIFY_TOKEN is required for the live test");
writeFileSync(join(dir, "social-watchlist.json"), JSON.stringify(watchlist));
console.log("Live smoke plan:", JSON.stringify(plan));
const shapes = [];
await main({ dataDir: dir, flags: new Set(["--social-only"]), runSocial: (args) => collectSocial({
  ...args, settings,
  runTarget: async (...params) => {
    const rows = await runApifyTarget(...params);
    // Keep only schema/identity fields for diagnostics, never tokens or full posts.
    shapes.push({ targetId: params[0].id, rows: rows.map((r) => ({
      keys: Object.keys(r), author: r.author ? {
        linkedinUrl: r.author.linkedinUrl, universalName: r.author.universalName,
        publicIdentifier: r.author.publicIdentifier, userName: r.author.userName,
      } : null, postUrl: r.linkedinUrl ?? r.url, postedAt: r.postedAt ?? r.createdAt,
    })) });
    return rows;
  },
}) });
writeFileSync(join(dir, "response-shapes.json"), JSON.stringify(shapes, null, 2));
const report = JSON.parse(readFileSync(join(dir, "social-coverage.json"), "utf8"));
console.log(JSON.stringify(report, null, 2));
const failed = report.targets.filter((r) => ["failed", "skipped"].includes(r.status) || !r.published);
if (failed.length) throw new Error(`${failed.length} smoke targets did not publish a valid recent post`);
console.log("PASS: all four account types produced posts through the real Pulse writer.");
