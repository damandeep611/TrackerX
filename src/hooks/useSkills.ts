"use client";

import { useMemo } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { subDays, addDays } from "date-fns";
import {
  addSkillCard,
  deleteSkillCard,
  getCurrentHours,
  getSkillCard,
} from "@/actions/skillCardAction";
import {
  getSkillAnalytics,
  getTagStatsForSkill,
  getUniqueTagsForSkill,
} from "@/actions/skillAnalyticsAction";
import {
  createTimeLog,
  getTimeLogsByDateForSkill,
  getTotalTimeForTasks,
} from "@/actions/timeLogAction";
import { queryKeys } from "@/lib/query-keys";
import type { NewTimeLog } from "@/types/skillDashboardTypes";

export type SkillListItem = Awaited<ReturnType<typeof getSkillCard>>[number];

// ---------- Skill list (dashboard) ----------

export function useSkillCards() {
  return useQuery({
    queryKey: queryKeys.skills.list(),
    queryFn: () => getSkillCard(),
  });
}

export function useAddSkillCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addSkillCard,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.skills.list() }),
  });
}

export function useDeleteSkillCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSkillCard,
    // Optimistically drop the card; roll back if the server refuses.
    onMutate: async (skillId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.skills.list() });
      const previous = queryClient.getQueryData<SkillListItem[]>(queryKeys.skills.list());
      queryClient.setQueryData<SkillListItem[]>(queryKeys.skills.list(), (old) =>
        old?.filter((s) => s.id !== skillId)
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.skills.list(), ctx.previous);
    },
    onSettled: (_data, _err, skillId) => {
      queryClient.removeQueries({ queryKey: queryKeys.skills.detail(skillId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

// ---------- Per-skill data (skill detail page) ----------

/** Total hours for a skill, formatted like "12.5". Seeded from the server render. */
export function useSkillHours(skillId: string, slug: string, initialHours?: string) {
  return useQuery({
    queryKey: queryKeys.skills.hours(skillId),
    queryFn: () => getCurrentHours(slug),
    initialData: initialHours,
    enabled: !!skillId && !!slug,
  });
}

const EMPTY_SKILL_ANALYTICS = {
  averageDailyHours: 0,
  totalDaysWithActivity: 0,
  completedTasks: 0,
  totalTasks: 0,
  createdAt: "",
  description: null as string | null,
  daysSinceCreation: 0,
};

export function useSkillAnalytics(skillId: string) {
  const query = useQuery({
    queryKey: queryKeys.skills.analytics(skillId),
    queryFn: async () => {
      const data = await getSkillAnalytics(skillId);
      if (!data.createdAt) throw new Error("Invalid skill data received");
      return { ...data, description: data.description || null };
    },
    enabled: !!skillId,
  });
  return {
    analytics: query.data ?? EMPTY_SKILL_ANALYTICS,
    isLoading: query.isPending,
    error: query.error ? "Failed to load analytics data" : null,
  };
}

export function useTagStats(skillId: string) {
  const query = useQuery({
    queryKey: queryKeys.skills.tagStats(skillId),
    queryFn: () => getTagStatsForSkill(skillId),
    enabled: !!skillId,
  });
  return {
    tagStats: query.data ?? [],
    isLoading: query.isPending,
    error: query.error ? "Failed to load tag statistics" : null,
  };
}

export function useRecentTags(skillId: string) {
  const query = useQuery({
    queryKey: queryKeys.skills.recentTags(skillId),
    queryFn: () => getUniqueTagsForSkill(skillId),
    enabled: !!skillId,
  });
  return {
    recentTags: query.data ?? [],
    isLoading: query.isPending,
    error: query.error ? "Failed to load tag suggestions" : null,
  };
}

/** Minutes logged per day (YYYY-MM-DD) from 3 days ago to 7 days ahead, for the timeline. */
export function useSkillTimeByDate(skillId: string) {
  return useQuery({
    queryKey: queryKeys.skills.timeByDate(skillId),
    queryFn: () => getTimeLogsByDateForSkill(skillId, subDays(new Date(), 3), addDays(new Date(), 7)),
    enabled: !!skillId,
  });
}

/** Minutes logged per task. Optimistic "temp-" ids are ignored until they're saved. */
export function useTaskTimeTotals(skillId: string, taskIds: string[]) {
  const ids = useMemo(
    () => taskIds.filter((id) => !id.startsWith("temp-")).sort(),
    [taskIds]
  );
  return useQuery({
    queryKey: queryKeys.skills.taskTotals(skillId, ids),
    queryFn: () => getTotalTimeForTasks(ids),
    enabled: !!skillId && ids.length > 0,
    placeholderData: keepPreviousData,
  });
}

/**
 * Log time against a task. Optimistically bumps the task's total, then
 * refreshes everything that depends on time logs (this skill's data, the
 * dashboard list and analytics).
 */
export function useCreateTimeLog(skillId: string) {
  const queryClient = useQueryClient();
  const totalsPrefix = [...queryKeys.skills.detail(skillId), "taskTotals"] as const;

  return useMutation({
    mutationFn: async (input: NewTimeLog) => {
      const result = await createTimeLog(input);
      if (!result.success) throw new Error(result.error || "Failed to log time");
      return result.timeLog;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: totalsPrefix });
      const snapshots = queryClient.getQueriesData<Record<string, number>>({ queryKey: totalsPrefix });
      queryClient.setQueriesData<Record<string, number>>({ queryKey: totalsPrefix }, (old) =>
        old ? { ...old, [input.task_id]: (old[input.task_id] ?? 0) + input.minutes } : old
      );
      return { snapshots };
    },
    onError: (_err, _input, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.detail(skillId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

/** Call after task add/edit/delete so tag stats, task counts and totals refresh. */
export function useInvalidateSkill(skillId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.skills.detail(skillId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  };
}
