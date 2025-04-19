// components/SignOutButton.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/"); // Redirect to login page after sign-out
        },
      },
    });
  };

  return (
    <Button onClick={handleSignOut}>Sign Out</Button>
  ) 
}
