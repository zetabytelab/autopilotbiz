"use client";

import { useState } from "react";
import EnrichmentNotice from "./EnrichmentNotice";
import { readLeadSignals } from "@/lib/lead-signals";
import { BUDGET_LABELS, INTEREST_LABELS, LEAD_BUDGETS, LEAD_INTERESTS, LEAD_ROLES, ROLE_LABELS, isSponsorInterest, type LeadInterest } from "@/lib/lead-score";

const input = "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none";
const label = "block text-xs font-medium text-zinc-400";

export default function SponsorInquiryForm() {
  const [interest, setInterest] = useState<LeadInterest | "">("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const body: Record<string, unknown> = {
      email: get("email"), name: get("name"), company: get("company"), role: get("role"), interest: get("interest"), website_url: get("website_url"),
    };
    if (isSponsorInterest(interest || undefined)) body.budget = get("budget");
    if (get("message")) body.message = get("message");
    const signals = readLeadSignals();
    if (signals) body.signals = signals;
    try {
      const res = await fetch("/api/sponsor-inquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json()) as { ok: boolean; message?: string; error?: string };
      setState(res.ok && data.ok ? "done" : "error");
      setMessage((res.ok && data.ok ? data.message : data.error) ?? "Something went wrong — email partners@autopilotindex.com.");
    } catch {
      setState("error");
      setMessage("Something went wrong — email partners@autopilotindex.com.");
    }
  }

  if (state === "done") return <p role="status" className="rounded-xl border border-lime-400/40 bg-lime-400/10 px-4 py-3 text-sm font-semibold text-lime-400">{message}</p>;

  return (
    <form onSubmit={submit} id="sponsor-form" className="grid gap-3 rounded-xl border border-zinc-800 p-4 sm:grid-cols-2">
      <label className="sm:col-span-1"><span className={label}>Work email *</span><input name="email" type="email" required autoComplete="email" className={input} placeholder="you@company.com" /></label>
      <label><span className={label}>Name *</span><input name="name" required maxLength={100} autoComplete="name" className={input} /></label>
      <label><span className={label}>Role *</span>
        <select name="role" required defaultValue="" className={input}><option value="" disabled>Choose…</option>{LEAD_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</select>
      </label>
      <label><span className={label}>Company *</span><input name="company" required maxLength={120} autoComplete="organization" className={input} /></label>
      <label><span className={label}>Interest *</span>
        <select name="interest" required value={interest} onChange={(e) => setInterest(e.target.value as LeadInterest)} className={input}><option value="" disabled>Choose…</option>{LEAD_INTERESTS.map((i) => <option key={i} value={i}>{INTEREST_LABELS[i]}</option>)}</select>
      </label>
      {isSponsorInterest(interest || undefined) && (
        <label><span className={label}>Budget band *</span>
          <select name="budget" required defaultValue="" className={input}><option value="" disabled>Choose…</option>{LEAD_BUDGETS.map((b) => <option key={b} value={b}>{BUDGET_LABELS[b]}</option>)}</select>
        </label>
      )}
      <label className="sm:col-span-2"><span className={label}>Anything else? (optional)</span><textarea name="message" maxLength={1000} rows={3} className={input} placeholder="Product, link, preferred edition or week" /></label>
      <input name="website_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="flex flex-col gap-2 sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className="self-start rounded-full bg-lime-400 px-5 py-2 font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Send inquiry"}
        </button>
        {state === "error" && <p role="alert" className="text-xs text-amber-400">{message}</p>}
        <EnrichmentNotice />
      </div>
    </form>
  );
}
