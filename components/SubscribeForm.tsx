"use client";

import { useEffect, useState } from "react";
import { trackFunnelEvent } from "@/lib/analytics";
import type { SignupPlacement } from "@/lib/signup-attribution";
import { LEAD_ROLES, ROLE_LABELS } from "@/lib/lead-score";
import { readLeadSignals } from "@/lib/lead-signals";
import EnrichmentNotice from "@/components/lead/EnrichmentNotice";

// A header button that scrolls to this form dispatches
// `ap:subscribe-via` with { target: <this form's placement>, placement: "header" }
// so a signup that follows is attributed to the button, not the box.
export const SUBSCRIBE_VIA_EVENT = "ap:subscribe-via";

type Props = {
  label?: string;
  /** Which box this is, sent to /api/subscribe for Brevo attribution. */
  placement?: SignupPlacement;
  /** "light" for white pages such as the homepage registry. */
  tone?: "dark" | "light";
  /** Drops the top margin, for inline rows. */
  compact?: boolean;
};

export default function SubscribeForm({ label = "🛩 Put your inbox on autopilot →", placement, tone = "dark", compact = false }: Props) {
  const [via, setVia] = useState<SignupPlacement | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  // Landing back from the double opt-in confirmation link (?confirmed=1).
  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get("confirmed") === "1") {
        setState("done");
        setMessage("Subscription confirmed — you're on the list.");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!placement) return;
    const onVia = (e: Event) => {
      const d = (e as CustomEvent<{ target?: string; placement?: SignupPlacement }>).detail;
      if (d?.target === placement && d.placement) setVia(d.placement);
    };
    window.addEventListener(SUBSCRIBE_VIA_EVENT, onVia);
    return () => window.removeEventListener(SUBSCRIBE_VIA_EVENT, onVia);
  }, [placement]);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    const sentPlacement = via ?? placement;
    // Best-effort attribution: ?ref= on the current URL wins, else whatever
    // RefCapture stashed on the landing page. Never blocks the signup.
    let ref = "";
    let page = "";
    const utm: Record<string, string> = {};
    try {
      const qs = new URLSearchParams(window.location.search);
      ref = qs.get("ref") ?? sessionStorage.getItem("ap_ref") ?? "";
      page = window.location.pathname;
      for (const k of ["utm_source", "utm_campaign", "utm_content"]) {
        const v = qs.get(k);
        if (v) utm[k] = v.slice(0, 100);
      }
    } catch {}
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, name, role, ...(company.trim() ? { company } : {}), interest: "newsletter", ...(readLeadSignals() ? { signals: readLeadSignals() } : {}), website_url: "", ref, page, ...(sentPlacement ? { placement: sentPlacement } : {}), ...utm }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; error?: string; subscriptionStatus?: string };
      if (res.ok && data.ok) {
        trackFunnelEvent("signup_request_accepted", data.subscriptionStatus);
        setState("done");
        setMessage(data.message ?? "You're on the list.");
      } else {
        setState("error");
        setMessage(data.error ?? "Something went wrong — try again.");
      }
    } catch {
      setState("error");
      setMessage("Something went wrong — try again.");
    }
  }

  const light = tone === "light";
  const top = compact ? "" : "mt-5 ";

  const fieldCls = light
    ? "min-w-0 flex-1 basis-40 rounded border border-[#c9d6cf] bg-white px-3 py-2 text-sm text-[#24322e] placeholder:text-[#93a29a] focus:border-[#1d6653] focus:outline-none"
    : "min-w-0 flex-1 basis-40 rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none";

  if (state === "done") {
    return (
      <p
        role="status"
        className={light
          ? `${top}inline-block rounded border border-[#b9d3c6] bg-[#eef6f1] px-4 py-2 text-sm font-medium text-[#1d6653]`
          : `${top}inline-block rounded-full border border-lime-400/40 bg-lime-400/10 px-5 py-2.5 text-sm font-semibold text-lime-400`}
      >
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={subscribe} data-placement={placement} className={`${top}flex max-w-md flex-wrap items-center gap-2`}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Work email"
        autoComplete="email"
        aria-label="Email address"
        className={light
          ? "min-w-0 flex-1 basis-40 rounded border border-[#c9d6cf] bg-white px-3 py-2 text-sm text-[#24322e] placeholder:text-[#93a29a] focus:border-[#1d6653] focus:outline-none"
          : "min-w-0 flex-1 basis-40 rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none"}
      />
      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" autoComplete="name" aria-label="Name" maxLength={100} className={fieldCls} />
      <select required value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role" className={fieldCls}>
        <option value="" disabled>Role</option>
        {LEAD_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
      </select>
      <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company (optional)" autoComplete="organization" aria-label="Company (optional)" maxLength={120} className={fieldCls} />
      <button
        type="submit"
        disabled={state === "sending"}
        className={light
          ? "rounded bg-[#1d6653] px-4 py-2 text-sm font-medium text-white hover:bg-[#17523f] disabled:opacity-60"
          : "rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-60"}
      >
        {state === "sending" ? "Subscribing…" : label}
      </button>
      <EnrichmentNotice tone={light ? "light" : "dark"} />
      {state === "error" && <p role="alert" className={`w-full text-xs ${light ? "text-[#a3471f]" : "text-amber-400"}`}>{message}</p>}
    </form>
  );
}
