import type { Metadata } from "next";
import Registry from "@/components/registry/Registry";

export const metadata: Metadata = {
  title: "Autopilot Index — Build more. Operate smaller.",
  description: "The people, tools and evidence behind self-driving businesses. Explore companies, builder tools, workflows and the $1B solo-founder thesis.",
  alternates: { canonical: "/" },
};
export default function Home() { return <Registry />; }
