"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addGoal, deleteGoal, getGoalBySlug, getGoals } from "@/actions/goalActions";
import { addGoalLog, deleteGoalLog, getGoalLogs } from "@/actions/goalLogActions";
import { queryKeys } from "@/lib/query-keys";

export type Goal = Awaited<ReturnType<typeof getGoals>>[number];
export type GoalLog = Awaited<ReturnType<typeof getGoalLogs>>[number];

export function useGoals() {
  return useQuery({ queryKey: queryKeys.goals.list(), queryFn: () => getGoals() });
}

export function useGoal(slug: string) {
  return useQuery({
    queryKey: queryKeys.goals.detail(slug),
    queryFn: () => getGoalBySlug(slug),
    enabled: !!slug,
  });
}

export function useGoalLogs(goalId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.goals.logs(goalId ?? ""),
    queryFn: () => getGoalLogs(goalId!),
    enabled: !!goalId,
  });
}

export function useAddGoal() {
  const queryClient = useQueryClient();
  const key = queryKeys.goals.list();
  return useMutation({
    mutationFn: addGoal,
    onMutate: async (input: { title: string; slug?: string }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Goal[]>(key);
      const now = new Date().toISOString();
      const optimistic: Goal = {
        id: `temp-${Date.now()}`,
        title: input.title,
        slug: input.slug ?? "",
        userId: "",
        createdAt: now,
        updatedAt: now,
        startDate: undefined,
        completedDate: undefined,
      };
      queryClient.setQueryData<Goal[]>(key, (old) => [optimistic, ...(old ?? [])]);
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  const key = queryKeys.goals.list();
  return useMutation({
    mutationFn: deleteGoal,
    onMutate: async (goalId: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Goal[]>(key);
      queryClient.setQueryData<Goal[]>(key, (old) => old?.filter((g) => g.id !== goalId));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSettled: (_data, _err, goalId) => {
      queryClient.removeQueries({ queryKey: queryKeys.goals.logs(goalId) });
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

export function useAddGoalLog(goalId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.goals.logs(goalId);
  return useMutation({
    mutationFn: (input: { title: string; startTime: Date; endTime: Date }) =>
      addGoalLog({ goalId, ...input }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<GoalLog[]>(key);
      const optimistic: GoalLog = {
        id: `temp-${Date.now()}`,
        goalId,
        userId: "",
        title: input.title,
        startTime: input.startTime.toISOString(),
        endTime: input.endTime.toISOString(),
        durationMinutes: Math.round((input.endTime.getTime() - input.startTime.getTime()) / 60000),
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<GoalLog[]>(key, (old) => [optimistic, ...(old ?? [])]);
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteGoalLog(goalId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.goals.logs(goalId);
  return useMutation({
    mutationFn: deleteGoalLog,
    onMutate: async (logId: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<GoalLog[]>(key);
      queryClient.setQueryData<GoalLog[]>(key, (old) => old?.filter((l) => l.id !== logId));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
