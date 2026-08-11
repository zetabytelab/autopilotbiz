// Generates the README for github.com/zetabytelab/autopilot from lib/data.ts.
// Usage: npm run gen:index [-- /path/to/autopilot/README.md]
// Runs on plain Node (type stripping): node --experimental-strip-types scripts/generate-index-readme.ts
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { companies, caseStudies, stackLayers, stackTools, switchLog } from "../lib/data.ts";

const LEVEL_ORDER = { L5: 0, L4: 1, L3: 2, L2: 3 } as const;
const cell = (s: string | null | undefined) => (s && s.length ? s.replace(/\|/g, "\\|") : "—");
const link = (name: string, url: string | null) => (url ? `[${name}](${url})` : name);

const indexed = companies
  .filter((c) => c.autopilot?.section === "index")
  .sort((a, b) => {
    const la = LEVEL_ORDER[a.autopilot!.level ?? "L2"] - LEVEL_ORDER[b.autopilot!.level ?? "L2"];
    return la !== 0 ? la : (a.autopilot!.evidence ?? "D").localeCompare(b.autopilot!.evidence ?? "D");
  });

const indexRows = indexed
  .map((c) => {
    const m = c.autopilot!;
    const ev = m.evidence === "A" ? "**A**" : m.evidence ?? "—";
    const humans = c.metrics.humans != null ? `**${c.metrics.humans}**` : "—";
    return `| ${link(c.name, c.url)} | **${m.level}** | ${ev} | ${humans} | ${cell(c.metrics.arr)} | ${cell(m.story)} | ${cell(m.flags)} |`;
  })
  .join("\n");

const watchRows = companies
  .filter((c) => c.autopilot?.section === "watchlist")
  .sort((a, b) => LEVEL_ORDER[a.autopilot!.level ?? "L3"] - LEVEL_ORDER[b.autopilot!.level ?? "L3"])
  .map((c) => `| ${link(c.name, c.url)} | **${c.autopilot!.level}** | ${cell(c.autopilot!.story)} | ${cell(c.autopilot!.flags)} |`)
  .join("\n");

const cautionRows = companies
  .filter((c) => c.autopilot?.section === "caution")
  .map((c) => `| ${link(c.name, c.url)} | ${cell(c.autopilot!.story)} | ${cell(c.autopilot!.flags)} |`)
  .join("\n");

const enablerRows = companies
  .filter((c) => c.autopilot?.section === "enabler")
  .map((c) => {
    const humans = c.metrics.humans != null ? String(c.metrics.humans) : "—";
    return `| ${link(c.name, c.url)} | ${cell(c.autopilot!.story)} | ${humans} | ${cell(c.autopilot!.flags)} |`;
  })
  .join("\n");

const experimentRows = caseStudies
  .filter((cs) => cs.index)
  .map((cs) => {
    const url = cs.links[0]?.url ?? null;
    const name = cs.title.split("—")[0].trim();
    return `| ${link(name, url)} | ${cell(cs.index!.agent)} | ${cell(cs.index!.legwork)} | ${cell(cs.index!.cost)} |`;
  })
  .join("\n");

const stackRows = stackLayers
  .map((layer) => {
    const tools = stackTools
      .filter((t) => t.category === layer.key)
      .map((t) => `${t.name} (${t.usedBy.join(", ")})`)
      .join(", ");
    return `| **${layer.label.split("—")[0].trim()}** | ${layer.blurb} | ${cell(tools)} |`;
  })
  .join("\n");

const switchRows = switchLog
  .map((s) => `| ${s.date} | ${s.company} | ${cell(s.moved)} | ${cell(s.impact)} |`)
  .join("\n");

