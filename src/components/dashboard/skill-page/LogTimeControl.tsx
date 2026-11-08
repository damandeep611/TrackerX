"use client";

import { useState, type KeyboardEvent } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { undoToast } from "@/components/ui/undo-toast";
import { useLogTime } from "@/hooks/useSkillPage";
import { formatDuration, parseDuration } from "@/lib/duration";
import { cn } from "@/lib/utils";
import { MAX_ENTRY_MINUTES } from "@/types/skillDashboardTypes";

const QUICK = [15, 30, 60];

/**
 * One-tap time logging on a task: +15m / +30m / +1h, or a custom amount
 * ("1h 30m"). Logged as ending now, with an Undo toast instead of a confirm.
 * One entry is capped at 3h; more shows a warning instead of failing silently.
 */
export function LogTimeControl({
  skillId,
  taskId,
  taskTitle,
  disabled,
  className,
}: {
  skillId: string;
  taskId: string;
  taskTitle: string;
  disabled?: boolean;
  className?: string;
}) {
  const { log, undo } = useLogTime(skillId);
  const [custom, setCustom] = useState<string | null>(null);

  const parsed = custom === null ? null : parseDuration(custom);
  const tooLong = parsed !== null && parsed > MAX_ENTRY_MINUTES;
  const invalid = custom !== null && custom.trim() !== "" && parsed === null;

  const submit = (minutes: number) => {
    if (minutes > MAX_ENTRY_MINUTES) return;
    log.mutate(
      { taskId, minutes },
      {
        onSuccess: (entryId) =>
          undoToast(`Logged ${formatDuration(minutes)} on “${truncate(taskTitle)}”`, () =>
            undo.mutate(
              { entryId, taskId, minutes },
              { onError: () => toast.error("Couldn't undo that entry") }
            )
          ),
        onError: (e) => toast.error(e.message || "Couldn't log time"),
      }
    );
    setCustom(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation(); // don't trigger row shortcuts
    if (e.key === "Enter" && parsed !== null && !tooLong) submit(parsed);
    if (e.key === "Escape") setCustom(null);
  };

  if (custom !== null) {
    return (
      <div className={cn("relative flex items-center gap-1.5", className)}>
        <input
          autoFocus
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => !custom.trim() && setCustom(null)}
          placeholder="1h 30m"
          aria-label="Time to log"
          aria-invalid={tooLong || invalid}
          className="tabular h-7 w-24 rounded-md border border-input bg-card px-2 text-xs outline-none focus:border-border-strong focus:ring-[3px] focus:ring-ring/40 aria-invalid:border-danger"
        />
        <Button
          size="xs"
          variant="secondary"
          disabled={parsed === null || tooLong}
          onClick={() => parsed !== null && submit(parsed)}
        >
          Log{parsed !== null && !tooLong ? ` ${formatDuration(parsed)}` : ""}
        </Button>
        <Button size="xs" variant="ghost" onClick={() => setCustom(null)}>
          Cancel
        </Button>
        {(tooLong || invalid) && (
          <p
            role="alert"
            className="absolute top-full right-0 z-10 mt-1 flex w-max items-center gap-1 rounded-md bg-warning-soft px-2 py-1 text-xs text-warning"
          >
            <AlertTriangle className="size-3" aria-hidden />
            {tooLong ? "Max 3h per entry; split longer sessions" : "Try “45m”, “1h 30m” or “1:30”"}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {QUICK.map((m) => (
        <Button
          key={m}
          size="xs"
          variant="secondary"
          disabled={disabled}
          onClick={() => submit(m)}
          className="tabular px-2"
          aria-label={`Log ${formatDuration(m)} on ${taskTitle}`}
        >
          +{formatDuration(m)}
        </Button>
      ))}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-xs"
            variant="ghost"
            disabled={disabled}
            onClick={() => setCustom("")}
            aria-label={`Log a custom amount on ${taskTitle}`}
          >
            <Clock />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Custom amount (max 3h)</TooltipContent>
      </Tooltip>
    </div>
  );
}

const truncate = (s: string, n = 32) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
