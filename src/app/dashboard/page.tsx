import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import SkillDashboard from "@/components/dashboard/skillcardComponents/all-skill-cards";
import { getSkillCard } from "@/actions/skillCardAction";
import { getOverviewAnalytics } from "@/actions/overviewAnalyticsAction";
import { getLastSevenDaysActivity, getLastSevenWeeksProgress } from "@/actions/timeLogAction";
import { getQueryClient } from "@/lib/query-client";
import { requireUser } from "@/lib/require-user";
import { queryKeys } from "@/lib/query-keys";

export default async function DashboardPage() {
  // Must run outside prefetchQuery: it marks the route dynamic (headers()) and
  // fails fast when signed out. prefetchQuery would swallow both.
  await requireUser();

  const queryClient = getQueryClient();

  // Prefetch in parallel so the client renders with data on first paint.
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: queryKeys.skills.list(), queryFn: () => getSkillCard() }),
    queryClient.prefetchQuery({ queryKey: queryKeys.dashboard.overview(), queryFn: () => getOverviewAnalytics() }),
    queryClient.prefetchQuery({ queryKey: queryKeys.dashboard.weeklyProgress(), queryFn: () => getLastSevenWeeksProgress() }),
    queryClient.prefetchQuery({ queryKey: queryKeys.dashboard.weeklyRhythm(), queryFn: () => getLastSevenDaysActivity() }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SkillDashboard />
    </HydrationBoundary>
  );
}
