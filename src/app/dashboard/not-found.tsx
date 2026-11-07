import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
        <SearchX className="h-6 w-6 text-muted-foreground" />
      </div>
      <h1 className="text-lg font-semibold text-foreground">Not found</h1>
      <p className="text-sm text-muted-foreground">
        This item doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Button variant="outline" asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
