"use client";

import Link from "next/link";
import { SUBSCRIBE_VIA_EVENT } from "@/components/SubscribeForm";

// Header newsletter button. If the current page has a signup box with
// id="subscribe", scroll to it in the same tab, focus the email field and tag
// the signup as placement "header". Otherwise go to `href` (a page with a form).
export default function SubscribeLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        const box = document.getElementById("subscribe");
        if (!box) return;
        event.preventDefault();
        box.scrollIntoView({ behavior: "smooth", block: "center" });
        const target = box.querySelector<HTMLFormElement>("form[data-placement]")?.dataset.placement;
        if (target) window.dispatchEvent(new CustomEvent(SUBSCRIBE_VIA_EVENT, { detail: { target, placement: "header" } }));
        window.setTimeout(() => box.querySelector<HTMLInputElement>("input[type=email]")?.focus({ preventScroll: true }), 350);
      }}
    >
      {children}
    </Link>
  );
}
