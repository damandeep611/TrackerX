/**
 * Where to send someone after sign-in. Only same-site dashboard paths are
 * allowed, so `?next=` can't be used as an open redirect.
 */
export const DEFAULT_AFTER_SIGN_IN = "/dashboard";

export function safeNext(value: string | null | undefined): string {
  if (!value) return DEFAULT_AFTER_SIGN_IN;
  // Must be a plain absolute path under /dashboard: no scheme, no "//host", no backslashes.
  if (!/^\/dashboard(?:[/?#]|$)/.test(value) || value.includes("//") || value.includes("\\")) {
    return DEFAULT_AFTER_SIGN_IN;
  }
  return value.slice(0, 512);
}

/** "/sign-in" or "/sign-in?next=%2Fdashboard%2Fsandbox". */
export function signInHref(next?: string | null): string {
  const target = safeNext(next);
  return target === DEFAULT_AFTER_SIGN_IN ? "/sign-in" : `/sign-in?next=${encodeURIComponent(target)}`;
}
