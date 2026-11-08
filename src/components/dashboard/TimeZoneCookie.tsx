"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Stores the browser's IANA time zone in the `tz` cookie so the server knows
 * the user's calendar "today" (lib/user-today.ts). When it changes (first
 * visit, travel), date-based queries are refetched.
 */
export function TimeZoneCookie() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;
    const current = document.cookie.match(/(?:^|;\s*)tz=([^;]*)/)?.[1];
    if (current === tz) return;
    document.cookie = `tz=${tz}; path=/; max-age=31536000; samesite=lax`;
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["skills"] });
  }, [queryClient]);
  return null;
}
