import type { Company, Source } from "@/lib/data";

// Editorial reading notes derived from the existing, cited company records.
// These are questions and scope distinctions, not new research or new grades.
export const featuredProfileSlugs = [
  "atoms", "polsia", "nanocorp", "cofounder", "base44",
  "boardy", "caffeine", "wordware", "feltsense", "lindy",
] as const;

type ProfileNotes = {
  relevance: string;
  humanRole: string;
  nextEvidence: string;
};

export type ResearchFinding = {
  summary: string;
  status: "Published terms" | "Vendor claim" | "Customer account · vendor published" | "Unresolved";
  sources: Source[];
};

export type CompanyResearch = {
  checkedAt: string;
  pricing: ResearchFinding;
  capabilities: ResearchFinding;
  humanInvolvement: ResearchFinding;
  customerEvidence: ResearchFinding;
  limitation: string;
};

const source = (name: string, url: string): Source => ({ name, url });
const finding = (summary: string, status: ResearchFinding["status"], ...sources: Source[]): ResearchFinding => ({ summary, status, sources });
const checkedAt = "2026-09-10";

// Checked means the cited publication was reviewed on this date. It does not
// imply a paid account test, independent financial verification or a grade change.
export const featuredCompanyResearch: Record<string, CompanyResearch> = {
  atoms: {
    checkedAt,
    pricing: finding("Free $0; Pro from $20/month; Max from $100/month. The FAQ lists 15 daily credits and 25 monthly free credits alongside paid allocations. Credit wording is ambiguous; confirm the actual account allowance. Race Mode is listed for Max.", "Published terms", source("Atoms pricing FAQ", "https://atoms.dev/pricing")),
    capabilities: finding("The advertised team covers demand research, architecture, product planning, app development, SEO, Google Ads and analytics.", "Vendor claim", source("Atoms agent roles", "https://atoms.dev/")),
    humanInvolvement: finding("The founder decides direction. Team leader Mike coordinates execution and requests approval; the page does not quantify intervention frequency.", "Vendor claim", source("Atoms team and approval workflow", "https://atoms.dev/")),
    customerEvidence: finding("The homepage reports over one million community builders and links build demonstrations. This is an adoption claim, not a count of paying customers or profitable autonomous businesses.", "Vendor claim", source("Atoms community and demonstrations", "https://atoms.dev/")),
    limitation: "No independently measured customer profit, retention or operator hours established in this review. The separate Index experiment remains the place to record an actual test.",
  },
  polsia: {
    checkedAt,
    pricing: finding("September 7 terms list a 3% customer-payment platform fee plus Stripe fees, separately a 20% advertising fee, a 31-day settlement period, and $50 minimum / $500 monthly payout limits. Subscription tiers were not verifiable from the public page. The older $49 + 20% revenue-share entry is historical.", "Published terms", source("Polsia terms · policy 2026-09-07", "https://polsia.com/terms")),
    capabilities: finding("The terms describe planning, content, outreach, advertising and infrastructure provisioning, with scheduled operations following general authorization.", "Published terms", source("Polsia services and scheduled operations", "https://polsia.com/terms")),
    humanInvolvement: finding("Users must review outputs, monitor spending, configure permissions and supervise actions. Scheduled execution can proceed without approval on every run.", "Published terms", source("Polsia responsibilities and authorization", "https://polsia.com/terms")),
    customerEvidence: finding("Public dashboards are described, but no audited customer revenue or completed-business outcome was established in this review.", "Unresolved", source("Polsia dashboard scope", "https://polsia.com/terms")),
    limitation: "The direct page extractor returned no readable body; the dated official terms were reviewed through the search engine's indexed copy. Confirm terms and subscription pricing in the account before purchase. Existing disputed financial claims are unresolved.",
  },
  nanocorp: {
    checkedAt,
    pricing: finding("A three-day trial includes 15 welcome credits and one active business, without a card. Afterward checkout, agents, email and custom domains pause unless upgraded. Founder is $30/month for 30 credits, unlimited businesses and a 20% withdrawal fee.", "Published terms", source("NanoCorp pricing", "https://www.nanocorp.so/pricing")),
    capabilities: finding("V3 advertises app creation, database, Stripe, domains, prospecting, customer email, Meta ads and daily reports.", "Vendor claim", source("NanoCorp V3 product", "https://www.nanocorp.so/")),
    humanInvolvement: finding("A founder completes the founding interview, starts the business, sets its mission and redirects the agent through chat. Hands-off reliability is not independently measured.", "Vendor claim", source("NanoCorp founding and steering workflow", "https://www.nanocorp.so/")),
    customerEvidence: finding("The homepage displayed $1,530 earned by businesses in 30 days and 243 earning businesses. Top-earner identities and URLs are hidden. These vendor counters are not independently auditable or comparable to platform ARR.", "Vendor claim", source("NanoCorp revenue counters", "https://www.nanocorp.so/")),
    limitation: "Counters are a dated snapshot, not a validated cohort study. Lifetime leader figures and the 30-day total cover different periods. Earlier disputed revenue claims remain unresolved.",
  },
  cofounder: {
    checkedAt,
    pricing: finding("Seven-day trial; Pro from $120/month. Team is advertised at $100/seat but marked coming soon. Statutory filing fees and external spending are separate. The historical $20 Pro / $50 Team figures are superseded by this page.", "Published terms", source("Cofounder pricing", "https://cofounder.co/pricing")),
    capabilities: finding("Advertises coordinated engineering, marketing, prospect research, email outreach, analytics and recurring work, with company context shared across agents.", "Vendor claim", source("Cofounder product workflow", "https://cofounder.co/")),
    humanInvolvement: finding("The site says shipping requires approval and marks company-name and domain choices as user tasks; incorporation and bank setup require approval.", "Vendor claim", source("Cofounder task and approval examples", "https://cofounder.co/")),
    customerEvidence: finding("The homepage reports more than 10,650 companies using the platform and names LearnPath and Valence OS. It supplies no audited revenue or ongoing human-hours measurements for those examples.", "Vendor claim", source("Cofounder customer examples", "https://cofounder.co/")),
    limitation: "Company counts are provider claims, not evidence of active, paying or profitable businesses. Product screenshots and sample dashboard numbers are not treated as customer results.",
  },
  base44: {
    checkedAt,
    pricing: finding("Free includes 25 message and 100 integration credits monthly. Displayed annual-billing equivalents: Starter $16, Builder $40, Pro $80, Elite $160 per month. These prices require annual billing; connected third-party services can charge separately.", "Published terms", source("Base44 pricing · annual billing display", "https://base44.com/pricing")),
    capabilities: finding("App creation includes backend, authentication and hosting. Superagents additionally advertise scheduled tasks, event triggers, outreach and reports across connected tools.", "Vendor claim", source("Base44 included app features", "https://base44.com/pricing"), source("Base44 Superagents", "https://base44.com/superagents")),
    humanInvolvement: finding("The user defines the job and explicitly grants tool permissions. The Superagents page does not establish the ongoing review and repair rate.", "Vendor claim", source("Base44 Superagent permissions", "https://base44.com/superagents")),
    customerEvidence: finding("A February 16 customer interview reports Lunair's $100K revenue in two months and $8K MRR, with founder-led LinkedIn marketing and partnerships. These are vendor-published customer figures, not independently audited or proof of unattended operation.", "Customer account · vendor published", source("Base44 / Lunair customer interview", "https://base44.com/blog/builder-spotlight-how-guy-manzur-built-an-ai-video-platform-and-hit-50k-in-30-days")),
    limitation: "Lunair's cumulative revenue and MRR are different measures. Its page retains an older $50K/30-day teaser. Base44's acquisition remains separate from customer-business outcomes and Superagent autonomy.",
  },
  boardy: {
    checkedAt,
    pricing: finding("April 17 terms describe the core service as free, excluding carrier charges. The current homepage promotes Boardy Pro without a price. The older $100/month Pro figure was not revalidated.", "Unresolved", source("Boardy published terms · 2026-04-17", "https://www.boardy.ai/terms-and-conditions"), source("Boardy Pro current presentation", "https://www.boardy.ai/")),
    capabilities: finding("Advertises matching introductions, calendar coordination, follow-up and meeting participation across Google Meet, Zoom and Teams.", "Vendor claim", source("Boardy product", "https://www.boardy.ai/")),
    humanInvolvement: finding("Users provide context and calendar access; both participants opt in before an introduction. Meetings and commercial decisions still involve people.", "Vendor claim", source("Boardy matching and consent workflow", "https://www.boardy.ai/")),
    customerEvidence: finding("The homepage displayed over 201,650 introductions and over $82B of capital introduced, plus named user testimonials. Introduced capital is not invested capital, sales or revenue; testimonials are selected by the vendor.", "Vendor claim", source("Boardy activity and testimonials", "https://www.boardy.ai/")),
    limitation: "Activity counters change continuously. Pro price, deal conversion and sustained customer value remain unverified; no new revenue metric is inferred.",
  },
  caffeine: {
    checkedAt,
    pricing: finding("Displayed plans: Free with 15 welcome credits and remix-only creation; Host $5/month; Studio $10 first month then $25/month; Business $100/month for two seats. The page also offers annual discounts. Confirm checkout billing and free hosting limits: the feature table and cards differ.", "Published terms", source("Caffeine pricing and comparison", "https://caffeine.ai/pricing")),
    capabilities: finding("The current site focuses on building internal tools, asking questions across apps, changing workflows conversationally and exporting software to a chosen hosting environment.", "Vendor claim", source("Caffeine current product and hosting", "https://caffeine.ai/")),
    humanInvolvement: finding("Users describe the software, ask questions and direct changes. No measured customer-business approval or intervention rate is published on the reviewed pages.", "Vendor claim", source("Caffeine conversational workflow", "https://caffeine.ai/")),
    customerEvidence: finding("The homepage claims thousands of internal tools and uses unnamed role-based testimonials. Its speed figures cite general low-code research rather than a Caffeine customer experiment.", "Vendor claim", source("Caffeine outcomes and footnotes", "https://caffeine.ai/")),
    limitation: "The current hosting proposition extends beyond the historical ICP-only description. Export portability and customer economics were not tested; anonymous testimonials do not establish business autonomy.",
  },
  wordware: {
    checkedAt,
    pricing: finding("Sauna lists Free with 100 daily credits, or 200 with a verified card. Monthly plans: Lite $29/1,200 credits, Basic $99/4,000, Pro $299/12,000 and Team $999/40,000. No annual billing; paid plans have no trial.", "Published terms", source("Sauna pricing FAQ", "https://www.sauna.ai/pricing")),
    capabilities: finding("Wordware's Sauna advertises persistent context, scheduled cloud work, connected apps and software creation, reachable through web, iOS, messaging, Slack and email.", "Vendor claim", source("Sauna product · by Wordware", "https://www.sauna.ai/")),
    humanInvolvement: finding("Users connect tools, supply context and configure autonomy from suggested actions to independent execution. Sharing and permissions remain user controlled.", "Published terms", source("Sauna autonomy and permission FAQ", "https://www.sauna.ai/pricing")),
    customerEvidence: finding("The reviewed product page includes a walkthrough and interface examples, but no named customer financial result or measured intervention rate.", "Unresolved", source("Sauna product demonstration", "https://www.sauna.ai/")),
    limitation: "Sauna feature claims and configurable autonomy were not exercised in a live account. Historical Wordware fundraising or team size does not measure today's Sauna customers or operating labor.",
  },
  feltsense: {
    checkedAt,
    pricing: finding("No price or self-serve subscription for the founder fleet appears on the reviewed official homepage. Commercial access and ownership terms require confirmation.", "Unresolved", source("Feltsense company and founder fleet", "https://feltsense.com/")),
    capabilities: finding("Advertises agents that identify demand, build products with Stripe, run acquisition and iterate; names Gutcheck as a beta product.", "Vendor claim", source("Feltsense spinout workflow", "https://feltsense.com/")),
    humanInvolvement: finding("The published workflow explicitly assigns Stripe verification and entity registration to a human. The company also says account setup and regulatory gaps need people.", "Vendor claim", source("Feltsense human task boundary", "https://feltsense.com/")),
    customerEvidence: finding("Gutcheck is a named product linked from the fleet page and now redirects to gutcheck.co, offering product-diligence reports. Its existence does not establish fleet revenue, profit or an autonomous customer business.", "Vendor claim", source("Feltsense beta cohort", "https://feltsense.com/"), source("Gutcheck product", "https://www.gutcheck.co/")),
    limitation: "No independently verified fleet survival, paying-customer or return figures established. Historical claims about thousands of agencies are not promoted to observed business outcomes.",
  },
  lindy: {
    checkedAt,
    pricing: finding("Current teammate plans: Plus $29.99/user/month with 3,000 credits; Pro $99.99/15,000; Max $199.99/35,000. Slack joiners get seven trial days; the FAQ says direct signups are billed immediately. Credits pool across seats and do not roll over.", "Published terms", source("Lindy current pricing and billing FAQ", "https://www.lindy.ai/pricing")),
    capabilities: finding("The current offering includes Slack tasks, scheduled routines, inbox and meeting work, computer use and MCP-connected tools.", "Vendor claim", source("Lindy included capabilities", "https://www.lindy.ai/pricing")),
    humanInvolvement: finding("The current FAQ says actions with outside impact wait for approval, including sending email and updating tickets; approved read-only lookups do not. Do not assume earlier workflow behavior applies to every current product.", "Published terms", source("Lindy action-approval FAQ", "https://www.lindy.ai/pricing")),
    customerEvidence: finding("Lindy's Truemed story reports 36% of support volume automated and ticket costs falling from $1 to $0.33, with a human support lead building the tools. Vendor-published customer results are not independent audit evidence.", "Customer account · vendor published", source("Truemed customer account", "https://www.lindy.ai/case-study/truemed")),
    limitation: "The case study and current teammate approval policy may describe different product configurations or periods. Neither establishes an entirely unattended company or measured operator hours.",
  },
};

