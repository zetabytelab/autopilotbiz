import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — The Autopilot Index",
  description:
    "How The Autopilot Index handles newsletter email, sponsor inquiries, business contact enrichment, aggregate analytics and your privacy choices.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6">
      <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">
        ← The Autopilot Index
      </Link>
      <h1 className="mt-8 text-3xl font-black tracking-tight text-zinc-50">Privacy</h1>

      <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-300">
        <p>
          The Autopilot Index keeps data collection to the minimum needed to run the site and the newsletter.
          This page explains what we collect and how it&apos;s used.
        </p>
        <h2 className="pt-2 text-lg font-bold text-zinc-100">What we collect</h2>
        <p>
          If you subscribe to <Link href="/pulse" className="text-lime-400 hover:underline">Autopilot Pulse</Link>,
          we store the email address you provide (and the name, role and company if you add them), via our email provider (Brevo), on a double opt-in basis. We do
          not sell or rent your email. Brevo processes it to provide the newsletter service.
        </p>
        <h2 id="business-contact-enrichment" className="pt-2 text-lg font-bold text-zinc-100">Business contact enrichment</h2>
        <p>
          When you email us at <a href="mailto:partners@autopilotindex.com" className="text-lime-400 hover:underline">partners@autopilotindex.com</a>,
          submit a sponsor or partnership form, or subscribe to Autopilot Pulse with your email, you give us that contact detail so we can
          reply and run the list.
        </p>
        <p>
          We may use the email address and any company name you provide to look up <strong>publicly available business information</strong>{" "}
          about that company (for example company size band, industry, website, and a company LinkedIn page) from a business-data provider
          such as Clearbit, Apollo, or Hunter. We do this only to decide whether your inquiry fits a founding sponsor slot (currently $500
          for the first three sponsors, then $750), a partnership, or a newsletter nurture path, and to reply with something useful.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>We enrich <strong>only</strong> identifiers you gave us on purpose (form fields, partners@, Brevo signup).</li>
          <li>We do <strong>not</strong> buy or scrape lists of people who only liked, commented on, or viewed our ads or social posts and never contacted us.</li>
          <li>We do <strong>not</strong> try to turn a social handle into a name, email, or phone number.</li>
          <li>We do <strong>not</strong> sell enrichment data. We keep it with your inquiry record and delete or anonymise it when we no longer need it for that purpose, or earlier if you ask.</li>
          <li>
            Lawful basis under UK GDPR: <strong>legitimate interests</strong> in running B2B sponsorship and partnership sales for a free
            media brand, balanced against your interests as someone who contacted us. You can object by emailing partners@autopilotindex.com.
          </li>
          <li>Providers act as processors or independent controllers under their own terms; we will name the live provider here once one is chosen.</li>
        </ul>
        <p>
          To prioritise replies, we also give each inquiry an internal score from what you submit (role, interest, budget band) and a few
          on-site signals kept in your own browser until you submit a form: whether you spent 30 seconds on the sponsor page, opened a Pulse
          edition, viewed three or more company profiles, or visited the Dealroom page. The score stays in our own email provider records. It
          is never shared with advertising platforms. These signals are not recorded if your browser sends Do Not Track or Global Privacy
          Control.
        </p>
        <p className="text-sm text-zinc-500">Controller: Antonio Serrano, trading as Autopilot Index (UK sole trader). Contact: partners@autopilotindex.com.</p>
        <h2 className="pt-2 text-lg font-bold text-zinc-100">Site measurement</h2>
        <p>
          We use Vercel Web Analytics to understand aggregate page visits, company-profile reading,
          experiment-page visits, accepted newsletter requests, 30 seconds spent on the sponsor page, and clicks on marked affiliate links.
          An accepted newsletter request is distinct from a confirmed double opt-in subscription.
          We do not send email addresses, form contents or calculator assumptions as analytics events,
          and we remove query strings and URL fragments from recorded page URLs. We do not build advertising profiles.
        </p>
        <p>
          Measurement is disabled for development and preview sites, automated browser tests, and browsers
          that signal Do Not Track or Global Privacy Control. Add <code className="rounded bg-zinc-800 px-1 text-xs">?analytics=off</code>{" "}
          to a page URL to turn measurement off for that page visit. If your browser blocks the analytics
          service, the site continues to work.
        </p>
        <h2 className="pt-2 text-lg font-bold text-zinc-100">Affiliate links</h2>
        <p>
          Some outbound links to tools are referral links, marked as such and tagged{" "}
          <code className="rounded bg-zinc-800 px-1 text-xs text-lime-400">rel=&quot;sponsored&quot;</code>. If you
          sign up through one, the index may earn a commission at no extra cost to you. We monetize the stack,
          never the subjects of coverage — referral links never buy placement or a kinder write-up.
        </p>
        <h2 className="pt-2 text-lg font-bold text-zinc-100">Your choices</h2>
        <p>
          You can unsubscribe from the newsletter at any time using the link in any email, which removes your
          address from our list. For any privacy request or question, contact{" "}
          <a href="mailto:hello@autopilotindex.com" className="text-lime-400 hover:underline">hello@autopilotindex.com</a>.
        </p>
        <p className="text-sm text-zinc-500">Last updated: October 2026.</p>
      </div>
    </main>
  );
}
