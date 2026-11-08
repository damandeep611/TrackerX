"use client";

import { TimeZoneCookie } from "./TimeZoneCookie";

/** Dashboard-only client setup. Theme + reduced-motion config live in the root layout (app/providers). */
export default function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <TimeZoneCookie />
    </>
  );
}
