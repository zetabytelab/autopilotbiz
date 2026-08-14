// A citable reference for a metric (Crunchbase, LinkedIn, press, etc.).
export type Source = { name: string; url: string };

// Placement metadata for the GitHub Autopilot Index (github.com/zetabytelab/autopilot).
// The repo README is GENERATED from this file via `npm run gen:index` — edit here, never there.
export type AutopilotMeta = {
  // L2 function autopilot · L3 operational · L4 goal-level · L5 full autonomy
  level?: "L2" | "L3" | "L4" | "L5";
  // A third-party audited · B public transaction/filing · C credible press · D founder claims only
  evidence?: "A" | "B" | "C" | "D";
  section: "index" | "watchlist" | "caution" | "enabler";
  story: string;
  // index → flags column · watchlist → why we're watching · caution → what happened · enabler → signal
  flags?: string;
};

export type Company = {
  name: string;
  slug: string;
  url: string | null;
  tagline: string;
  categoryClaim: string | null;
  description: string;
  techStack: string[];
  funding: {
    totalRaised: string | null;
    lastRound: string | null;
    date: string | null;
    valuation: string | null;
    investors: string[];
  };
  founders: { name: string; background: string }[];
  metrics: {
    arr: string | null;
    arrUsd: number | null;
    humans: number | null;
    // Where each figure comes from — shown in the leaderboard so readers can audit the data.
    sources?: { humans?: Source; arr?: Source; raised?: Source };
  };
  referralProgram: { exists: boolean | null; notes: string | null };
  pricing: string | null;
  news: { date: string; headline: string }[];
  verified: boolean;
  // "hackathon" = the original Cursor Hands-Off Hackathon cohort (default);
  // "expansion" = the wider autopilot/lean-AI universe.
  cohort?: "hackathon" | "expansion";
  autopilot?: AutopilotMeta;
};

