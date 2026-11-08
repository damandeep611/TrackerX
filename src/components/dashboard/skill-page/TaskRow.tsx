"use client";

import { type KeyboardEvent } from "react";
import { motion } from "motion/react";
import {
  ArrowRightLeft,
  Circle,
  CircleCheck,
  CircleDot,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDuration } from "@/lib/duration";
import { listItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SkillTask, TaskStatus } from "@/types/skillDashboardTypes";
import { LogTimeControl } from "./LogTimeControl";

export const STATUS_META: Record<
  TaskStatus,
  { label: string; icon: typeof Circle; className: string; next: TaskStatus }
> = {
  todo: { label: "To do", icon: Circle, className: "text-subtle-foreground", next: "in_progress" },
  in_progress: { label: "Doing", icon: CircleDot, className: "text-brand", next: "done" },
  done: { label: "Done", icon: CircleCheck, className: "text-success", next: "todo" },
};

/**
 * One task. Keyboard (when the row is focused): S = next status, X = done/undo,
 * E = edit, Delete = delete.
 */
export function TaskRow({
  task,
  skillId,
  onStatus,
  onEdit,
  onDelete,
}: {
  task: SkillTask;
  skillId: string;
  onStatus: (task: SkillTask, status: TaskStatus) => void;
  onEdit: (task: SkillTask) => void;
  onDelete: (task: SkillTask) => void;
}) {
  const meta = STATUS_META[task.status];
  const Icon = meta.icon;
  const pending = task.id.startsWith("temp-");
  const done = task.status === "done";

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || pending || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "s") onStatus(task, meta.next);
    else if (k === "x") onStatus(task, done ? "todo" : "done");
    else if (k === "e") onEdit(task);
    else if (k === "delete" || k === "backspace") onDelete(task);
    else return;
    e.preventDefault();
  };

  return (
    <motion.div
      layout="position"
      variants={listItem}
      initial="hidden"
      animate="show"
      exit="exit"
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label={`${task.title}, ${meta.label}`}
      className={cn(
        "group flex flex-col gap-2 rounded-xl border border-transparent px-2 py-2 outline-none transition-colors sm:flex-row sm:items-center sm:gap-3",
        "hover:border-border hover:bg-surface-2 focus-visible:border-border-strong focus-visible:bg-surface-2",
        pending && "opacity-60"
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              disabled={pending}
              onClick={() => onStatus(task, meta.next)}
              className={cn(
                "mt-px rounded-full p-0.5 transition-transform outline-none hover:scale-110 focus-visible:ring-[3px] focus-visible:ring-ring",
                meta.className
              )}
              aria-label={`${meta.label}. Mark as ${STATUS_META[meta.next].label.toLowerCase()}`}
            >
              <Icon className="size-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Mark as {STATUS_META[meta.next].label.toLowerCase()} <kbd className="ml-1 opacity-70">S</kbd>
          </TooltipContent>
        </Tooltip>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm text-foreground",
              done && "text-muted-foreground line-through decoration-border-strong"
            )}
          >
            {task.title}
          </p>
          {(task.description || task.tags.length > 0) && (
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
              {task.tags.map((t) => (
                <span
                  key={t}
                  className="shrink-0 rounded-full bg-surface-3 px-1.5 py-px text-[11px] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
              {task.description && (
                <span className="truncate text-xs text-subtle-foreground">{task.description}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pl-8 sm:justify-end sm:pl-0">
        <span
          className={cn(
            "tabular w-14 text-right text-xs",
            task.minutes ? "text-foreground" : "text-subtle-foreground"
          )}
          title="Time logged on this task"
        >
          {task.minutes ? formatDuration(task.minutes) : "—"}
        </span>
        {!done && (
          <LogTimeControl
            skillId={skillId}
            taskId={task.id}
            taskTitle={task.title}
            disabled={pending}
            className="sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-xs"
              variant="ghost"
              disabled={pending}
              aria-label={`More actions for ${task.title}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => onEdit(task)}>
              <Pencil />
              Edit
              <DropdownMenuShortcut>E</DropdownMenuShortcut>
            </DropdownMenuItem>
            {(Object.keys(STATUS_META) as TaskStatus[])
              .filter((s) => s !== task.status)
              .map((s) => (
                <DropdownMenuItem key={s} onSelect={() => onStatus(task, s)}>
                  <ArrowRightLeft />
                  Move to {STATUS_META[s].label}
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(task)}>
              <Trash2 />
              Delete
              <DropdownMenuShortcut>Del</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
