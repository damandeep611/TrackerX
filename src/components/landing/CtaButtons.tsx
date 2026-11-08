import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";

/** Signed in → "Open dashboard"; signed out → one-click Google sign-in. */
export function PrimaryCta({ signedIn, size = "lg" }: { signedIn: boolean; size?: "default" | "lg" }) {
  if (signedIn) {
    return (
      <Button asChild size={size}>
        <Link href="/dashboard">
          Open dashboard
          <ArrowRight />
        </Link>
      </Button>
    );
  }
  return <GoogleSignInButton size={size} />;
}
