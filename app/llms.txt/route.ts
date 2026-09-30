import { llmsTxt } from "@/lib/llms";

// Built at deploy time, like the former static public/llms.txt.
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsTxt(), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
