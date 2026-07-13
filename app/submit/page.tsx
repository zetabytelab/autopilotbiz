import type { Metadata } from "next";
import SubmitForm from "@/components/submit/SubmitForm";

export const metadata: Metadata = {
  title: "Submit a company — Business on Autopilot",
  description:
    "Know a company running on autopilot? Submit it for review. Every submission is verified against independent sources and the Autopilot Criteria.",
};

export default function SubmitPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <header className="py-14">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">Submit</p>
        <h1 className="text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
          Add a company to the tracker
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Three short steps, live preview, no account needed. Submissions become public GitHub issues and are
          researched against independent sources before anything gets listed — self-reported claims are labeled
          as such, always.
        </p>
      </header>
      <SubmitForm />
    </main>
  );
}
