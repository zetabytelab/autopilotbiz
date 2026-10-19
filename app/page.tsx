import type { Metadata } from "next";
import Registry from "@/components/registry/Registry";

export const metadata: Metadata = {
  title: "Autopilot Index — Build more. Operate smaller.",
  description: "The people, tools and evidence behind self-driving businesses. Explore companies, builder tools, workflows and the $1B solo-founder thesis.",
  alternates: { canonical: "/" },
  // Page-level openGraph/twitter replace the layout defaults wholesale, so every field is restated here.
  openGraph: {
    type: "website",
    siteName: "The Autopilot Index",
    url: "https://autopilotindex.com",
    title: "Autopilot Index — Build more. Operate smaller.",
    description:
      "Public research and intelligence on AI-operated businesses, their evidence and the tech stack behind them. Plus Autopilot Pulse.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Autopilot Index — business on autopilot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Autopilot Index — Build more. Operate smaller.",
    description: "Public research and intelligence on AI-operated businesses, their evidence and the tech stack behind them.",
    images: ["/og.png"],
  },
};
export default function Home() { return <Registry />; }