export const companies: Company[] = [
  {
    name: "Polsia",
    slug: "polsia",
    url: "https://polsia.com",
    tagline: "AI that runs your company while you sleep.",
    categoryClaim: "An orchestration of agents that runs the work a company actually needs done.",
    description:
      "An AI operating system that builds and operates an online business end-to-end: writes and ships code, does research, creates content, sets up company infrastructure (hosting, database, repo, payments, ad accounts), and runs cold outreach, paid ads, and support. It famously handled most of its own $30M fundraise — data room, investor briefings, diligence — with solo founder Ben Cera joining only the final calls. Also the category's unit-economics case study: a $1.2M/month Anthropic bill cut to ~$100K by routing routine workloads to open-source models on rented GPUs.",
    techStack: [
      "Anthropic",
      "OpenAI",
      "Sciforium",
      "Sapiom",
      "Blaxel",
      "Anchor Browser",
      "AgentMail",
      "Stripe Connect",
      "Render",
      "Neon",
      "GitHub",
      "Postmark",
      "AWS",
    ],
    funding: {
      totalRaised: "$30M",
      lastRound: "Series A",
      date: "2026-05",
      valuation: "$250M",
      investors: [
        "Sound Ventures",
        "True Ventures (pre-seed, hosts Polsia at its SF office)",
        "Offline Ventures",
        "Adjacent",
        "Tekton Ventures",
        "Drysdale Ventures",
        "Vaynerfund",
      ],
    },
    founders: [
      {
        name: "Ben Cera",
        background:
          "Solo founder, zero employees — public persona of Ben Broca (French, ex-CloudKitchens under Travis Kalanick). Says AI agents run ~80% of founder operations; documents the build in a self-filmed YouTube series.",
      },
    ],
    metrics: {
      arr: "~$10M",
      arrUsd: 10_000_000,
      humans: 1,
      sources: {
        humans: { name: "Pulse2", url: "https://pulse2.com/polsia-30-million-at-250-million-valuation-raised-for-ai-operations-platform/" },
        arr: { name: "Pulse2 · self-reported", url: "https://pulse2.com/polsia-30-million-at-250-million-valuation-raised-for-ai-operations-platform/" },
        raised: { name: "Pulse2", url: "https://pulse2.com/polsia-30-million-at-250-million-valuation-raised-for-ai-operations-platform/" },
      },
    },
    referralProgram: {
      exists: false,
      notes: "No official affiliate program; ?ref= links exist in the wild but rewards are unverified.",
    },
    pricing: "$49/mo (hosting, DB, repo, payments, ad accounts, one nightly autonomous task + credits) plus 20% revenue share via Stripe Connect.",
    news: [
      {
        date: "2026-08",
        headline:
          "Sapiom — the spend-routing layer in Polsia's stack — raises a $35M Series A (Dragonfly lead; Anthropic among the backers). Press coverage credits its task-to-cheapest-model routing in Polsia's $1.2M → $100K bill cut, adding third-party corroboration to the founder-reported arc.",
      },
      {
        date: "2026-07",
        headline:
          "Self-documentary ('I Built a $250M AI Company. The Bill Is $1.2M a Month') reveals the unit-economics arc: monthly Anthropic bill climbed $500K → $1.2M, then dropped to ~$100K in June after moving routine workloads to open-source models on rented GPUs (Sciforium inference; Sapiom handling agent spend). Next move: a free tier. Figures founder-reported; independent analysts dispute the margin math.",
      },
      {
        date: "2026-07",
        headline: "WSJ reports 10,000 paying customers and ~$10M projected revenue.",
      },
      {
        date: "2026-03",
        headline:
          "500 → 5,000 paying users in one month, driven by the 'Polsia raises its own round' stunt — the live dashboard at polsia.com/live showed the AI working on every customer company (user counts founder-reported).",
      },
      { date: "2026-05", headline: "Raised $30M at a $250M valuation with zero employees — the AI reportedly ran much of the fundraise." },
      { date: "2026-05", headline: "Approaching $10M annual run rate with one human." },
      { date: "2026-01", headline: "Reported running ~6,000 customer companies at $6M+ ARR (Henry Shi profile)." },
    ],
    verified: true,
    autopilot: {
      level: "L3",
      evidence: "C",
      section: "index",
      story:
        "AI runs the company while the founder sleeps; raised $30M at $250M with zero employees. Cut its $1.2M/mo Anthropic bill to ~$100K via open-source inference.",
      flags: "Figures founder-reported; margin math disputed",
    },
  },
  {
    name: "Nanocorp",
    slug: "nanocorp",
    url: "https://www.nanocorp.so",
    tagline: "One prompt. One company. Zero code.",
    categoryClaim:
      "An autonomous company run by an agent that maximizes revenue while trying to avoid bankruptcy — no human intervention.",
    description:
      "From a single prompt, AI agents create and operate a real online business: build the product, deploy it with payments and a domain, prospect and email customers, run Meta ads, and send daily reports. A 'CEO agent' manages the org — you're the owner who just talks to the CEO. Built by Phospho (YC W24).",
    techStack: ["Stripe", "Vercel", "Meta Ads", "nanocorp.app domains + email", "Built-in database"],
    funding: {
      totalRaised: "€1.7M (parent Phospho pre-seed)",
      lastRound: "Pre-seed (as Phospho)",
      date: "2024-01",
      valuation: null,
      investors: ["Y Combinator", "Elaia"],
    },
    founders: [
      {
        name: "Pierre-Louis Biojout",
        background: "CTO of Phospho (YC W24); Applied Maths & CS, École Polytechnique. Team size: 1.",
      },
    ],
    metrics: {
      arr: "$193K (claimed)",
      arrUsd: 193_000,
      humans: 1,
      sources: {
        humans: { name: "Y Combinator", url: "https://www.ycombinator.com/companies/nanocorp" },
        arr: { name: "Founder claim · disputed", url: "https://www.alexisbouchez.com/reviews/2026/03/30/nanocorp" },
        raised: { name: "Tech.eu", url: "https://tech.eu/2024/01/17/elaia-and-ycombinator-back-phospho-with-1-7m-for-genai-application-monitoring/" },
      },
    },
    referralProgram: {
      exists: true,
      notes: "Users earn credits through referrals (even on the free tier). Platform takes a 20% withdrawal fee on company earnings.",
    },
    pricing: "Free: 3 lifetime credits, 1 company, 20% withdrawal fee. Founder: $30/mo for 30 credits, unlimited companies, custom domains.",
    news: [
      { date: "2026-05", headline: "Launched as Phospho's autonomous-company platform (Show HN); founder reported $193K ARR within 3 days." },
      { date: "2026-03", headline: "Independent review reports ~190 companies founded per day — but disputes the revenue claims, finding just ~$264 cumulative revenue across all platform-created companies." },
    ],
    verified: true,
    autopilot: {
      level: "L3",
      evidence: "D",
      section: "index",
      story: "One prompt → one company, zero code. YC-backed solo founder.",
      flags: "Revenue claim disputed by independent review",
    },
  },
  {
    name: "Cofounder",
    slug: "cofounder",
    url: "https://cofounder.co",
    tagline: "Run an entire company with AI.",
    categoryClaim: "The operating system for a one-person, billion-dollar company.",
    description:
      "Agent orchestration platform from The General Intelligence Company (NYC). Deploys specialized agents across engineering, sales, marketing, design, finance, and ops — with shared context, agent inboxes, and approval gates ('nothing ships without your approval'). Users can 'graduate' and take ownership of the underlying GitHub/Supabase/Vercel projects.",
    techStack: ["GitHub", "Supabase", "Vercel", "MCP", "Stripe", "Multi-model"],
    funding: {
      totalRaised: ">$10M",
      lastRound: "$8.7M Seed",
      date: "2025-12",
      valuation: null,
      investors: ["Union Square Ventures (lead)", "Acrew Capital", "Compound", "Untapped VC", "Agent Fund", "The House Fund"],
    },
    founders: [
      { name: "Andrew Pignanelli", background: "CEO; South Park Commons alum (the community that incubated Cognition, Replit, Profound)." },
      { name: "Abhishyant Khare", background: "Co-founder; South Park Commons alum." },
    ],
    metrics: {
      arr: null,
      arrUsd: null,
      humans: null,
      sources: {
        raised: { name: "Forbes", url: "https://www.forbes.com/sites/stevenwolfepereira/2025/12/08/building-a-one-person-unicorn-this-startup-just-raised-87m-to-help/" },
      },
    },
    referralProgram: {
      exists: false,
      notes: "No affiliate program — but the Cofounder 2 Fellowship grants $1,000 + $100/day in credits for 30 days to agent-run startups, no equity taken.",
    },
    pricing: "Free 7-day trial with $10 usage. Pro from $20/mo; Team from $50/mo. Usage-based overage covers agents, models, compute, ad spend.",
    news: [
      { date: "2026-03", headline: "Cofounder 2 research preview + Fellowship program for agent-run startups." },
      { date: "2025-12", headline: "Announced Cofounder 1.5 and $8.7M seed led by Union Square Ventures." },
      { date: "2025-09", headline: "Launched; thousands of users in the first week." },
    ],
    verified: true,
    autopilot: {
      level: "L3",
      evidence: "D",
      section: "watchlist",
      story: "\"Run an entire company with AI\"",
      flags: "USV-backed; thesis-defining but pre-metrics",
    },
  },
  {
    name: "ChainOpera AI",
    slug: "chainopera-ai",
    url: "https://chainopera.ai",
    tagline: "Collaborative intelligence of AI agent networks.",
    categoryClaim: "A decentralized 'full-stack super agent AI economy' — a community-owned OpenAI alternative.",
    description:
      "Full-stack decentralized AI platform: a consumer AI Terminal, an agent-building platform, a decentralized model & GPU network, and an AI-native L1 blockchain with the $COAI token. Recently added an AI Trading Arena with autonomous trading agents. The crypto outlier of the cohort.",
    techStack: ["Own L1 blockchain ($COAI)", "TensorOpera / FedML stack", "EigenLayer", "Babylon", "Aethir GPU network", "Google Cloud", "Azure"],
    funding: {
      totalRaised: "$17M (incl. sister co TensorOpera; ChainOpera seed $3.5M)",
      lastRound: "Seed",
      date: "2024-12",
      valuation: null,
      investors: ["Finality Capital", "Road Capital", "IDG Capital", "Camford VC", "ABCDE Capital", "Amber Group"],
    },
    founders: [
      { name: "Salman Avestimehr", background: "Dean's Professor at USC, IEEE Fellow; co-founder of FedML/TensorOpera." },
      { name: "Aiden He", background: "Co-founder of FedML/TensorOpera; ML systems researcher." },
    ],
    metrics: {
      arr: null,
      arrUsd: null,
      humans: 40,
      sources: {
        humans: { name: "The Block ('40+ team')", url: "https://www.theblock.co/post/332347/chainopera-ai-raised-17-million-in-seed-funding-to-build-blockchain-l1-and-ai-os-for-ai-agents" },
        raised: { name: "The Block", url: "https://www.theblock.co/post/332347/chainopera-ai-raised-17-million-in-seed-funding-to-build-blockchain-l1-and-ai-os-for-ai-agents" },
      },
    },
    referralProgram: {
      exists: true,
      notes: "Crypto-style points program: invite codes earn ~100 points per referral, plus seasonal airdrop 'Quests'.",
    },
    pricing: "No SaaS pricing — usage driven by the $COAI token and points/airdrop economy.",
    news: [
      { date: "2026-05", headline: "Launched AI Trading Arena; integrated Lit Protocol's 'Vincent' autonomous trading agents." },
      { date: "2025-09", headline: "$COAI became the first project listed on Binance Alpha." },
    ],
    verified: true,
  },
  {
    name: "Wordware (Sauna)",
    slug: "wordware",
    url: "https://wordware.ai",
    tagline: "Your work doesn't have to stop, even when you do.",
    categoryClaim: "A proactive AI chief-of-staff: every task, decision, and workflow gets handled — automatically.",
    description:
      "Started as a YC S24 IDE for building AI agents in plain English; in 2026 pivoted its flagship to Sauna (sauna.ai) — an always-on cloud assistant that connects to Gmail, Slack, Linear, GitHub, Notion, Stripe and 3,000+ tools via MCP, learns your context, and proactively executes work around the clock.",
    techStack: ["MCP custom connectors", "3,000+ SaaS integrations", "Cloud-hosted persistent agents"],
    funding: {
      totalRaised: "$30M",
      lastRound: "Seed (one of YC's largest)",
      date: "2024-11",
      valuation: null,
      investors: ["Spark Capital (lead)", "Felicis", "Y Combinator", "Day One Ventures", "Paul Graham (angel)"],
    },
    founders: [
      { name: "Filip Kozera", background: "CEO; Cambridge; previously founded a Transformer-based human-memory startup." },
      { name: "Robert Chandler", background: "CTO; Cambridge; led ML for self-driving at Five AI (acq. Bosch)." },
    ],
    metrics: {
      arr: null,
      arrUsd: null,
      humans: 15,
      sources: {
        humans: { name: "Forbes (at Nov 2024 raise)", url: "https://www.forbes.com/sites/dariashunina/2024/11/27/how-wordware-secured-30m-seed-in-7-days/" },
        raised: { name: "Forbes", url: "https://www.forbes.com/sites/dariashunina/2024/11/27/how-wordware-secured-30m-seed-in-7-days/" },
      },
    },
    referralProgram: { exists: false, notes: "Launch promo only: first 2,000 Sauna users got free daily credits." },
    pricing: "Sauna: reported $29/mo and $299/mo premium tiers.",
    news: [
      { date: "2026-05", headline: "Launched Sauna (sauna.ai) — rebranding around an always-on proactive AI assistant." },
      { date: "2024-11", headline: "$30M seed led by Spark Capital; previously the #1 Product Hunt launch of all time." },
    ],
    verified: true,
  },
  {
    name: "Feltsense",
    slug: "feltsense",
    url: "https://feltsense.com",
    tagline: "We build agentic founders.",
    categoryClaim: "Fleets of agentic founders that ideate, ship, and capture market share on their own.",
    description:
      "Deploys fleets of AI 'founder' agents that autonomously spot B2C market opportunities from real-time signals, validate demand, build products with Stripe payments, and launch paid-acquisition campaigns. Feltsense keeps equity in the companies its agents create — the business model is ownership, not SaaS.",
    techStack: ["Stripe", "Social listening / real-time demand signals"],
    funding: {
      totalRaised: "$5.1M",
      lastRound: "Seed",
      date: "2026-02",
      valuation: null,
      investors: ["Draper Associates (lead)", "Precursor Ventures", "Liquid 2 Ventures"],
    },
    founders: [
      {
        name: "Marik Hazan",
        background: "CEO; launched the first VC firm focused on psychedelic therapeutics; led growth at Bell Curve.",
      },
    ],
    metrics: {
      arr: null,
      arrUsd: null,
      humans: null,
      sources: {
        raised: { name: "Yahoo Finance", url: "https://finance.yahoo.com/news/feltsense-raises-5-1m-launch-165000161.html" },
      },
    },
    referralProgram: { exists: false, notes: null },
    pricing: "Not published — equity ownership of agent-created companies rather than SaaS pricing.",
    news: [
      { date: "2026-02", headline: "Raised $5.1M seed led by Draper Associates for 'agentic founders' that build startups from zero." },
      { date: "2026-04", headline: "Claims ~10,000 'Founder Agencies' spun up within months (self-reported); launched Gutcheck diligence tool in beta." },
    ],
    verified: true,
  },
  {
    name: "Caffeine",
    slug: "caffeine",
    url: "https://caffeine.ai",
    tagline: "The self-writing internet.",
    categoryClaim: "Apps that AI writes, deploys, and continually updates — no human intervention in the codebase.",
    description:
      "Natural-language app builder from the DFINITY Foundation. Describe an app in plain language and an ensemble of AI models builds, deploys, and iterates production apps hosted on the Internet Computer Protocol (ICP) blockchain — with an App Market, custom domains, and cross-app queries.",
    techStack: ["Internet Computer Protocol (ICP)", "Motoko (AI-generated backends)", "Multi-model ensemble"],
    funding: {
      totalRaised: "Funded by DFINITY Foundation ($100M+ raised for ICP)",
      lastRound: null,
      date: null,
      valuation: null,
      investors: ["DFINITY Foundation (parent)"],
    },
    founders: [
      { name: "Dominic Williams", background: "Founder & Chief Scientist of DFINITY (Internet Computer); CEO of Caffeine.ai." },
    ],
    metrics: { arr: null, arrUsd: null, humans: null },
    referralProgram: { exists: true, notes: "Affiliate program listed on pricing page — currently waitlist-only." },
    pricing: "Free (daily credits); Host $5/mo; Studio $25/mo; Business $250/mo; Enterprise custom.",
    news: [
      { date: "2025-10", headline: "DFINITY launches Caffeine publicly — production apps from natural-language prompts." },
      { date: "2025-07", headline: "Early access opens after 'Hello, Self-Writing Internet' event; 15,000+ alpha users." },
    ],
    verified: true,
    autopilot: {
      level: "L3",
      evidence: "D",
      section: "watchlist",
      story: "\"The self-writing internet\"",
      flags: "Pre-metrics",
    },
  },
  {
    name: "Atoms",
    slug: "atoms",
    url: "https://atoms.dev",
    tagline: "Turn ideas into products that sell.",
    categoryClaim: "An 'AI Business Team' — named AI employees that build AND market products for one-person companies.",
    description:
      "Multi-agent platform (rebrand of MGX / MetaGPT X by DeepWisdom) where specialized agents — team leader, researcher, architect, PM, engineer, ads specialist, SEO specialist — research, build, deploy, and market full-stack apps. Built on MetaGPT and OpenManus (~150K+ combined GitHub stars). 'Race Mode' runs multiple models on a prompt and picks the best output.",
    techStack: ["MetaGPT", "OpenManus", "Atoms Cloud (hosting, auth, DB)", "Multi-model orchestration", "Stripe", "GitHub"],
    funding: {
      totalRaised: "~$31M",
      lastRound: "Series A+ (Cathay Innovation; Series A led by Ant Group)",
      date: "2025",
      valuation: null,
      investors: ["Ant Group", "Cathay Innovation", "Jinqiu Capital", "MindWorks Capital", "Baidu Ventures"],
    },
    founders: [
      {
        name: "Wu Chenglin",
        background: "Founder & CEO of DeepWisdom; previously led large-scale AI at Huawei and Tencent; creator of MetaGPT.",
      },
    ],
    metrics: {
      arr: null,
      arrUsd: null,
      humans: null,
      sources: {
        raised: { name: "36kr", url: "https://eu.36kr.com/en/p/3638641265740932" },
      },
    },
    referralProgram: {
      exists: true,
      notes: "atoms.dev/affiliate: commission on each referred user's first 6 recurring payments; referred users get $50 in credits; monthly payouts via Wise.",
    },
    pricing: "Freemium: ~25 free credits/cycle; paid from $20/mo; Race Mode on the $100/mo Max plan.",
    news: [
      { date: "2026-06", headline: "MarkTechPost feature: agents that build, deploy, and market your app." },
      { date: "2026-01", headline: "DeepWisdom rebrands MGX as Atoms; announces $31M raised (Ant Group, Cathay Innovation)." },
    ],
    verified: true,
    autopilot: {
      level: "L3",
      evidence: "D",
      section: "watchlist",
      story: "AI business team that builds, deploys and markets your product",
      flags: "Products shipping; no economics disclosed",
    },
  },
  {
    name: "Semio",
    slug: "semio",
    url: "https://semio.ai",
    tagline: "Bringing robots to life.",
    categoryClaim: "Natural language is the user interface of robots.",
    description:
      "LA robotics-software startup (founded 2016) whose Arora platform lets developers build, deploy, and manage conversational AI applications for physical robots and digital characters. The physical-embodiment outlier of the cohort — agents with bodies. Funding undisclosed.",
    techStack: ["Arora SaaS platform", "JavaScript SDK for robot skills"],
    funding: { totalRaised: null, lastRound: null, date: null, valuation: null, investors: [] },
    founders: [
      { name: "Ross Mead", background: "Founder & CEO; PhD in robotics/human-robot interaction from USC." },
      { name: "Braden McDorman", background: "Co-founder & CTO." },
    ],
    metrics: {
      arr: null,
      arrUsd: null,
      humans: 7,
      sources: {
        humans: { name: "Tracxn", url: "https://tracxn.com/d/companies/semio/__BjN5hbn1zB_pkpRlyXAAgGbYOUmuxV496mQpEjKqmfA" },
      },
    },
    referralProgram: { exists: false, notes: null },
    pricing: "Not published — demo/consultation only.",
    news: [],
    verified: true,
  },
  {
    name: "Boardy",
    slug: "boardy",
    url: "https://boardy.ai",
    tagline: "The world's first AI superconnector.",
    categoryClaim: "I'm done making intros… now I make deals happen.",
    description:
      "The guy with the cardboard box on his head. Boardy calls you on the phone, has a real conversation to learn what you're building, then autonomously brokers double-opt-in warm introductions — to investors, customers, hires. It famously raised its own $8M seed by pitching investors itself: most Creandum partners only ever spoke to Boardy, never the founders. By mid-2026: 166K+ people spoken with, 114K+ intros, ~$63B in capital introductions (company-reported).",
    techStack: ["AI voice calls", "Double-opt-in email intros", "LinkedIn persona"],
    funding: {
      totalRaised: "$11M",
      lastRound: "$8M Seed ($3M pre-seed Oct 2024)",
      date: "2025-01",
      valuation: null,
      investors: ["Creandum (lead)", "Andy Dunn", "Leah Solivan", "Andrew Yeung"],
    },
    founders: [
      { name: "Andrew D'Souza", background: "CEO; co-founder of Clearco (revenue-based financing)." },
      { name: "Matt Stein, Shen Sivananthan, Ankur & Abhinav Boyed", background: "Co-founders." },
    ],
    metrics: {
      arr: null,
      arrUsd: null,
      humans: null,
      sources: {
        raised: { name: "TechCrunch", url: "https://techcrunch.com/2025/01/14/boardy-ai-raises-8m-seed-round-months-after-closing-pre-seed/" },
      },
    },
    referralProgram: {
      exists: true,
      notes: "Growth is intro-native: Boardy Deal Partners lets referrers connect founders to Boardy; strong candidates can get $25K–$300K checks from Boardy Ventures.",
    },
    pricing: "Core free (intros capped ~3/day). Boardy Pro: $100/mo (June 2026 — first 5,000 signups got it free for life; window closed in ~2 hours).",
    news: [
      { date: "2026-06", headline: "Boardy Pro launch; ~$63B in capital introductions reported to date." },
      { date: "2025-12", headline: "Launches AI-led venture fund / scout network (Boardy Ventures)." },
      { date: "2025-01", headline: "$8M seed led by Creandum — round largely negotiated by the AI itself (TechCrunch)." },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      level: "L3",
      evidence: "C",
      section: "index",
      story:
        "AI superconnector that networks on your behalf — raised its round without investors seeing a deck or speaking to a human.",
    },
  },
  {
    name: "Base44",
    slug: "base44",
    url: "https://base44.com",
    tagline: "Build software with a prompt.",
    categoryClaim: "The canonical one-person exit: solo founder, zero funding, $80M cash in 6 months.",
    description:
      "Text-to-app platform (auth, DB, hosting from natural language). Maor Shlomo built it solo-owned (100% equity, bootstrapped) with a small team — 1 founder + 8 employees at exit — and sold to Wix for $80M cash six months after launch. It then hit $100M ARR nine months post-acquisition and passed $150M by May 2026. The proof point that a tiny team plus agents can build acquisition-grade software businesses.",
    techStack: ["Claude Opus", "GPT-5", "Gemini 3 Pro", "Built-in auth, DB & hosting"],
    funding: {
      totalRaised: "$0 (bootstrapped)",
      lastRound: "Acquired by Wix for $80M cash + earnout",
      date: "2025-06",
      valuation: null,
      investors: [],
    },
    founders: [
      { name: "Maor Shlomo", background: "Israeli; ex-Explorium co-founder; built Base44 solo after IDF reserve duty." },
    ],
    metrics: {
      arr: "$3.5M at exit → $150M under Wix",
      arrUsd: 3_500_000,
      humans: 9,
      sources: {
        humans: { name: "TechCrunch (1 founder + 8 staff)", url: "https://techcrunch.com/2025/06/18/6-month-old-solo-owned-vibe-coder-base44-sells-to-wix-for-80m-cash/" },
        arr: { name: "Getlatka / Wix earnings", url: "https://getlatka.com/blog/base44-revenue-acquired-wix/" },
        raised: { name: "TechCrunch", url: "https://techcrunch.com/2025/06/18/6-month-old-solo-owned-vibe-coder-base44-sells-to-wix-for-80m-cash/" },
      },
    },
    referralProgram: {
      exists: true,
      notes: "base44.com/affiliates — flat $100 per successful referral, $300 minimum payout, monthly payments.",
    },
    pricing: "Free (25 credits); Starter $16/mo annual; Builder $40/mo; Pro $80/mo.",
    news: [
      { date: "2026-05", headline: "Wix Q1 2026 earnings: Base44 surpasses $150M ARR." },
      { date: "2026-03", headline: "Calcalist: Base44 hits $100M ARR nine months after the Wix acquisition." },
      { date: "2025-06", headline: "TechCrunch: 6-month-old, solo-owned vibe coder Base44 sells to Wix for $80M cash." },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      level: "L2",
      evidence: "B",
      section: "index",
      story:
        "Solo-owned vibe-coding platform, sold to Wix for $80M cash at 6 months old. The category's first clean exit.",
    },
  },
  {
    name: "Midjourney",
    slug: "midjourney",
    url: "https://midjourney.com",
    tagline: "Independent AI image & video research lab.",
    categoryClaim: "The lean-AI benchmark: $8M+ revenue per employee.",
    description:
      "Subscription image/video generation, self-funded since day one. Not 'autopilot'-positioned, but it anchors the extreme of the category's core metric — roughly $500M in revenue with ~60 people (headcount estimates range 60–190 depending on the database).",
    techStack: ["Proprietary diffusion models", "Discord-first distribution"],
    funding: {
      totalRaised: "$0 (self-funded)",
      lastRound: null,
      date: null,
      valuation: "~$10B implied via secondaries (unverified)",
      investors: [],
    },
    founders: [{ name: "David Holz", background: "Previously co-founded Leap Motion." }],
    metrics: {
      arr: "~$500M",
      arrUsd: 500_000_000,
      humans: 60,
      sources: {
        humans: { name: "Getlatka (~60; others up to 190)", url: "https://getlatka.com/companies/midjourney" },
        arr: { name: "Third-party estimates", url: "https://sacra.com/c/midjourney/" },
        raised: { name: "Crunchbase", url: "https://www.crunchbase.com/organization/midjourney" },
      },
    },
    referralProgram: { exists: false, notes: null },
    pricing: "$10/mo Basic; $30 Standard; $60 Pro; $120 Mega.",
    news: [
      { date: "2026-03", headline: "V8 Alpha: native 2K, 5x faster generation." },
      { date: "2025-08", headline: "Meta partnership to license Midjourney's 'aesthetic technology'." },
    ],
    verified: true,
    cohort: "expansion",
  },
  {
    name: "Artisan",
    slug: "artisan",
    url: "https://artisan.co",
    tagline: "AI employees. 'Stop hiring humans.'",
    categoryClaim: "Autonomous AI BDR 'Ava' runs outbound sales end-to-end.",
    description:
      "Ava prospects from a 300M+ contact database, writes and sequences email, and books meetings autonomously — with Aaron (inbound) and Aria (meetings) on the roadmap. Famous for the 'Stop Hiring Humans' billboard campaign. YC W24.",
    techStack: ["LLM agents on a proprietary B2B data layer"],
    funding: {
      totalRaised: "$36.5M",
      lastRound: "$25M Series A",
      date: "2025-04",
      valuation: null,
      investors: ["Glade Brook Capital (lead)", "HubSpot Ventures", "BOND", "Day One Ventures", "Y Combinator"],
    },
    founders: [{ name: "Jaspar Carmichael-Jack", background: "CEO, early-20s; YC W24." }],
    metrics: {
      arr: "$5M+",
      arrUsd: 5_000_000,
      humans: 35,
      sources: {
        humans: { name: "Getlatka", url: "https://getlatka.com/companies/artisan.co" },
        arr: { name: "TechCrunch", url: "https://techcrunch.com/2025/04/09/artisan-the-stop-hiring-humans-ai-agent-startup-raises-25m-and-is-still-hiring-humans/" },
        raised: { name: "TechCrunch", url: "https://techcrunch.com/2025/04/09/artisan-the-stop-hiring-humans-ai-agent-startup-raises-25m-and-is-still-hiring-humans/" },
      },
    },
    referralProgram: {
      exists: false,
      notes: "No affiliate program; piloting success-based pay-per-response pricing via Paid.ai.",
    },
    pricing: "Ava 2.0 self-serve from ~$250/mo; ~$600/mo mid-tier; $5,000+/mo enterprise.",
    news: [
      { date: "2026-05", headline: "Ava 2.0 general availability with self-serve onboarding and $300 free credits." },
      { date: "2025-04", headline: "TechCrunch: the 'stop hiring humans' startup raises $25M — and is still hiring humans." },
    ],
    verified: true,
    cohort: "expansion",
  },
  {
    name: "Lindy",
    slug: "lindy",
    url: "https://lindy.ai",
    tagline: "Meet your first AI employee.",
    categoryClaim: "Autopilot: cloud computer-use agents that operate a browser autonomously.",
    description:
      "No-code platform to build AI agents ('Lindies') for email, sales, support, and scheduling across 6,000+ integrations. Lindy 3.0 added Autopilot — agents that drive a cloud browser on their own. 400,000+ users.",
    techStack: ["Multi-model (OpenAI / Anthropic)", "Cloud computer-use agents", "6,000+ integrations"],
    funding: {
      totalRaised: "$49.9M",
      lastRound: null,
      date: null,
      valuation: null,
      investors: ["Menlo Ventures", "Coatue", "Battery Ventures", "Tiger Global"],
    },
    founders: [{ name: "Flo Crivello", background: "Ex-Uber; founder of Teamflow." }],
    metrics: {
      arr: "$5.1M (2024 est.)",
      arrUsd: 5_100_000,
      humans: 52,
      sources: {
        humans: { name: "Tracxn", url: "https://tracxn.com/d/companies/lindy/__FJe0QVe6UcRHtdiPJpmyRG3livSd4eIGsIxMxz-kNPI" },
        arr: { name: "Getlatka (2024 est.)", url: "https://getlatka.com/companies/lindyai" },
        raised: { name: "Tracxn", url: "https://tracxn.com/d/companies/lindy/__FJe0QVe6UcRHtdiPJpmyRG3livSd4eIGsIxMxz-kNPI" },
      },
    },
    referralProgram: {
      exists: true,
      notes: "Affiliate/creator partner program on PartnerStack (lindy.ai/partners) plus a service-partner directory.",
    },
    pricing: "Free tier; Plus $49.99/mo; Pro $99.99/mo (computer use + voice); Max $199.99/mo.",
    news: [
      { date: "2025-08", headline: "Lindy 3.0 launch with Autopilot — autonomous computer-use agents." },
    ],
    verified: true,
    cohort: "expansion",
  },
  {
    name: "Basis",
    slug: "basis",
    url: "https://usebasis.co",
    tagline: "AI agents for accounting firms — end-to-end.",
    categoryClaim: "Agents that complete accounting, tax, and audit workflows in production, not copilot suggestions.",
    description:
      "Deploys autonomous agents that finish accounting workflows end-to-end at real firms — used by ~30% of the top 25 US accounting firms. Became a unicorn in February 2026. The strongest signal that agent-run operations are landing in conservative industries.",
    techStack: [],
    funding: {
      totalRaised: "$138M",
      lastRound: "$100M Series B",
      date: "2026-02",
      valuation: "$1.15B",
      investors: ["Accel (lead)", "GV", "Khosla Ventures", "NFDG", "Aaron Levie & Jeff Dean (angels)"],
    },
    founders: [
      { name: "Matt Harpe", background: "Co-founder, NYC." },
      { name: "Mitch Troyanovsky", background: "Co-founder, NYC." },
    ],
    metrics: {
      arr: null,
      arrUsd: null,
      humans: 76,
      sources: {
        humans: { name: "Getlatka", url: "https://getlatka.com/companies/getbasis.ai" },
        raised: { name: "Bloomberg", url: "https://www.bloomberg.com/news/articles/2026-02-24/ai-for-accounting-startup-basis-hits-1-15-billion-valuation" },
      },
    },
    referralProgram: { exists: false, notes: "Enterprise sales motion." },
    pricing: "Custom / enterprise.",
    news: [
      { date: "2026-02", headline: "Raises $100M Series B at $1.15B led by Accel." },
      { date: "2024-12", headline: "$34M Series A led by Khosla Ventures." },
    ],
    verified: true,
    cohort: "expansion",
  },
  {
    name: "Delphi",
    slug: "delphi",
    url: "https://delphi.ai",
    tagline: "Create your digital mind.",
    categoryClaim: "Your expertise, monetized 24/7 — a personal-brand business on autopilot.",
    description:
      "Turns an expert's content into an interactive AI clone (text/voice/video) that handles audience conversations, coaching, and monetization around the clock. 2,000+ experts live; backed by Sequoia.",
    techStack: [],
    funding: {
      totalRaised: "$16M+",
      lastRound: "$16M Series A",
      date: "2025-06",
      valuation: null,
      investors: ["Sequoia (lead)", "Menlo Ventures", "Anthropic's Anthology Fund", "Crossbeam"],
    },
    founders: [
      { name: "Dara Ladjevardian", background: "CEO; inspired by wanting to talk with his late grandfather via his memoir." },
      { name: "Sam Spelsberg", background: "CTO." },
    ],
    metrics: {
      arr: null,
      arrUsd: null,
      humans: 37,
      sources: {
        humans: { name: "Tracxn", url: "https://tracxn.com/d/companies/delphi/__sanFr2u2e2tuCcA8J4CoLaZ1mPK11wUadGeq5Xb_Ois" },
        raised: { name: "Delphi blog", url: "https://www.delphi.ai/blog/delphi-raises-16m-series-a-from-sequoia" },
      },
    },
    referralProgram: {
      exists: true,
      notes: "No standard affiliate program — but creators monetize their own clones via subscription/usage revenue share, functioning as a partner economy.",
    },
    pricing: "Free tier; Builder $79/mo; Scaler $299/mo; 'Immortal' concierge tier (custom).",
    news: [
      { date: "2026-01", headline: "CEO calls 2026 'the tipping point for digital minds'." },
      { date: "2025", headline: "$16M Series A led by Sequoia." },
    ],
    verified: true,
    cohort: "expansion",
  },
  {
    name: "Payman",
    slug: "payman",
    url: "https://paymanai.com",
    tagline: "AI that pays humans.",
    categoryClaim: "Agentic banking: controlled money access so agents can hire and pay humans.",
    description:
      "Payments and banking infrastructure that gives AI agents controlled access to money — so they can hire and pay humans and other agents (fiat, bank, or crypto). The financial rails that make fully autonomous businesses possible. Backed by Visa.",
    techStack: [],
    funding: {
      totalRaised: "$13.8M",
      lastRound: null,
      date: "2024-05",
      valuation: null,
      investors: ["Visa", "Boost VC", "CB Ventures", "Deepwater", "Spartan Group"],
    },
    founders: [{ name: "Tyllen Bicakcic", background: "Founder/CEO; fintech & crypto background." }],
    metrics: {
      arr: "$770K (2025 est.)",
      arrUsd: 770_000,
      humans: 15,
      sources: {
        humans: { name: "Tracxn", url: "https://tracxn.com/d/companies/paymanai/__NSTYOZtZdNiGZxC0Vkul0dzUfj3ZUgPqDRNO08pHBUE" },
        arr: { name: "Getlatka (2025 est.)", url: "https://getlatka.com/companies/paymanai.com" },
        raised: { name: "Tracxn", url: "https://tracxn.com/d/companies/paymanai/__NSTYOZtZdNiGZxC0Vkul0dzUfj3ZUgPqDRNO08pHBUE/funding-and-investors" },
      },
    },
    referralProgram: { exists: false, notes: null },
    pricing: "Developer / usage-based; not publicly listed.",
    news: [
      { date: "2026-05", headline: "Citizens State Bank (Colorado) partners with Payman to pioneer 'agentic banking'." },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      section: "enabler",
      story: "AI that pays humans — agent-initiated payouts",
      flags: "~$770K est. revenue",
    },
  },
  {
    name: "RentAHuman",
    slug: "rentahuman",
    url: "https://rentahuman.ai",
    tagline: "The marketplace where AI agents hire humans.",
    categoryClaim: "Humans as API endpoints — hands and feet for the agent economy.",
    description:
      "The inverse of everything else on this list: instead of humans deploying AI agents, AI agents hire humans for physical-world tasks — package pickups, in-store photos, event staffing, robotics training data. Agents post escrow-funded bounties via MCP or REST API and pay out in stablecoins. Launched February 2026 by Alexander Liteplo and went instantly viral (Wired, Forbes, Futurism, Nature): 73K humans registered within two days, 500K+ claimed within two weeks. Early reporting noted far fewer visible worker profiles than registered users — traction claims are self-reported.",
    techStack: ["MCP", "REST API", "Stablecoin payouts", "Escrow bounties"],
    funding: {
      totalRaised: "YC-backed (undisclosed seed)",
      lastRound: "Y Combinator, Spring 2026 batch",
      date: "2026",
      valuation: null,
      investors: ["Y Combinator"],
    },
    founders: [
      { name: "Alexander Liteplo", background: "26; CS at UBC; crypto engineer (LayerZero Labs, UMA Protocol)." },
      { name: "Patricia Tani", background: "Co-founder; previously worked on AI-agent startup LemonAI (per Wired)." },
    ],
    metrics: {
      arr: "~$240K run rate (claimed $20K MRR)",
      arrUsd: 240_000,
      humans: 3,
      sources: {
        humans: { name: "Y Combinator", url: "https://www.ycombinator.com/companies/rentahuman" },
        arr: { name: "YC profile · self-reported", url: "https://www.ycombinator.com/companies/rentahuman" },
        raised: { name: "Crunchbase", url: "https://www.crunchbase.com/organization/rentahuman-ai" },
      },
    },
    referralProgram: {
      exists: true,
      notes: "'Finder's fee' program — earn commissions by referring qualified humans to enterprise bounties.",
    },
    pricing: "Free to browse; tasks funded per-bounty with escrow (examples range $1–$300).",
    news: [
      { date: "2026-02", headline: "Launches and breaks the internet: 73K humans registered in two days; Wired profiles 'the first marketplace for bots to hire humans'." },
      { date: "2026-04", headline: "Joins Y Combinator (Spring 2026 batch); reports 500K+ registered humans across 100+ countries and $20K MRR." },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      section: "enabler",
      story: "AI agents hire humans for physical-world tasks (MCP + escrow bounties)",
      flags: "YC-backed; 500K+ registered humans claimed",
    },
  },
  {
    name: "Naïve",
    slug: "naive",
    url: "https://usenaive.ai",
    tagline: "The infrastructure for autonomous companies.",
    categoryClaim: "Coding agents build the app — Naïve builds the company.",
    description:
      "Palo Alto AI lab building the operating stack agents need to run a real business: incorporation, virtual payment cards, email inboxes, phone numbers, compute, model routing, and memory — provisioned behind a single config file and unified API, with governance and budget controls. A coding agent writes the config; Naïve stands up the company around it. Founded by Sean Dorje and Dennis Zax, 20-year-old Berkeley dropouts who have built together since 14 and sold their first startup (ezML) as teenagers. Claims 30,000+ developer customers and sales up more than tenfold in six months.",
    techStack: ["Single config file + unified API", "Virtual payment cards", "Model router", "Serverless JS runtime", "Mobile emulator"],
    funding: {
      totalRaised: "$28.5M+",
      lastRound: "$28.5M Series A",
      date: "2026-08",
      valuation: null,
      investors: ["Nexus Venture Partners (lead)", "Y Combinator", "Zetta Venture Partners", "Liquid 2 Ventures"],
    },
    founders: [
      { name: "Sean Dorje", background: "Co-founder & CEO; 20; Berkeley dropout; sold ezML as a teenager; YC alum." },
      { name: "Dennis Zax", background: "Co-founder; 20; Berkeley dropout; building with Dorje since they were 14." },
    ],
    metrics: {
      arr: "Low double-digit $M run-rate (self-reported)",
      arrUsd: 10_000_000,
      humans: null,
      sources: {
        arr: { name: "SiliconANGLE · self-reported", url: "https://siliconangle.com/2026/08/06/naive-bags-28-5m-funding-automate-creation-day-day-running-almost-business/" },
        raised: { name: "SiliconANGLE", url: "https://siliconangle.com/2026/08/06/naive-bags-28-5m-funding-automate-creation-day-day-running-almost-business/" },
      },
    },
    referralProgram: { exists: null, notes: null },
    pricing: null,
    news: [
      { date: "2026-08", headline: "$28.5M Series A led by Nexus Venture Partners (YC, Zetta, Liquid 2 participating) to build 'the infrastructure for autonomous companies'." },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      section: "enabler",
      story: "One config file → incorporation, cards, inboxes, phone numbers, compute (agents provision the company)",
      flags: "$28.5M Series A (Nexus); 30K+ devs claimed",
    },
  },
  {
    name: "Moritz",
    slug: "moritz",
    url: "https://moritzlegal.com",
    tagline: "The AI-native law firm.",
    categoryClaim: "AI does 80% of the work, so you pay elite lawyers for the final 20%.",
    description:
      "Oslo-based AI-native law firm (YC W26): agents draft contracts and execute deals, ~10 Harvard/Oxford-trained lawyers review the final 20%, at flat fees ($750–$2,500/doc) with ~4-hour turnarounds. Founded by Pamir Ehsas (former outside counsel to OpenAI and Google) and Stefan Mandaric (AI engineer, ex-MIT Fulbright). The flagship of the 2026 wave of AI-native professional-services firms — the agents do the firm's own billable work.",
    techStack: [],
    funding: {
      totalRaised: "$9M",
      lastRound: "$9M seed (oversubscribed, closed in 4 days)",
      date: "2026-05",
      valuation: null,
      investors: ["20VC", "Y Combinator", "Urban Innovation Fund", "Inception Fund", "20+ unicorn-founder angels"],
    },
    founders: [
      { name: "Pamir Ehsas", background: "CEO; former outside counsel to OpenAI and Google." },
      { name: "Stefan Mandaric", background: "AI engineer; ex-MIT Fulbright scholar." },
    ],
    metrics: {
      arr: null,
      arrUsd: null,
      humans: 10,
      sources: {
        humans: { name: "Y Combinator", url: "https://www.ycombinator.com/companies/moritz" },
        raised: { name: "tech.eu", url: "https://tech.eu/2026/05/05/backed-by-y-combinator-and-20-unicorn-founders-moritz-lands-9m/" },
      },
    },
    referralProgram: { exists: null, notes: null },
    pricing: "Flat fee per document, $750–$2,500.",
    news: [
      {
        date: "2026-05",
        headline:
          "$9M oversubscribed seed closed in 4 days (20VC, YC, Urban Innovation Fund, Inception Fund, 20+ unicorn-founder angels). Press reports $2B in aggregate contract value across 100+ companies in the first 3 months; YC profile says $3B — figures self-reported.",
      },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      level: "L3",
      evidence: "C",
      section: "watchlist",
      story: "AI-native law firm — agents draft, ~10 lawyers review the final 20% at flat fees.",
      flags: "$9M seed press-verified; $2B–$3B deal-value claims self-reported; no ARR disclosed",
    },
  },
  {
    name: "Minimal",
    slug: "minimal-ai",
    url: "https://gominimal.ai",
    tagline: "AI customer support agents for e-commerce.",
    categoryClaim: "Three humans, agents resolve up to 90% of support tickets.",
    description:
      "Amsterdam-based YC S25 startup whose agents autonomously resolve e-commerce support tickets — up to 90% automation (93% in its top case study) — on a 3-person team. Founded by Niek Hogenboom (CEO) and Titus Ex (CTO, ex-ML engineer at Uber). Reports crossing 7-figure ARR (company-stated).",
    techStack: [],
    funding: {
      totalRaised: "$3.6M",
      lastRound: "Seed",
      date: "2026-03",
      valuation: null,
      investors: ["Y Combinator", "Rebel Fund", "Zeno Partners", "Formosa Capital", "Sunshine Lake", "15 customers as angels"],
    },
    founders: [
      { name: "Niek Hogenboom", background: "CEO; previously founded SitRight." },
      { name: "Titus Ex", background: "CTO; ex-ML engineer at Uber and Soda." },
    ],
    metrics: {
      arr: "7-figure (self-reported)",
      arrUsd: 1_000_000,
      humans: 3,
      sources: {
        humans: { name: "Y Combinator", url: "https://www.ycombinator.com/companies/minimal-ai" },
        arr: { name: "Founder-stated · self-reported", url: "https://www.ycombinator.com/companies/minimal-ai" },
        raised: { name: "Ziptone", url: "https://www.ziptone.nl/en/nieuws/minimal-ai-haalt-36-miljoen-dollar-op-om-klantenservice-te-automatiseren/" },
      },
    },
    referralProgram: { exists: null, notes: null },
    pricing: null,
    news: [
      {
        date: "2026-03",
        headline:
          "$3.6M seed led by YC and Rebel Fund, with 15 of its own customers investing as angels; reports 7-figure ARR resolving up to 90% of e-commerce tickets with a 3-person team.",
      },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      level: "L3",
      evidence: "C",
      section: "watchlist",
      story: "AI support agents resolve up to 90% of e-commerce tickets — 7-figure ARR on 3 humans.",
      flags: "$3.6M seed press-verified; ARR self-reported",
    },
  },
  {
    name: "Lunavo",
    slug: "lunavo",
    url: "https://lunavo.ai",
    tagline: "The AI workforce for freight forwarders.",
    categoryClaim: "85% of repetitive back-office logistics automated within 60 days.",
    description:
      "German YC Fall-2025 startup (2 people): an 'AI workforce' for freight forwarders in the DACH region — claims 85% of repetitive carrier back-office work automated within 60 days, 11-second median email replies, and 3× loads per dispatcher. Founded by Felix Lösch (ex-McKinsey) and Niclas Heun (ex-Siemens AI researcher). Backed by YC's standard deal plus Germany's EXIST founder grant — no external seed round yet.",
    techStack: [],
    funding: {
      totalRaised: "YC standard deal (~$500K) + EXIST grant",
      lastRound: "Y Combinator, Fall 2025 batch",
      date: "2025-09",
      valuation: null,
      investors: ["Y Combinator", "EXIST Gründerstipendium (German government grant)"],
    },
    founders: [
      { name: "Felix Lösch", background: "CEO; ex-McKinsey." },
      { name: "Niclas Heun", background: "CTO; TU Munich/Waterloo; ex-Siemens AI researcher." },
    ],
    metrics: {
      arr: null,
      arrUsd: null,
      humans: 2,
      sources: {
        humans: { name: "Y Combinator", url: "https://www.ycombinator.com/companies/lunavo" },
        raised: { name: "Y Combinator (standard deal)", url: "https://www.ycombinator.com/companies/lunavo" },
      },
    },
    referralProgram: { exists: null, notes: null },
    pricing: null,
    news: [
      {
        date: "2025-09",
        headline: "Joins YC Fall 2025; claims 85% of repetitive freight-forwarder back-office work automated within 60 days (self-reported; no third-party coverage yet).",
      },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      level: "L3",
      evidence: "D",
      section: "watchlist",
      story: "AI workforce automating 85% of freight-forwarder back-office ops (DACH).",
      flags: "All metrics self-reported; YC standard deal only, no external round",
    },
  },
  {
    name: "Beacon Health",
    slug: "beacon-health",
    url: "https://www.beaconhealth.ai",
    tagline: "AI employees for primary care.",
    categoryClaim: "Agents work inside the EHR: prior auth, referrals, screenings, risk adjustment.",
    description:
      "YC W26 startup (2 people, SF): 'AI employees' for value-based primary care — agents work inside EHRs (Epic, Athena, eCW, Cerner) closing quality gaps, running prior authorizations, referrals and patient outreach. Live with an independent physician association supporting 40,000 patients. Founded by Mark Pothen (CEO) and Obinna Akahara (CTO). Not to be confused with Beacon Health System, the legacy Indiana hospital network.",
    techStack: [],
    funding: {
      totalRaised: "YC standard deal (~$500K)",
      lastRound: "Y Combinator, Winter 2026 batch",
      date: "2026-01",
      valuation: null,
      investors: ["Y Combinator"],
    },
    founders: [
      { name: "Mark Pothen", background: "CEO." },
      { name: "Obinna Akahara", background: "CTO; Physics, UT Austin." },
    ],
    metrics: {
      arr: null,
      arrUsd: null,
      humans: 2,
      sources: {
        humans: { name: "Y Combinator", url: "https://www.ycombinator.com/companies/beacon-health" },
        raised: { name: "Y Combinator (standard deal)", url: "https://www.ycombinator.com/companies/beacon-health" },
      },
    },
    referralProgram: { exists: null, notes: null },
    pricing: null,
    news: [
      {
        date: "2026-01",
        headline: "YC W26; goes live with an independent physician association supporting 40,000 patients — agents run prior auth, referrals, screenings and risk adjustment inside the EHR.",
      },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      level: "L3",
      evidence: "C",
      section: "watchlist",
      story: "\"AI employees\" inside the EHR for value-based primary care — live with a 40,000-patient IPA.",
      flags: "YC-verified traction claim; pre-revenue-disclosure",
    },
  },
  {
    name: "Gamma",
    slug: "gamma",
    url: "https://gamma.app",
    tagline: "PowerPoint for the AI era.",
    categoryClaim: "The lean-AI benchmark: $100M ARR on 52 people, profitable, ~$23M primary capital.",
    description:
      "AI-native presentation and content platform — the cleanest lean-AI case on record: $100M ARR on 52 people (Nov 2025), profitable for over two years, reached on only ~$23M of primary capital. 70M users, 600K+ paying subscribers, users in 40% of the Fortune 500 (Sacra). $68M Series B led by a16z at a $2.1B valuation.",
    techStack: [],
    funding: {
      totalRaised: "~$90M (incl. secondary)",
      lastRound: "$68M Series B at $2.1B (a16z lead)",
      date: "2025-11",
      valuation: "$2.1B",
      investors: ["Andreessen Horowitz", "Accel", "Uncork Capital", "South Park Commons", "Hustle Fund"],
    },
    founders: [{ name: "Grant Lee", background: "Co-founder & CEO." }],
    metrics: {
      arr: "$100M (Nov 2025)",
      arrUsd: 100_000_000,
      humans: 52,
      sources: {
        humans: { name: "Lean AI Leaderboard / Sacra", url: "https://sacra.com/c/gamma/" },
        arr: { name: "TechCrunch", url: "https://techcrunch.com/2025/11/10/ai-powerpoint-killer-gamma-hits-2-1b-valuation-100m-arr-founder-says/" },
        raised: { name: "TechCrunch", url: "https://techcrunch.com/2025/11/10/ai-powerpoint-killer-gamma-hits-2-1b-valuation-100m-arr-founder-says/" },
      },
    },
    referralProgram: { exists: null, notes: null },
    pricing: "Freemium; Pro subscription.",
    news: [
      {
        date: "2025-11",
        headline: "Passes $100M ARR on 52 people, profitable for 2+ years; $68M Series B led by a16z at a $2.1B valuation (~$20M of it secondary for early employees).",
      },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      level: "L2",
      evidence: "C",
      section: "index",
      story: "$100M ARR · 52 humans · profitable — the lean-AI benchmark, corroborated by TechCrunch/Sacra.",
      flags: "~$1.9M ARR/human; a16z-led $2.1B valuation",
    },
  },
  {
    name: "Retell AI",
    slug: "retell-ai",
    url: "https://www.retellai.com",
    tagline: "AI voice agents by API.",
    categoryClaim: "Voice-agent platform grown to ~$60M annualized on ~$5M raised.",
    description:
      "YC W24 voice/phone-agent API platform (founder Bing Wu) — the infrastructure behind many production phone agents. Growth is corroborated (Sacra estimates ~$60M annualized by Apr 2026, +650% YoY, on only ~$5.1M raised), but its famous efficiency claim is not: headcount reports range from 21 (Lean AI Leaderboard, Nov 2025) to 50 (YC directory) to 143 (Tracxn, Jun 2026) — treat ARR-per-human as disputed.",
    techStack: [],
    funding: {
      totalRaised: "~$5.1M",
      lastRound: "$4.6M seed (Alt Capital lead; YC, Aaron Levie, Michael Seibel among angels)",
      date: "2024-08",
      valuation: null,
      investors: ["Alt Capital", "Y Combinator", "Carya Ventures"],
    },
    founders: [{ name: "Bing Wu", background: "Co-founder & CEO; YC W24; pivoted from an AI dubbing platform." }],
    metrics: {
      arr: "~$60M annualized (Sacra est., Apr 2026)",
      arrUsd: 60_000_000,
      humans: null,
      sources: {
        humans: { name: "Disputed: 21 (leaderboard) → 143 (Tracxn)", url: "https://leanaileaderboard.com/" },
        arr: { name: "Sacra · estimate", url: "https://sacra.com/research/retell-ai-60m-yr-up-650-yoy/" },
        raised: { name: "Retell blog", url: "https://www.retellai.com/blog/seed-announcement" },
      },
    },
    referralProgram: { exists: null, notes: null },
    pricing: "Usage-based, ~$0.055/min platform fee.",
    news: [
      {
        date: "2026-04",
        headline: "Sacra estimates ~$60M annualized revenue, up ~650% YoY, on ~$5.1M total raised. Headcount disputed across sources (21–143) — efficiency claims flagged.",
      },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      level: "L2",
      evidence: "C",
      section: "watchlist",
      story: "Voice agents by API — ~$60M annualized (est.) on ~$5M raised; headcount disputed 21–143.",
      flags: "ARR is analyst estimate; ARR-per-human unreliable due to disputed headcount",
    },
  },
  {
    name: "11x",
    slug: "11x",
    url: "https://11x.ai",
    tagline: "Digital workers for GTM.",
    categoryClaim: "AI sales reps sold explicitly as headcount replacement.",
    description:
      "Autonomous AI SDR 'Alice' and voice agent 'Julian' run outbound prospecting, email, and calls. Included as the category's cautionary tale: a TechCrunch investigation (March 2025) found it claimed customers it didn't have, with revenue and churn heavily disputed. Still operating under a new CEO.",
    techStack: [],
    funding: {
      totalRaised: "~$76M",
      lastRound: "$50M Series B (~$350M valuation)",
      date: "2024-11",
      valuation: "~$350M",
      investors: ["a16z (lead)", "Benchmark"],
    },
    founders: [
      { name: "Hasan Sukkar", background: "Founder; stepped down as CEO May 2025." },
      { name: "Prabhav Jain", background: "CTO, now CEO." },
    ],
    metrics: {
      arr: "claimed $10M; disputed ~$3M",
      arrUsd: null,
      humans: 77,
      sources: {
        humans: { name: "Tracxn", url: "https://tracxn.com/d/companies/11x/__P4mFd4dOZmyEt3qkI243p5AtNH1AhqMZw4A4Zd1scY4" },
        arr: { name: "TechCrunch investigation", url: "https://techcrunch.com/2025/03/24/a16z-and-benchmark-backed-11x-has-been-claiming-customers-it-doesnt-have/" },
        raised: { name: "Tracxn", url: "https://tracxn.com/d/companies/11x/__P4mFd4dOZmyEt3qkI243p5AtNH1AhqMZw4A4Zd1scY4" },
      },
    },
    referralProgram: { exists: false, notes: null },
    pricing: "Not public; historically annual contracts in the tens of thousands.",
    news: [
      { date: "2025-03", headline: "TechCrunch: 'a16z- and Benchmark-backed 11x has been claiming customers it doesn't have'." },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      section: "caution",
      story: "AI SDRs replacing headcount; $10M ARR claimed",
      flags:
        "TechCrunch investigation: claimed customers it didn't have; ARR nearer $3M; CEO stepped down. Still operating.",
    },
  },
  {
    name: "Egbe",
    slug: "egbe",
    url: "https://egbe.ai",
    tagline: "The zero-employee company. You found it. AI runs it.",
    categoryClaim: "Autonomous companies, built by AI — an AI co-founder for solo founders.",
    description:
      "Bring the idea; Egbe's AI co-founder takes it from research to a shipped product — Stripe checkout wired in, hosting/domains/email provisioned, then ads, cold email, and content on autopilot to find your first users, with the founder steering the big calls. Founded 2026 in Cambridge, MA by Nikolay Vyahhi (Stepik, Hyperskill), who told the MIT AI Summit in April he'd already spun up 100 AI-run e-commerce startups on a few Mac minis. In August it said GLM-5.2 from Z.ai now powers the majority of the co-founder's building workload, with requests and processed tokens up nearly 8× in a month (self-reported, one month post-launch) — a live test of frontier open models powering AI co-founders. Traction and customer claims are self-reported; no funding disclosed.",
    techStack: ["GLM-5.2 (Z.ai)", "Stripe", "Provisioned hosting/domains/email", "Self-hosted analytics"],
    funding: {
      totalRaised: null,
      lastRound: null,
      date: null,
      valuation: null,
      investors: [],
    },
    founders: [
      {
        name: "Nikolay Vyahhi",
        background:
          "Founder/CEO of edtech platform Stepik and Hyperskill; MIT lecturer involved in MIT Media Lab's Project NANDA ('Internet of AI Agents'); bioinformatics researcher (co-created QUAST).",
      },
    ],
    metrics: {
      arr: null,
      arrUsd: null,
      humans: 5,
      sources: {
        humans: { name: "LinkedIn · self-reported", url: "https://www.linkedin.com/company/egbe-ai/" },
      },
    },
    referralProgram: { exists: null, notes: null },
    pricing: "$99/mo + pay-as-you-go usage wallet; $50 free credit, no card required.",
    news: [
      {
        date: "2026-08",
        headline:
          "Says GLM-5.2 (Z.ai) now powers the majority of its AI co-founder's building workload — production requests and processed tokens up nearly 8× in a single month since the switch (self-reported, from a one-month-old base) — and joins the Z.ai Startup Program.",
      },
      {
        date: "2026-07",
        headline: "Launches publicly: 'the first companies are already running on Egbe' (numbers not disclosed).",
      },
      {
        date: "2026-04",
        headline:
          "Pre-launch: founder tells the MIT AI Summit he has created 100 AI-run e-commerce startups 'on a few Mac minis and some cloud servers' (Boston Globe; founder-reported).",
      },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      level: "L4",
      evidence: "D",
      section: "watchlist",
      story:
        "\"The zero-employee company. You found it. AI runs it.\" — AI co-founder ships the product, wires Stripe, runs ads",
      flags:
        "Founder Nikolay Vyahhi (Stepik) pre-tested with 100 AI-run e-commerce startups on Mac minis; claims 8× token growth in a month on GLM-5.2 (self-reported).",
    },
  },
  {
    name: "Medvi",
    slug: "medvi",
    url: "https://medvi.io",
    tagline: "The near-one-person $1B company — payroll of two, $1.8B revenue track.",
    categoryClaim: "Not an AI company — an old-fashioned middleman business turbocharged by AI.",
    description:
      "Telehealth seller of GLP-1 weight-loss drugs, built in two months for $20,000 with a dozen-plus AI tools by Matthew Gallagher, working from home in LA. The category's verification outlier: the NYT audited its financials directly — $401M sales and 16.2% net profit in 2025 (Hims & Hers: 5.5% on 2,442 employees), tracking $1.8B for 2026. Bootstrapped, profitable, no valuation. The trick isn't just AI — it's 'telehealth-in-a-box' rails (CareValidate, OpenLoop Health) absorbing doctors, pharmacies, and compliance. Equally instructive as a cautionary tale: an FDA warning letter, an anti-spam class action over its affiliate marketers, and post-NYT reporting on fake AI doctor personas in its Meta ads. Sam Altman said the company won him a bet on when a near-one-person $1B business would appear.",
    techStack: [
      "ChatGPT",
      "Claude",
      "Grok",
      "Midjourney",
      "Runway",
      "ElevenLabs",
      "Custom AI agents",
      "CareValidate",
      "OpenLoop Health",
    ],
    funding: {
      totalRaised: "$0 — bootstrapped and profitable",
      lastRound: null,
      date: null,
      valuation: "None official (never raised)",
      investors: [],
    },
    founders: [
      {
        name: "Matthew Gallagher",
        background:
          "41; self-taught coder (first project: a Weird Al fan page), no degree, ex-actor. Previous startup Watch Gang hit 60 employees and never turned a profit — the anti-headcount lesson behind Medvi. Advised by Kobie Fuller (Upfront Ventures) to skip VC entirely.",
      },
      {
        name: "Elliot Gallagher",
        background: "36; Matthew's brother and the only employee (hired April 2025) — filters all communications.",
      },
    ],
    metrics: {
      arr: "$401M 2025 sales, 16.2% net (NYT-verified); tracking $1.8B in 2026",
      arrUsd: 401_000_000,
      humans: 2,
      sources: {
        humans: {
          name: "NYT (financials reviewed)",
          url: "https://www.nytimes.com/2026/04/02/technology/ai-billion-dollar-company-medvi.html",
        },
        arr: {
          name: "NYT (financials reviewed)",
          url: "https://www.nytimes.com/2026/04/02/technology/ai-billion-dollar-company-medvi.html",
        },
      },
    },
    referralProgram: {
      exists: true,
      notes:
        "Runs an affiliate-marketer network — the same channel at the center of the March 2026 anti-spam class action.",
    },
    pricing: "From $179 for the first month of GLP-1 medication.",
    news: [
      {
        date: "2026-04",
        headline:
          "NYT front page: 'A $1.8 Billion Business Built With A.I. and a Payroll of Just Two' — financials verified by the Times; Sam Altman says it won him a bet. Backlash follows: Techdirt and Futurism dispute the framing, and Business Insider finds thousands of Meta ads fronted by fake AI doctor personas.",
      },
      {
        date: "2026-03",
        headline:
          "Class action filed in the Central District of California alleging its affiliate marketers sent spam with spoofed domains and falsified headers ($1,000 sought per email).",
      },
      {
        date: "2026-02",
        headline:
          "FDA warning letter (Feb 20) for misbranding compounded semaglutide/tirzepatide — marketing implied FDA approval. Same month: men's health line launches and claims 50,000 customers in month one.",
      },
      {
        date: "2025-12",
        headline:
          "First full year closes at $401M sales, 250,000 customers, 16.2% net profit — with two employees, seven contract account managers, and two contract engineers.",
      },
      {
        date: "2024-09",
        headline: "Launches after a two-month, $20,000 build; 300 customers in month one, 1,000 more in month two.",
      },
    ],
    verified: true,
    cohort: "expansion",
    autopilot: {
      level: "L2",
      evidence: "A",
      section: "index",
      story:
        "GLP-1 telehealth built in 2 months for $20K. 16.2% net profit with a payroll of two brothers — the NYT audited the books. Runs on \"telehealth-in-a-box\" rails.",
      flags: "FDA warning letter (Feb 2026); anti-spam class action (Mar 2026); AI-fake-doctor ads exposed",
    },
  },
];

