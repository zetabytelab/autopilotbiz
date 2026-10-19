"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SubscribeForm from "@/components/SubscribeForm";
import { SIGNUP_PLACEMENTS, type SignupPlacement } from "@/lib/signup-attribution";

declare global {
  interface Window { mountAutopilotRegistry?: () => (() => void); }
}

export default function Registry() {
  const root = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  // Signup boxes the vanilla registry renders (lib/registry-source/subscribe.js)
  // as empty [data-subscribe-mount] slots; the shared React form is portalled in.
  const [slots, setSlots] = useState<{ node: HTMLElement; placement: SignupPlacement }[]>([]);
  useEffect(() => {
    let active = true;
    let dispose: (() => void) | undefined;
    const styles = document.createElement("link");
    styles.rel = "stylesheet";
    styles.href = "/registry/registry.css";
    document.head.append(styles);
    const script = document.createElement("script");
    script.src = "/registry/runtime.js";
    script.onload = () => {
      if (!active || !root.current) return;
      try {
        dispose = window.mountAutopilotRegistry?.();
        setStatus(dispose ? "ready" : "error");
        const found = [...root.current.querySelectorAll<HTMLElement>("[data-subscribe-mount]")].flatMap((node) => {
          const p = node.dataset.subscribeMount as SignupPlacement;
          return SIGNUP_PLACEMENTS.includes(p) ? [{ node, placement: p }] : [];
        });
        setSlots(found);
      } catch { setStatus("error"); }
    };
    script.onerror = () => { if (active) setStatus("error"); };
    document.body.classList.add("registry-active");
    document.body.append(script);
    return () => {
      active = false;
      setSlots([]);
      dispose?.();
      script.remove();
      styles.remove();
      document.body.classList.remove("registry-active", "frontier-active", "capital-active", "comfortable", "with-sponsor-rail");
    };
  }, []);
  return <>
    {status !== "ready" && <section style={{ padding: "32px", background: "white", color: "#273e31" }} aria-live="polite">
      <h1>Build more. Operate smaller.</h1>
      <p>The people, tools and evidence behind self-driving businesses.</p>
      <p>{status === "error" ? "The interactive index could not load. Please reload this page." : "Opening the index…"}</p>
      <a href="/pulse">Read the Autopilot Pulse</a>{" · "}
      <a href="https://www.linkedin.com/in/antonioserranopabon/">Contact Antonio Serrano on LinkedIn</a>
    </section>}
    <div ref={root} id="app" />
    {slots.map(({ node, placement }) => createPortal(
      <SubscribeForm key={placement} placement={placement} tone="light" compact label="Subscribe free" />,
      node,
      placement,
    ))}
  </>;
}
