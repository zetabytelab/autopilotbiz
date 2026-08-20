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
