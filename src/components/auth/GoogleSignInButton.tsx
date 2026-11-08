"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { safeNext, signInHref } from "@/lib/safe-next";
import { cn } from "@/lib/utils";

/** The official four-colour Google "G" (brand colours are part of the mark, so they stay hex). */
export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 262" className={cn("size-4 shrink-0", className)} aria-hidden>
      <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
      <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
      <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z" />
      <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
    </svg>
  );
}

/**
 * "Continue with Google". Shows an honest pending state while the browser
 * heads to Google, and surfaces failures (toast + the button comes back) instead
 * of swallowing them. OAuth errors from the callback land on /sign-in?error=…
 */
export function GoogleSignInButton({
  next,
  size = "lg",
  variant = "default",
  label = "Continue with Google",
  className,
}: {
  /** Dashboard path to return to after sign-in (sanitised). */
  next?: string | null;
  size?: "default" | "lg";
  variant?: "default" | "outline";
  label?: string;
  className?: string;
}) {
  const [pending, setPending] = useState(false);

  const signIn = async () => {
    setPending(true);
    const target = safeNext(next);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: target,
        errorCallbackURL: signInHref(target),
      });
      if (error) throw new Error(error.message || error.statusText || "Sign-in failed");
      // On success the browser is navigating to Google; keep the pending state.
    } catch (e) {
      setPending(false);
      toast.error(
        e instanceof Error && e.message && e.message !== "Failed to fetch"
          ? `Couldn't start sign-in: ${e.message}`
          : "Couldn't reach the sign-in service. Check your connection and try again."
      );
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={signIn}
      disabled={pending}
      aria-live="polite"
      className={cn("gap-2.5", className)}
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : <GoogleMark />}
      {pending ? "Redirecting to Google…" : label}
    </Button>
  );
}
