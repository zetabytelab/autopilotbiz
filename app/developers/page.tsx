import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Developers — The Autopilot Index API & MCP server",
  description:
    "Query The Autopilot Index programmatically: a read-only public REST API, an OpenAPI spec, and an MCP server so AI agents can call the index natively. No auth required.",
  alternates: { canonical: "/developers" },
};

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-black/50 p-4 font-mono text-xs leading-relaxed text-zinc-300">
      {children}
    </pre>
  );
}

const ENDPOINTS = [
  ["GET", "/api/v1", "API discovery — links to every resource."],
  ["GET", "/api/v1/companies", "List companies run by AI. Filters: q, cohort, section, verified, sort, limit, offset."],
  ["GET", "/api/v1/companies/{slug}", "One company by slug."],
  ["GET", "/api/v1/stack", "The autopilot tech stack. Filters: category, q, hasReferral."],
  ["GET", "/api/v1/editions", "Autopilot Pulse newsletter editions."],
];

export default function Developers() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-6">
      <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-lime-400">
        ← The Autopilot Index
      </Link>
      <p className="mb-2 mt-8 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">Developers</p>
      <h1 className="text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
        The Autopilot Index, callable by agents.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
        A read-only public API and an <span className="text-zinc-100">MCP server</span> over the whole index —
        companies run by AI, their tech stacks, and every edition. All data is public; there is no authentication
        and no rate-limit key to request. Be reasonable and cache responses.
      </p>

      {/* REST */}
      <h2 className="mt-12 text-xl font-bold text-zinc-100">REST API</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Base URL <code className="rounded bg-zinc-800 px-1 text-xs text-lime-400">https://autopilotindex.com/api/v1</code>.
        JSON only. CORS-enabled. Full spec:{" "}
        <a href="/openapi.json" className="text-lime-400 hover:underline">/openapi.json</a> (OpenAPI 3.1).
      </p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <tbody>
            {ENDPOINTS.map(([m, path, desc]) => (
              <tr key={path} className="border-b border-zinc-900 last:border-0">
                <td className="whitespace-nowrap px-3 py-3 align-top font-mono text-xs text-lime-400">{m}</td>
                <td className="whitespace-nowrap px-3 py-3 align-top font-mono text-xs text-zinc-200">{path}</td>
                <td className="px-3 py-3 align-top text-zinc-400">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-zinc-400">Example — the top AI-run companies by ARR:</p>
      <Code>{`curl "https://autopilotindex.com/api/v1/companies?sort=arr&limit=5"`}</Code>

      {/* MCP */}
      <h2 className="mt-12 text-xl font-bold text-zinc-100">MCP server</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Connect an agent (Claude, Cursor, etc.) directly to the index over the Model Context Protocol
        (Streamable HTTP). Endpoint:{" "}
        <code className="rounded bg-zinc-800 px-1 text-xs text-lime-400">https://autopilotindex.com/mcp</code>.
        Manifest at <a href="/.well-known/mcp.json" className="text-lime-400 hover:underline">/.well-known/mcp.json</a>.
      </p>
      <p className="mt-3 text-sm text-zinc-400">Add to an MCP client config:</p>
      <Code>{`{
  "mcpServers": {
    "autopilot-index": {
      "type": "http",
      "url": "https://autopilotindex.com/mcp"
    }
  }
}`}</Code>
      <p className="mt-3 text-sm text-zinc-400">Tools: <code className="text-zinc-200">search_companies</code>, <code className="text-zinc-200">get_company</code>, <code className="text-zinc-200">list_stack_tools</code>, <code className="text-zinc-200">list_editions</code>.</p>

      {/* CLI */}
      <h2 className="mt-12 text-xl font-bold text-zinc-100">From the terminal</h2>
      <p className="mt-2 text-sm text-zinc-400">
        The API is plain JSON over HTTPS, so no client is needed — pipe it to <code className="rounded bg-zinc-800 px-1 text-xs text-lime-400">jq</code>:
      </p>
      <Code>{`curl -s "https://autopilotindex.com/api/v1/companies?sort=arr&limit=5" | jq '.items[].name'
curl -s "https://autopilotindex.com/api/v1/companies/polsia" | jq '.techStack'
curl -s "https://autopilotindex.com/api/v1/stack?category=agents" | jq '.items[].name'`}</Code>
      <p className="mt-3 text-sm text-zinc-500">A native <code className="text-zinc-300">npx autopilot-index</code> CLI is on the roadmap.</p>

      <p className="mt-12 text-sm text-zinc-500">
        Questions? <Link href="/contact" className="text-lime-400 hover:underline">Contact</Link>. The index is{" "}
        <Link href="/pricing" className="text-lime-400 hover:underline">free</Link>; the source is on{" "}
        <a href="https://github.com/zetabytelab/autopilot" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">GitHub</a>.
      </p>
    </main>
  );
}
