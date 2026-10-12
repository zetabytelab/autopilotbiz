"use client";
import { usePathname } from "next/navigation";
export default function LegacyChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return pathname === "/" ? null : children;
}
