"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { ChevronRight, ListTodo } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useDeleteTask, useTagSuggestions, useUpdateTask } from "@/hooks/useSkillPage";
import { formatDuration } from "@/lib/duration";
import { cn } from "@/lib/utils";
import type { SkillTask, SkillTaskPatch, TaskStatus } from "@/types/skillDashboardTypes";
import { STATUS_META, TaskRow } from "./TaskRow";
import { TaskEditDialog } from "./TaskEditDialog";

// Work-first order: what you're on, then what's next, then what's finished.
const SECTIONS: { status: TaskStatus; empty: string }[] = [
  { status: "in_progress", empty: "Nothing in progress. Press S on a task to start it." },
  { status: "todo", empty: "No open tasks." },
  { status: "done", empty: "" },
];

/** Tasks grouped by status. All open tasks are always visible (no date filter). */
export function TaskList({ skillId, tasks }: { skillId: string; tasks: SkillTask[] }) {
  const updateTask = useUpdateTask(skillId);
  const deleteTask = useDeleteTask(skillId);
  const { data: tagSuggestions } = useTagSuggestions(skillId);
  const [editing, setEditing] = useState<SkillTask | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SkillTask | null>(null);
  const [showDone, setShowDone] = useState(false);

  const fail = (err: Error) => toast.error(err.message || "Something went wrong");

  const setStatus = (task: SkillTask, status: TaskStatus) =>
    updateTask.mutate({ taskId: task.id, patch: { status } }, { onError: fail });

  const save = (task: SkillTask, patch: SkillTaskPatch) => {
    updateTask.mutate({ taskId: task.id, patch }, { onError: fail });
    setEditing(null);
  };

  const remove = (task: SkillTask) =>
    deleteTask.mutate(task.id, {
      onSuccess: () => toast.success("Task deleted"),
      onError: fail,
    });

  // Tasks with logged time need a confirm (their time goes too); empty ones go straight away.
  const requestDelete = (task: SkillTask) =>
    task.minutes > 0 ? setConfirmDelete(task) : remove(task);

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ListTodo />}
        title="No tasks yet"
        description="Add what you're working on above, then log time on it as you go."
      />
    );
  }

  const byStatus = (s: TaskStatus) => tasks.filter((t) => t.status === s);

  return (
    <div className="space-y-5">
      {SECTIONS.map(({ status, empty }) => {
        const list = byStatus(status);
        const meta = STATUS_META[status];
        const Icon = meta.icon;
        const isDone = status === "done";
        const collapsed = isDone && !showDone;
        if (isDone && list.length === 0) return null;
        const minutes = list.reduce((a, t) => a + t.minutes, 0);

        return (
          <section key={status} aria-label={meta.label}>
            <button
              type="button"
              disabled={!isDone}
              onClick={() => setShowDone((v) => !v)}
              aria-expanded={isDone ? !collapsed : undefined}
              className="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-muted-foreground enabled:hover:text-foreground"
            >
              {isDone && (
                <ChevronRight
                  className={cn("size-3.5 transition-transform", !collapsed && "rotate-90")}
                  aria-hidden
                />
              )}
              <Icon className={cn("size-3.5", meta.className)} aria-hidden />
              <span className="font-medium text-foreground">{meta.label}</span>
              <span className="tabular">{list.length}</span>
              {minutes > 0 && (
                <span className="tabular ml-auto text-subtle-foreground">{formatDuration(minutes)}</span>
              )}
            </button>
            {!collapsed &&
              (list.length === 0 ? (
                <p className="px-2 py-2 pl-9 text-xs text-subtle-foreground">{empty}</p>
              ) : (
                <div className="space-y-0.5">
                  <AnimatePresence initial={false} mode="popLayout">
                    {list.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        skillId={skillId}
                        onStatus={setStatus}
                        onEdit={setEditing}
                        onDelete={requestDelete}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ))}
          </section>
        );
      })}

      <p className="hidden px-2 text-[11px] text-subtle-foreground sm:block">
        Focus a task to use shortcuts: <kbd>S</kbd> next status · <kbd>X</kbd> done · <kbd>E</kbd> edit ·{" "}
        <kbd>Del</kbd> delete · <kbd>N</kbd> new task
      </p>

      {editing && (
        <TaskEditDialog
          key={editing.id}
          task={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => save(editing, patch)}
          recentTags={tagSuggestions?.recent}
          suggestedTags={tagSuggestions?.suggested}
        />
      )}

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this task?</DialogTitle>
            <DialogDescription>
              “{confirmDelete?.title}” and the {formatDuration(confirmDelete?.minutes ?? 0)} logged on
              it will be removed from this skill. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDelete) remove(confirmDelete);
                setConfirmDelete(null);
              }}
            >
              Delete task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
