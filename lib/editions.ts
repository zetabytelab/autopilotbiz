// Autopilot Pulse editions — canonical home. LinkedIn carries the adaptation;
// this file renders /pulse pages, the RSS feed, and the Brevo email mirror
// (scripts/send-edition.ts). Body paragraphs support **bold** spans only.

export type EditionSection = {
  heading?: string;
  paras: string[];
  image?: string;
  imageAlt?: string;
};

export type Edition = {
  slug: string;
  number: number;
  title: string;
  date: string; // ISO
  tldr: string[];
  cover: string;
  linkedinUrl: string;
  sections: EditionSection[];
};

export const editions: Edition[] = [
  {
    slug: "06-throwaway-computer",
    number: 6,
    title: "A computer your agent can throw away",
    date: "2026-09-10",
    cover: "/pulse/06-cover.png",
    linkedinUrl: "https://www.linkedin.com/newsletters/autopilot-pulse-7494069864693850112/",
    tldr: [
      "An agent shipped a sanctions screener in **32 minutes** with twenty green tests. It had cleared **three of four sanctioned people**. Nothing was broken: it mocked its own misunderstanding of the API, then proved itself right against it.",
      "**A mock is your own misunderstanding, written down.** The same agent, given a working copy of the world instead, asked 24 questions, found it needed two schemas rather than one, and shipped verified at 40 minutes with four of four caught.",
      "**Calibre run a triage agent over every recorded user session.** Replay frames, logs and a PostHog summary go in; a pull request comes out carrying the original session, the reproduction and the verified fix as three videos. Around a penny a session.",
      "**Price your cache before you price your model.** Uncached input is 28% of Calibre's tokens and 64% of the bill. Lifting the cache hit rate from 72% to 90% saves about as much as swapping the model, with no vendor to bet on. **[DERIVED]**",
      "Six talks, one primitive: a computer you can create in a second, hand to an agent, snapshot mid-task and throw away. Hosted by **Daytona with Civo**, featuring **Calibre, Veris AI, Polpo and Sparkles**.",
    ],
    sections: [
      {
        paras: [
          "An agent was handed a ticket: build a sanctions screener. It read the documentation, wrote the code, mocked the upstream service, and ran twenty tests. All twenty passed. It shipped in 32 minutes. It had cleared three of four sanctioned people.",
          "Nothing was broken. Every test was real and every test was green. The agent had mocked its own misunderstanding of the API, then proved itself right against it.",
          "I watched that demo on Tuesday at AI Builders London, hosted by **Daytona with Civo**. Six talks, three hundred people, pizza an hour late because the evening overran. The theme was sandboxes: a computer you can create in under a second, hand to an agent, snapshot mid-task, and throw away. The infrastructure turned out to be the least interesting part. What two teams built on top of it is what I have been thinking about since.",
        ],
      },
      {
        heading: "1 — The primitive, and who is using it",
        paras: [
          "Daytona started in 2023 as a dev-environment manager for human engineers. Agent teams kept asking for something the product did not do, so they rebuilt around the sandbox: CPU, memory, storage, GPU, networking and operating system configured on demand, then started, paused or snapshotted at any point.",
          "**$24M Series A** led by FirstMark in February 2026, roughly $31M raised in total, a million-dollar forward run rate within three months of launch that doubled six weeks later, and **LangChain, Writer, Turing and SambaNova** as named customers. **[HIGH]**",
          "One change worth knowing before you evaluate: in **June 2026 Daytona moved its production codebase to closed source**. The public repository is still there but unmaintained. If your interest was the self-hosting story, that story has changed.",
        ],
      },
      {
        heading: "2 — Calibre: moving towards software factories",
        image: "/pulse/06-calibre-pyramid.jpg",
        imageAlt: "Calibre's complexity pyramid, with auto-session replays at the base and an engineer in the loop at the top",
        paras: [
          "Calibre certifies companies for ISO 27001. Their talk was a builder's account rather than a pitch, because **Cepheid is their internal maintenance agent, not their product**. That is exactly why it was the most useful thing all evening. They showed the architecture, the failures and the bill.",
          "They started by deciding what to hand over, which is the step most teams skip. Maintenance, dependency updates, bugs and interface problems go to **Cepheid auto-session replays**. Small features, API endpoints and integrations go through **Cepheid in Slack**. New features keep an engineer in the loop with the agent supplying deep context, and building a new product from scratch stays human. Nobody claimed the top of the pyramid, which is the honest version of this story.",
        ],
      },
      {
        image: "/pulse/06-calibre-session-evidence.jpg",
        imageAlt: "The session evidence slide: replay frames, a screenshot at any timestamp on request, and frontend plus backend logs for the same user and window",
        paras: [
          "The loop starts from what a real user actually did. Frames are pulled from the session replay at key events and interactions. The agent can ask for a screenshot at any timestamp, so it is not stuck with whatever was sampled. It gets frontend and backend logs for the same user and the same time window, plus a **PostHog AI summary** of the session.",
          "That is a genuinely rich evidence packet, and none of it required new instrumentation. If you already run session replay and product analytics, you already have it.",
        ],
      },
      {
        image: "/pulse/06-calibre-implementation.jpg",
        imageAlt: "The Cepheid implementation diagram: session evidence to a triage agent in a sandbox, then either a coding agent or no finding",
        paras: [
          "Session evidence goes to a triage agent running in a sandbox, which inspects behaviour and code. Most of the time it returns no finding and the work stops there. When it does find something, a coding agent takes over to reproduce, fix and verify.",
        ],
      },
      {
        heading: "3 — Triage: most sessions have nothing to fix",
        image: "/pulse/06-calibre-triage.jpg",
        imageAlt: "The triage slide: a cheap first pass on every replay, a stronger model only on findings, and a record of each session kept to find patterns",
        paras: [
          "The idea that makes the whole thing affordable is that **most sessions have nothing wrong with them**. A cheap model does the first pass on every replay. Only when it flags something does a stronger model investigate and fix.",
          "They keep a record of every session either way, so patterns emerge across sessions rather than only within one. That last part matters more than it sounds: a bug that appears once is noise, and the same bug across forty sessions is a priority.",
        ],
      },
      {
        heading: "4 — Fixing issues, and making them reviewable",
        image: "/pulse/06-calibre-fixing-issues.jpg",
        imageAlt: "The fixing issues slide: the pull request shows the original user session, the reproduction and the verified fix side by side, with cause, fix and a verification checklist",
        paras: [
          "When there is something to fix, the agent reuses the same session rather than starting from a bug report. Cepheid first reproduces the problem in the preview environment. Then the pull request arrives carrying **three videos side by side**: the original user session, the reproduction, and the verified fix. Underneath sits the cause, the fix, and a verification checklist that has been ticked off.",
          "The example on screen was an uploaded policy disappearing between questionnaire steps, with the cause identified as the attachment state being cleared when advancing a step. A reviewer can confirm that in about thirty seconds without opening the code.",
          "**This is the single most copyable idea of the night.** The hard part of an autonomous fix is not writing it, it is making it reviewable.",
        ],
      },
      {
        image: "/pulse/06-calibre-slack.jpg",
        imageAlt: "The Slack slide: each session gets a thread with the replay and findings, and replying sends the agent back in with the evidence in context",
        paras: [
          "Every session gets a Slack thread with the replay and the findings, and you can reply to ask a question or send the agent back in. It picks up the same conversation with the evidence still loaded.",
          "The example they chose to show found nothing: a 50-minute session, 68 clicks, 44 minutes of idle skipped, one flagged rage-click correctly dismissed as someone tapping the same rating button down a list. Status: inspected, nothing notable.",
          "Choosing a negative result for your one demo slide is a deliberate signal, and almost nobody does it. **Publishing what your agent checked and cleared is how the thing earns trust.** A system that only speaks up when it finds something teaches you nothing about whether it is looking.",
        ],
      },
      {
        heading: "5 — The bill, and choosing models by cost",
        image: "/pulse/06-calibre-cost-luna.jpg",
        imageAlt: "Cepheid cost with Luna: $11.94 per 1,000 session replays, split across uncached input, cached input and output",
        paras: [
          "What made Cepheid possible was a model cheap enough to run on every session rather than the suspicious ones. Triage costs **$11.94 per thousand replays**, which is about 1.19 cents a session.",
        ],
      },
      {
        image: "/pulse/06-calibre-cost-glm.jpg",
        imageAlt: "Cepheid cost with GLM 5.3 Flash: $4.82 for 1,000 replays against Luna's $11.94",
        paras: [
          "Swapping the model takes that to **$4.82**, or 0.48 cents a session. Real money at volume. But the row that was not on a slide is the one I would act on first.",
          "**Uncached input is 28% of their tokens and 64% of the bill.** Lifting the cache hit rate from 72% to 90% would take the Luna figure to about $7.49, a 37% saving on its own, comparable in size to the entire model swap, with no migration and no vendor to bet on. **[DERIVED]**",
          "Two caveats were on Calibre's own slides, which is to their credit. The cheaper column assumes the same token and cache usage rather than a measured run, and model swaps change output length. And the promotional pricing behind it expired the following afternoon. Both cost slides also carry the line that stronger-model fixes and hosting are additional, which makes $11.94 a floor rather than a cost.",
          "**Price your cache before you price your model.**",
        ],
      },
      {
        heading: "6 — Veris: give your agent a world, not a mock",
        image: "/pulse/06-veris-fleet.jpg",
        imageAlt: "Eight coding agents on their own branches, all waiting for one shared set of test accounts with real keys, shared state and rate limits",
        paras: [
          "Veris starts from a problem you only get once agents are working. It is not a capability problem. It is a queue.",
          "Eight coding agents, each on its own branch, all queueing for one shared set of test accounts. One Stripe test mode, one Salesforce sandbox org, one Slack dev workspace. Real keys, shared state, rate limited. Roughly **300 changes a day** arriving and about **15 minutes to verify one**. The agents are no longer the bottleneck. The single shared world is.",
        ],
      },
      {
        image: "/pulse/06-veris-own-world.jpg",
        imageAlt: "Each agent gets its own sandbox with its own copy of every dependency, nothing shared and nothing to wait for",
        paras: [
          "The fix is obvious once stated: each agent gets its own copy of every dependency. Nothing shared, nothing to wait for. That is what a cheap sandbox buys you. But it is only half the problem.",
        ],
      },
      {
        image: "/pulse/06-veris-data-agree.jpg",
        imageAlt: "The same customer present in Stripe, Salesforce and Slack with matching identifiers, one set of facts that every service agrees on",
        paras: [
          "The same customer has to exist in Stripe, in Salesforce, in Slack and in your database, **with matching identifiers**. One set of facts, every service agreeing. Mocking one API is trivial. **Making eight services agree on a coherent entity graph is the actual moat**, and it is why this is a product rather than a fixture file.",
        ],
      },
      {
        image: "/pulse/06-veris-console.jpg",
        imageAlt: "The Veris console showing an environment with seven shared services including Stripe, GitHub, Slack, Google Drive, PostgreSQL and the OpenSanctions screening API",
        paras: [
          "In the console that becomes an environment you launch: seven services wired together, including a real Postgres cluster reachable from outside the sandbox.",
        ],
      },
      {
        heading: "7 — Is the twin actually right?",
        image: "/pulse/06-veris-fidelity.jpg",
        imageAlt: "721 tests written by people who never saw the twin, 703 matching the real vendor with zero false passes, and 3.6 times faster",
        paras: [
          "This is where most simulation pitches wave their hands. Veris ran an experiment designed to fail. They took other people's open-source integration suites across fifteen services, from Stripe to Calendly, pointed them at the real vendor, then at the twin, **changing only the base URL**.",
          "721 tests. 703 matched on both outcome and error code. **Zero false passes**, which is the failure mode that ships broken code. Of the eighteen failures they attributed fourteen to their own setup, stale data or a vendor outage, and four to the twin.",
          "The sharper number is underneath: on a fresh deployment 238 of 238 runs were identical, while the live vendors drifted by four. That argues the twin is better than production for testing rather than merely cheaper. And at 78ms against 283ms it is 3.6 times faster, which matters when you are running rollouts rather than a test suite.",
          "Publishing your own failure attribution is what makes the rest of it credible. Seventy services are twinned and fifteen were measured here, so the fidelity of the other fifty-five is the open question.",
        ],
      },
      {
        heading: "8 — Same ticket, same agent. One had a world.",
        image: "/pulse/06-veris-trajectory.jpg",
        imageAlt: "The trajectory comparison: a plain agent shipped at 32 minutes clearing three of four sanctioned people, while the same agent with a world shipped verified at 40 minutes catching four of four",
        paras: [
          "Same ticket, same agent, same prompt. The plain agent read the docs, wrote a sanctions screener against a single schema, mocked the upstream service, passed twenty tests, and shipped at **32 minutes with three of four sanctioned people cleared**. A human found that later.",
          "The one with a world spent 90 seconds creating a sandbox, then **asked the twin 24 questions**, discovered it needed two schemas rather than one, and shipped verified at 40 minutes with all four caught and nothing to repair.",
          "**The world made the agent slower. Forty minutes against thirty-two. That is the point.** It let the agent find out it was wrong.",
          "The plain agent mocked its own misunderstanding and then passed twenty tests against it. Every green tick was real and the result still shipped broken. That is the argument for environment fidelity, demonstrated rather than asserted, and it is the same conclusion Sparkles reached from the other direction: their chart of Cursor's own telemetry shows merged agent pull requests going near-vertical when environment monitoring shipped, not when the agents got smarter.",
        ],
      },
      {
        image: "/pulse/06-veris-closing.jpg",
        imageAlt: "The Veris closing slide: build against the world, ship against the real one",
        paras: [
          "Build against the world, ship against the real one. It is a good line because it names the actual trade: your agent needs somewhere consequence-free to be wrong, and production is not it.",
        ],
      },
      {
        heading: "9 — The rest of the room",
        paras: [
          "**Polpo** put a tool proxy between the agent and Daytona that asks one question per turn: does this need isolation at all? Researching competitor pricing needs a model and web search and no sandbox. Generating the PDF afterwards needs a filesystem and a shell. Most architectures pay for both halves. The cheapest sandbox is the one you never start.",
          "**Sparkles.dev** showed how much merged code at serious engineering organisations now comes from an internal cloud coding agent: Ramp at 76.5%, Sierra at 70%, Cursor at 56%, with Fullscript, Checkout.com and Shopify still in the teens. Every one of them already had Cursor or Claude Code and built their own platform anyway. Dan Bekirov closed on the line the whole evening kept circling: AI created more code, it did not create trust.",
          "**Civo and relaxAI** made the sovereignty case. UK-governed compute with B200s available, and turnkey sovereign models on top, aimed at regulated buyers who want to own the whole stack. Daytona sandboxes are supported on both, so the architectures above survive the move. If you sell into UK financial services, healthcare or the public sector, jurisdiction is a wedge your American competitors cannot copy quickly.",
        ],
      },
      {
        heading: "10 — What to do this week",
        paras: [
          "**Start a sandbox.** An hour is enough to know whether a throwaway computer changes your architecture. The free tiers are generous and the primitive only makes sense in your hands.",
          "**Copy Calibre's loop.** If you already record sessions, you are one cheap triage model away from an agent that reviews all of them. Ship the three-video pull request and publish the non-findings.",
          "**Give one agent a real environment before you give it more autonomy.** The Veris trajectory is the cheapest possible lesson: green tests against your own mock prove only that you understood the API the way you already thought you did.",
          "**Ask two questions of anyone selling you this.** How often is your router, triage or classifier wrong, and what happens when it is? And what does your headline saving look like at full utilisation? Every architecture on that stage gated an expensive path behind a cheap decision, and not one published that decision's error rate.",
          "Then talk to them. This is a small and unusually open ecosystem, and every founder was reachable in the room and honest about their limits. I am going to run the Calibre loop on this site and publish what it costs. If you try one of these, tell me what broke.",
        ],
      },
    ],
  },
  {
    slug: "05-two-readers",
    number: 5,
    title: "Your website has two readers now",
    date: "2026-09-03",
    cover: "/pulse/05-cover.png",
    linkedinUrl: "https://www.linkedin.com/pulse/autopilot-pulse-5-your-website-has-two-readers-now-agents-antonio-s--7jjde/",
    tldr: [
      "Your website has **two readers** now — a human, and an AI agent that reads your raw response as data and decides in one pass whether it can use you. In 2026 **Vercel, Cloudflare and Ora** all shipped a 0–100 agent-readiness score.",
      "The graders **disagree**: behavioral (Ora/Vercel watch an agent attempt a task) vs protocol (Cloudflare — Web Bot Auth, MCP cards, agentic commerce) vs GEO (Glippy, aeojs). A 100 on one is not a 100 on another.",
      "**Readability is table stakes; being *callable* is the moat.** Most of the web is invisible to agents — only **~4%** do markdown content negotiation and **fewer than 15 sites globally** publish an MCP Server Card **[HIGH]**.",
      "I took my own site **68 → 90** in a day of fixes, then built a public **API + MCP server** so an agent can *use* the index, not just read it.",
      "The full playbook — every grader compared, the six-category taxonomy, the L0→L5 ladder, the tiered 0→1 steps, and an **agent-executable** version — lives at **autopilotindex.com/guides/agent-ready-web**.",
    ],
    sections: [
      {
        paras: [
          "For most of the web's life it had one kind of reader: a human, with eyes, on a page. That assumption is quietly breaking. Your site now has a second reader — an AI agent, arriving with a task, reading your HTML as data, and deciding in seconds whether it can use you or should move on. Here's the shift, what I did about it on this very site, and the playbook to do it yourself.",
        ],
      },
      {
        heading: "1 — Two infra giants built the same scoreboard",
        paras: [
          "This year **both Vercel and Cloudflare shipped a 0-to-100 agent-readiness score** — Vercel's `is-agentic` (powered by Ora / Era Labs), Cloudflare's at isitagentready.com **[HIGH]**. When the two companies that route a huge share of the internet build the same scoreboard in the same year, it isn't a gimmick — it's a signal about where traffic is going.",
          "They don't agree on what to measure. Ora and Vercel are **behavioral** — they send a real agent to complete a task on your live site and watch where it gets stuck. Cloudflare is **protocol-first** — it checks whether you speak the emerging standards (Web Bot Auth, Content Signals, MCP Server Cards, agentic commerce). GEO tools like Glippy and aeojs check AI-search visibility. A 100 on one is not a 100 on the others — which is exactly why a consensus view matters.",
        ],
      },
      {
        heading: "2 — The day of fixes (68 → 90)",
        image: "/pulse/05-before-after.png",
        imageAlt: "is-agentic score before and after: 68 'Important blockers remain' to 90 'Strong technical baseline'",
        paras: [
          "I ran it on this site and got **68/100 — \"important blockers remain.\"** Most of the gap closed in an afternoon, in public: a **sitemap** and an **llms.txt** with a \"when to use this\" section, **JSON-LD** so an agent can parse who I am, real **About / Contact / Pricing** pages (agents check these to decide you're legitimate), **404s that actually return 404**, and **markdown content negotiation**.",
          "That got me into the 80s. The uncomfortable framing from Cloudflare's own data: across the 200,000 most-visited domains, only **~3.9%** support markdown negotiation and **~4%** declare AI usage preferences **[HIGH]**. Most of the web is invisible to the second reader — so being early here is cheap and rare.",
        ],
      },
      {
        heading: "3 — Read vs use: the part most sites miss",
        paras: [
          "The check I couldn't fake was the one that reframed everything: no API, no OpenAPI spec, no MCP server. It made me ask what an index is actually *for*. A human reads it. An agent should be able to **call** it.",
          "So I built that: a public, read-only REST API, an OpenAPI 3.1 spec, and — the part that matters — an **MCP server**, so any agent can query the index natively. Security-hardened: read-only, whitelisted fields, validated inputs. The tell on how early this is: Cloudflare found **fewer than 15 sites globally** publish an MCP Server Card **[MED]**. Final score: **90/100 — \"strong technical baseline.\"** But the 90 isn't the win. The win is that the index went from something an agent can *read* to something an agent can *use*.",
        ],
      },
      {
        heading: "4 — What a builder should do about it",
        paras: [
          "**Ship the plumbing now — it's cheap and rare.** Sitemap, llms.txt with when-to-use, JSON-LD, real trust pages, honest 404s. An afternoon of work that ~96% of the web hasn't done.",
          "**Decide what an agent should be able to *do*, not just read.** If your product is data — a catalog, an index, a directory, docs — an API + MCP server turns it from a page an agent scrapes into a tool an agent calls. That's a different, more durable relationship.",
          "**Don't optimize the badge — optimize the outcome.** A 100 doesn't mean an agent can complete a real task on your site. Fix the checks, then watch an agent actually try to use you. The full playbook — every grader compared, the maturity ladder, the tiered steps, and a version you can point Claude Code or Codex straight at — is at **autopilotindex.com/guides/agent-ready-web**. If you run a business on autopilot, what's the first thing you'd want an agent to *do* on your site — not just read?",
        ],
      },
    ],
  },
  {
    slug: "04-ai-gateway-wars",
    number: 4,
    title: "The AI gateway wars",
    date: "2026-08-31",
    cover: "/pulse/04-cover.png",
    linkedinUrl: "https://www.linkedin.com/pulse/ai-gateway-wars-antonio-s--bemwe",
    tldr: [
      "The **gateway layer** — the pipe between your app and every model — just became the most contested real estate in AI. In ~3 months two of the biggest got acquired and everyone else shipped their own.",
      "**Stripe is acquiring OpenRouter** for a reported **$7B+** (sources range $7–10B) — roughly **5× the $1.3B valuation** it set three months earlier. Signed; closing expected in weeks.",
      "**Palo Alto Networks bought Portkey** (closed May 2026), folding it into agent-security — a second gateway acquisition in one quarter.",
      "The platforms are hoarding the layer: **Databricks** (reportedly bid, lost, shipped its own Unity AI Gateway), **Vercel**, **Ramp**, plus incumbents **Cloudflare** and **Kong** ($2B valuation).",
      "The builder lesson: **don't single-thread your gateway, own your fallback, and treat cost-routing as a first-class lever** — the difference between a $1.2M and a $100K model bill.",
    ],
    sections: [
      {
        paras: [
          "The least glamorous layer of the AI stack is the routing/spend/fallback \"gateway\" that sits between your app and every model provider. In 2026 it became the most strategic — because whoever owns the meter owns the margin. Here's the consolidation, who owns what now, and what a builder should actually do about it.",
        ],
      },
      {
        heading: "1 — The consolidation, dated",
        image: "/pulse/04-sankey.png",
        imageAlt: "Consolidation flow: OpenRouter (~100T tokens/mo) → Stripe; Portkey → Palo Alto; Helicone → Mintlify; Seldon → TrueFoundry",
        paras: [
          "**Stripe agreed to buy OpenRouter.** Reporting ran from Axios and Bloomberg into Stripe's own newsroom around Aug 19–21; the deal is signed, not yet closed. The price is genuinely unsettled — outlets range **$7B to $10B**, with **$7.5B** the best point estimate — a ~5× markup on the **$1.3B** valuation OpenRouter set just three months earlier. **[HIGH** the deal is real; **MED** on the exact figure.** Stripe's Patrick Collison put the thesis plainly: *\"Tokens are the central currency for companies building with AI.\"*",
          "**Palo Alto Networks bought Portkey** (announced April, closed May 2026), folding it into its Prisma AIRS agent-security product **[HIGH]** — the second gateway swallowed in a single quarter. And **Databricks reportedly bid for OpenRouter, lost, and shipped its own Unity AI Gateway** instead **[MED** on the bid; **HIGH** on the product**]**. Even a PitchBook piece asked the quiet part out loud: *\"Everyone is building AI routers. Are they a dead end?\"*",
        ],
      },
      {
        heading: "2 — The battlefield, mapped",
        image: "/pulse/04-quadrant.png",
        imageAlt: "The AI Gateway Quadrant — leaders, challengers, visionaries and niche players across control-plane breadth and execution",
        paras: [
          "**Independent gateways** are where the action (and the exits) are: **OpenRouter** (500+ models, ~5.5% markup) now Stripe-bound; **LiteLLM** (open-source, ~$7M ARR, the self-host default); **Kong** ($175M at $2B) shipping AI Gateway 2.0; **Requesty** (600+ models, the broadest); **Not Diamond** ($0.05/M tokens routed); and **Sapiom** ($50M raised — Accel seed + Dragonfly A), the cost-router we covered whose routing cut one bill ~10×. The churn is just as telling: **Helicone was absorbed by Mintlify, Martian pivoted to research, and Unify left for agents** — three would-be gateways gone in a quarter.",
          "**Platform-owned** gateways come at the layer from opposite ends. **Vercel AI Gateway** (now GA, on Fluid compute) is a developer-experience play — keep AI-app builders inside the Vercel/AI-SDK stack from prototype to production. **Akamai's AI & API Manager** (Zuplo-powered, on Akamai Cloud, native to OpenAI/Claude/Gemini) is the opposite: edge distribution plus **API/AI monetization** to its enterprise base — AccuWeather is the proof customer. Same layer, opposite go-to-markets. **Databricks** (Unity AI Gateway, now GA) and the hyperscalers bundle it into the data/cloud estate.",
          "And the surprise segment — **payments/fintech-owned** (Stripe via OpenRouter, Ramp's own gateway) — understands the real prize: the metering layer, not the models. **The full segmented map, with funding and who-owns-what, lives on the index.**",
        ],
      },
      {
        heading: "3 — The money — who's funding the layer",
        paras: [
          "Worth tracking, because the money signals where the next moat forms. **CapitalG** (Alphabet) led OpenRouter's $113M Series B; **Menlo Ventures** led its Series A and has been the layer's most vocal thesis-holder; **a16z, Sequoia** and **NVIDIA's NVentures** all piled into OpenRouter (NVIDIA strategically — routing sells more GPUs). **Dragonfly** backed Sapiom (with Anthropic); **Elevation** and **Lightspeed** backed Portkey pre-acquisition; **Balderton** backed Kong. When the routing layer draws both Alphabet and NVIDIA onto the same cap table, it's not a side quest.",
        ],
      },
      {
        heading: "4 — So which one should you use?",
        image: "/pulse/04-decision-guide.png",
        imageAlt: "Post-consolidation decision guide: pick by priority — broadest models & billing, security, independence, self-host, ecosystem, or cost",
        paras: [
          "The honest answer isn't \"switch away.\" An acquisition can make a gateway *stronger*: **OpenRouter gains Stripe's billing rails; Portkey gains Palo Alto's security.** Pick by what you prioritise — broadest models + billing (OpenRouter/Stripe), enterprise security (Prisma AIRS), independent-managed (Requesty), own-it/self-host (LiteLLM, open-source), your existing ecosystem (Vercel, Cloudflare), or pure cost-cutting (add a router like Sapiom or Not Diamond behind whatever you run).",
          "**Don't single-thread your gateway.** The one you pick today may not exist as an independent company by renewal (see Stripe↔OpenRouter, PANW↔Portkey). Keep it swappable.",
          "**Own your fallback.** When a provider degrades or a deal closes, the gateway is what keeps you running — make provider failover a hard requirement, not a nice-to-have.",
          "**Make cost-routing first-class.** Routing routine calls to cheaper models (Sapiom/Sciforium-style) is the single biggest lever on your model bill — the difference between $1.2M and $100K a month. **The neutral, portable gateway is the one that lets you pull it.**",
          "We're mapping the whole battlefield on the index — every gateway, who owns them now, and the VCs circling. **If you run a business on autopilot, which gateway do you trust — and why?** Reply and tell me; the honest answers go into the next update.",
        ],
      },
    ],
  },
  {
    slug: "03-never-says-tomorrow",
    number: 3,
    title: "The machine that never says tomorrow",
    date: "2026-08-24",
    cover: "/pulse/03-cover.png",
    linkedinUrl:
      "https://www.linkedin.com/pulse/autopilot-pulse-3-machine-never-says-tomorrow-antonio-s--ivofe",
    tldr: [
      "I let an AI run one of my companies for 90 days, then exported the database. The most impressive thing wasn't the code — it was the **temperament**: a deploy every day, a CEO report every night, and never once \"I'll do it tomorrow.\"",
      "The machine underneath is real: **Polsia, Inc.** (Delaware, Apr 2025), **$30M raised at a $250M valuation** led by Sound Ventures (with True Ventures, Offline Ventures, Adjacent, Tekton Ventures, Drysdale Ventures and VaynerFund) — plus a genuinely smart cost stack (Sapiom + Sciforium) that cut its model bill ~10×.",
      "Founder **Ben Cera** — ex-CloudKitchens, calls the whole thing \"aisloP\" with a wink — is running a real-time adaptation machine. Kudos to him and the investors backing a new venture shape.",
      "The honest other half: in my account the traction was thin and some social proof was **seeded, not earned** — and I'm not alone (public Trustpilot 1.8/5; other owners report the same). Autonomy is real; so is the missing human-in-the-loop.",
      "The builder lesson: copy the relentlessness — but **never let the agent that does the work also grade it. Instrument your own truth.**",
    ],
    sections: [
      {
        paras: [
          "Edition #2 put Polsia on the index flagged **DISPUTED**, both sides linked. This week I can add something a review can't: I was a customer, so I have the view from inside one account — the emails it sent, the dashboard it showed me, the database it let me download. I came out admiring the machine and wary of trusting its narration. Both are useful if you're thinking about building on autopilot.",
          "**Full disclosure:** I'm a Polsia customer, not a bystander. In May I gave it a real idea — an n8n-templates product, FlowForge — and let it run for 90 days. I paid the subscription, joined its \"Missionaries\" channel, and redeemed some community bonus credits, which I spent on legitimate research tasks for my own project. My usage was light, so I've paired what I saw with what other owners report publicly — and there's a call for more owner stories at the end.",
        ],
      },
      {
        heading: "1 — The real lesson: the machine that never procrastinates",
        image: "/pulse/03-card-cadence.png",
        imageAlt: "90 days, zero 'tomorrow': a deploy every day, a CEO report every night",
        paras: [
          "Forget the code for a second — the thing that stuck with me after 90 days is temperament. Every single day, Polsia shipped something and told me about it in a nightly \"CEO report\" structured like a real operator's update: What Shipped, The Math, System Health. No \"I'll get to it tomorrow.\" No waiting for inspiration. No Sunday-night dread. As a human founder who knows the pull of \"later,\" watching a company execute with zero procrastination for three months straight is genuinely inspiring — and it's the most transferable idea in the category. **The frontier isn't a smarter model; it's an operator that never stalls.** Kudos to Ben Cera for building a machine that embodies that, and to the investors who saw the shape of it early.",
        ],
      },
      {
        heading: "2 — Seen live: the whole machine, in real time",
        image: "/pulse/03-card-live.png",
        imageAlt: "polsia.com/live, captured Fri 21 Aug 2026: 20,583 active companies (+23% WoW), 3.8M messages, 2M+ tasks, 1M+ emails",
        paras: [
          "One thing my own account couldn't show — but Polsia publishes anyway: a **public live board** at polsia.com/live. On the Friday I wrote this, it read **20,583 companies active (+23% week-over-week)**, 3.8M human messages, 2M+ tasks completed and 1M+ emails sent — with a real-time feed of new companies spinning up, tasks running and emails firing (**4,375 companies launched in the previous 24 hours** alone). Whatever you make of the model, watching a company-building machine breathe in real time is genuinely something — and it's radical transparency most startups would never dare.",
        ],
      },
      {
        heading: "3 — The stack that makes relentless affordable",
        paras: [
          "Relentless is expensive when every action is a frontier-model call. Polsia's answer is the part builders should actually copy. Its model bill reportedly ran to **$1.2M/month**, then fell to roughly **$100K** — not by doing less, but by routing routine work to cheaper models on rented GPUs: **Sapiom** (CEO Ilan Zerbib, ex-Shopify; just raised $35M with Anthropic among the backers) does the task-to-cheapest-capable-model routing, **Sciforium** (CEO Hassan Akbari, ex-Google) supplies the compute. Pair that with the business model — **$49/mo + 20% of any revenue + 20% of ad spend** — and you see the machine: it's economically motivated to run your growth engine relentlessly, because it earns on the output. **Study the routing discipline; it's the real edge.**",
        ],
      },
      {
        heading: "4 — What I actually found running one (honestly, with limits)",
        paras: [
          "My run was light, so take this as one data point, not a verdict. On the growth side the relentlessness was real — daily emails, daily actions. On the results side, the dashboard was quieter than the reports: modest visitors, no revenue, and I never completed payment setup, so some funnel milestones the reports described couldn't have literally happened in my account. When Polsia let me export the database, it was small — and a detail worth flagging for any builder: the template gallery displayed star-ratings and install-counts that, in the exported data, had been **seeded by a setup script rather than earned by users**. That's a product anti-pattern regardless of who ships it: manufactured social proof converts today and erodes trust the moment someone looks under the hood. **Not a scandal — a lesson.**",
        ],
      },
      {
        heading: "5 — I'm not the only owner — the pattern, fairly",
        paras: [
          "Because my usage was limited, I checked what other owners say publicly, and the pattern is consistent enough to matter. Developer David Miranda (panphora) publicly called Polsia \"a scam\" after finding three of its launched companies were \"hollow shells\" — polished landing pages with no working product. Bootstrapper Arvid Kahl noted the aisloP name cuts both ways. **Trustpilot sits at 1.8/5 across 79 reviews.** The recurring themes from real customers: tasks marked \"done\" that never deploy, credits burned on failed work, and — the one every builder should note — **unauthorized autonomous actions** (outreach sent in a user's name they never approved; wrong names or prices). One logged audit reported 41 of 47 tasks \"complete\" at roughly a 21% real success rate.",
          "The fair counterweight, because it's true: plenty of the same reviewers credit **genuine agent velocity** — a capable solo founder really can build a lot, fast — and several turned ideas into real products. The honest summary isn't \"fake\"; it's **\"legitimate but immature, with no human in the loop by design.\"** When the same system builds and judges and reports, there's no gate to catch the miss before it reaches a customer, an ad budget, or a journalist's inbox.",
        ],
      },
      {
        heading: "6 — What builders take from this",
        paras: [
          "**Copy the temperament, not the autonomy-without-brakes.** The relentless daily cadence is the gift; the missing human-in-the-loop is the trap. You want the machine that never procrastinates and a gate before anything irreversible ships in your name.",
          "**Instrument your own truth.** Wire a payment webhook and a real analytics event to a source the agent can't author. If your only signal is the agent's own summary, you have a narrator, not a metric.",
          "**Never seed social proof.** It's the shortcut that detonates the day someone exports the table. And the transferable stack idea is **cost-routing** (Sapiom/Sciforium-style), not the marketing machine.",
        ],
      },
      {
        heading: "7 — What I'd change if it were mine: trusted autonomy",
        paras: [
          "Ben has asked publicly for founder feedback, so here's mine — offered as a customer who genuinely wants this to win. It all ladders to one idea: right now the same system builds, judges, and reports, so there's no independent signal to lean on. **Give users the yoke and every complaint dissolves while the relentlessness stays. Autonomy isn't the product; trusted autonomy is.** Seven notes, ranked by leverage:",
          "**1. Separate \"shipped\" from \"works.\"** Verify every deploy — hit the URL, confirm it's reachable — before the report says \"done.\" Kills the #1 complaint overnight.",
          "**2. A gate before anything irreversible in your name.** One-tap approve / edit / skip on only the 5% that's identity-bearing — outreach, ad spend, publishing. Keeps the speed, removes the terror. That's literally the yoke.",
          "**3. Truth by construction.** Never seed social proof; wire real signals (a Stripe webhook, a real pageview). Then \"$0 today\" reads as honesty — the moat against every \"hollow shell\" post.",
          "**4. Make \"done\" financially fair.** Auto-refund credits when a task fails its own check.",
          "**5. Give owners real ownership.** One-click export of repo + domain — \"your stuff is yours.\" Making it easy to leave is what makes people stay.",
          "**6. Calibrated relentlessness.** Let the machine say \"I'm 60% sure — approve this?\" instead of shipping silently. A machine that knows what it doesn't know earns more, not less.",
          "**7. Point the autopilot at its own support inbox.** The same relentlessness that ships nightly should answer customers within hours.",
          "Each one converts a loud critic into a case study. The only thing capping a $250M machine is **trust debt** — pay it down and the relentlessness nobody else has becomes unstoppable instead of unnerving.",
          "I'll keep Polsia on the index, still **DISPUTED**, both sides linked — that's the rule the whole project runs on. But I'll say the admiring part plainly too: Ben Cera has built a real-time adaptation machine that a lot of well-run companies would envy for its sheer refusal to stall. **The autopilot is real. Just keep a hand near the yoke.**",
          "**Have you run a company on an autopilot — Polsia, Cofounder, Atoms, Nanocorp, any of them?** I want the honest range: what shipped, what broke, what it cost, what it earned. Reply or DM — I'll fold the best (credited or anonymous, your call) into a follow-up. The category needs owner receipts, not just founder decks.",
        ],
      },
    ],
  },
  {
    slug: "02-the-bill",
    number: 2,
    title: "The Bill: what it costs to run a company on AI",
    date: "2026-08-17",
    cover: "/pulse/02-cover.png",
    linkedinUrl:
      "https://www.linkedin.com/pulse/autopilot-pulse-2-bill-what-costs-run-company-ai-antonio-s--10dse/",
    tldr: [
      "Polsia's model bill went $500K → $1.2M/month → ~$100K. This week the receipts got audited — both sides below.",
      "Cofounder raised $87M for a \"manager agent\" that wields 80+ tools — and provisions a full GitHub + Vercel + Supabase stack for every customer.",
      "Egbe runs a zero-employee company mostly on open-weights GLM — usage up ~8× in a month.",
      "The experiments got real: agents ran actual shops and real-money deals; 48 AIs have now run a (simulated) food truck — 16 went bankrupt.",
      "Stack alert: Stripe is reportedly buying OpenRouter for $7B+ — the \"neutral\" model gateway may soon live inside a payments giant.",
    ],
    sections: [
      {
        paras: [
          "Edition #1 asked whether businesses can run themselves. This one opens the engine rooms: what the agents actually run on, what it costs — and a story that broke this week and stress-tested the index's own rules.",
        ],
      },
      {
        heading: "1 — Polsia: the bill, and the bill come due",
        image: "/pulse/02-card-bill.png",
        imageAlt: "Polsia's monthly model bill: $500K to $1.2M to ~$100K",
        paras: [
          "The most-watched company on the index is a one-founder, zero-employee \"AI operating system\" that builds and runs online businesses end-to-end — and it gave the category its defining unit-economics story: a monthly Anthropic bill that climbed from $500K to $1.2M, then dropped to ~$100K after routing routine workloads to open-source models on rented GPUs (Sciforium for inference, Sapiom routing every task to the cheapest capable model). The detail that makes it credible: Sapiom just raised $35M — with Anthropic among the backers. The model vendor is investing in the company that cuts its customers' model bills.",
          "Then, this week, the other side of the ledger. An independent investigation alleged some Polsia-launched businesses are \"hollow shells\" — polished landing pages with no working product behind them. Trustpilot sits at 1.9/5 across 74 reviews, and an independent breakdown pegs subscription revenue at $6.96M of the $10.22M ARR headline. The counterpoints are real too: reviewers have documented genuinely fast autonomous output, and founder Ben Cera discloses numbers most founders hide — roughly 50% month-one churn, and that about 10% of customer companies have made at least a dollar. Our call: Polsia stays on the index, flagged **DISPUTED**, with both sides linked. **Vibes don't chart — in either direction.**",
        ],
      },
      {
        heading: "2 — Cofounder: the $87M manager agent",
        paras: [
          "Cofounder's architecture is the clearest picture yet of what an \"org chart as software\" looks like: a GPT-5 + Claude \"superoptimizer\" manager agent holding 80+ tools in context, directing worker agents underneath. The detail CTOs will appreciate: it auto-provisions a complete GitHub + Vercel + Supabase stack for every customer company — infrastructure-as-onboarding, confirmed in Supabase's own customer story. $87M raised to bet that the org chart is now a routing diagram.",
        ],
      },
      {
        heading: "3 — Egbe: the contrarian model bet",
        paras: [
          "Nikolay Vyahhi's zero-employee company runs the majority of its build workload on GLM — open-weights models from Z.ai — rather than a frontier lab API. Requests and tokens are up roughly 8× in a month (self-reported). And Z.ai just shipped GLM-5.3 this week, so the bet keeps compounding. The lesson: frontier-lab loyalty is now optional. The tradeoff: concentration risk in a single fast-moving vendor — which is true of every stack choice on this list.",
        ],
      },
      {
        heading: "4 — Atoms & Nanocorp: one prompt → one company",
        paras: [
          "Atoms (built by the creator of MetaGPT) doesn't stop at building your product — its agents market and sell it too, which is the part most builders underestimate. Nanocorp's pitch is the purest distillation of the category: \"One prompt. One company. Zero code.\" — with the honest footnote that its ARR claims are disputed and labeled as such on the index. Building is now table stakes; distribution is the moat.",
        ],
      },
      {
        heading: "5 — The experiments got real tills",
        image: "/pulse/02-card-tills.png",
        imageAlt: "FoodTruckBench, Project Deal and Andon Labs: agents with real tills",
        paras: [
          "FoodTruckBench deserves its own spotlight this week — not just as a benchmark, but as a solo-founder story. Nicholas S. built the whole thing alone — simulation engine, 12-factor demand model, the playable game, everything — and it has quietly become the most useful reality check in the category: 48 frontier models, each handed $2,000 and 34 tools to run an Austin food truck for 30 days. 16 went bankrupt. Claude Opus 5 currently leads at $75,264 net worth (+3,663% ROI); the best human run is still ahead at roughly $101K.",
          "And because this is The Bill edition, the benchmark's newest lens fits perfectly: net worth per API dollar. GPT-5.6 Luna returned $144,501 of simulated net worth for every $1 of API spend; Claude Opus 5 — the outright winner — returned $2,800. **Winning and being worth the bill are different metrics.**",
          "In December, Anthropic ran the experiment quietly and published it in April as Project Deal: 69 employees handed their buying and selling to custom Claude agents in a real Slack marketplace — 500+ items, real money, zero human intervention — and the agents closed 186 deals worth $4,000+. The finding that should keep every builder up at night isn't that it worked; it's that model quality was negotiation power — while the humans with weaker agents rated their outcomes exactly as fair as everyone else. The disadvantage was real, measurable, and completely invisible. **Your stack choice is now your negotiating position.**",
          "And Andon Labs keeps going further — handing agents actual shops and a café to run: inventory, pricing, customers. Free due-diligence for your own agent-business idea. Run the experiment before you run the company.",
        ],
      },
      {
        heading: "Stack alert — Stripe ⇄ OpenRouter, $7B+",
        paras: [
          "Bloomberg reports Stripe has finalized a deal to buy OpenRouter — the gateway many builders use as their \"one API over 400+ models\" neutrality layer — for more than $7B, barely three months after its $1.3B Series B. Stripe declined to comment, so treat it as reported, not confirmed. But if it closes, the neutral routing layer will live inside a payments giant — worth knowing if OpenRouter is your fallback plan.",
        ],
      },
    ],
  },
  {
    slug: "01-org-chart-prompt",
    number: 1,
    title: "The org chart is now a prompt",
    date: "2026-08-14",
    cover: "/pulse/01-cover.png",
    linkedinUrl:
      "https://www.linkedin.com/pulse/autopilot-pulse-1-org-chart-now-prompt-antonio-s--qrtie/",
    tldr: [
      "AI-native service firms are the new wave: law firms and clinics where agents do the billable work — not tools sold to them.",
      "The lean-AI benchmark is now ~$1.9M revenue per employee (Gamma: $100M ARR, 52 people, profitable).",
      "An AI called 35,659 UK pubs — only 4% of publicans noticed. Detection dropped to 0.6% when it matched the local accent.",
      "The best AI still loses to the best human at running a (simulated) business — by half.",
      "Sequoia named the whole category: \"A copilot sells the tool. An autopilot sells the work.\"",
    ],
    sections: [
      {
        heading: "Aha #1 — The agents are becoming the law firm",
        paras: [
          "The most interesting companies this month aren't selling AI to professionals — they ARE the professionals. Moritz is a licensed law firm (founded by OpenAI and Google's former outside counsel) where AI does 80% of the drafting and ~10 elite lawyers review the rest, at flat fees, with 4-hour turnarounds. It raised a $9M oversubscribed seed in 4 days. Behind it: an immigration firm, a UK conveyancing firm, an accounting firm backed with $75M from General Catalyst. When the agent does the billable work itself, \"software margins\" and \"services revenue\" stop being different things.",
        ],
      },
      {
        heading: "Aha #2 — The efficiency frontier is ~$2M per human",
        paras: [
          "Gamma: $100M ARR, 52 people, profitable for two years, on just ~$23M of primary capital — now valued at $2.1B by a16z. That's the cleanest verified case, but the pattern repeats down the leaderboard. The org chart isn't shrinking because of layoffs; it's shrinking because the work ships without the headcount.",
        ],
      },
      {
        heading: "Aha #3 — Nobody can hear the machines",
        paras: [
          "The Guinndex (the AI that phoned 3,000 Irish pubs for pint prices) crossed to the UK: 35,659 pubs called for ~£500 in API fees. Just 4% of publicans realized they were talking to an AI — and 0.6% in Northern Ireland, where the agent used a native accent. Meanwhile the format is spreading on its own: an NYU student's agent priced 1,766 NYC pizza slices; two independent teams priced flat whites in Sydney and London. Voice agents doing real-world economic legwork is now a genre.",
        ],
      },
      {
        heading: "Aha #4 — Humans still win. For now.",
        paras: [
          "FoodTruckBench ran AI models through 30 simulated days of operating a food truck. Many went bankrupt. The best AI turned $2,000 into $75K — impressive, until you learn the best human run scored higher still. Autonomy is real; superiority isn't. Yet.",
        ],
      },
      {
        heading: "Aha #5 — Radical transparency finds the cracks",
        paras: [
          "One famous \"lean AI\" claim — a voice startup at \"$36M ARR with 21 people\" — fell apart under verification: headcount reports range from 21 to 143 depending on the source. It's still on the index, but flagged disputed. That's the rule the whole project runs on: verified, self-reported, or disputed — **vibes don't chart**.",
        ],
      },
    ],
  },
];

export const getEdition = (slug: string) => editions.find((e) => e.slug === slug);
