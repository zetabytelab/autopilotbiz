export type PulseCollectionInput = {
  runId: string;
  platforms: Array<"x" | "linkedin">;
  requestedAt: string;
};

type PulsePlan = PulseCollectionInput & {
  status: "planned";
  next: "provider-steps-not-enabled";
};

async function createPulsePlan(input: PulseCollectionInput): Promise<PulsePlan> {
  "use step";
  return {
    ...input,
    status: "planned",
    next: "provider-steps-not-enabled",
  };
}

/**
 * Durable orchestration boundary for Pulse collection.
 *
 * Provider calls are intentionally not wired yet. Once Neon/Blob and the
 * provider budget guard are configured, each provider becomes its own step so
 * retries cannot repeat unrelated billable work.
 */
export async function collectPulseWorkflow(input: PulseCollectionInput): Promise<PulsePlan> {
  "use workflow";
  return createPulsePlan(input);
}