export type StackCategory =
  | "intelligence"
  | "agents"
  | "sandboxes"
  | "code-deploy"
  | "data"
  | "ops"
  | "rails"
  | "payments"
  | "distribution";

export type StackTool = {
  name: string;
  url: string;
  role: string;
  referral: string | null;
  // Your personal affiliate/referral link — when set, the OFFER chip links here
  // instead of the plain vendor URL. Join links per program are in the TODO
  // comments on each tool below.
  referralUrl?: string;
  usedBy: string[];
  category: StackCategory;
};

// Pyramid layers, top (apex) → bottom (foundation).
export const stackLayers: { key: StackCategory; label: string; blurb: string }[] = [
  { key: "intelligence", label: "Intelligence — LLMs & engines", blurb: "The models that think, plan, and argue" },
  { key: "agents", label: "Agent infrastructure", blurb: "Inboxes, browsers, voices & compute for agents" },
  { key: "sandboxes", label: "Sandboxes & GPU compute", blurb: "Isolated containers and neocloud GPUs — where agent code actually runs" },
  { key: "code-deploy", label: "Code & deployment", blurb: "Where agent-written code lives and ships" },
  { key: "data", label: "Databases & backend", blurb: "State for a thousand agent-built apps" },
  { key: "ops", label: "Ops & observability", blurb: "Tracing, evals & audit trails — how one human trusts what the agents did overnight" },
  { key: "rails", label: "Regulated-industry rails", blurb: "Doctors, pharmacies & compliance as an API — how one human sells in regulated markets" },
  { key: "payments", label: "Payments & money rails", blurb: "How autopilot businesses actually get paid" },
  { key: "distribution", label: "Distribution & comms", blurb: "Ads, email, phone — reaching the real world" },
];

