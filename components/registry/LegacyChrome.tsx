"use client";
import { usePathname } from "next/navigation";
export default function LegacyChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return pathname === "/" || pathname === "/pulse" || pathname.startsWith("/pulse/") ? null : children;
}
