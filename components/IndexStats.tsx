import { companies, stackTools } from "@/lib/data";
import { editions } from "@/lib/editions";
import candidatesData from "@/data/candidates.json";

// Every figure here is derived from the data files at build time, never typed by
// hand — the strip cannot drift from the index it describes.
const newsEntries = companies.reduce((n, c) => n + c.news.length, 0);
const sourceLinks = companies.reduce((n, c) => {
  const s = c.metrics.sources ?? {};
  return n + Object.values(s).filter(Boolean).length;
}, 0);

// A = third-party audited, B = public filing/transaction, C = credible press,
// D = founder claims only. Publishing the weak end is the point of the grading.
const graded = companies.map((c) => c.autopilot?.evidence).filter(Boolean);
const hardEvidence = graded.filter((g) => g === "A" || g === "B").length;
const claimsOnly = graded.filter((g) => g === "D").length;

const stats: { value: string; label: string; note: string }[] = [
  {
    value: String(companies.length),
    label: "companies tracked",
    note: `${hardEvidence} on audited or filed evidence, ${claimsOnly} on founder claims alone`,
  },
  {
    value: String(newsEntries + sourceLinks),
    label: "source-linked entries",
    note: "every number cites where it came from",
  },
  {
    value: String(stackTools.length),
    label: "stack tools mapped",
    note: "the layers agent-run companies build on",
  },
  {
    value: String(candidatesData.candidates.length),
    label: "watchlist candidates",
    note: "claims not yet good enough for the index",
  },
  {
    value: String(editions.length),
    label: "editions published",
    note: "original research, corrections included",
  },
];

export default function IndexStats() {
  const refreshed = new Date(candidatesData.generatedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <section aria-label="Index at a glance" className="border-y border-zinc-800 py-8">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-mono text-3xl font-black tabular-nums text-lime-400 sm:text-4xl">
              {s.value}
            </dd>
            <p className="mt-1 text-sm font-semibold text-zinc-200">{s.label}</p>
            <p className="mt-0.5 text-xs leading-snug text-zinc-500">{s.note}</p>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-xs text-zinc-600">
        Watchlist last regenerated {refreshed}. Evidence grades record source strength, not proof of
        autonomous operation.
      </p>
    </section>
  );
}