// The infrastructure layer that showed up repeatedly behind autopilot businesses.
// Referral notes are indicative — always confirm current terms on the vendor's site.
export const stackTools: StackTool[] = [
  {
    name: "Claude (Anthropic)",
    url: "https://claude.com",
    role: "Reasoning, planning & code review — the 'thinking' half of most agent stacks",
    referral: null,
    usedBy: ["Polsia"],
    category: "intelligence",
  },
  {
    name: "OpenAI",
    url: "https://openai.com",
    role: "Implementation models & stress-testing plans (the Codex side of the duo workflow)",
    referral: null,
    usedBy: ["Polsia"],
    category: "intelligence",
  },
  {
    name: "Cursor",
    url: "https://cursor.com",
    role: "Agentic coding IDE — host of the Hands-Off Hackathon",
    // TODO(referral): check https://cursor.com/dashboard/referrals — $25 credit/referral, limited rollout
    referral: "Referral: 50% off referee's first month (limited rollout)",
    usedBy: ["Hackathon teams"],
    category: "intelligence",
  },
  {
    name: "Atoms",
    url: "https://atoms.dev",
    role: "AI business team — agents that build, deploy AND market your product",
    referral: "Affiliate: referred users get $50 in credits",
    referralUrl: "https://atoms.dev/?utm_source=affiliate&via=autopilot-biz",
    usedBy: ["One-person companies"],
    category: "intelligence",
  },
  {
    name: "Sciforium",
    url: "https://sciforium.com",
    role: "Serverless open-source model inference on AMD GPUs — how Polsia cut its $1.2M/mo Anthropic bill to ~$100K",
    referral: null,
    usedBy: ["Polsia"],
    category: "intelligence",
  },
  {
    name: "Z.ai (GLM-5.2)",
    url: "https://z.ai",
    role: "Open-weights frontier models (GLM-5.2, 1M-token context) — powers the majority of Egbe's AI co-founder workload",
    referral: null,
    usedBy: ["Egbe"],
    category: "intelligence",
  },
  {
    name: "Claude Code",
    url: "https://claude.com/claude-code",
    role: "Agentic coding CLI + managed cloud sessions — the workhorse behind hands-off builds",
    referral: null,
    usedBy: ["Hackathon teams"],
    category: "intelligence",
  },
  {
    name: "OpenAI Codex",
    url: "https://openai.com/codex",
    role: "OpenAI's coding agent — cloud tasks, CLI and IDE; the implementation half of many duo workflows",
    referral: null,
    usedBy: ["Polsia"],
    category: "intelligence",
  },
  {
    name: "Hermes (Nous Research)",
    url: "https://nousresearch.com",
    role: "Open-weights Hermes models — steerable, self-hostable intelligence with no per-seat pricing",
    referral: null,
    usedBy: ["Solo builders"],
    category: "intelligence",
  },
  {
    name: "OpenRouter",
    url: "https://openrouter.ai",
    role: "One API over 400+ models — price/latency routing and instant fallbacks when a provider blinks",
    referral: null,
    usedBy: ["Solo builders"],
    category: "intelligence",
  },
  {
    name: "OpenClaw",
    url: "https://openclaw.ai",
    role: "Open-source self-hosted agent runtime — a 24/7 personal AI on your own hardware, 50+ integrations",
    referral: null,
    usedBy: ["Solo builders"],
    category: "agents",
  },
  {
    name: "NanoClaw",
    url: "https://github.com/nanocoai/nanoclaw",
    role: "Minimal OpenClaw alternative on the Claude Agent SDK — small enough to read, container-isolated agents",
    referral: null,
    usedBy: ["Solo builders"],
    category: "agents",
  },
  {
    name: "CareValidate",
    url: "https://carevalidate.com",
    role: "'Telehealth-in-a-box' — the platform layer that let Medvi launch a prescription-drug business in two months",
    referral: null,
    usedBy: ["Medvi"],
    category: "rails",
  },
  {
    name: "OpenLoop Health",
    url: "https://openloophealth.com",
    role: "Doctor networks, pharmacies, fulfillment & compliance as an API (a Nov 2025 class action disputes its compounded pills)",
    referral: null,
    usedBy: ["Medvi"],
    category: "rails",
  },
  {
    name: "Sapiom",
    url: "https://sapiom.ai",
    role: "Routes each agent task to the cheapest capable model + spend infrastructure (wallets, policy, settlement). Raised $35M Series A Aug 2026 — Anthropic is a backer",
    referral: null,
    usedBy: ["Polsia"],
    category: "payments",
  },
  {
    name: "Stripe",
    url: "https://stripe.com",
    role: "Payments & billing for agent-run revenue (Stripe Connect for platform rev-share)",
    // Verified 2026-07: partner-only ecosystem, no consumer affiliate and no builder credits — no OFFER badge.
    referral: null,
    usedBy: ["Polsia", "Nanocorp", "Cofounder", "Feltsense", "Atoms"],
    category: "payments",
  },
  {
    name: "Together AI",
    url: "https://together.ai",
    role: "Open-model inference cloud — frontier OSS models at commodity prices",
    referral: null,
    usedBy: ["Solo builders"],
    category: "intelligence",
  },
  {
    name: "Groq",
    url: "https://groq.com",
    role: "LPU inference — open models at absurd tokens per second",
    referral: null,
    usedBy: ["Solo builders"],
    category: "intelligence",
  },
  {
    name: "HappyRobot",
    url: "https://happyrobot.ai",
    role: "AI workers on the phone — the orchestration layer behind 'Brigitte'",
    referral: null,
    usedBy: ["Le Baguette Index"],
    category: "agents",
  },
  {
    name: "Soniox",
    url: "https://soniox.com",
    role: "Real-time speech-to-text — the ears on the Baguette Index calls",
    referral: null,
    usedBy: ["Le Baguette Index"],
    category: "agents",
  },
  {
    name: "Apify",
    url: "https://apify.com",
    role: "Actor marketplace for scraping & automation — this index's own pulse runs its X/LinkedIn sources on it",
    // TODO(referral): join at https://apify.com/partners/affiliate (20% first 3mo → 30%, up to $2.5k/customer) → set referralUrl
    referral: "Affiliate: 20% → 30% recurring, up to $2,500/customer",
    usedBy: ["Autopilot Index (this site)"],
    category: "agents",
  },
  {
    name: "Vapi",
    url: "https://vapi.ai",
    role: "Voice agents by API — dial, listen, respond; the fast path to a 'Rachel' of your own",
    // TODO(referral): join at https://affiliates.vapi.ai (~15% via Tolt) → set referralUrl
    referral: "Affiliate: ~15% commission",
    usedBy: ["Solo builders"],
    category: "agents",
  },
  {
    name: "Browserbase",
    url: "https://browserbase.com",
    role: "Headless browsers for agents at scale — sessions, stealth & replays",
    referral: null,
    usedBy: ["Solo builders"],
    category: "agents",
  },
  {
    name: "Firecrawl",
    url: "https://firecrawl.dev",
    role: "Websites → LLM-ready data — the web-reading layer for agent pipelines",
    // TODO(referral): apply at https://partners.dub.co/firecrawl/apply (25% ×12mo then 15%; Creator/OSS tier 50%) → set referralUrl
    referral: "Affiliate: 25% for 12 months, then 15%",
    usedBy: ["Solo builders"],
    category: "agents",
  },
  {
    name: "n8n",
    url: "https://n8n.io",
    role: "Self-hostable workflow automation with agent nodes — the glue of one-person ops",
    // TODO(referral): join at https://n8n.io/affiliates/ (30% ×12mo on cloud) → set referralUrl
    referral: "Affiliate: 30% for 12 months (cloud)",
    usedBy: ["Solo builders"],
    category: "agents",
  },
  {
    name: "Resend",
    url: "https://resend.com",
    role: "The transactional-email API this generation of builders reaches for",
    referral: null,
    usedBy: ["Solo builders"],
    category: "distribution",
  },
  {
    name: "Polar",
    url: "https://polar.sh",
    role: "Merchant of record for one-person software businesses — global sales tax handled, checkout in minutes",
    referral: null,
    usedBy: ["Solo builders"],
    category: "payments",
  },
  {
    name: "Langfuse",
    url: "https://langfuse.com",
    role: "Open-source agent/LLM observability — what did my agents actually do overnight?",
    referral: null,
    usedBy: ["Small-team CTOs"],
    category: "ops",
  },
  {
    name: "Modal",
    url: "https://modal.com",
    role: "gVisor-isolated sandboxes + on-demand GPUs (T4→B200) — purpose-built for agent workloads at 100k+ concurrent sessions",
    referral: null,
    usedBy: ["Coding agents"],
    category: "sandboxes",
  },
  {
    name: "E2B",
    url: "https://e2b.dev",
    role: "Firecracker microVM sandboxes for untrusted agent code — a billion sandboxes started",
    referral: null,
    usedBy: ["Coding agents"],
    category: "sandboxes",
  },
  {
    name: "Daytona",
    url: "https://daytona.io",
    role: "Persistent agent dev environments — auto-stop economics and computer-use support",
    referral: null,
    usedBy: ["Coding agents"],
    category: "sandboxes",
  },
  {
    name: "CoreWeave",
    url: "https://coreweave.com",
    role: "The flagship neocloud — GPU capacity at scale behind the model providers themselves",
    referral: null,
    usedBy: ["Model providers"],
    category: "sandboxes",
  },
  {
    name: "Lambda Labs",
    url: "https://lambda.ai",
    role: "GPU neocloud — on-demand H100s/B200s priced so a small team can rent frontier compute",
    referral: null,
    usedBy: ["Solo builders"],
    category: "sandboxes",
  },
  {
    name: "RunPod",
    url: "https://runpod.io",
    role: "Per-second GPU rentals & serverless inference endpoints — the solo builder's GPU dealer",
    referral: null,
    usedBy: ["Solo builders"],
    category: "sandboxes",
  },
  {
    name: "DigitalOcean",
    url: "https://digitalocean.com",
    role: "Droplets, managed K8s & GPU droplets — small-team cloud without the hyperscaler bill maze",
    referral: null,
    usedBy: ["Solo builders"],
    category: "code-deploy",
  },
  {
    name: "Akamai (Linode)",
    url: "https://www.linode.com",
    role: "Linode VMs on Akamai's edge — boring, cheap, predictable compute",
    referral: null,
    usedBy: ["Solo builders"],
    category: "code-deploy",
  },
  {
    name: "Vercel",
    url: "https://vercel.com",
    role: "Instant deployment for agent-built products",
    // TODO(referral): join at https://vercel.com/affiliates (Dub-run, open to individuals) → set referralUrl
    referral: "Affiliate program (per-signup commission)",
    usedBy: ["Nanocorp", "Cofounder"],
    category: "code-deploy",
  },
  {
    name: "Render",
    url: "https://render.com",
    role: "App & worker hosting",
    // Verified 2026-07: Render has NO live referral program (docs 404; feature request closed).
    referral: null,
    usedBy: ["Polsia"],
    category: "code-deploy",
  },
  {
    name: "Neon",
    url: "https://neon.com",
    role: "Serverless Postgres — a database per agent/project",
    // No individual affiliate (partner program is companies-only, verified 2026-07); the builder offer is startup credits.
    referral: "Startup program: $1k–$200k credits",
    usedBy: ["Polsia"],
    category: "data",
  },
  {
    name: "Supabase",
    url: "https://supabase.com",
    role: "Backend-as-a-service for agent-built apps",
    referral: null,
    usedBy: ["Cofounder"],
    category: "data",
  },
  {
    name: "AgentMail (YC S25)",
    url: "https://agentmail.to",
    role: "Email inboxes built for AI agents",
    referral: null,
    usedBy: ["Polsia"],
    category: "agents",
  },
  {
    name: "Anchor Browser",
    url: "https://anchorbrowser.io",
    role: "Browser automation infrastructure for agents",
    referral: null,
    usedBy: ["Polsia"],
    category: "agents",
  },
  {
    name: "Blaxel (YC X25)",
    url: "https://blaxel.ai",
    role: "Compute platform to deploy & scale agents",
    referral: null,
    usedBy: ["Polsia"],
    category: "agents",
  },
  {
    name: "MCP (Model Context Protocol)",
    url: "https://modelcontextprotocol.io",
    role: "The connector standard — how agents reach 3,000+ tools",
    referral: null,
    usedBy: ["Wordware (Sauna)", "Cofounder"],
    category: "agents",
  },
  {
    name: "Meta Ads",
    url: "https://www.facebook.com/business/ads",
    role: "Agent-run paid acquisition",
    referral: null,
    usedBy: ["Polsia", "Nanocorp", "Feltsense"],
    category: "distribution",
  },
  {
    name: "RentAHuman",
    url: "https://rentahuman.ai",
    role: "Marketplace where agents hire humans for physical-world tasks (MCP + API, escrow bounties)",
    // TODO(referral): account at https://rentahuman.ai/account/referrals; fee-tagged bounties at /bounties?findersFeeOnly=true
    referral: "Finder's fees on tagged bounties",
    usedBy: ["Agents via MCP (e.g. Claude)"],
    category: "agents",
  },
  {
    name: "ElevenLabs",
    url: "https://elevenlabs.io",
    role: "Conversational voice agents — the voice behind 'Rachel' and 'Brigitte'",
    // TODO(referral): apply at https://elevenlabs.io/affiliates/app/sign-up → set referralUrl
    referral: "Affiliate: 22% of revenue, first 12 months",
    usedBy: ["Guinndex", "Le Baguette Index"],
    category: "agents",
  },
  {
    name: "Twilio",
    url: "https://www.twilio.com",
    role: "Programmable telephony — agents dialing the real world",
    referral: null,
    usedBy: ["Guinndex", "Le Baguette Index"],
    category: "distribution",
  },
  {
    name: "Postmark",
    url: "https://postmarkapp.com",
    role: "Transactional email delivery",
    // TODO(referral): join at https://postmarkapp.com/lp/referral-partner-program (20% recurring × 12mo, Rewardful) → set referralUrl
    referral: "Affiliate: 20% recurring for 12 months",
    usedBy: ["Polsia"],
    category: "distribution",
  },
  {
    name: "GitHub",
    url: "https://github.com",
    role: "Code hosting — where agent PRs land and get reviewed",
    referral: null,
    usedBy: ["Polsia", "Cofounder", "Atoms"],
    category: "code-deploy",
  },
  {
    name: "AWS",
    url: "https://aws.amazon.com",
    role: "Underlying cloud infrastructure",
    // Builder offer only (credits program, no affiliate path for individuals — verified 2026-07).
    referral: "Activate: up to $200K startup credits",
    usedBy: ["Polsia"],
    category: "code-deploy",
  },
];

