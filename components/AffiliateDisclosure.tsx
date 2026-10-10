import type { StackTool } from "@/lib/data";
import { affiliateDisclosure } from "@/lib/affiliate";

export default function AffiliateDisclosure({ tool, className = "" }: { tool: Pick<StackTool, "name" | "referralUrl">; className?: string }) {
  const text = affiliateDisclosure(tool);
  if (!text) return null;
  return <p className={`text-[11px] leading-snug text-zinc-500 ${className}`}>{text}</p>;
}
