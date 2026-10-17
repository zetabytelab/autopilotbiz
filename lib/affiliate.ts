import { companies, type StackTool } from "./data.ts";

// Shown next to every rendered affiliate (referralUrl) link. When the vendor is
// also a company profiled in the index (today: Atoms), the note adds that the
// link has no bearing on its rating or rank.
export const AFFILIATE_DISCLOSURE =
  "Disclosure: this is an affiliate link. If you sign up, we may earn a commission at no extra cost to you.";

export function affiliateDisclosure(tool: Pick<StackTool, "name" | "referralUrl">): string | null {
  if (!tool.referralUrl) return null;
  const listed = companies.some((c) => c.name === tool.name);
  return listed
    ? `${AFFILIATE_DISCLOSURE} ${tool.name} is also listed in our index, and this link has no effect on its rating or rank.`
    : AFFILIATE_DISCLOSURE;
}
