import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getGoals } from "@/actions/goalActions";
import GoalsView from "@/components/dashboard/80-hour-goals/GoalsView";
import { getQueryClient } from "@/lib/query-client";
import { requireUser } from "@/lib/require-user";
import { queryKeys } from "@/lib/query-keys";

export default async function EightyHourGoalsPage() {
  // Must run outside prefetchQuery: it marks the route dynamic (headers()) and
  // fails fast when signed out. prefetchQuery would swallow both.
  await requireUser();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({ queryKey: queryKeys.goals.list(), queryFn: () => getGoals() });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GoalsView />
    </HydrationBoundary>
  );
}
