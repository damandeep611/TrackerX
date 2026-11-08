"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addSkillTask,
  deleteSkillTask,
  getSkillTasks,
  updateSkillTask,
} from "@/actions/skillTaskAction";
import { getSkillInsights, getTagSuggestions } from "@/actions/skillInsightsAction";
import { createTimeLog, deleteTimeLog } from "@/actions/timeLogAction";
import { queryKeys } from "@/lib/query-keys";
import { localDateKey } from "@/lib/duration";
import type { NewSkillTask, SkillTask, SkillTaskPatch } from "@/types/skillDashboardTypes";

/**
 * Data + mutations for the skill page. Tasks live in React Query
 * (`queryKeys.skills.tasks`), each carrying its total minutes, so logging time
 * is an optimistic bump on the task and every widget stays in sync.
 */

const isTemp = (id: string) => id.startsWith("temp-");

export function useSkillTasks(skillId: string) {
  return useQuery({
    queryKey: queryKeys.skills.tasks(skillId),
    queryFn: () => getSkillTasks(skillId),
  });
}

export function useSkillInsights(skillId: string) {
  return useQuery({
    queryKey: queryKeys.skills.insights(skillId),
    queryFn: () => getSkillInsights(skillId),
  });
}

export function useTagSuggestions(skillId: string) {
  return useQuery({
    queryKey: queryKeys.skills.tagSuggestions(skillId),
    queryFn: () => getTagSuggestions(skillId),
    staleTime: 5 * 60 * 1000,
  });
}

/** Shared optimistic-update plumbing for the task list. */
function useTaskCache(skillId: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.skills.tasks(skillId);
  return {
    queryClient,
    key,
    async snapshot() {
      await queryClient.cancelQueries({ queryKey: key });
      return queryClient.getQueryData<SkillTask[]>(key);
    },
    set(update: (tasks: SkillTask[]) => SkillTask[]) {
      queryClient.setQueryData<SkillTask[]>(key, (old) => update(old ?? []));
    },
    restore(previous?: SkillTask[]) {
      if (previous) queryClient.setQueryData(key, previous);
    },
    /** Time changed: refresh this skill's insights, the dashboard and the skills list. */
    invalidateTime() {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.insights(skillId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  };
}

async function unwrap<T extends { success: boolean; error?: string }>(p: Promise<T>) {
  const r = await p;
  if (!r.success) throw new Error(r.error || "Something went wrong");
  return r as Extract<T, { success: true }>;
}

export function useAddTask(skillId: string) {
  const cache = useTaskCache(skillId);
  return useMutation({
    mutationFn: (input: Omit<NewSkillTask, "skillId">) =>
      unwrap(addSkillTask({ ...input, skillId })).then((r) => r.task),
    onMutate: async (input) => {
      const previous = await cache.snapshot();
      const now = new Date().toISOString();
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      cache.set((tasks) => [
        {
          id: tempId,
          skill_id: skillId,
          title: input.title,
          description: input.description ?? null,
          status: input.status ?? "todo",
          tags: input.tags ?? [],
          createdAt: now,
          updatedAt: now,
          minutes: 0,
        },
        ...tasks,
      ]);
      return { previous, tempId };
    },
    onSuccess: (task, _input, ctx) => {
      cache.set((tasks) => tasks.map((t) => (t.id === ctx?.tempId ? task : t)));
    },
    onError: (_err, _input, ctx) => cache.restore(ctx?.previous),
    onSettled: () => {
      cache.queryClient.invalidateQueries({ queryKey: queryKeys.skills.tagSuggestions(skillId) });
      cache.queryClient.invalidateQueries({ queryKey: queryKeys.skills.insights(skillId) });
    },
  });
}

export function useUpdateTask(skillId: string) {
  const cache = useTaskCache(skillId);
  return useMutation({
    mutationFn: ({ taskId, patch }: { taskId: string; patch: SkillTaskPatch }) =>
      unwrap(updateSkillTask(taskId, skillId, patch)),
    onMutate: async ({ taskId, patch }) => {
      const previous = await cache.snapshot();
      cache.set((tasks) =>
        tasks.map((t) =>
          t.id === taskId ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
        )
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => cache.restore(ctx?.previous),
    onSettled: (_d, _e, { patch }) => {
      if (patch.tags) {
        cache.queryClient.invalidateQueries({ queryKey: queryKeys.skills.tagSuggestions(skillId) });
      }
    },
  });
}

export function useDeleteTask(skillId: string) {
  const cache = useTaskCache(skillId);
  return useMutation({
    mutationFn: (taskId: string) => unwrap(deleteSkillTask(taskId, skillId)),
    onMutate: async (taskId) => {
      const previous = await cache.snapshot();
      cache.set((tasks) => tasks.filter((t) => t.id !== taskId));
      return { previous };
    },
    onError: (_err, _id, ctx) => cache.restore(ctx?.previous),
    onSettled: () => {
      cache.invalidateTime(); // the task's logged time is gone too
      cache.queryClient.invalidateQueries({ queryKey: queryKeys.skills.tagSuggestions(skillId) });
    },
  });
}

/** Log minutes on a task ("ended now", on the user's local date). Resolves to the entry id. */
export function useLogTime(skillId: string) {
  const cache = useTaskCache(skillId);
  const bump = (taskId: string, delta: number) =>
    cache.set((tasks) =>
      tasks.map((t) => (t.id === taskId ? { ...t, minutes: Math.max(t.minutes + delta, 0) } : t))
    );

  const log = useMutation({
    mutationFn: ({ taskId, minutes }: { taskId: string; minutes: number }) => {
      if (isTemp(taskId)) throw new Error("Task is still saving");
      return unwrap(
        createTimeLog({ task_id: taskId, skill_id: skillId, minutes, logged_date: localDateKey() })
      ).then((r) => r.id);
    },
    onMutate: async ({ taskId, minutes }) => {
      const previous = await cache.snapshot();
      bump(taskId, minutes);
      return { previous };
    },
    onError: (_err, _vars, ctx) => cache.restore(ctx?.previous),
    onSettled: () => cache.invalidateTime(),
  });

  const undo = useMutation({
    mutationFn: ({ entryId }: { entryId: string; taskId: string; minutes: number }) =>
      unwrap(deleteTimeLog(entryId)),
    onMutate: async ({ taskId, minutes }) => {
      const previous = await cache.snapshot();
      bump(taskId, -minutes);
      return { previous };
    },
    onError: (_err, _vars, ctx) => cache.restore(ctx?.previous),
    onSettled: () => cache.invalidateTime(),
  });

  return { log, undo };
}