export const playbook = {
  source: "Ben Cera (Polsia) — solo-founder AI coding workflow",
  steps: [
    { step: "Explore & plan", detail: "Claude Opus for exploration and planning the change." },
    { step: "Stress-test the plan", detail: "Codex on max effort to stress-test the plan — it catches gaps Opus missed." },
    { step: "Argue it out", detail: "Back to Opus, which usually complains Codex is over-engineering. A few rounds back and forth." },
    { step: "Implement & review", detail: "Codex implements, Opus reviews." },
    { step: "Pre-ship check", detail: "Ask both: 'Safe to ship? What's the worst thing that could happen?'" },
  ],
  punchline: "“Opus and Codex arguing over my codebase is my entire engineering team.”",
};

export type CaseStudy = {
  title: string;
  who: string;
  date: string | null;
  summary: string;
  stack: string[];
  links: { label: string; url: string }[];
  verified: boolean;
  // Condensed row for the generated GitHub Autopilot Index README.
  index?: { agent: string; legwork: string; cost: string };
};

// Small-scale but telling experiments: agents doing real-world legwork
// (calls, negotiations, data collection) that used to require humans.
export const caseStudies: CaseStudy[] = [
  {
    title: "Guinndex — the Guinness price index",
    who: "Matt Cortland, AI engineer (London)",
    date: "March 2026",
    summary:
      "Annoyed by a €7.80 Dublin pint, he built an AI voice agent named 'Rachel' (friendly Northern Irish accent) that phoned 3,000+ pubs across all 32 Irish counties asking the price of a pint of Guinness. 2,052 pubs answered; 1,000+ verified prices. National average: €5.95. Cheapest: €3.00 (Glynn's Bar, Dunmore); priciest: €10 (Temple Bar). Total cost: ~€200. Only a handful of publicans realized it was an AI — and at least one pub cut its price €0.40 afterward. Now runs as a crowdsourced 'living CPI for the pint'. June 2026: Rachel crossed to the UK (guinndex.co.uk, co-built with AI researcher John Fleming) — 46,237 pubs mapped, 35,659 dialed, 6,544 verified prices across 108 counties, national average £5.82, for ~£500 in API fees. Only 4% of UK publicans detected the AI (0.6% in Northern Ireland, where Rachel matched the local accent). Sister project: Gas Index USA (Apr 2026).",
    stack: ["ElevenLabs Conversational AI", "Twilio Voice", "Claude / Claude Code", "Google Maps API", "Next.js + Supabase"],
    links: [
      { label: "guinndex.ai", url: "https://guinndex.ai" },
      { label: "guinndex.co.uk", url: "https://guinndex.co.uk" },
      { label: "Fortune", url: "https://fortune.com/2026/03/30/guinness-beer-prices-ireland-anthropic-claude-ai/" },
      { label: "Vice", url: "https://www.vice.com/en/article/how-one-man-lowered-the-price-of-guinness-by-using-ai-to-call-3000-pubs/" },
      { label: "tech.eu", url: "https://tech.eu/2026/03/20/meet-rachel-the-ai-agent-that-phoned-3000-pubs-to-price-a-pint/" },
      { label: "Inside the Cask (UK)", url: "https://insidethecask.com/2026/06/04/the-guinndex-uk/" },
    ],
    verified: true,
    index: {
      agent: "\"Rachel\" (ElevenLabs voice + Twilio)",
      legwork:
        "Phoned **3,000+ Irish pubs** for the price of a pint (avg €5.95); then **35,659 UK pubs** (6,544 verified prices, avg £5.82). Only 4% of UK publicans detected the AI. A living CPI for the pint.",
      cost: "~€200 (IE) + ~£500 (UK)",
    },
  },
  {
    title: "Le Baguette Index",
    who: "Charles & Louis-Marie Lorin",
    date: "May 2026",
    summary:
      "Explicitly inspired by the Guinndex: an AI voice agent named 'Brigitte' phoned French bakeries asking 'Combien coûte votre baguette tradition ?'. ~11,190 calls reached 5,173 bakeries across 146 communes (hung up on 1,400+ times); 1,638 prices retained. Average: €1.25; a third of bakeries charge exactly €1.30. Fun finding: cheaper baguettes correlate with better Google ratings. Out-of-pocket cost: ~€30. Most bakers never realized they were talking to a machine.",
    stack: ["HappyRobot", "Twilio", "ElevenLabs", "Soniox", "GPT-4 + Claude", "Apify", "FastAPI"],
    links: [
      { label: "lebaguetteindex.fr", url: "https://lebaguetteindex.fr/" },
      { label: "Cybernews", url: "https://cybernews.com/ai-news/ai-bakery-baguette/" },
      { label: "Write-up (Substack)", url: "https://nicoguyon.substack.com/p/le-baguette-index-5-000-boulangeries" },
    ],
    verified: true,
    index: {
      agent: "\"Brigitte\"",
      legwork:
        "**11,190 calls** to 5,173 French bakeries for the price of a baguette tradition (avg €1.25). Most bakers never noticed she was a machine.",
      cost: "~€30",
    },
  },
  {
    title: "FoodTruckBench — can AI run a food truck?",
    who: "Nicholas S., solo developer",
    date: "July 2026",
    summary:
      "The control-group experiment for the autopilot thesis: a 30-day simulated food truck in Austin, TX — $2,000 starting capital, 34 tools covering location choice, dynamic pricing, inventory, staffing, weather, and event calendars — with humans and models competing under identical rules on one leaderboard. 41 models tested: 25 survived, 16 went bankrupt. Best AI run (Claude Opus 5) turned $2,000 into $75K net worth (+3,663% ROI); Gemini 3 Flash once wrote 'Let's go' 574 times in a single response and never went anywhere. The sobering caveat: the best human still beats every model, roughly doubling the top AI score. Simulated rather than real-world — charted as the cleanest benchmark yet of whether agents can actually run a business.",
    stack: ["Custom 30-day business simulation", "34 agent tools", "12-factor demand model", "41 frontier models (Claude, GPT, Gemini, DeepSeek, Gemma…)"],
    links: [
      { label: "foodtruckbench.com", url: "https://foodtruckbench.com/" },
      { label: "Tuscan Agency write-up", url: "https://www.tuscanagency.com/blog/ai-food-truck-benchmark-business-reasoning-2026" },
      { label: "Skeptical take (Tech Trenches)", url: "https://techtrenches.dev/p/the-autonomy-illusion" },
    ],
    verified: true,
    index: {
      agent: "41 LLMs vs. one human, same rules",
      legwork:
        "**30 simulated days** running an Austin food truck on $2,000: 16 of 41 models went bankrupt; best AI hit +3,663% ROI — still only half the best human's score.",
      cost: "$2,000 (simulated)",
    },
  },
  {
    title: "SliceDex — the NYC pizza slice price index",
    who: "Juan Pablo Jaramillo (\"JP\"), NYU Stern student",
    date: "May 2026",
    summary:
      "Explicitly inspired by the Guinndex: voice agent 'Heather' (ElevenLabs + Twilio) phoned pizza shops across all five NYC boroughs asking the price of a plain cheese slice. 1,766 shops called, 1,346 answered (76% pick-up), 838 gave a price; 829 prices live in the index across 2,252 shops mapped. Headline average: $3.42 (distribution mean $3.56, σ $0.62); most common price $3.50; range $1.00–$6.00. Claude parsed the call transcripts into structured data. Updated in batches via Heather plus community submissions. Figures site-verified; no mainstream press yet (one independent mention by Lander Analytics).",
    stack: ["ElevenLabs", "Twilio", "Claude", "Google Places API", "Supabase", "Mapbox"],
    links: [
      { label: "slicedex.com", url: "https://slicedex.com" },
      { label: "Lander Analytics", url: "https://www.landeranalytics.com/post/revisiting-the-pizza-principle-twelve-years-later" },
    ],
    verified: true,
    index: {
      agent: "\"Heather\" (ElevenLabs + Twilio; Claude parses transcripts)",
      legwork:
        "Called **1,766 NYC pizza shops** for the price of a plain cheese slice — 838 priced, avg $3.42, range $1–$6 across all five boroughs.",
      cost: "Not disclosed",
    },
  },
  {
    title: "Flat White Index — Sydney",
    who: "Daniel Hall, Richard Kelsey & Geoff Huens (Agentic Consciousness, AU)",
    date: "2026",
    summary:
      "Voice agent 'Mia' called 847 independent Sydney cafés (chains excluded, weekday business hours only) asking 'How much is a regular flat white?'. Average: A$5.80, range A$4.00 (Ashfield) to A$7.20 (Darling Harbour) across 23 suburbs, re-surveyed monthly. The dataset is published open under CC BY 4.0 (JSON + llms.txt) with the code on GitHub. Melbourne edition slated for 2026. Figures site-verified; self-reported, no independent press yet.",
    stack: ["AI voice agent (\"Mia\")", "Open data: CC BY 4.0 JSON"],
    links: [
      { label: "flatwhiteindex.com.au", url: "https://flatwhiteindex.com.au" },
      { label: "GitHub", url: "https://github.com/HallyAus/flatwhiteindex" },
    ],
    verified: true,
    index: {
      agent: "\"Mia\"",
      legwork:
        "Called **847 independent Sydney cafés** for the price of a regular flat white — avg A$5.80, mapped by suburb, re-surveyed monthly, data open under CC BY 4.0.",
      cost: "Not disclosed",
    },
  },
  {
    title: "London Coffee Index",
    who: "TheDX (UK voice-agent studio)",
    date: "August 2026",
    summary:
      "A separate project from the Sydney index (different team, independently built): TheDX's voice agents contacted 2,288 independent coffee shops across all 33 London boroughs; 677 responded and 416 flat-white prices were captured. Median £3.50, average £3.40; Westminster the priciest borough (median £3.85). Shop identities anonymised and map points displaced for privacy. Figures site-verified; self-reported, no independent press yet.",
    stack: ["AI voice agents (vendor undisclosed)"],
    links: [{ label: "flatwhiteindex.thedx.ai", url: "https://flatwhiteindex.thedx.ai" }],
    verified: true,
    index: {
      agent: "Unnamed voice agents by TheDX",
      legwork:
        "Contacted **2,288 independent London coffee shops** across all 33 boroughs — 416 flat-white prices captured, median £3.50, Westminster priciest.",
      cost: "Not disclosed",
    },
  },
];

