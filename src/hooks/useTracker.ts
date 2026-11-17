"use client";

import { useRef } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  addTomorrowItem,
  addTrackerTask,
  deleteTrackerTask,
  dismissCarryIn,
  getTrackerDay,
  getTrackerHistory,
  importCarryIn,
  removeTomorrowItem,
  reorderTrackerTasks,
  updateTomorrowItem,
  updateTrackerDay,
  updateTrackerTask,
} from "@/actions/trackerActions";
import { undoToast } from "@/components/ui/undo-toast";
import { queryKeys } from "@/lib/query-keys";
import type {
  TomorrowItem,
  TrackerDayActions,
  TrackerDayData,
  TrackerTask,
  TrackerTaskPatch,
} from "@/types/tracker";

/**
 * Data + mutations for /dashboard/tracker. Every change is optimistic on the
 * day's cache (`queryKeys.tracker.day(date)`); the day refetches once the last
 * pending change settles, and History is marked stale.
 */

const isTemp = (id: string) => id.startsWith("temp-");
const tempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function unwrap<T extends { success: boolean; error?: string }>(p: Promise<T>) {
  const r = await p;
  if (!r.success) throw new Error(r.error || "Something went wrong");
  return r as Extract<T, { success: true }>;
}

/* ---------------------------------- reads --------------------------------- */

export function useTrackerDay(date: string) {
  // Keep showing the previous day while the next one loads (the view goes read-only meanwhile).
  return useQuery({
    queryKey: queryKeys.tracker.day(date),
    queryFn: () => getTrackerDay(date),
    placeholderData: keepPreviousData,
  });
}

export function useTrackerHistory(enabled = true) {
  return useQuery({ queryKey: queryKeys.tracker.history(), queryFn: () => getTrackerHistory(), enabled });
}

/* -------------------------------- mutations ------------------------------- */

/** One optimistic change: how it looks in the cache, and the server call. */
interface Op {
  apply?: (d: TrackerDayData) => TrackerDayData;
  run: () => Promise<unknown>;
  onSuccess?: (result: unknown) => void;
}

const TASK_FIELDS = ["title", "notes", "estimateMinutes", "actualMinutes", "done", "carry"] as const;

type NewTask = Omit<TrackerTask, "id"> & { index?: number };

const mapDay = (fn: (day: TrackerDayData["day"]) => TrackerDayData["day"]) => (d: TrackerDayData) => ({
  ...d,
  day: fn(d.day),
});

