import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { signInHref } from "@/lib/safe-next";

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

/**
 * For server pages: like requireUser(), but a missing or expired session sends
 * the visitor to sign-in (and back to `path` afterwards) instead of the error page.
 * The proxy catches most signed-out visits; this covers stale session cookies.
 */
export async function requirePageUser(path: string): Promise<string> {
  const user = await getCurrentUser();
  if (!user?.id) redirect(signInHref(path));
  return user.id;
}