// Production workloads voting with their wallets — the strongest infra demand signal there is.
export type StackSwitch = { date: string; company: string; moved: string; impact: string };
export const switchLog: StackSwitch[] = [
  {
    date: "2026-06",
    company: "Polsia",
    moved: "Routine workloads: Anthropic API → open-source models on Sciforium",
    impact: "**$1.2M/mo → ~$100K/mo** compute bill (founder-reported)",
  },
  {
    date: "2026-07",
    company: "Egbe",
    moved: "Majority of build workload → GLM-5.2 (Z.ai)",
    impact: "Requests & tokens up **~8× in one month** (self-reported, one month post-launch)",
  },
];

// The inclusion framework — published rules for who makes the list, in the
// spirit of Henry Shi's Lean AI Leaderboard criteria. Also used to judge
// radar candidates before promotion.
export const criteria = [
  {
    rule: "Agents execute, humans direct",
    detail:
      "AI performs core business operations end-to-end — selling, building, supporting, transacting. Copilots and assistants that merely help a human work faster don't qualify.",
  },
  {
    rule: "Extreme leverage",
    detail: "Ten or fewer humans, or at least $500K of ARR per human. The org chart should look like a prompt.",
  },
  {
    rule: "Real economics",
    detail:
      "A verifiable revenue, funding, or exit signal with a citable source — Crunchbase, press, or public filings. Vibes don't chart.",
  },
  {
    rule: "Radical transparency",
    detail:
      "Every metric on the leaderboard is labeled: verified, self-reported, or disputed — and links to its source. Disputed claims stay visible, flagged.",
  },
  {
    rule: "The Guinndex rule",
    detail:
      "Not a company? Field experiments qualify when an agent does real-world economic legwork — calling 3,000 pubs, pricing 5,000 baguettes, raising a round.",
  },
] as const;

