"use client";

import { useState } from "react";
import { History, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, Well } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useLogSandboxTime } from "@/hooks/useSandbox";
import { formatDuration } from "@/lib/duration";
import { daysBetween, formatDay, formatHours } from "@/lib/insights";
import type { SandboxLog } from "@/types/sandbox";

function dayLabel(date: string, today: string) {
  const d = daysBetween(date, today);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return formatDay(date, today);
}

/** Recent sessions grouped by day, with a per-day total. */
export function SessionList({
  sandboxId,
  logs,
  today,
}: {
  sandboxId: string;
  logs: SandboxLog[];
  today: string;
}) {
  const { remove } = useLogSandboxTime(sandboxId);
  const [confirm, setConfirm] = useState<SandboxLog | null>(null);

  if (logs.length === 0) {
    return (
      <EmptyState
        compact
        icon={<History />}
        title="No sessions yet"
        description="Use the quick-log chips above after you finish a block of work."
      />
    );
  }

  const days: { date: string; logs: SandboxLog[]; minutes: number }[] = [];
  for (const log of logs) {
    const last = days.at(-1);
    if (last?.date === log.date) {
      last.logs.push(log);
      last.minutes += log.minutes;
    } else days.push({ date: log.date, logs: [log], minutes: log.minutes });
  }

  const onDelete = () => {
    if (!confirm) return;
    remove.mutate(confirm, {
      onSuccess: () => toast.success("Session deleted"),
      onError: (e) => toast.error(e.message || "Couldn't delete the session"),
    });
    setConfirm(null);
  };

  return (
    <>
      <div className="space-y-3">
        <Card>
          <Well className="divide-y divide-border/60 p-1.5">
            {days.map((d) => (
              <section key={d.date} aria-label={dayLabel(d.date, today)} className="py-1.5 first:pt-0 last:pb-0">
                <h3 className="flex items-center justify-between px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">
                  {dayLabel(d.date, today)}
                  <span className="tabular font-normal">{formatHours(d.minutes)}</span>
                </h3>
                <ul>
                  {d.logs.map((log) => (
                    <li
                      key={log.id}
                      className="group flex min-h-10 items-center gap-3 rounded-lg px-2.5 py-1.5 hover:bg-surface-3"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {log.title ?? <span className="text-subtle-foreground">Untitled session</span>}
                      </span>
                      <span className="tabular shrink-0 text-sm text-muted-foreground">
                        {formatDuration(log.minutes)}
                      </span>
                      <Button
                        size="icon-xs"
                        variant="destructive-ghost"
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                        disabled={log.id.startsWith("temp-")}
                        onClick={() => setConfirm(log)}
                        aria-label={`Delete session ${log.title ?? ""} (${formatDuration(log.minutes)})`}
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </Well>
        </Card>
        {logs.length >= 100 && (
          <p className="text-center text-xs text-subtle-foreground">Showing the latest 100 sessions.</p>
        )}
      </div>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this session?</DialogTitle>
            <DialogDescription>
              {confirm && (
                <>
                  {formatDuration(confirm.minutes)}
                  {confirm.title ? ` of “${confirm.title}”` : ""} on {dayLabel(confirm.date, today).toLowerCase()}{" "}
                  is removed from the total.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
