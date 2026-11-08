import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { BrandMark } from "@/components/brand";
import { Card, Well } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/require-user";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Sign in" };

/** Better Auth OAuth error codes → something a person can act on. */
function errorMessage(code: string): string {
  switch (code) {
    case "access_denied":
      return "Sign-in was cancelled on Google's side. Try again when you're ready.";
    case "state_mismatch":
    case "please_restart_the_process":
    case "invalid_callback_request":
      return "That sign-in attempt expired. Start again below.";
    case "account_not_linked":
      return "This Google account couldn't be linked to an existing account.";
    default:
      return "Sign-in didn't complete. Please try again.";
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNext(rawNext);
  // Already signed in: go straight where they were heading.
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="flex min-h-dvh flex-col bg-background px-4 py-6 text-foreground">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-0.5 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Home
      </Link>

      <main className="flex flex-1 items-center justify-center py-10">
        <Card className="w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-1 duration-500">
          <Well className="flex flex-col items-center gap-5 px-6 py-8 text-center">
            <BrandMark className="size-10 rounded-xl [&_svg]:size-5" />
            <div className="space-y-1.5">
              <h1 className="text-xl font-semibold tracking-tight">Sign in to BuildxSkill</h1>
              <p className="text-sm text-muted-foreground">
                Log the hours you put into your skills and deep-work projects, and see your real pace.
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="flex w-full items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-left text-sm text-danger"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {errorMessage(error)}
                  <span className="mt-0.5 block font-mono text-xs opacity-70">{error.slice(0, 60)}</span>
                </span>
              </p>
            )}

            <GoogleSignInButton next={next} className="w-full" />
          </Well>
          <p className="px-4 pt-1 pb-3 text-center text-xs text-muted-foreground">
            Google sign-in only. We use your name, email and photo for your profile; your skills and
            sessions are visible to you alone.
          </p>
        </Card>
      </main>
    </div>
  );
}
