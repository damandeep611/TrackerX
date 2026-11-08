"use client";

import { useState, type KeyboardEvent, type Ref } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { undoToast } from "@/components/ui/undo-toast";
import { sessionNow, useLogSandboxTime } from "@/hooks/useSandbox";
import { formatDuration, parseDuration } from "@/lib/duration";
import { cn } from "@/lib/utils";
import { MAX_ENTRY_MINUTES } from "@/types/skillDashboardTypes";

/** One-tap amounts (owner decision: no timer, log after the fact). */
export const QUICK_MINUTES = [25, 50, 60, 120];

/** Log `minutes` ending now, then offer Undo. Shared by the chips and the custom field. */
function useQuickLog(sandboxId: string, sandboxName: string) {
  const { log, remove } = useLogSandboxTime(sandboxId);
  return {
    pending: log.isPending,
    submit(minutes: number, title?: string | null) {
      if (minutes > MAX_ENTRY_MINUTES) return;
      log.mutate(sessionNow(minutes, title), {
        onSuccess: (entry) =>
          undoToast(`Logged ${formatDuration(minutes)} on “${truncate(sandboxName)}”`, () =>
            remove.mutate(entry, { onError: () => toast.error("Couldn't undo that session") })
          ),
        onError: (e) => toast.error(e.message || "Couldn't log the session"),
      });
    },
  };
}

/** Compact chips for the sandbox card. */
export function QuickLogChips({
  sandboxId,
  sandboxName,
  className,
}: {
  sandboxId: string;
  sandboxName: string;
  className?: string;
}) {
  const { submit } = useQuickLog(sandboxId, sandboxName);
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {QUICK_MINUTES.map((m) => (
        <Button
          key={m}
          size="xs"
          variant="secondary"
          className="tabular px-2"
          onClick={() => submit(m)}
          aria-label={`Log ${formatDuration(m)} on ${sandboxName}`}
        >
          +{formatDuration(m)}
        </Button>
      ))}
    </div>
  );
}

/**
 * The detail page's log panel: optional title (remembers the last one), quick
 * chips and a custom amount ("1h 30m", "90", "1:30"), all ending now on the
 * local date. Max 3h per entry, with a warning instead of a silent failure.
 */
export function QuickLogPanel({
  sandboxId,
  sandboxName,
  lastTitle,
  durationRef,
}: {
  sandboxId: string;
  sandboxName: string;
  lastTitle: string | null;
  /** The custom-duration field, focused by the L shortcut. */
  durationRef?: Ref<HTMLInputElement>;
}) {
  const { submit } = useQuickLog(sandboxId, sandboxName);
  const [title, setTitle] = useState(lastTitle ?? "");
  const [custom, setCustom] = useState("");

  const parsed = parseDuration(custom);
  const tooLong = parsed !== null && parsed > MAX_ENTRY_MINUTES;
  const invalid = custom.trim() !== "" && parsed === null;
  const canLog = parsed !== null && !tooLong;

  const logCustom = () => {
    if (!canLog) return;
    submit(parsed, title);
    setCustom("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      logCustom();
    }
    if (e.key === "Escape") (e.target as HTMLInputElement).blur();
  };

  return (
    <div className="space-y-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && e.currentTarget.blur()}
        placeholder="What did you work on? (optional)"
        aria-label="Session title"
        maxLength={200}
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {QUICK_MINUTES.map((m) => (
          <Button
            key={m}
            size="sm"
            variant="outline"
            className="tabular min-w-14"
            onClick={() => submit(m, title)}
          >
            +{formatDuration(m)}
          </Button>
        ))}
      </div>

      <div className="relative flex items-center gap-1.5">
        <Input
          ref={durationRef}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Custom, e.g. 1h 30m"
          aria-label="Custom duration"
          aria-invalid={tooLong || invalid}
          aria-describedby={tooLong || invalid ? "sandbox-duration-hint" : undefined}
          className="tabular h-8 flex-1"
        />
        <Button size="sm" variant="brand" disabled={!canLog} onClick={logCustom}>
          Log{canLog ? ` ${formatDuration(parsed)}` : ""}
        </Button>
      </div>
      {tooLong || invalid ? (
        <p
          id="sandbox-duration-hint"
          role="alert"
          className="flex items-center gap-1.5 rounded-md bg-warning-soft px-2 py-1.5 text-xs text-warning"
        >
          <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
          {tooLong ? "Max 3h per entry; split longer sessions" : "Try “45m”, “1h 30m” or “1:30”"}
        </p>
      ) : (
        <p className="text-xs text-subtle-foreground">
          Ends now, on today&apos;s date. Press <Kbd>L</Kbd> to jump here.
        </p>
      )}
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-surface-2 px-1 font-mono text-[11px] text-muted-foreground">
      {children}
    </kbd>
  );
}

const truncate = (s: string, n = 32) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
