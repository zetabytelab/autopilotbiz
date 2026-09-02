import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { preflight, API_BASE } from "@/lib/api/http";
import {
  listCompanies,
  getCompany,
  listStack,
  listEditions,
  listCompaniesSchema,
  listStackSchema,
} from "@/lib/api/core";

// Minimal, hardened MCP server (JSON-RPC 2.0 over Streamable HTTP). Read-only.
// Deliberately hand-rolled: tiny attack surface, no extra deps, full control of
// validation. All tools resolve to the same query layer as the REST API.

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = { name: "autopilot-index", version: "1.0.0" };
const MAX_BODY_BYTES = 64 * 1024; // reject oversized payloads before parsing

const MCP_CORS = "GET, POST, OPTIONS";

// ── Tool registry ────────────────────────────────────────────────────────────
type Tool = {
  description: string;
  inputSchema: Record<string, unknown>;
  zod: z.ZodTypeAny;
  run: (args: unknown) => unknown;
};

const getCompanyArgs = z.object({ slug: z.string().regex(/^[a-z0-9-]{1,64}$/) });

const TOOLS: Record<string, Tool> = {
  search_companies: {
    description:
      "Search The Autopilot Index of companies run by AI. Filter by free-text query, cohort, section, or verified status; returns a ranked page (by ARR).",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", maxLength: 120, description: "Free-text search over name, tagline, description, tech stack." },
        cohort: { type: "string", enum: ["hackathon", "expansion"] },
        section: { type: "string", enum: ["index", "watchlist", "caution", "enabler"] },
        verified: { type: "string", enum: ["true", "false"] },
        sort: { type: "string", enum: ["arr", "name"] },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      },
      additionalProperties: false,
    },
    zod: listCompaniesSchema,
    run: (args) => listCompanies(args as z.infer<typeof listCompaniesSchema>),
  },
  get_company: {
    description: "Get one company from The Autopilot Index by its slug (e.g. from search_companies results).",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string", pattern: "^[a-z0-9-]{1,64}$" } },
      required: ["slug"],
      additionalProperties: false,
    },
    zod: getCompanyArgs,
    run: (args) => {
      const { slug } = args as z.infer<typeof getCompanyArgs>;
      const c = getCompany(slug);
      if (!c) throw new ToolError(`No company with slug '${slug}'.`);
      return c;
    },
  },
  list_stack_tools: {
    description: "List tools in the autopilot tech stack (AI gateways, orchestration, scraping, voice, etc.). Filter by category or query.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", maxLength: 40 },
        q: { type: "string", maxLength: 120 },
        hasReferral: { type: "string", enum: ["true", "false"] },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      },
      additionalProperties: false,
    },
    zod: listStackSchema,
    run: (args) => listStack(args as z.infer<typeof listStackSchema>),
  },
  list_editions: {
    description: "List all Autopilot Pulse newsletter editions (weekly deep-dives on companies run by AI and their stack).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    zod: z.object({}).strict(),
    run: () => listEditions(),
  },
};

class ToolError extends Error {}

// ── JSON-RPC helpers ─────────────────────────────────────────────────────────
function rpcResult(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result }, { headers: rpcHeaders() });
}
function rpcError(id: unknown, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { headers: rpcHeaders() });
}
function rpcHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": MCP_CORS,
    "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  };
}

// ── Handlers ─────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Content-Type + body-size guards before parsing.
  const ctype = request.headers.get("content-type") || "";
  if (!ctype.includes("application/json")) {
    return rpcError(null, -32700, "Content-Type must be application/json.");
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return rpcError(null, -32600, "Request body too large.");
  }

  let msg: { jsonrpc?: string; id?: unknown; method?: string; params?: unknown };
  try {
    msg = JSON.parse(raw);
  } catch {
    return rpcError(null, -32700, "Parse error: invalid JSON.");
  }

  if (Array.isArray(msg)) return rpcError(null, -32600, "Batch requests are not supported.");
  if (!msg || typeof msg !== "object" || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return rpcError((msg as { id?: unknown })?.id ?? null, -32600, "Invalid Request.");
  }

  const { id, method, params } = msg;
  const isNotification = id === undefined;

  try {
    switch (method) {
      case "initialize":
        return rpcResult(id, {
          protocolVersion: readProtocol(params) ?? PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER_INFO,
          instructions:
            "The Autopilot Index MCP server. Read-only tools over companies run by AI and their tech stack. Use search_companies to explore, get_company for detail.",
        });
      case "notifications/initialized":
      case "notifications/cancelled":
        return new NextResponse(null, { status: 202, headers: rpcHeaders() });
      case "ping":
        return rpcResult(id, {});
      case "tools/list":
        return rpcResult(id, {
          tools: Object.entries(TOOLS).map(([name, t]) => ({ name, description: t.description, inputSchema: t.inputSchema })),
        });
      case "tools/call": {
        if (isNotification) return new NextResponse(null, { status: 202, headers: rpcHeaders() });
        return callTool(id, params);
      }
      default:
        if (isNotification) return new NextResponse(null, { status: 202, headers: rpcHeaders() });
        return rpcError(id, -32601, `Method not found: ${method}`);
    }
  } catch {
    // Never leak internals.
    return rpcError(id, -32603, "Internal error.");
  }
}

function readProtocol(params: unknown): string | undefined {
  const p = params as { protocolVersion?: unknown } | null;
  return p && typeof p.protocolVersion === "string" ? p.protocolVersion : undefined;
}

function callTool(id: unknown, params: unknown) {
  const p = (params ?? {}) as { name?: unknown; arguments?: unknown };
  if (typeof p.name !== "string" || !(p.name in TOOLS)) {
    return rpcError(id, -32602, `Unknown tool: ${String(p.name)}`);
  }
  const tool = TOOLS[p.name];
  const parsed = tool.zod.safeParse(p.arguments ?? {});
  if (!parsed.success) {
    // Tool-level error (isError), not a protocol error.
    return rpcResult(id, {
      isError: true,
      content: [{ type: "text", text: `Invalid arguments: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}` }],
    });
  }
  try {
    const result = tool.run(parsed.data);
    return rpcResult(id, {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    });
  } catch (e) {
    const message = e instanceof ToolError ? e.message : "Tool execution failed.";
    return rpcResult(id, { isError: true, content: [{ type: "text", text: message }] });
  }
}

// GET returns a human/agent-readable descriptor (doubles as a discovery manifest).
export function GET() {
  return NextResponse.json(
    {
      name: SERVER_INFO.name,
      version: SERVER_INFO.version,
      protocol: "mcp",
      protocolVersion: PROTOCOL_VERSION,
      transport: "streamable-http",
      endpoint: `${API_BASE}/mcp`,
      description: "Read-only MCP server over The Autopilot Index. POST JSON-RPC 2.0 messages here.",
      tools: Object.entries(TOOLS).map(([name, t]) => ({ name, description: t.description })),
      documentation: `${API_BASE}/developers`,
    },
    { headers: rpcHeaders() },
  );
}

export function OPTIONS() {
  return preflight(MCP_CORS);
}