export function getCompanyResearch(slug: string): CompanyResearch | undefined {
  return featuredCompanyResearch[slug];
}

const notes: Record<string, ProfileNotes> = {
  atoms: {
    relevance: "A close match for the one-person business thesis: one founder coordinates specialist agents from research and product development through deployment and customer acquisition.",
    humanRole: "The founder sets direction, approves plans and compares alternative builds. Published app-building reviews do not establish the ongoing hours needed to operate a paying business.",
    nextEvidence: "Measure a real launch: founder time, approval and repair events, tool spending, paying customers and net revenue. Separate a successfully deployed app from a sustainably operating business.",
  },
  polsia: {
    relevance: "A direct test of end-to-end company operations, with reported activity across product, distribution, support and infrastructure.",
    humanRole: "The founder reports substantial automation and still participates in consequential decisions, including final investor calls. A one-person headcount does not measure customer intervention or outside labor.",
    nextEvidence: "Reconcile recurring subscriptions with non-recurring revenue, verify working customer businesses, and measure retained revenue after model costs and founder interventions. Existing disputed claims remain unresolved in this profile.",
  },
  nanocorp: {
    relevance: "Explicitly promises a company from a prompt, with a CEO agent coordinating product delivery and customer acquisition.",
    humanRole: "The proposed model is an owner directing a CEO agent. The recorded material does not establish how often owners must fix, approve or redirect execution.",
    nextEvidence: "Distinguish the platform's subscription revenue from money earned by its generated companies. Resolve the disputed figures before treating them as proof of autonomous business success.",
  },
  cofounder: {
    relevance: "Coordinates agents across several business functions and allows founders to take ownership of the underlying projects.",
    humanRole: "The recorded product description includes explicit approval gates: nothing ships without the founder's approval. That makes approval frequency and founder time central to evaluation.",
    nextEvidence: "Document a complete customer journey from an approved plan to deployment, acquisition and support. Record overage costs and whether the exported project remains usable independently.",
  },
  base44: {
    relevance: "An example of a small, founder-owned team building a valuable software business, and a tool a solo founder can use to deliver an app.",
    humanRole: "The exit-era record identifies one founder and eight employees. Solo ownership is distinct from a business operated by one person; later Wix-era results describe a different operating context.",
    nextEvidence: "Keep exit-era revenue and headcount paired. Separately establish customer-business operating hours and autonomy; the acquisition supports the exit claim, not full operational autonomy.",
  },
  boardy: {
    relevance: "A focused agent service covering networking and introductions, with potential value for a founder's distribution and fundraising workflow.",
    humanRole: "People participate in conversations and double-opt-in introductions. The recorded introduction totals do not establish the value of completed deals or ongoing operator effort.",
    nextEvidence: "Measure accepted introductions, qualified outcomes and time saved. Separate introduced capital from money actually invested or earned.",
  },
  caffeine: {
    relevance: "Automates app creation and deployment, a useful part of getting a one-person business into production.",
    humanRole: "A person describes the app and directs iteration. The recorded evidence does not establish autonomous acquisition, support, financial operations or a profitable customer business.",
    nextEvidence: "Test a deployed app against real customer needs, ongoing maintenance and hosting costs. Distinguish parent DFINITY funding from financing raised specifically for Caffeine.",
  },
  wordware: {
    relevance: "Sauna's connected assistant could take recurring work off a founder's plate across email, project tools and business systems.",
    humanRole: "Users connect accounts and provide business context. Ongoing approval frequency, exception handling and the scope of delegated permissions are not quantified in the record.",
    nextEvidence: "Verify which tasks Sauna completes independently and log failures and interventions. Treat the older Wordware funding and team figures as historical company context, not current Sauna usage or staffing.",
  },
  feltsense: {
    relevance: "Pursues agent-created businesses with an ownership model, making it a useful comparison with subscription tools sold to solo founders.",
    humanRole: "The company claims founder agents identify demand, build products and acquire customers. The record does not quantify human review or operational labor behind the portfolio.",
    nextEvidence: "Track surviving businesses, external paying customers and net returns. Agency or launch counts alone do not establish durable demand or autonomous profitability.",
  },
  lindy: {
    relevance: "Offers agents for repeatable business functions and browser work that a solo founder could combine into an operating workflow.",
    humanRole: "People configure agents and integrations. The record does not quantify the repair, review and exception handling required in a particular deployed workflow.",
    nextEvidence: "Test a bounded workflow over repeated runs and record completed outcomes, interventions and cost per outcome. Platform user counts are not counts of autonomously operated businesses.",
  },
};

