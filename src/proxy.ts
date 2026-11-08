import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { signInHref } from "@/lib/safe-next";

/**
 * Optimistic redirect for signed-out visitors (UX + defense in depth).
 * This only checks that a session cookie exists; it does NOT validate it.
 * Real authorization happens in every Server Action / page via requireUser().
 * The requested path rides along as `?next=` so sign-in can return there.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(new URL(signInHref(pathname + search), request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
