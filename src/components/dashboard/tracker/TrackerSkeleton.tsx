import { Skeleton } from "@/components/ui/skeleton";

/** Shaped like the Day tab: header, reminder, tasks + the day column. */
export function TrackerSkeleton({ withHeader = true }: { withHeader?: boolean }) {
  const body = (
    <>
      <Skeleton className="h-5 w-2/3 max-w-xl" />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_23rem]">
        <Skeleton className="order-2 h-96 rounded-2xl lg:order-1" />
        <div className="order-1 space-y-4 lg:order-2">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="hidden h-80 rounded-2xl lg:block" />
        </div>
      </div>
    </>
  );
  if (!withHeader) return <div className="space-y-5">{body}</div>;
  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:py-8"
      aria-busy="true"
      aria-label="Loading tracker"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-7 w-28" />
        </div>
        <Skeleton className="h-9 w-48 rounded-xl" />
      </div>
      {body}
    </div>
  );
}
