import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { collectPulseWorkflow, type PulseCollectionInput } from "@/workflows/pulse-collection";

export const runtime = "nodejs";

function authorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const input: PulseCollectionInput = {
    runId: randomUUID(),
    platforms: ["x", "linkedin"],
    requestedAt: new Date().toISOString(),
  };
  const run = await start(collectPulseWorkflow, [input]);
  return NextResponse.json({ accepted: true, runId: run.runId, input });
}
