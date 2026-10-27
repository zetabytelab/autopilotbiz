import Link from "next/link";

// Short-form disclosure near submit (lead score v0 spec §1). Legitimate interests; no checkbox.
export default function EnrichmentNotice({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const link = tone === "light" ? "text-[#1d6653] underline" : "text-lime-400 hover:underline";
  return (
    <p data-enrichment-notice className={`w-full text-xs leading-snug ${tone === "light" ? "text-[#5d6b65]" : "text-zinc-500"}`}>
      We may look up publicly available company details from the email and company name you enter so we can qualify sponsor and
      partnership inquiries. We do not scrape people from ads or unmask social handles.{" "}
      <Link href="/privacy#business-contact-enrichment" className={link}>Privacy Policy</Link>
    </p>
  );
}
