"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardInsights } from "@/actions/dashboardInsightsAction";
import { getLastSevenWeeksProgress } from "@/actions/timeLogAction";
import { queryKeys } from "@/lib/query-keys";

/** Streak, consistency, week-over-week and per-skill activity (home dashboard). */
export function useDashboardInsights() {
  return useQuery({
    queryKey: queryKeys.dashboard.insights(),
    queryFn: () => getDashboardInsights(),
  });
}

/** Hours per calendar week (Mon–Sun) for the last 7 weeks. */
export function useWeeklyProgress() {
  return useQuery({
    queryKey: queryKeys.dashboard.weeklyProgress(),
    queryFn: () => getLastSevenWeeksProgress(),
  });
}
