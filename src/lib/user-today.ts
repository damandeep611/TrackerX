import "server-only";

import { cookies } from "next/headers";

/**
 * The user's IANA time zone is stored in the `tz` cookie by
 * `components/dashboard/TimeZoneCookie` so the server can tell which calendar
 * day it is for them. Falls back to UTC until the cookie exists.
 */
export const TZ_COOKIE = "tz";

function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The user's current calendar date as a Date at UTC midnight (matches how logged_date is stored). */
export async function getUserToday(): Promise<Date> {
  const tz = (await cookies()).get(TZ_COOKIE)?.value;
  const zone = tz && tz.length <= 64 && isValidTimeZone(tz) ? tz : "UTC";
  const key = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return new Date(`${key}T00:00:00.000Z`);
}
