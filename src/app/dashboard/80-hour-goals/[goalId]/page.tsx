import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getGoalBySlug } from "@/actions/goalActions";
import { getGoalLogs } from "@/actions/goalLogActions";
import GoalDetailView from "@/components/dashboard/80-hour-goals/GoalDetailView";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";

export default async function GoalDetailPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId: slug } = await params;

  const goal = await getGoalBySlug(slug);
  if (!goal) notFound();

  const queryClient = getQueryClient();
  queryClient.setQueryData(queryKeys.goals.detail(slug), goal);
  await queryClient.prefetchQuery({
    queryKey: queryKeys.goals.logs(goal.id),
    queryFn: () => getGoalLogs(goal.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GoalDetailView slug={slug} />
    </HydrationBoundary>
  );
}
