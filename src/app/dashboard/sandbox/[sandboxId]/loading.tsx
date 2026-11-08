import { Skeleton } from "@/components/ui/skeleton";

// Shown the moment a sandbox card is clicked. Shaped like the detail page:
// header, the dial card beside the log + milestones cards, then the tab bar.
export default function SandboxLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:py-8" aria-busy="true" aria-label="Loading sandbox">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-3.5 w-96 max-w-full" />
        </div>
        <Skeleton className="size-9 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[440px] rounded-2xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
      <Skeleton className="h-9 w-72 rounded-xl" />
    </div>
  );
}
