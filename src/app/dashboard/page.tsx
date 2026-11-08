import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import HomeDashboard from "@/components/dashboard/home/HomeDashboard";
import { getSkillCard } from "@/actions/skillCardAction";
import { getDashboardInsights } from "@/actions/dashboardInsightsAction";
import { getLastSevenWeeksProgress } from "@/actions/timeLogAction";
import { getQueryClient } from "@/lib/query-client";
import { getCurrentUser, requireUser } from "@/lib/require-user";
import { queryKeys } from "@/lib/query-keys";

export default async function DashboardPage() {
  // Must run outside prefetchQuery: it marks the route dynamic (headers()) and
  // fails fast when signed out. prefetchQuery would swallow both.
  await requireUser();
  const user = await getCurrentUser(); // cached: no second session lookup

  const queryClient = getQueryClient();

  // Prefetch in parallel so the client renders with data on first paint.
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: queryKeys.skills.list(), queryFn: () => getSkillCard() }),
    queryClient.prefetchQuery({ queryKey: queryKeys.dashboard.insights(), queryFn: () => getDashboardInsights() }),
    queryClient.prefetchQuery({ queryKey: queryKeys.dashboard.weeklyProgress(), queryFn: () => getLastSevenWeeksProgress() }),
  ]);

  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeDashboard firstName={firstName} />
    </HydrationBoundary>
  );
}
