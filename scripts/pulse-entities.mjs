import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------- companies
// Extract {name, slug, url} from lib/data.ts (only company blocks have
// name+slug adjacent, so this doesn't match stackTools).
export function loadCompanies() {
  const src = readFileSync(join(ROOT, "lib", "data.ts"), "utf8");
  const re = /name:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*url:\s*(null|"[^"]*")/g;
  const out = [];
  for (const m of src.matchAll(re)) {
    out.push({ name: m[1], slug: m[2], url: m[3] === "null" ? null : m[3].slice(1, -1) });
  }
  if (out.length < 5) throw new Error("company extraction from lib/data.ts failed");
  return out;
}

// ------------------------------------------------------- stack providers
// Watched technology providers (the stack behind the companies). Keyed by the
// EXACT tool name in lib/data.ts stackTools; slug becomes "stack-<kebab>".
// Every entry is deliberately in DISAMBIG form (query + confirm) — provider
// names are generic, so body-match trust is always off and a title must pass
// the confirm regex. Queries stay builder-focused to keep firehose noise out.
export const STACK_WATCH = {
  "Claude (Anthropic)": { query: '"Anthropic" Claude model OR API OR pricing', confirm: /anthropic|claude/i },
  "Claude Code": { query: '"Claude Code"', confirm: /claude code/i },
  "OpenAI": { query: '"OpenAI" model OR API OR pricing', confirm: /openai|chatgpt|gpt/i },
  "OpenAI Codex": { query: '"Codex" OpenAI', confirm: /codex/i },
  "Hermes (Nous Research)": { query: '"Nous Research" OR "Hermes" open-source AI model', confirm: /nous research|hermes[- ]?\d|hermes.*(model|llm)/i },
  "OpenRouter": { query: '"OpenRouter" AI', confirm: /openrouter/i },
  "OpenClaw": { query: '"OpenClaw"', confirm: /openclaw|clawdbot|moltbot/i },
  "NanoClaw": { query: '"NanoClaw"', confirm: /nanoclaw/i },
  "Cursor": { query: '"Cursor" AI coding', confirm: /cursor.*(ai|cod|agent|ide)|anysphere/i },
  "Sciforium": { query: '"Sciforium"', confirm: /sciforium/i },
  "Z.ai (GLM-5.2)": { query: '"Z.ai" OR "GLM-5"', confirm: /z\.ai|glm|zhipu/i },
  "ElevenLabs": { query: '"ElevenLabs"', confirm: /elevenlabs/i },
  // Agent infrastructure
  "AgentMail (YC S25)": { query: '"AgentMail"', confirm: /agentmail/i },
  "Blaxel (YC X25)": { query: '"Blaxel"', confirm: /blaxel/i },
  "Anchor Browser": { query: '"Anchor Browser"', confirm: /anchor browser/i },
  "MCP (Model Context Protocol)": { query: '"Model Context Protocol"', confirm: /model context protocol|\bmcp\b/i },
  // Sandboxes & GPU compute ("Modal"/"Daytona"/"Lambda" are brutally ambiguous
  // — Daytona 500, AWS Lambda, UI modals — hence the aggressive confirms)
  "Modal": { query: '"Modal" AI sandbox OR GPU compute', confirm: /modal[' ]?s? (labs|sandbox|gpu|compute|cloud)|modal\.com|sandbox.*modal|modal.*(sandbox|gpu|serverless)/i },
  "E2B": { query: '"E2B" sandbox', confirm: /e2b/i },
  "Daytona": { query: '"Daytona" AI sandbox agents', confirm: /daytona.*(sandbox|agent|\bai\b|dev environment)/i },
  "CoreWeave": { query: '"CoreWeave"', confirm: /coreweave/i },
  "Lambda Labs": { query: '"Lambda" GPU cloud OR neocloud', confirm: /lambda ?labs|lambda\.ai|lambda.*(gpu|neocloud)|gpu.*lambda/i },
  "RunPod": { query: '"RunPod"', confirm: /runpod/i },
  // Clouds & deploy
  "Vercel": { query: '"Vercel"', confirm: /vercel/i },
  "Render": { query: '"Render.com" OR "Render" cloud platform', confirm: /render\.com|render.*(cloud|hosting|deploy|platform)/i },
  "DigitalOcean": { query: '"DigitalOcean"', confirm: /digital ?ocean/i },
  "Akamai (Linode)": { query: '"Linode" OR "Akamai" cloud computing', confirm: /linode|akamai.*(cloud|compute|linode)/i },
  // Data & comms
  "Neon": { query: '"Neon" Postgres', confirm: /neon.*(postgres|database|serverless)|postgres.*neon/i },
  "Supabase": { query: '"Supabase"', confirm: /supabase/i },
  "Postmark": { query: '"Postmark" email', confirm: /postmark/i },
  "Resend": { query: '"Resend" email API', confirm: /resend.*(email|api)|email.*resend/i },
  // Voice & agent tooling
  "HappyRobot": { query: '"HappyRobot"', confirm: /happyrobot/i },
  "Soniox": { query: '"Soniox"', confirm: /soniox/i },
  "Apify": { query: '"Apify"', confirm: /apify/i },
  "Vapi": { query: '"Vapi" voice AI', confirm: /vapi/i },
  "Browserbase": { query: '"Browserbase"', confirm: /browserbase/i },
  "Firecrawl": { query: '"Firecrawl"', confirm: /firecrawl/i },
  "n8n": { query: '"n8n"', confirm: /n8n/i },
  // Inference & money & ops ("Together"/"Polar" collide with everyday words)
  "Together AI": { query: '"Together AI" inference', confirm: /together ?ai|together\.ai|together compute/i },
  "Groq": { query: '"Groq"', confirm: /groq/i },
  "Polar": { query: '"Polar.sh" OR "Polar" payments developers', confirm: /polar\.sh|polar.*(payment|merchant|monetiz|billing|checkout)/i },
  "Langfuse": { query: '"Langfuse"', confirm: /langfuse/i },
};
export const stackSlug = (name) =>
  "stack-" +
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Extract watched stack tools from lib/data.ts (blocks have name+url+role —
// companies have name+slug, so the shapes don't collide).
export function loadStackEntities() {
  const src = readFileSync(join(ROOT, "lib", "data.ts"), "utf8");
  const re = /name:\s*"([^"]+)",\s*url:\s*"([^"]+)",\s*role:/g;
  const out = [];
  for (const m of src.matchAll(re)) {
    if (!STACK_WATCH[m[1]]) continue;
    out.push({ name: m[1], slug: stackSlug(m[1]), url: m[2] });
  }
  return out;
}

