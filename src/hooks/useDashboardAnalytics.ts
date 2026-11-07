"use client";

import { useQuery } from "@tanstack/react-query";
import { getOverviewAnalytics } from "@/actions/overviewAnalyticsAction";
import { getLastSevenDaysActivity, getLastSevenWeeksProgress } from "@/actions/timeLogAction";
import { queryKeys } from "@/lib/query-keys";

const EMPTY_OVERVIEW = {
  timeSpentYesterday: { hoursSpent: 0, tasksCompleted: 0 },
  weeklyTime: { totalHours: 0, daysWithActivity: 0 },
  monthlyTime: { totalHours: 0, daysWithActivity: 0 },
  mostActiveSkill: { skillName: "No data", hoursSpent: 0 },
};

export function useOverviewAnalytics() {
  const query = useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: () => getOverviewAnalytics(),
  });
  return {
    analytics: query.data ?? EMPTY_OVERVIEW,
    isLoading: query.isPending,
    error: query.error ? "Failed to load overview data" : null,
  };
}

export function useWeeklyProgress() {
  return useQuery({
    queryKey: queryKeys.dashboard.weeklyProgress(),
    queryFn: () => getLastSevenWeeksProgress(),
  });
}

export function useWeeklyRhythm() {
  return useQuery({
    queryKey: queryKeys.dashboard.weeklyRhythm(),
    queryFn: () => getLastSevenDaysActivity(),
  });
}
