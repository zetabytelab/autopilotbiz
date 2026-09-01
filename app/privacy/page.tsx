import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — The Autopilot Index",
  description:
    "The Autopilot Index privacy policy: what we collect (newsletter email only), how it's used, and your choices.",
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
          we store the email address you provide, via our email provider (Brevo), on a double opt-in basis. We do
          not sell, rent, or share your email with third parties. Standard, privacy-respecting analytics may be
          used to understand aggregate traffic; we do not build advertising profiles.
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
        <p className="text-sm text-zinc-500">Last updated: September 2026.</p>
      </div>
    </main>
  );
}
