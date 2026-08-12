"use client";

import { useEffect } from "react";

// Stashes ?ref= from any landing page (e.g. autopilotindex.com/?ref=li) so the
// subscribe form can attribute the signup even after client-side navigation.
export default function RefCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) sessionStorage.setItem("ap_ref", ref.slice(0, 24));
    } catch {
      // sessionStorage unavailable (private mode etc.) — attribution is best-effort
    }
  }, []);
  return null;
}