export const categories = [
  { name: "Autopilot-native", detail: "The business itself runs on agents (Polsia, Nanocorp, Boardy)." },
  { name: "Autopilot-enablers", detail: "Infrastructure that makes agent-run business possible (Payman, RentAHuman)." },
  { name: "Cautionary tales", detail: "Claims that didn't survive contact with reality — tracked, labeled (11x)." },
] as const;

export type InvestorThesis = {
  firm: string;
  partner: string;
  quote: string;
  portfolio: string;
  source: { name: string; url: string };
  date: string;
};

// Verbatim, source-verified quotes from investors on these cap tables.
export const investorTheses: InvestorThesis[] = [
  {
    firm: "Union Square Ventures",
    partner: "Rebecca Kaden",
    quote:
      "What we actually want are agents that don't just execute tasks, but understand your business deeply enough to run these workflows autonomously, 24/7, continuously improving, and fully coordinated.",
    portfolio: "Cofounder",
    source: {
      name: "USV blog",
      url: "https://blog.usv.com/the-race-to-run-businesses-autonomously-cofounder-by-the-general-intelligence-company-of-new-york",
    },
    date: "2025-12",
  },
  {
    firm: "Creandum",
    partner: "Simon Schmincke",
    quote: "We were convinced we had to invest without seeing a pitch deck or even speaking to a human!",
    portfolio: "Boardy",
    source: { name: "Creandum — Backing Boardy", url: "https://creandum.com/stories/backing-boardy-ai/" },
    date: "2025-01",
  },
  {
    firm: "True Ventures",
    partner: "Tony Conrad",
    quote:
      "For most of startup history, the answer was people and capital. Now, a Founder with a clear vision and the right platform can skip the org chart entirely and go straight to building something real.",
    portfolio: "Polsia",
    source: {
      name: "True Ventures blog",
      url: "https://www.trueventures.com/blog/polsia-one-person-company-no-longer-a-metaphor",
    },
    date: "2026",
  },
  {
    firm: "Upfront Ventures",
    partner: "Kobie Fuller",
    quote:
      "Those folks that have those skills, it's kind of like their superpower… This is an extreme example, but I don't think it's going to be the last by any stretch.",
    portfolio: "Medvi (advisor — told Gallagher to skip VC: 'You should just keep building')",
    source: {
      name: "NYT — Erin Griffith",
      url: "https://www.nytimes.com/2026/04/02/technology/ai-billion-dollar-company-medvi.html",
    },
    date: "2026-04",
  },
  {
    firm: "Khosla Ventures",
    partner: "Vinod Khosla",
    quote: "Basis is already radically changing how work gets done at the best firms, driving 20% to 50% efficiencies.",
    portfolio: "Basis",
    source: {
      name: "CPA Practice Advisor",
      url: "https://www.cpapracticeadvisor.com/2026/02/24/basis-raises-100-million-to-deploy-ai-agents-for-accounting-firms/178759/",
    },
    date: "2026-02",
  },
  {
    firm: "Accel",
    partner: "Miles Clements",
    quote: "Basis is years ahead in accounting AI, and we believe it has what it takes to define this category.",
    portfolio: "Basis",
    source: {
      name: "CPA Practice Advisor",
      url: "https://www.cpapracticeadvisor.com/2026/02/24/basis-raises-100-million-to-deploy-ai-agents-for-accounting-firms/178759/",
    },
    date: "2026-02",
  },
  {
    firm: "Sequoia Capital",
    partner: "Jess Lee",
    quote: "Delphi lets these experts be everywhere to everyone, all at once.",
    portfolio: "Delphi",
    source: {
      name: "Sequoia — Partnering with Delphi",
      url: "https://sequoiacap.com/article/partnering-with-delphi-meet-your-heroes/",
    },
    date: "2025-06",
  },
  {
    firm: "OpenAI",
    partner: "Sam Altman",
    quote:
      "In my little group chat with my tech CEO friends there's this betting pool for the first year that there is a one-person billion-dollar company.",
    portfolio: "the category",
    source: {
      name: "Fortune",
      url: "https://fortune.com/2024/02/04/sam-altman-one-person-unicorn-silicon-valley-founder-myth/",
    },
    date: "2023-09",
  },
];

export const hackathon = {
  name: "Cursor Hands-Off Hackathon",
  date: "June 25, 2026",
  url: "https://cursor-hands-off-hackathon-06-2026.vercel.app/",
  video: "https://www.loom.com/share/1c00509d5ff64e1aabc4a0e966a3f21f",
  pitch:
    "Create a self-running business powered entirely by AI agents. Spend the first phase setting up systems — defining workflows, deploying agents, giving them just enough structure to operate independently. Then let go. While your company runs, you don't. At the end: which agents performed, which companies made money, who built the most autonomous system.",
  motto: "The goal isn't to do more — it's to make less do more.",
};
