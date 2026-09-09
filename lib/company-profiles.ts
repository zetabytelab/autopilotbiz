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
  if (company.url) sources.push({ name: "Company website · first-party claims", url: company.url });
  for (const source of Object.values(company.metrics.sources ?? {})) {
    if (source) sources.push(source);
  }
  for (const item of company.news) {
    if (item.url) sources.push({ name: `${item.date} · ${item.headline}`, url: item.url });
  }
  return sources.filter((source, index) => sources.findIndex((other) => other.url === source.url) === index);
}