const readme = `<!-- GENERATED FILE — do not edit by hand.
     Source of truth: autopilotbiz/lib/data.ts (autopilot fields, switchLog, caseStudies).
     Regenerate with \`npm run gen:index\` in the autopilotbiz repo. -->

# 🛩️ The Autopilot Index

**Tracking companies run by AI — not AI companies.**

A new category is forming: businesses where **agents execute and humans direct**. One-person companies at $10M run rates. A payroll of two at $401M in audited sales. Sam Altman bet his CEO friends on when the first near-one-person billion-dollar company would appear — [he thinks he already won](https://www.nytimes.com/2026/04/02/technology/ai-billion-dollar-company-medvi.html).

This index tracks that category the way self-driving was tracked: by **autonomy level**, with every metric **evidence-graded and sourced**. Revenue is the least reliable signal in a category this young — autonomy is observable, so that's what we rank.

**Live tracker with full profiles, stack pyramid & news pulse → [autopilotindex.com](https://autopilotindex.com)**

---

## What qualifies

1. **Agents execute, humans direct** — AI performs core business operations end-to-end (selling, building, supporting, transacting). Copilots that make a human faster don't qualify.
2. **Extreme leverage** — ≤10 humans, or ≥$500K revenue per human. The org chart should look like a prompt.
3. **Real economics** — a citable revenue, funding, or exit signal. No signal yet → **Watchlist**, not the Index.
4. **Radical transparency** — every figure is labeled with an evidence grade and linked to its source. Disputed claims stay visible, flagged.
5. **The Guinndex rule** — not a company? Field experiments qualify when an agent does real-world economic legwork.

### Autonomy Levels

| Level | Name | Definition | Example |
|---|---|---|---|
| **L5** | Full autonomy | AI runs the company including capital allocation | 🏁 *Vacant — the finish line* |
| **L4** | Goal-level autopilot | Human sets goals & signs papers; AI operates the company day to day | *Vacant — claimed ([Egbe](#-watchlist--claims-before-evidence)), never verified* |
| **L3** | Operational autopilot | AI runs most core operations; human steers the big calls | [Polsia](#the-index) (~80% of founder ops, founder-reported) |
| **L2** | Function autopilot | AI runs whole functions end-to-end (support, growth, build) with human review | [Medvi](#the-index) |
| L1 | Copilot | AI assists; humans operate | *Out of scope* |

### Evidence Grades

| Grade | Meaning | Example |
|---|---|---|
| **A** | Third-party audited / verified financials | Medvi (NYT reviewed its financials directly) |
| **B** | Public transaction or filing (exit, funding docs) | Base44 ($80M cash acquisition by Wix) |
| **C** | Credible press + founder confirmation | Polsia (WSJ-reported customer count) |
| **D** | Founder claims only | Egbe (all traction self-reported) |

---

## The Index

*Autopilot-run companies with real economics, ranked by autonomy level, then evidence.*

| Company | Level | Evidence | Humans | Revenue | The story | Flags |
|---|---|---|---|---|---|---|
${indexRows}

*Revenue-per-human champion: Medvi at ~$200M/human. Purest autopilot story: Polsia at 1 human.*

---

## 📖 How to read the levels

The core question at every level is **who executes, and who decides** — headcount is deliberately not the question.

**L2 — Function autopilot** *(Medvi, Base44)*. Whole functions run end-to-end on AI: Medvi's ad creative is Midjourney/Runway, support is a chatbot, analytics are AI, the site was AI-built. But *the company* is not autonomous — Matthew Gallagher is the operating system connecting those functions, making every cross-functional call daily. The proof is in the NYT article itself: he tweaked the site before a hike, it broke, and the business lost ~200 customers because **no agent could decide to fix it**. That's the signature of L2 — remove the human for a week and the company degrades. Base44 is the same shape: AI built the product; the founder ran the business.

**L3 — Operational autopilot** *(Polsia, Nanocorp, Boardy)*. Agents run *across* functions — operations, support, even fundraising — and the human's job shrinks to steering. Polsia is the reference case: founder-reported ~80% of operations agent-run, a live dashboard showing the AI working on every customer's company, and the AI reportedly running much of its own $30M raise. Boardy earned L3 through a stunt that doubles as evidence: investors wired money without ever seeing a deck or speaking to a human — the AI *was* the counterparty. Why not L4: the founder is still in the loop **daily**, and everything is founder-reported (Grade C at best). L3 is where claims and evidence currently max out.

**L4 — Goal-level autopilot** *(vacant — claimed by Egbe)*. Human sets goals and signs the legal papers; AI operates the company day to day. Egbe's pitch is literally this sentence — "You found it. AI runs it." — and founder Nikolay Vyahhi's 100 pre-launch AI-run e-commerce startups on Mac minis is the most interesting *pre-evidence* for L4 anywhere. But no one has independently observed a company running for weeks without human operational intervention while serving real customers. That's the promotion test, and it's why L4 sits empty with Egbe on the Watchlist rather than in the Index.

**L5 — Full autonomy** *(vacant, structurally)*. Add capital allocation: the AI decides what to build next, whom to hire, where the profits go. Not just unproven — currently *legally impossible* (agents can't sign contracts or own assets; that's partly what enablers like Sapiom exist to route around). L5 is the finish line the whole index points at.

### The teams angle

Two things the levels reveal that a headcount column hides:

**Small ≠ autonomous, and autonomous ≠ small.** Medvi (2 humans) sits *below* Polsia (1 human) on the ladder — fewer humans didn't mean more autonomy, because the human works constantly and the AI never decides. Inverted: Midjourney runs ~$500M revenue on ~60 humans — spectacular *lean*, but it's an AI company run by humans, which is exactly why it's context and not in the Index. The [Lean AI leaderboard](https://github.com/henrythe9th/official-lean-ai-native-leaderboard) measures leverage; these levels measure who runs it. That's the category boundary.

**The "team" is really a four-layer stack**, and the levels describe which layer holds the middle of the org chart:

| Layer | What it is | Medvi example |
|---|---|---|
| Core humans | Payroll | 2 brothers |
| Shadow humans | Contractors & partners' staff | 7 contract account managers, 2 contract engineers, agencies — plus the doctors inside the rails |
| Rails | Departments bought as APIs | CareValidate, OpenLoop Health |
| Agents | The execution layer that grows with each level | Ads, support, analytics, code |

As a company climbs, agents eat the org chart **from the middle out**: execution first (L2), then coordination (L3), then operation (L4), then allocation (L5). Humans persist at two ends — the *top* (goals, signatures, accountability, which even L5 can't shed legally) and the *edges*, where they come back as a premium: Medvi added human account managers because retention needed relationship memory, and RentAHuman exists because agents need physical hands.

> **The org chart evolution:** L2 = human hub with agent spokes → L3 = agent mesh with a human governor → L4 = human chairman, AI CEO → L5 = human shareholder.

So the scouting question for each company isn't "how few people?" — it's **"which layers of the org chart have flipped from human to agent, and can they prove it?"** A level jump with evidence is the news event; the shadow-headcount disclosure is the honesty layer that keeps the index credible.

---

## 🔭 Watchlist — claims before evidence

*Passes the autonomy bar, no citable economics yet. Promotion requires a Grade C signal or better.*

| Company | Claimed level | The claim | Why we're watching |
|---|---|---|---|
${watchRows}

---

## 🟥 Cautionary tales

*Claims that didn't survive contact with reality. They stay listed — base rates are data.*

| Company | What was claimed | What happened |
|---|---|---|
${cautionRows}

*(Medvi carries flags in the Index above — verified revenue **and** an FDA letter can both be true.)*

---

## 🍺 Field experiments — the Guinndex rule

*Not companies. Proof that agents can do real economic legwork.*

| Experiment | Agent | The legwork | Cost |
|---|---|---|---|
${experimentRows}

---

## 🧱 Part 2 — The Enablers

*The companies and tools that make autopilot business possible. For a builder, this is the shopping list; for an investor, adoption here is the demand signal.*

### Enabler companies

| Company | What it enables | Humans | Signal |
|---|---|---|---|
${enablerRows}

### The stack behind the index

| Layer | What it does | Tools (used by) |
|---|---|---|
${stackRows}

<sub>*OpenLoop faces a Nov 2025 class action disputing its compounded pills. Rails cut both ways.</sub>

### 🔄 The Switch Log

*Production workloads voting with their wallets — the strongest infra demand signal there is.*

| Date | Company | Moved | Claimed impact |
|---|---|---|---|
${switchRows}

---

## Submitting a company

- **PR** against this README (keep the evidence-grade discipline: every figure needs a source link), or
- **[Submit via the tracker](https://autopilotindex.com/submit)** — goes through automated checks + human vetting.

Unverifiable claims land on the **Watchlist**, not the Index. That's a feature.

## About

Maintained by [@zetabytelab](https://github.com/zetabytelab) — one human + agents. Inspired by the structure of Henry Shi's [Lean AI Native Leaderboard](https://github.com/henrythe9th/official-lean-ai-native-leaderboard); different question. Lean AI asks *how much revenue per human?* The Autopilot Index asks ***who's actually running the company?***

**Data:** [CC BY 4.0](LICENSE) — use it, credit it. Some tool links on the companion site are affiliate links (disclosed there); rankings and inclusion are never paid.
`;

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = process.argv[2] ? resolve(process.argv[2]) : resolve(root, "../autopilot/README.md");
writeFileSync(out, readme);
console.log(`Wrote ${out} — ${indexed.length} indexed, ${readme.length} chars`);
