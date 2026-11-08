"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  addResource,
  createSandbox,
  deleteResource,
  deleteSandbox,
  deleteSandboxLog,
  getSandboxes,
  getSandboxLogs,
  getSandboxOverview,
  getSandboxResources,
  logSandboxSession,
  setMilestoneLabel,
  setResourceStatus,
} from "@/actions/sandboxActions";
import { localDateKey } from "@/lib/duration";
import { queryKeys } from "@/lib/query-keys";
import type {
  ResourceStatus,
  SandboxLog,
  SandboxOverview,
  SandboxResource,
  SandboxSummary,
} from "@/types/sandbox";

/**
 * Data + mutations for the sandbox pages. Keys live under
 * `queryKeys.sandboxes`; `detail(id)` refreshes everything for one sandbox.
 * Logging time is optimistic on the list, the overview and the session list.
 */

type List = Awaited<ReturnType<typeof getSandboxes>>;

const isTemp = (id: string) => id.startsWith("temp-");
const tempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function unwrap<T extends { success: boolean; error?: string }>(p: Promise<T>) {
  const r = await p;
  if (!r.success) throw new Error(r.error || "Something went wrong");
  return r as Extract<T, { success: true }>;
}

/* ---------------------------------- reads --------------------------------- */

export function useSandboxes() {
  return useQuery({ queryKey: queryKeys.sandboxes.list(), queryFn: () => getSandboxes() });
}

export function useSandboxOverview(id: string) {
  return useQuery({ queryKey: queryKeys.sandboxes.overview(id), queryFn: () => getSandboxOverview(id) });
}

export function useSandboxLogs(id: string) {
  return useQuery({ queryKey: queryKeys.sandboxes.logs(id), queryFn: () => getSandboxLogs(id) });
}

export function useSandboxResources(id: string) {
  return useQuery({ queryKey: queryKeys.sandboxes.resources(id), queryFn: () => getSandboxResources(id) });
}

/* --------------------------------- caches --------------------------------- */

type Snapshot = [readonly unknown[], unknown][];

/** Cancel + snapshot several queries so one rollback restores them all. */
async function snapshot(qc: QueryClient, keys: readonly (readonly unknown[])[]): Promise<Snapshot> {
  await Promise.all(keys.map((queryKey) => qc.cancelQueries({ queryKey })));
  return keys.map((k) => [k, qc.getQueryData(k)]);
}

function restore(qc: QueryClient, snap?: Snapshot) {
  snap?.forEach(([k, data]) => qc.setQueryData(k, data));
}

/** Add `delta` minutes to the sandbox's totals wherever they're cached. */
function bumpMinutes(qc: QueryClient, sandboxId: string, delta: number, date: string) {
  qc.setQueryData<List>(queryKeys.sandboxes.list(), (old) =>
    old && {
      ...old,
      sandboxes: old.sandboxes.map((s) => {
        if (s.id !== sandboxId) return s;
        const isToday = date === old.today;
        return {
          ...s,
          totalMinutes: Math.max(s.totalMinutes + delta, 0),
          minutes7d: isToday ? Math.max(s.minutes7d + delta, 0) : s.minutes7d,
          daily14: isToday
            ? [...s.daily14.slice(0, -1), Math.max((s.daily14.at(-1) ?? 0) + delta, 0)]
            : s.daily14,
          lastLogged: delta > 0 ? date : s.lastLogged,
        };
      }),
    }
  );
  qc.setQueryData<SandboxOverview | null>(queryKeys.sandboxes.overview(sandboxId), (old) =>
    old && {
      ...old,
      insights: { ...old.insights, totalMinutes: Math.max(old.insights.totalMinutes + delta, 0) },
    }
  );
}

/* ------------------------------- sandboxes -------------------------------- */

export function useCreateSandbox() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; targetHours: number }) =>
      unwrap(createSandbox(input)).then((r) => r.sandbox),
    onSuccess: (sandbox) =>
      qc.setQueryData<List>(queryKeys.sandboxes.list(), (old) =>
        old ? { ...old, sandboxes: [sandbox, ...old.sandboxes] } : old
      ),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.sandboxes.list() }),
  });
}

export function useDeleteSandbox() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrap(deleteSandbox(id)),
    onMutate: async (id) => {
      const snap = await snapshot(qc, [queryKeys.sandboxes.list()]);
      qc.setQueryData<List>(queryKeys.sandboxes.list(), (old) =>
        old && { ...old, sandboxes: old.sandboxes.filter((s) => s.id !== id) }
      );
      return { snap };
    },
    onError: (_e, _id, ctx) => restore(qc, ctx?.snap),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.sandboxes.list() }),
  });
}

/* -------------------------------- sessions -------------------------------- */

