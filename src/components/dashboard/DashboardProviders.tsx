"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider } from "@/components/theme-provider";

export default function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {/* All motion components honour prefers-reduced-motion. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