/** Everything the Today view can change, for one date. */
export function useTrackerActions(date: string): TrackerDayActions {
  const qc = useQueryClient();
  const key = queryKeys.tracker.day(date);
  const mutationKey = [...key, "mutate"];
  const reorderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { mutate } = useMutation({
    mutationKey,
    mutationFn: (op: Op) => op.run(),
    onMutate: async (op) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<TrackerDayData>(key);
      if (prev && op.apply) qc.setQueryData(key, op.apply(prev));
      return { prev };
    },
    onError: (err, _op, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      toast.error(err.message || "Couldn't save that change");
    },
    onSuccess: (result, op) => op.onSuccess?.(result),
    onSettled: () => {
      // Refetch only when nothing else is in flight, so a refetch can't undo a pending optimistic change.
      if (qc.isMutating({ mutationKey }) <= 1) qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: queryKeys.tracker.history(), refetchType: "none" });
    },
  });

  const current = () => qc.getQueryData<TrackerDayData>(key);

  /** Swap a temp id for the saved row, then send any edits made while it was saving. */
  const settleTask = (temp: string, saved: TrackerTask) => {
    const local = current()?.day.tasks.find((t) => t.id === temp);
    qc.setQueryData<TrackerDayData>(key, (d) =>
      d && mapDay((day) => ({ ...day, tasks: day.tasks.map((t) => (t.id === temp ? { ...t, id: saved.id } : t)) }))(d)
    );
    if (!local) return;
    const patch: TrackerTaskPatch = {};
    for (const f of TASK_FIELDS) {
      if (local[f] !== saved[f]) (patch as Record<string, unknown>)[f] = local[f];
    }
    if (Object.keys(patch).length > 0) updateTask(saved.id, patch);
  };

  const insertTask = (input: NewTask) => {
    const id = tempId();
    const { index, ...fields } = input;
    mutate({
      apply: mapDay((day) => {
        const tasks = [...day.tasks];
        tasks.splice(index ?? tasks.length, 0, { id, ...fields });
        return { ...day, tasks };
      }),
      run: () => unwrap(addTrackerTask({ date, ...fields, index })).then((r) => r.task),
      onSuccess: (task) => settleTask(id, task as TrackerTask),
    });
  };

  const updateTask = (id: string, patch: TrackerTaskPatch) =>
    mutate({
      apply: mapDay((day) => ({ ...day, tasks: day.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      // Edits to a task that's still saving are sent by settleTask.
      run: () => (isTemp(id) ? Promise.resolve() : unwrap(updateTrackerTask({ taskId: id, patch }))),
    });

  const settleTomorrow = (temp: string, saved: TomorrowItem) =>
    qc.setQueryData<TrackerDayData>(key, (d) =>
      d && mapDay((day) => ({ ...day, tomorrow: day.tomorrow.map((t) => (t.id === temp ? { ...t, id: saved.id } : t)) }))(d)
    );

  return {
    updateDay: (patch) =>
      mutate({
        apply: mapDay((day) => ({ ...day, ...patch })),
        run: () => unwrap(updateTrackerDay({ date, patch })),
      }),

    addTask: ({ title, estimateMinutes }) =>
      insertTask({
        title,
        notes: null,
        estimateMinutes,
        actualMinutes: null,
        done: false,
        carry: true,
        carriedFrom: null,
      }),

    updateTask,

    deleteTask: (id) => {
      const tasks = current()?.day.tasks ?? [];
      const index = tasks.findIndex((t) => t.id === id);
      const task = tasks[index];
      if (!task) return;
      mutate({
        apply: mapDay((day) => ({ ...day, tasks: day.tasks.filter((t) => t.id !== id) })),
        run: () => (isTemp(id) ? Promise.resolve() : unwrap(deleteTrackerTask(id))),
        onSuccess: () =>
          undoToast(`Deleted “${task.title}”`, () => {
            const { id: _drop, ...fields } = task;
            void _drop;
            insertTask({ ...fields, index });
          }),
      });
    },

    reorderTasks: (orderedIds) => {
      // Instant in the cache (called on every drag frame); saved once the drag settles.
      qc.setQueryData<TrackerDayData>(key, (d) =>
        d &&
        mapDay((day) => ({
          ...day,
          tasks: orderedIds
            .map((id) => day.tasks.find((t) => t.id === id))
            .filter((t): t is TrackerTask => !!t),
        }))(d)
      );
      if (reorderTimer.current) clearTimeout(reorderTimer.current);
      reorderTimer.current = setTimeout(() => {
        const ids = (current()?.day.tasks ?? []).map((t) => t.id).filter((id) => !isTemp(id));
        mutate({ run: () => unwrap(reorderTrackerTasks({ date, orderedIds: ids })) });
      }, 500);
    },

    addTomorrow: ({ title, estimateMinutes }) => {
      const id = tempId();
      mutate({
        apply: mapDay((day) => ({ ...day, tomorrow: [...day.tomorrow, { id, title, estimateMinutes }] })),
        run: () => unwrap(addTomorrowItem({ date, title, estimateMinutes })).then((r) => r.item),
        onSuccess: (item) => settleTomorrow(id, item as TomorrowItem),
      });
    },

    updateTomorrow: (id, patch) =>
      mutate({
        apply: mapDay((day) => ({ ...day, tomorrow: day.tomorrow.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
        run: () => (isTemp(id) ? Promise.resolve() : unwrap(updateTomorrowItem({ id, patch }))),
      }),

    removeTomorrow: (id) =>
      mutate({
        apply: mapDay((day) => ({ ...day, tomorrow: day.tomorrow.filter((t) => t.id !== id) })),
        run: () => (isTemp(id) ? Promise.resolve() : unwrap(removeTomorrowItem(id))),
      }),

    importCarryIn: () =>
      mutate({
        // The server merges and dedupes; the refetch right after shows the result.
        apply: (d) => ({ ...d, carryIn: null }),
        run: () =>
          unwrap(importCarryIn({ date })).then((r) => {
            if (r.added > 0) toast.success(`Added ${r.added} task${r.added === 1 ? "" : "s"}`);
          }),
      }),

    dismissCarryIn: () =>
      mutate({
        apply: (d) => ({ ...d, carryIn: null }),
        run: () => unwrap(dismissCarryIn({ date })),
      }),
  };
}
