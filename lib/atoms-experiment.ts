import ledger from "@/public/experiments/atoms/ledger.json";

type AcceptanceResult = {
  checkId: string;
  status: "pass" | "fail" | "not_run" | "unavailable";
  observedAt: string | null;
  observed: string;
  artifactVersion: string | null;
  evidenceIds: string[];
};

export const atomsExperiment = ledger as Omit<typeof ledger, "acceptanceResults"> & { acceptanceResults: AcceptanceResult[] };

export const experimentStatusLabel = ledger.status === "paused"
  ? ledger.buildStartedAt ? "Execution paused" : "Awaiting Atoms sign-in · build not started"
  : ({ prepared: "Protocol prepared · build not started", building: "Build in progress", verifying: "Verifying the product", observing: "Observation start recorded", complete: "Completion recorded · review evidence" } as Record<string, string>)[ledger.status] ?? "Status under review";

const hasBuild = ledger.buildStartedAt !== null;
const built = ledger.buildCompletedAt !== null;
const observing = ledger.observationStartedAt !== null;
const observed = ledger.observationEndedAt !== null;

export const experimentMetrics = [
  { label: "Cash spent", value: ledger.metrics.cashSpendUsd, unit: "USD", source: "Receipts and billing history" },
  { label: "Human time", value: ledger.metrics.humanMinutes, unit: "minutes", source: "Timed work log, including review" },
  { label: "Human interventions", value: ledger.metrics.humanInterventions, unit: "interventions", source: "Approvals, corrections and manual fixes" },
  { label: "Credits used", value: ledger.metrics.creditsConsumed, unit: "credits", source: "Account balance and usage history" },
  { label: "Paying customers", value: ledger.metrics.payingCustomers, unit: "customers", source: "Completed payments, excluding test orders" },
  { label: "Gross revenue", value: ledger.metrics.grossRevenueUsd, unit: "USD", source: "Payment records before refunds and fees" },
];

export const experimentPhases = [
  {
    title: "Prepare the test",
    status: "Prepared",
    detail: "Freeze the build prompt, numerical fixtures, time limit and evidence rules before generating the product.",
  },
  {
    title: "Build with Atoms",
    status: built ? "Build recorded" : hasBuild ? ledger.status === "paused" ? "Paused" : "In progress" : ledger.status === "paused" ? "Awaiting sign-in" : "Not started",
    detail: "Use an authenticated account and available free credits. Record the agent transcript, time, credit usage and every human intervention.",
  },
  {
    title: "Verify and publish the product",
    status: observing ? "Observation start recorded" : built ? "Awaiting verification" : "Not started",
    detail: "Check calculations, mobile use, export and privacy. Record the actual product URL and any manual fixes before reporting a launch.",
  },
  {
    title: "Observe real use for seven days",
    status: observed ? "Observation end recorded" : observing ? "Observation start recorded" : "Not started",
    detail: "Measure visits, completed calculations and support effort. Revenue stays unmeasured until a real payment offer and payment records exist.",
  },
];

export const acceptanceChecks = [
  { id: "A1", name: "Known financial inputs", expected: "$20 price, $4 variable cost, 3% payment fee, $30 fixed costs and 10 customers produce $15.40 contribution per customer, 2 break-even customers and $124 monthly operating surplus." },
  { id: "A2", name: "Human workload", expected: "10 customers at 15 minutes each plus 2 fixed hours per month produce 4.5 human hours. At $25/hour, the economic surplus is $11.50." },
  { id: "A3", name: "Zero or negative contribution", expected: "A $4 price, $4 variable cost and 0% fee display ‘No break-even at these assumptions’; no Infinity, NaN or misleading positive result." },
  { id: "A4", name: "Input boundaries", expected: "Zero customers works; negative, blank and non-finite inputs are explained; fee percentages above 100 are rejected; customer counts require whole numbers." },
  { id: "A5", name: "Usable on phone and keyboard", expected: "At 375px width there is no horizontal overflow. Every input has a visible label, keyboard focus and an understandable error message." },
  { id: "A6", name: "Export and privacy", expected: "Exported JSON reproduces entered assumptions and calculated results. No entered scenario is sent to a server or third party; reset clears any locally saved scenario." },
  { id: "A7", name: "Working published product", expected: "A separate browser session opens the actual product URL and reproduces A1–A6. Capture the URL, time, screenshots and any console errors." },
  { id: "A8", name: "Ownership and provenance", expected: "Record whether code export is available on the account. If available, save the export and verify local execution. Attribute all code changes to Atoms or the external human/AI that made them." },
];

export const experimentSources = [
  { title: "Atoms product overview", url: "https://atoms.dev/", note: "Company describes agents for product creation, deployment and growth; these remain claims to test." },
  { title: "Atoms pricing", url: "https://atoms.dev/pricing", note: "A free plan is advertised. Actual credits and feature access must be checked in the test account; no paid plan is assumed." },
  { title: "Atoms’ solo-founder vision", url: "https://atoms.dev/blog/atoms-raises-31m-series-a-and-a-plus", note: "The company describes an ambition to cover research, building, deployment and iteration. The experiment separates those stages." },
];
