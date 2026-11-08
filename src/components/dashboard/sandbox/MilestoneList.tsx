"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle, Flag, Pencil } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card, CardAction, CardHeader, CardTitle, Well } from "@/components/ui/card";
import { useSetMilestone } from "@/hooks/useSandbox";
import { etaAtPace, formatDay, formatHours } from "@/lib/insights";
import type { Marker } from "@/lib/milestones";
import { cn } from "@/lib/utils";

/**
 * Every dial marker as a row: reached / next / ahead, with an ETA at the
 * recent pace. Click a row (or its marker on the dial) to name it inline;
 * Enter saves, Escape cancels, an empty name clears it.
 */
export function MilestoneList({
  sandboxId,
  markers,
  totalMinutes,
  weeklyMinutes,
  today,
  editing,
  onEditingChange,
}: {
  sandboxId: string;
  markers: Marker[];
  totalMinutes: number;
  weeklyMinutes: number;
  today: string;
  editing: number | null;
  onEditingChange: (hourMark: number | null) => void;
}) {
  const reached = markers.filter((m) => m.reached).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Flag />
          Milestones
        </CardTitle>
        <CardAction>
          <span className="tabular text-xs text-muted-foreground">
            {reached} / {markers.length} reached
          </span>
        </CardAction>
      </CardHeader>
      <Well className="max-h-80 overflow-y-auto p-1.5">
        {markers.length === 0 ? (
          <p className="px-2.5 py-4 text-center text-sm text-muted-foreground">
            Markers appear every 20h once the target is at least 20h.
          </p>
        ) : (
          <ol className="space-y-0.5">
            {markers.map((m) => (
              <MilestoneRow
                key={m.hourMark}
                sandboxId={sandboxId}
                marker={m}
                eta={
                  m.reached ? null : etaAtPace(today, m.hourMark * 60 - totalMinutes, weeklyMinutes)
                }
                remaining={m.hourMark * 60 - totalMinutes}
                today={today}
                editing={editing === m.hourMark}
                onEdit={(on) => onEditingChange(on ? m.hourMark : null)}
              />
            ))}
          </ol>
        )}
      </Well>
    </Card>
  );
}

function MilestoneRow({
  sandboxId,
  marker,
  eta,
  remaining,
  today,
  editing,
  onEdit,
}: {
  sandboxId: string;
  marker: Marker;
  eta: string | null;
  remaining: number;
  today: string;
  editing: boolean;
  onEdit: (on: boolean) => void;
}) {
  const setMilestone = useSetMilestone(sandboxId);
  const rowRef = useRef<HTMLLIElement>(null);

  // Selected from the dial: bring the row into view.
  useEffect(() => {
    if (editing) rowRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [editing]);

  const save = (value: string) => {
    onEdit(false);
    const label = value.trim() || null;
    if (label === marker.label) return;
    setMilestone.mutate(
      { hourMark: marker.hourMark, label },
      { onError: () => toast.error("Couldn't save the milestone name") }
    );
  };

  const Icon = marker.reached ? CheckCircle2 : Circle;

  return (
    <li
      ref={rowRef}
      className={cn(
        "group flex min-h-10 items-center gap-3 rounded-lg px-2.5 py-1.5",
        marker.next && "bg-card shadow-panel",
        !editing && "hover:bg-surface-3"
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          marker.reached ? "text-brand" : marker.next ? "text-brand" : "text-subtle-foreground"
        )}
        aria-hidden
      />
      <span className="tabular w-12 shrink-0 text-sm text-foreground">{marker.hourMark}h</span>

      {editing ? (
        <NameInput initial={marker.label ?? ""} onSave={save} onCancel={() => onEdit(false)} />
      ) : (
        <button
          type="button"
          onClick={() => onEdit(true)}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-sm text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          aria-label={`Name the ${marker.hourMark}h milestone${marker.label ? ` (now “${marker.label}”)` : ""}`}
        >
          <span className={cn("truncate", marker.label ? "text-foreground" : "text-subtle-foreground")}>
            {marker.label ?? "Name this milestone"}
          </span>
          <Pencil className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      )}

      {!editing && (
        <span className="tabular shrink-0 text-xs text-muted-foreground">
          {marker.reached ? (
            "Reached"
          ) : marker.next ? (
            <>
              {formatHours(remaining)} to go
              {eta && <span className="hidden sm:inline"> · {formatDay(eta, today)}</span>}
            </>
          ) : (
            eta && <span className="hidden sm:inline">~{formatDay(eta, today)}</span>
          )}
        </span>
      )}
    </li>
  );
}

function NameInput({
  initial,
  onSave,
  onCancel,
}: {
  initial: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const done = useRef(false);
  const finish = (fn: () => void) => {
    if (done.current) return;
    done.current = true;
    fn();
  };

  return (
    <input
      autoFocus
      value={value}
      maxLength={80}
      onChange={(e) => setValue(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={(e) => {
        if (e.key === "Enter") finish(() => onSave(value));
        if (e.key === "Escape") finish(onCancel);
      }}
      onBlur={() => finish(() => onSave(value))}
      placeholder="e.g. First working prototype"
      aria-label="Milestone name"
      className="h-7 min-w-0 flex-1 rounded-md border border-input bg-card px-2 text-sm outline-none focus:border-brand/60 focus:ring-[3px] focus:ring-ring"
    />
  );
}
