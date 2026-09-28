import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
};

export default withWorkflow(withBotId(nextConfig));