/** Log a session ending now on the local date. `log` resolves to the saved entry. */
export function useLogSandboxTime(sandboxId: string) {
  const qc = useQueryClient();
  const keys = [
    queryKeys.sandboxes.list(),
    queryKeys.sandboxes.overview(sandboxId),
    queryKeys.sandboxes.logs(sandboxId),
  ] as const;
  const settle = () => {
    qc.invalidateQueries({ queryKey: queryKeys.sandboxes.overview(sandboxId) });
    qc.invalidateQueries({ queryKey: queryKeys.sandboxes.list() });
  };

  const log = useMutation({
    mutationFn: (input: { minutes: number; title?: string | null; date: string }) =>
      unwrap(logSandboxSession({ sandboxId, ...input })).then((r) => r.log),
    onMutate: async ({ minutes, title, date }) => {
      const snap = await snapshot(qc, keys);
      const temp: SandboxLog = {
        id: tempId(),
        title: title?.trim() || null,
        minutes,
        date,
        createdAt: new Date().toISOString(),
      };
      bumpMinutes(qc, sandboxId, minutes, date);
      qc.setQueryData<SandboxLog[]>(queryKeys.sandboxes.logs(sandboxId), (old) => old && [temp, ...old]);
      return { snap, tempId: temp.id };
    },
    onSuccess: (saved, _v, ctx) =>
      qc.setQueryData<SandboxLog[]>(queryKeys.sandboxes.logs(sandboxId), (old) =>
        old?.map((l) => (l.id === ctx?.tempId ? saved : l))
      ),
    onError: (_e, _v, ctx) => restore(qc, ctx?.snap),
    onSettled: settle,
  });

  const remove = useMutation({
    mutationFn: (entry: SandboxLog) => {
      if (isTemp(entry.id)) throw new Error("Session is still saving");
      return unwrap(deleteSandboxLog(entry.id));
    },
    onMutate: async (entry) => {
      const snap = await snapshot(qc, keys);
      bumpMinutes(qc, sandboxId, -entry.minutes, entry.date);
      qc.setQueryData<SandboxLog[]>(queryKeys.sandboxes.logs(sandboxId), (old) =>
        old?.filter((l) => l.id !== entry.id)
      );
      return { snap };
    },
    onError: (_e, _v, ctx) => restore(qc, ctx?.snap),
    onSettled: () => {
      settle();
      qc.invalidateQueries({ queryKey: queryKeys.sandboxes.logs(sandboxId) });
    },
  });

  return { log, remove };
}

/** Convenience for "log N minutes, ended now". */
export const sessionNow = (minutes: number, title?: string | null) => ({
  minutes,
  title,
  date: localDateKey(),
});

/* ------------------------------- milestones ------------------------------- */

export function useSetMilestone(sandboxId: string) {
  const qc = useQueryClient();
  const key = queryKeys.sandboxes.overview(sandboxId);
  return useMutation({
    mutationFn: ({ hourMark, label }: { hourMark: number; label: string | null }) =>
      unwrap(setMilestoneLabel({ sandboxId, hourMark, label })),
    onMutate: async ({ hourMark, label }) => {
      const snap = await snapshot(qc, [key]);
      const name = label?.trim();
      qc.setQueryData<SandboxOverview | null>(key, (old) => {
        if (!old) return old;
        const rest = old.milestones.filter((m) => m.hourMark !== hourMark);
        const milestones = name ? [...rest, { hourMark, label: name }] : rest;
        return { ...old, milestones: milestones.sort((a, b) => a.hourMark - b.hourMark) };
      });
      return { snap };
    },
    onError: (_e, _v, ctx) => restore(qc, ctx?.snap),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

/* -------------------------------- resources ------------------------------- */

export function useResourceMutations(sandboxId: string) {
  const qc = useQueryClient();
  const key = queryKeys.sandboxes.resources(sandboxId);
  const set = (fn: (rs: SandboxResource[]) => SandboxResource[]) =>
    qc.setQueryData<SandboxResource[]>(key, (old) => fn(old ?? []));
  const settle = () => qc.invalidateQueries({ queryKey: key });

  const add = useMutation({
    mutationFn: (input: { title: string; url: string; resourceType: string; thumbnailUrl?: string }) =>
      unwrap(addResource(sandboxId, input)).then((r) => r.resource),
    onMutate: async (input) => {
      const snap = await snapshot(qc, [key]);
      const id = tempId();
      set((rs) => [
        {
          id,
          sandboxId,
          title: input.title,
          url: input.url,
          thumbnailUrl: input.thumbnailUrl || null,
          resourceType: input.resourceType,
          status: "unread",
          createdAt: new Date().toISOString(),
        },
        ...rs,
      ]);
      return { snap, id };
    },
    onSuccess: (saved, _v, ctx) => set((rs) => rs.map((r) => (r.id === ctx?.id ? saved : r))),
    onError: (_e, _v, ctx) => restore(qc, ctx?.snap),
    onSettled: settle,
  });

  const remove = useMutation({
    mutationFn: (id: string) => unwrap(deleteResource(id, sandboxId)),
    onMutate: async (id) => {
      const snap = await snapshot(qc, [key]);
      set((rs) => rs.filter((r) => r.id !== id));
      return { snap };
    },
    onError: (_e, _v, ctx) => restore(qc, ctx?.snap),
    onSettled: settle,
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ResourceStatus }) =>
      unwrap(setResourceStatus(id, sandboxId, status)),
    onMutate: async ({ id, status }) => {
      const snap = await snapshot(qc, [key]);
      set((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
      return { snap };
    },
    onError: (_e, _v, ctx) => restore(qc, ctx?.snap),
    onSettled: settle,
  });

  return { add, remove, setStatus, isTemp };
}

export type { SandboxSummary };
