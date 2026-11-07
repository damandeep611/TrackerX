import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "UnauthorizedError";
  }
}

/**
 * Resolves the current session once per request (deduped with React `cache`).
 * Returns null when signed out.
 */
export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

/**
 * Returns the signed-in user's id or throws. Use this at the top of every
 * Server Action and every server-rendered page that reads user data, and
 * scope every query by the returned id.
 */
export async function requireUser(): Promise<string> {
  const user = await getCurrentUser();
  if (!user?.id) throw new UnauthorizedError();
  return user.id;
}
