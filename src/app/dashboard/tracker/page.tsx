import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTrackerDay, getTrackerHistory } from "@/actions/trackerActions";
import { TrackerPage } from "@/components/dashboard/tracker/TrackerPage";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { requirePageUser } from "@/lib/require-user";
import { getUserToday } from "@/lib/user-today";

export const metadata = { title: "Tracker" };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function TrackerRoute({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; tab?: string }>;
}) {
  // Outside prefetchQuery: keeps the route dynamic and fails fast when signed out.
  await requirePageUser("/dashboard/tracker");

  const today = (await getUserToday()).toISOString().slice(0, 10);
  const params = await searchParams;
  // Any valid past date; the future (or junk) falls back to today.
  const date =
    params.date && DATE_RE.test(params.date) && params.date <= today && params.date >= "2020-01-01"
      ? params.date
      : today;
  const tab = params.tab === "history" ? "history" : "day";

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: queryKeys.tracker.day(date), queryFn: () => getTrackerDay(date) }),
    tab === "history"
      ? queryClient.prefetchQuery({ queryKey: queryKeys.tracker.history(), queryFn: () => getTrackerHistory() })
      : null,
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TrackerPage today={today} initialDate={date} initialTab={tab} />
    </HydrationBoundary>
  );
}
