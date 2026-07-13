"use client";

import { useEffect, useMemo, useState } from "react";
import CompanyCard from "@/components/CompanyCard";
import { criteria, type Company } from "@/lib/data";

const STEPS = ["Basics", "Autonomy", "Evidence", "Review"] as const;

const CATEGORIES = [
  { key: "autopilot-native", label: "Autopilot-native", hint: "the business runs on agents" },
  { key: "autopilot-enabler", label: "Autopilot-enabler", hint: "infrastructure for agent-run business" },
  { key: "field-experiment", label: "Field experiment", hint: "an agent did real-world legwork" },
] as const;

type State = {
  name: string;
  url: string;
  tagline: string;
  category: (typeof CATEGORIES)[number]["key"];
  autonomy: string;
  criteriaClaimed: number[];
  arr: string;
  humans: string;
  funding: string;
  evidence: string[];
  contact: string;
};

const initial: State = {
  name: "",
  url: "",
  tagline: "",
  category: "autopilot-native",
  autonomy: "",
  criteriaClaimed: [],
  arr: "",
  humans: "",
  funding: "",
  evidence: [""],
  contact: "",
};

export default function SubmitForm() {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<State>(initial);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; issueUrl?: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/submit")
      .then((r) => r.json())
      .then((d) => setToken(d.token))
      .catch(() => {});
  }, []);

  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));

  // Live preview: shape the form state into a Company for the real card.
  const preview: Company = useMemo(
    () => ({
      name: s.name || "Your company",
      slug: "preview",
      url: s.url || null,
      tagline: s.tagline || "One line that sells the autonomy.",
      categoryClaim: null,
      description: s.autonomy || "What do the agents actually run end-to-end? Sales, code, support, payments…",
      techStack: [],
      funding: { totalRaised: s.funding || null, lastRound: null, date: null, valuation: null, investors: [] },
      founders: [],
      metrics: {
        arr: s.arr || null,
        arrUsd: null,
        humans: s.humans ? Number(s.humans) || null : null,
      },
      referralProgram: { exists: null, notes: null },
      pricing: null,
      news: [],
      verified: false,
    }),
    [s],
  );

  const canNext =
    step === 0
      ? s.name.length >= 2 && /^https:\/\/./.test(s.url)
      : step === 1
        ? s.autonomy.length >= 20
        : step === 2
          ? s.evidence.some((e) => /^https:\/\/./.test(e))
          : true;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          name: s.name,
          url: s.url,
          tagline: s.tagline,
          category: s.category,
          autonomy: s.autonomy,
          criteriaClaimed: s.criteriaClaimed,
          arr: s.arr,
          humans: s.humans,
          funding: s.funding,
          evidence: s.evidence.filter(Boolean),
          contact: s.contact,
          website_url: "", // honeypot (real users never see it filled)
        }),
      });
      const data = await res.json();
      if (data.ok) setResult({ ok: true, message: data.message, issueUrl: data.issueUrl });
      else setError(data.error + (data.issues ? ` — ${data.issues.join("; ")}` : ""));
    } catch {
      setError("network error — try again");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-lime-400/50 focus:outline-none";
  const label = "mb-1.5 block font-mono text-xs uppercase tracking-wider text-zinc-500";

  if (result?.ok) {
    return (
      <div className="rounded-2xl border border-lime-400/30 bg-lime-400/5 p-8 text-center">
        <p className="text-2xl">🛰️</p>
        <h2 className="mt-2 text-xl font-bold text-zinc-100">Submission received</h2>
        <p className="mt-2 text-sm text-zinc-400">
          {result.message} It will be researched against independent sources and, if it passes{" "}
          <a href="/#criteria" className="text-lime-400 underline">
            the Autopilot Criteria
          </a>
          , it joins the tracker.
        </p>
        {result.issueUrl && (
          <a
            href={result.issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full border border-lime-400/40 px-5 py-2 text-sm text-lime-400 hover:bg-lime-400/10"
          >
            Track your submission on GitHub ↗
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,420px)]">
      <div>
        {/* Stepper */}
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((name, i) => (
            <button
              key={name}
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                i === step
                  ? "border-lime-400 bg-lime-400/15 text-lime-300"
                  : i < step
                    ? "border-zinc-700 text-zinc-300"
                    : "border-zinc-800 text-zinc-600"
              }`}
            >
              <span className="font-mono">{i + 1}</span> {name}
            </button>
          ))}
        </div>

        <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          {step === 0 && (
            <>
              <div>
                <label className={label}>Company name *</label>
                <input className={input} value={s.name} onChange={(e) => set("name", e.target.value)} maxLength={80} placeholder="Acme Autonomy" />
              </div>
              <div>
                <label className={label}>Website (https://) *</label>
                <input className={input} value={s.url} onChange={(e) => set("url", e.target.value)} maxLength={300} placeholder="https://…" />
              </div>
              <div>
                <label className={label}>Tagline</label>
                <input className={input} value={s.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={120} placeholder="AI that runs the whole shop." />
              </div>
              <div>
                <label className={label}>Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => set("category", c.key)}
                      className={`rounded-xl border px-3 py-2 text-left text-sm ${
                        s.category === c.key ? "border-lime-400 bg-lime-400/10 text-lime-300" : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      <span className="font-medium">{c.label}</span>
                      <span className="block text-xs text-zinc-500">{c.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className={label}>What do the agents run end-to-end? * (min 20 chars)</label>
                <textarea
                  className={`${input} min-h-28`}
                  value={s.autonomy}
                  onChange={(e) => set("autonomy", e.target.value)}
                  maxLength={600}
                  placeholder="Agents run outbound sales, ship code to production, answer support, and reconcile payments. The human reviews a nightly report…"
                />
              </div>
              <div>
                <label className={label}>Which Autopilot Criteria does it claim?</label>
                <div className="space-y-2">
                  {criteria.map((c, i) => (
                    <button
                      key={c.rule}
                      onClick={() =>
                        set(
                          "criteriaClaimed",
                          s.criteriaClaimed.includes(i) ? s.criteriaClaimed.filter((x) => x !== i) : [...s.criteriaClaimed, i],
                        )
                      }
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm ${
                        s.criteriaClaimed.includes(i) ? "border-lime-400/60 bg-lime-400/10" : "border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <span className={`font-mono text-xs ${s.criteriaClaimed.includes(i) ? "text-lime-400" : "text-zinc-600"}`}>
                        {s.criteriaClaimed.includes(i) ? "✓" : i + 1}
                      </span>
                      <span className={s.criteriaClaimed.includes(i) ? "text-zinc-200" : "text-zinc-400"}>{c.rule}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={label}>ARR</label>
                  <input className={input} value={s.arr} onChange={(e) => set("arr", e.target.value)} maxLength={40} placeholder="$1M" />
                </div>
                <div>
                  <label className={label}>Humans</label>
                  <input className={input} value={s.humans} onChange={(e) => set("humans", e.target.value)} maxLength={10} placeholder="2" />
                </div>
                <div>
                  <label className={label}>Funding</label>
                  <input className={input} value={s.funding} onChange={(e) => set("funding", e.target.value)} maxLength={60} placeholder="$5M seed" />
                </div>
              </div>
              <div>
                <label className={label}>Evidence links * (press, Crunchbase, founder posts — https only)</label>
                {s.evidence.map((e, i) => (
                  <input
                    key={i}
                    className={`${input} mb-2`}
                    value={e}
                    onChange={(ev) => {
                      const next = [...s.evidence];
                      next[i] = ev.target.value;
                      set("evidence", next);
                    }}
                    maxLength={300}
                    placeholder="https://techcrunch.com/…"
                  />
                ))}
                {s.evidence.length < 5 && (
                  <button onClick={() => set("evidence", [...s.evidence, ""])} className="text-xs text-lime-400 hover:underline">
                    + add another link
                  </button>
                )}
              </div>
              <div>
                <label className={label}>Your contact (optional)</label>
                <input className={input} value={s.contact} onChange={(e) => set("contact", e.target.value)} maxLength={120} placeholder="email or @handle" />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3 text-sm text-zinc-400">
              <p>
                Ready to send. Your submission becomes a <span className="text-zinc-200">public GitHub issue</span>{" "}
                labeled <span className="font-mono text-xs">unverified</span>, then gets researched against
                independent sources. Claims are hypotheses, not facts — that's{" "}
                <a href="/#criteria" className="text-lime-400 underline">
                  the rules
                </a>
                .
              </p>
              {error && <p className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-red-300">{error}</p>}
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex justify-between border-t border-zinc-800 pt-4">
            <button
              onClick={() => setStep((x) => Math.max(0, x - 1))}
              disabled={step === 0}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-300 disabled:opacity-30"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => canNext && setStep((x) => x + 1)}
                disabled={!canNext}
                className="rounded-full bg-lime-400 px-6 py-2 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-40"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={busy || !token}
                className="rounded-full bg-lime-400 px-6 py-2 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-40"
              >
                {busy ? "Sending…" : "Submit for review 🛰️"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
          Live preview — how it would look on the tracker
        </p>
        <CompanyCard company={preview} />
      </div>
    </div>
  );
}
