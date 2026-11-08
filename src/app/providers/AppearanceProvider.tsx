"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider } from "@/components/theme-provider";

/** Theme (light / dark / system) and reduced-motion handling for every page, landing included. */
export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {/* All motion components honour prefers-reduced-motion. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
