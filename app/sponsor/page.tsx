import type { Metadata } from "next";
import Link from "next/link";
import { AUDIENCE, FOUNDING_SLOTS_LEFT, PRICES, SPONSOR_EMAIL, SPONSOR_MAILTO, slotsLine } from "@/lib/sponsor";

const TITLE = "Sponsor Autopilot Pulse";
const DESCRIPTION = `Put your tool in front of builders, CTOs and founders who follow AI-run companies. ${AUDIENCE.linkedinSubscribers.value} LinkedIn subscribers (${AUDIENCE.linkedinSubscribers.asOf}). Founding rate $${PRICES.founding.edition} per edition, 3 slots.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/sponsor" },
  openGraph: {
    type: "website",
    siteName: "The Autopilot Index",
    url: "https://autopilotindex.com/sponsor",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Autopilot Index — business on autopilot" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og.png"] },
};

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const h2 = "pt-6 text-xl font-bold text-zinc-100";
const code = "rounded bg-zinc-800 px-1 text-xs text-lime-400";

function Mock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="mt-3">
      <figcaption className="mb-1 font-mono text-xs uppercase tracking-wider text-zinc-500">{label}</figcaption>
      {children}
    </figure>
  );
}

export default function Sponsor() {
  const founding = FOUNDING_SLOTS_LEFT > 0;
  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6">
      <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">← The Autopilot Index</Link>
      <h1 className="mt-8 text-3xl font-black tracking-tight text-zinc-50">Sponsor Autopilot Pulse</h1>
      <p className="mt-4 text-lg leading-relaxed text-zinc-300">
        One clearly labelled sponsor in each edition of the weekly newsletter for people building companies that run on AI agents.
      </p>

      <div className="mt-6 rounded-2xl border border-lime-400/30 bg-lime-400/5 p-5">
        <p className="font-mono text-sm text-zinc-300">
          <strong className="text-zinc-50">{usd(PRICES.founding.edition)} per edition</strong> · founding rate ·{" "}
          <span className="text-lime-400" data-testid="slots">{slotsLine()}</span> · then {usd(PRICES.standard.edition)}
        </p>
        <a href={SPONSOR_MAILTO} className="mt-4 inline-block rounded-full bg-lime-400 px-5 py-2 font-semibold text-zinc-950 hover:bg-lime-300">
          Sponsor an edition: {usd(founding ? PRICES.founding.edition : PRICES.standard.edition)}
        </a>
        <p className="mt-2 text-xs text-zinc-500">
          Questions first? <a href={`mailto:${SPONSOR_EMAIL}`} className="text-lime-400 hover:underline">{SPONSOR_EMAIL}</a>
        </p>
      </div>

      <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-300">
        <h2 className={h2}>Who reads it</h2>
        <p>
          <strong className="text-zinc-100">Autopilot Pulse:</strong>{" "}
          <em>&ldquo;Weekly signals from the businesses that run themselves — and the stack they run on. Built for builders and CTOs watching.&rdquo;</em>
        </p>
        <p>
          Builders, CTOs and founders of AI-run companies, and the people deciding what to build next. They read it to see which
          companies really run on agents, what the evidence says, and which tools are behind them.
        </p>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 p-4">
            <dt className="text-3xl font-black text-lime-400">{AUDIENCE.linkedinSubscribers.value}</dt>
            <dd className="text-sm text-zinc-400">subscribers to Autopilot Pulse on LinkedIn, published weekly</dd>
          </div>
          <div className="rounded-xl border border-zinc-800 p-4">
            <dt className="text-3xl font-black text-lime-400">{AUDIENCE.founderShare.value}</dt>
            <dd className="text-sm text-zinc-400">of the newsletter&apos;s LinkedIn audience are founders, CEOs or co-founders</dd>
          </div>
        </dl>
        <p className="text-xs text-zinc-500">
          Subscribers: LinkedIn newsletter count, {AUDIENCE.linkedinSubscribers.asOf}. Audience mix: LinkedIn audience insights, {AUDIENCE.founderShare.asOf}.
        </p>
        <p className="text-sm text-zinc-400">
          Every edition is also published on autopilotindex.com, a free public index of AI-run companies that&apos;s indexed by Google and growing.
        </p>

        <h2 className={h2}>How it looks</h2>
        <Mock label="At the top of the edition">
          <p className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300">
            <span className="text-zinc-500">Sponsored by</span> <span className="rounded bg-zinc-800 px-1 text-xs">logo</span>{" "}
            <strong className="text-zinc-100">Your brand:</strong> your pitch, about 40 characters →
          </p>
        </Mock>
        <Mock label="Featured sponsor block, inside the edition">
          <div className="rounded-xl border border-zinc-700 p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Sponsored</p>
            <div className="mt-2 flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-zinc-800 text-xs text-zinc-400">logo</span>
              <div className="text-sm">
                <p className="font-semibold text-zinc-100">Your brand</p>
                <p className="text-zinc-400">Your pitch, about 40 characters</p>
                <p className="text-lime-400">Visit →</p>
              </div>
            </div>
          </div>
        </Mock>
        <Mock label="Bonus: on the homepage during that edition's week">
          <p className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Sponsored │</span>{" "}
            <span className="rounded bg-zinc-800 px-1 text-xs">logo</span> <strong className="text-zinc-100">Your brand:</strong> your pitch, about 40
            characters <span className="text-lime-400">Visit ↗</span>
          </p>
        </Mock>

        <h2 className={h2}>What you get for {usd(PRICES.founding.edition)}</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-zinc-100">One Autopilot Pulse edition</strong>, sent to the LinkedIn newsletter&apos;s subscribers, with the email version going out through Brevo.</li>
          <li><strong className="text-zinc-100">A Sponsored by line</strong> near the top of the edition, with your name and link.</li>
          <li><strong className="text-zinc-100">A short featured sponsor block</strong> inside the edition: your name, logo, a pitch of about 40 characters, and one link.</li>
          <li><strong className="text-zinc-100">The same placement on the edition&apos;s web copy</strong> at autopilotindex.com/pulse, where it stays as part of the archive.</li>
          <li><strong className="text-zinc-100">Bonus:</strong> a labelled mention on the autopilotindex.com homepage for the week that edition is out.</li>
          <li>
            <strong className="text-zinc-100">Trackable links.</strong> Every link carries{" "}
            <code className={code}>utm_source=autopilotindex&amp;utm_medium=newsletter</code>, so the clicks show up in your own analytics. If you
            send a link that already has your own UTM tags, we use it as given.
          </li>
          <li><strong className="text-zinc-100">A short report after the edition:</strong> the article views and clicks, exactly as LinkedIn and our analytics report them.</li>
          <li><strong className="text-zinc-100">One sponsor per edition.</strong> You never share the slot.</li>
        </ul>

        <h2 className={h2}>Pricing</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-400">
              <tr className="border-b border-zinc-800">
                <th className="py-2 pr-3 font-medium"></th>
                <th className="py-2 pr-3 font-medium">Founding rate (first 3 sponsors)</th>
                <th className="py-2 font-medium">After that</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-900">
                <td className="py-2 pr-3">One edition</td>
                <td className="py-2 pr-3 font-bold text-zinc-50">{usd(PRICES.founding.edition)}</td>
                <td className="py-2 font-bold text-zinc-50">{usd(PRICES.standard.edition)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">3 editions <em className="text-zinc-500">(suggested)</em></td>
                <td className="py-2 pr-3"><strong className="text-zinc-50">{usd(PRICES.founding.bundle3)}</strong> ({usd(PRICES.founding.bundle3Each)} each, {PRICES.bundleDiscountPct}% off)</td>
                <td className="py-2"><strong className="text-zinc-50">{usd(PRICES.standard.bundle3)}</strong> ({usd(PRICES.standard.bundle3Each)} each, {PRICES.bundleDiscountPct}% off)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="font-mono text-sm text-zinc-300">
          {usd(PRICES.founding.edition)} per edition · founding rate · {slotsLine()} · then {usd(PRICES.standard.edition)}
        </p>
        <a href={SPONSOR_MAILTO} className="inline-block rounded-full bg-lime-400 px-5 py-2 font-semibold text-zinc-950 hover:bg-lime-300">
          Sponsor an edition: {usd(founding ? PRICES.founding.edition : PRICES.standard.edition)}
        </a>
        <p className="text-xs text-zinc-500">
          Questions first? <a href={`mailto:${SPONSOR_EMAIL}`} className="text-lime-400 hover:underline">{SPONSOR_EMAIL}</a>
        </p>

        <h2 className={h2}>How it works</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong className="text-zinc-100">Email <a href={SPONSOR_MAILTO} className="text-lime-400 hover:underline">{SPONSOR_EMAIL}</a></strong> with your
            product, the link, a pitch of about 40 characters, your logo (square, PNG or SVG), and the edition or week you&apos;d like.
          </li>
          <li><strong className="text-zinc-100">I check that it fits</strong> (see below) and reply with the edition and date, plus an invoice.</li>
          <li>
            <strong className="text-zinc-100">Once it&apos;s paid, your placement runs</strong> in the confirmed edition, and the homepage mention runs that
            week. If the date moves, you choose the next edition or get a full refund.
          </li>
        </ol>

        <h2 className={h2}>What we accept, and how it&apos;s labelled</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong className="text-zinc-100">The fit.</strong> Sponsors are tools and services for people building or running AI-operated businesses. Every sponsor is approved by hand, and we can decline any sponsor.</li>
          <li><strong className="text-zinc-100">Always labelled.</strong> Every placement is marked <strong>Sponsored</strong>, and the links carry <code className={code}>rel=&quot;sponsored&quot;</code>.</li>
          <li><strong className="text-zinc-100">No influence on coverage.</strong> Sponsorship doesn&apos;t buy coverage and can&apos;t block it. It never affects a company&apos;s autonomy level, evidence grade, ranking or inclusion in the index. Sponsors don&apos;t see or approve editorial content.</li>
          <li><strong className="text-zinc-100">Listed companies are flagged.</strong> If a sponsor is also a company in the index, both its profile and the placement say so.</li>
          <li><strong className="text-zinc-100">Accuracy.</strong> The pitch must be accurate. We won&apos;t run claims we can&apos;t check, and we may ask you to change the wording.</li>
        </ul>

        <p className="border-t border-zinc-900 pt-6 text-sm text-zinc-500">
          Antonio Serrano, trading as Autopilot Index · <a href={`mailto:${SPONSOR_EMAIL}`} className="text-lime-400 hover:underline">{SPONSOR_EMAIL}</a> ·{" "}
          <Link href="/pricing" className="text-lime-400 hover:underline">How the site is funded</Link>
        </p>
      </div>
    </main>
  );
}
