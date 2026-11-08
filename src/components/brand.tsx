import { Box } from "lucide-react";
import { cn } from "@/lib/utils";

/** The app's mark + name, shared by the sidebar, landing page and sign-in screen. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className
      )}
      aria-hidden
    >
      <Box className="size-4" strokeWidth={2.5} />
    </span>
  );
}

export function Brand({ hideName = false, className }: { hideName?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      {hideName ? (
        <span className="sr-only">BuildxSkill</span>
      ) : (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">BuildxSkill</span>
      )}
    </span>
  );
}