export function getProfileNotes(company: Company): ProfileNotes {
  return notes[company.slug] ?? {
    relevance: company.autopilot?.story ?? "Tracked as part of the wider AI business and automation landscape. Inclusion alone does not establish that the company operates autonomously.",
    humanRole: "Ongoing human hours, approval frequency and intervention rates have not been measured in this record. Reported team size describes the company, not the labor required to operate a customer business.",
    nextEvidence: "Establish a repeatable production workflow, identify the tasks people still perform, and measure cost, reliability and customer outcomes before drawing conclusions about business autonomy.",
  };
}

export function getCompanySources(company: Company): Source[] {
  const sources: Source[] = [];
  const research = getCompanyResearch(company.slug);
  if (research) {
    for (const field of [research.pricing, research.capabilities, research.humanInvolvement, research.customerEvidence]) {
      sources.push(...field.sources);
    }
  }
  if (company.url) sources.push({ name: "Company website · first-party claims", url: company.url });
  for (const source of Object.values(company.metrics.sources ?? {})) {
    if (source) sources.push(source);
  }
  for (const item of company.news) {
    if (item.url) sources.push({ name: `${item.date} · ${item.headline}`, url: item.url });
  }
  return sources.filter((source, index) => sources.findIndex((other) => other.url === source.url) === index);
}
