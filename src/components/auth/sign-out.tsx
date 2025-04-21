// components/SignOutButton.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

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
    <button
      onClick={handleSignOut}
      className="flex items-center justify-between gap-3 cursor-pointer  p-2 text-sm"
    >
      <LogOut size={16} className="text-red-500 ml-2" />
      Sign Out
    </button>
  );
}
