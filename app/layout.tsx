import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Business on Autopilot — the autonomous-business tracker",
  description:
    "Tracking the new class of AI companies that run themselves: who they are, their tech stacks, funding, referral programs, and how to build your own agent-run business.",
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
        <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="font-mono text-sm font-bold tracking-tight text-zinc-100 hover:text-lime-400">
              autopilot<span className="text-lime-400">.biz</span>
            </Link>
            <div className="flex items-center gap-5 text-sm">
              <Link href="/#leaderboard" className="text-zinc-400 hover:text-zinc-100">
                Leaderboard
              </Link>
              <Link href="/#stack" className="hidden text-zinc-400 hover:text-zinc-100 sm:inline">
                Stack
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
        </footer>
      </body>
    </html>
  );
}
