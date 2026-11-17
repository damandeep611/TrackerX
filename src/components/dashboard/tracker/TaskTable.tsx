"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, Reorder, useDragControls } from "motion/react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CornerDownLeft,
  CornerDownRight,
  GripVertical,
  ListChecks,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle, Well } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDuration } from "@/lib/duration";
import { duration, ease, spring } from "@/lib/motion";
import { formatShortDate } from "@/lib/tracker";
import { cn } from "@/lib/utils";
import type { TrackerDayActions, TrackerTask } from "@/types/tracker";
import { DurationField, InlineText } from "./fields";

/** Desktop columns: # / grip · check · task · estimate · actual · menu. */
const GRID =
  "sm:grid sm:grid-cols-[1.5rem_1.75rem_minmax(0,1fr)_5rem_5rem_1.75rem] sm:items-start sm:gap-x-1.5";

/**
 * The day's tasks, in your order. Edit any cell in place, drag the number
 * (or Alt+↑/↓) to reorder, tick to finish: finished rows stay where they are,
 * just quieter.
 */
export function TaskTable({
  tasks,
  readOnly,
  actions,
}: {
  tasks: TrackerTask[];
  readOnly?: boolean;
  actions: Pick<TrackerDayActions, "addTask" | "updateTask" | "deleteTask" | "reorderTasks">;
}) {
  const done = tasks.filter((t) => t.done).length;

  const move = (id: string, by: -1 | 1) => {
    const i = tasks.findIndex((t) => t.id === id);
    const j = i + by;
    if (i < 0 || j < 0 || j >= tasks.length) return;
    const ids = tasks.map((t) => t.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    actions.reorderTasks(ids);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <ListChecks />
          Tasks
        </CardTitle>
        {tasks.length > 0 && (
          <CardAction className="text-xs text-muted-foreground">
            <span className="tabular text-foreground">{done}</span>&nbsp;of&nbsp;<span className="tabular">{tasks.length}</span>&nbsp;done
          </CardAction>
        )}
      </CardHeader>

      <Well className="p-1.5 sm:p-2">
        {tasks.length > 0 && (
          <div
            aria-hidden
            className={cn(
              GRID,
              "hidden px-2 pt-1 pb-2 text-[11px] font-medium text-subtle-foreground sm:grid"
            )}
          >
            <span className="text-center">#</span>
            <span />
            <span>Task</span>
            <span className="pr-1.5 text-right">Estimate</span>
            <span className="pr-1.5 text-right">Actual</span>
            <span />
          </div>
        )}

        <Reorder.Group
          as="div"
          axis="y"
          values={tasks}
          onReorder={(next: TrackerTask[]) => actions.reorderTasks(next.map((t) => t.id))}
          className="space-y-px"
        >
          <AnimatePresence initial={false}>
            {tasks.map((task, i) => (
              <TaskRow
                key={task.id}
                task={task}
                index={i}
                count={tasks.length}
                readOnly={readOnly}
                onUpdate={(patch) => actions.updateTask(task.id, patch)}
                onDelete={() => actions.deleteTask(task.id)}
                onMove={(by) => move(task.id, by)}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {!readOnly && <AddTaskRow onAdd={actions.addTask} first={tasks.length === 0} />}
        {readOnly && tasks.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">No tasks were planned this day.</p>
        )}
      </Well>

      {!readOnly && tasks.length > 0 && (
        <p className="hidden px-3 pb-2 text-[11px] text-subtle-foreground sm:block">
          Click any cell to edit · drag the number or <kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd> to reorder ·
          times like <span className="tabular">45m</span>, <span className="tabular">1h 30m</span>,{" "}
          <span className="tabular">1:45</span>
        </p>
      )}
    </Card>
  );
}

function TaskRow({
  task,
  index,
  count,
  readOnly,
  onUpdate,
  onDelete,
  onMove,
}: {
  task: TrackerTask;
  index: number;
  count: number;
  readOnly?: boolean;
  onUpdate: (patch: Partial<TrackerTask>) => void;
  onDelete: () => void;
  onMove: (by: -1 | 1) => void;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);
  const over =
    task.estimateMinutes && task.actualMinutes ? task.actualMinutes - task.estimateMinutes : 0;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (readOnly || !e.altKey) return;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      onMove(e.key === "ArrowUp" ? -1 : 1);
      // Keep focus on the same field after the row moves.
      const el = e.target as HTMLElement;
      requestAnimationFrame(() => el.focus());
    }
  };

  return (
    <Reorder.Item
      as="div"
      value={task}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      onKeyDown={onKeyDown}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
      exit={{ opacity: 0, height: 0, transition: { duration: duration.fast } }}
      className={cn(
        "group relative rounded-lg px-2 py-2 transition-[background-color,box-shadow] duration-150",
        "hover:bg-card/70 focus-within:bg-card/70 dark:hover:bg-surface-3/40 dark:focus-within:bg-surface-3/40",
        dragging && "z-10 bg-card shadow-raised ring-1 ring-border-strong dark:bg-surface-3"
      )}
    >
      <div className={cn(GRID, "flex flex-wrap items-start gap-x-2 gap-y-1")}>
        {/* Number; becomes the drag handle on hover. */}
        <button
          type="button"
          tabIndex={-1}
          disabled={readOnly}
          onPointerDown={(e) => {
            if (readOnly) return;
            e.preventDefault();
            controls.start(e);
          }}
          aria-label={`Drag to reorder ${task.title}`}
          className={cn(
            "relative mt-1 hidden h-6 w-6 shrink-0 items-center justify-center rounded-md text-subtle-foreground sm:flex",
            !readOnly && "cursor-grab touch-none hover:bg-surface-3 active:cursor-grabbing"
          )}
        >
          <span
            className={cn(
              "tabular text-xs transition-opacity",
              !readOnly && "group-hover:opacity-0",
              task.done && "opacity-60"
            )}
          >
            {index + 1}
          </span>
          {!readOnly && (
            <GripVertical className="absolute size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </button>

        <DoneToggle
          done={task.done}
          disabled={readOnly}
          title={task.title}
          onToggle={() => onUpdate({ done: !task.done })}
        />

        {/* Task + explanation. */}
        <motion.div
          className="min-w-0 flex-1 pr-7 sm:pr-0"
          animate={{ opacity: task.done ? 0.55 : 1 }}
          transition={{ duration: duration.slow, ease: ease.out }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <InlineText
              value={task.title}
              onCommit={(title) => onUpdate({ title })}
              required
              readOnly={readOnly}
              maxLength={200}
              aria-label="Task"
              className={cn(
                "text-sm font-medium text-foreground",
                task.done && "text-muted-foreground"
              )}
            />
            {task.carriedFrom && (
              <span
                title={`Carried over from ${formatShortDate(task.carriedFrom)}`}
                className="hidden shrink-0 items-center gap-1 rounded-full bg-surface-3 px-1.5 py-px text-[11px] text-muted-foreground sm:inline-flex"
              >
                <CornerDownRight className="size-3" aria-hidden />
                {formatShortDate(task.carriedFrom).split(" ")[0]}
              </span>
            )}
          </div>
          <InlineText
            value={task.notes}
            onCommit={(notes) => onUpdate({ notes: notes || null })}
            multiline
            readOnly={readOnly}
            maxLength={1000}
            placeholder="Add details…"
            aria-label="Details"
            className={cn(
              "mt-0.5 text-[13px] leading-relaxed text-muted-foreground",
              !task.notes && "sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100",
              readOnly && !task.notes && "hidden"
            )}
          />
        </motion.div>

        {/* Times: right-aligned columns on desktop, a labelled line on phones. */}
        <div className="flex w-full items-center gap-1 pl-[1.625rem] text-xs text-subtle-foreground sm:contents">
          <span className="sm:hidden">Est.</span>
          <DurationField
            value={task.estimateMinutes}
            onCommit={(m) => onUpdate({ estimateMinutes: m })}
            readOnly={readOnly}
            aria-label={`Estimate for ${task.title}`}
            className={cn("mt-0.5 text-muted-foreground max-sm:w-16 max-sm:text-left", task.done && "opacity-60")}
          />
          <span className="ml-2 sm:hidden">Actual</span>
          <div className="mt-0.5 flex flex-col items-start sm:items-end">
            <DurationField
              value={task.actualMinutes}
              onCommit={(m) => onUpdate({ actualMinutes: m })}
              readOnly={readOnly}
              placeholder={readOnly ? "—" : "Add"}
              aria-label={`Actual time for ${task.title}`}
              className={cn(
                "max-sm:w-16 max-sm:text-left",
                task.actualMinutes ? "font-medium" : "",
                task.done && "opacity-60"
              )}
            />
            {over !== 0 && (
              <span className="tabular px-1.5 text-[11px] text-subtle-foreground sm:pl-0" title="Compared with the estimate">
                {over > 0 ? "+" : "−"}
                {formatDuration(Math.abs(over))}
              </span>
            )}
          </div>
        </div>

        {!readOnly && (
          <div className="absolute top-2 right-1.5 sm:static sm:mt-0.5">
            <RowMenu
              task={task}
              canUp={index > 0}
              canDown={index < count - 1}
              onToggle={() => onUpdate({ done: !task.done })}
              onMove={onMove}
              onDelete={onDelete}
            />
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}

/** Round check. Fills with a small spring; the row itself just dims. */
function DoneToggle({
  done,
  disabled,
  title,
  onToggle,
}: {
  done: boolean;
  disabled?: boolean;
  title: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? `Mark “${title}” as not done` : `Mark “${title}” as done`}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "relative mt-1 flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] outline-none transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-ring sm:mx-auto",
        done
          ? "border-success bg-success text-white"
          : "border-border-strong bg-transparent enabled:hover:border-success/70 enabled:hover:bg-success-soft",
        disabled && "cursor-default"
      )}
    >
      <AnimatePresence initial={false}>
        {done && (
          <motion.span
            key="check"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: spring }}
            exit={{ scale: 0.5, opacity: 0, transition: { duration: duration.fast } }}
            className="flex"
          >
            <Check className="size-3" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function RowMenu({
  task,
  canUp,
  canDown,
  onToggle,
  onMove,
  onDelete,
}: {
  task: TrackerTask;
  canUp: boolean;
  canDown: boolean;
  onToggle: () => void;
  onMove: (by: -1 | 1) => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label={`More actions for ${task.title}`}
          className="sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 data-[state=open]:opacity-100"
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={onToggle}>
          {task.done ? <RotateCcw /> : <Check />}
          {task.done ? "Mark as not done" : "Mark as done"}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canUp} onSelect={() => onMove(-1)}>
          <ArrowUp />
          Move up
          <DropdownMenuShortcut>Alt ↑</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canDown} onSelect={() => onMove(1)}>
          <ArrowDown />
          Move down
          <DropdownMenuShortcut>Alt ↓</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Last row: type a task, Tab to the estimate, Enter adds it and you keep typing. */
function AddTaskRow({
  onAdd,
  first,
}: {
  onAdd: TrackerDayActions["addTask"];
  first: boolean;
}) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [estimate, setEstimate] = useState<number | null>(null);
  // Enter in the estimate commits and submits in the same tick, so read the latest value from a ref.
  const estimateRef = useRef<number | null>(null);
  // Remount the estimate field after each add so its text clears.
  const [round, setRound] = useState(0);

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    onAdd({ title: t, estimateMinutes: estimateRef.current });
    setTitle("");
    setEstimate(null);
    estimateRef.current = null;
    setRound((r) => r + 1);
    titleRef.current?.focus();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={cn(
        GRID,
        "mt-1 flex items-center gap-2 rounded-lg border border-dashed border-border-strong/60 px-2 py-1.5 transition-colors",
        "focus-within:border-solid focus-within:border-border-strong focus-within:bg-card dark:focus-within:bg-surface-3/40"
      )}
    >
      <span className="hidden justify-center text-subtle-foreground sm:flex">
        <Plus className="size-3.5" aria-hidden />
      </span>
      <Plus className="size-4 shrink-0 text-subtle-foreground sm:hidden" aria-hidden />
      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && setTitle("")}
        maxLength={200}
        placeholder={first ? "What's the first thing today?" : "Add a task…"}
        aria-label="New task"
        className="h-7 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle-foreground sm:col-span-2"
      />
      <DurationField
        key={round}
        value={estimate}
        onCommit={(m) => {
          estimateRef.current = m;
          setEstimate(m);
        }}
        onEnter={submit}
        placeholder="Est."
        aria-label="Estimate for the new task"
        className="w-16 text-muted-foreground sm:w-[4.75rem]"
      />
      <span className="hidden sm:block" />
      <Button
        type="submit"
        size="icon-xs"
        variant="ghost"
        disabled={!title.trim()}
        aria-label="Add task"
        className="disabled:opacity-0"
      >
        <CornerDownLeft />
      </Button>
    </form>
  );
}
