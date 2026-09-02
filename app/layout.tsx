import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import RefCapture from "@/components/RefCapture";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://autopilotindex.com"),
  title: "The Autopilot Index — tracking companies run by AI",
  description:
    "Tracking the new class of AI companies that run themselves: who they are, their tech stacks, funding, referral programs, and how to build your own agent-run business.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "The Autopilot Index",
    url: "https://autopilotindex.com",
    title: "The Autopilot Index — tracking companies run by AI",
    description:
      "The index of companies run by AI — and the tech stack behind them. Plus Autopilot Pulse, a weekly newsletter.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Autopilot Index — business on autopilot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Autopilot Index — tracking companies run by AI",
    description: "The index of companies run by AI — and the tech stack behind them.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-200">
        <RefCapture />
        <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="font-mono text-sm font-bold tracking-tight text-zinc-100 hover:text-lime-400">
              autopilot<span className="text-lime-400">index</span>
            </Link>
            <div className="flex items-center gap-5 text-sm">
              <Link href="/#leaderboard" className="text-zinc-400 hover:text-zinc-100">
                Leaderboard
              </Link>
              <Link href="/#stack" className="hidden text-zinc-400 hover:text-zinc-100 sm:inline">
                Stack
              </Link>
              <Link href="/pulse" className="hidden text-zinc-400 hover:text-zinc-100 sm:inline">
                Editions
              </Link>
              <Link href="/submit" className="text-zinc-400 hover:text-zinc-100">
                Submit
              </Link>
              <Link
                href="/news"
                className="rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 font-medium text-lime-400 hover:bg-lime-400/20"
              >
                News pulse
              </Link>
            </div>
          </div>
        </nav>
        {children}
        <footer className="mt-auto border-t border-zinc-900 py-6 text-center">
          <a
            href="https://buymeacoffee.com/serranox"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-medium text-yellow-300 transition hover:bg-yellow-400/20"
          >
            ☕ Buy me a coffee — one human maintains this (the agents work for free)
          </a>
          <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-500">
            <Link href="/about" className="hover:text-lime-400">About</Link>
            <Link href="/pricing" className="hover:text-lime-400">Pricing</Link>
            <Link href="/developers" className="hover:text-lime-400">Developers</Link>
            <Link href="/contact" className="hover:text-lime-400">Contact</Link>
            <Link href="/privacy" className="hover:text-lime-400">Privacy</Link>
            <a href="/llms.txt" className="hover:text-lime-400">llms.txt</a>
            <a href="https://github.com/zetabytelab/autopilot" target="_blank" rel="noopener noreferrer" className="hover:text-lime-400">GitHub</a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
