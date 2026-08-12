"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    // Best-effort attribution: ?ref= on the current URL wins, else whatever
    // RefCapture stashed on the landing page. Never blocks the signup.
    let ref = "";
    let page = "";
    try {
      ref =
        new URLSearchParams(window.location.search).get("ref") ??
        sessionStorage.getItem("ap_ref") ??
        "";
      page = window.location.pathname;
    } catch {}
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, website_url: "", ref, page }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; error?: string };
      if (data.ok) {
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

  if (state === "done") {
    return (
      <p className="mt-5 inline-block rounded-full border border-lime-400/40 bg-lime-400/10 px-5 py-2.5 text-sm font-semibold text-lime-400">
        🛩 {message} Daily signals, zero effort.
      </p>
    );
  }

  return (
    <form onSubmit={subscribe} className="mt-5 flex max-w-md flex-wrap items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@fund.vc"
        aria-label="Email address"
        className="min-w-0 flex-1 rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-60"
      >
        {state === "sending" ? "Boarding…" : "🛩 Put your inbox on autopilot →"}
      </button>
      {state === "error" && <p className="w-full text-xs text-amber-400">{message}</p>}
    </form>
  );
}
