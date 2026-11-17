"use client";

import { useState } from "react";
import { Clock, Info } from "lucide-react";
import { Card, CardAction, CardHeader, CardTitle, Well } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { SegmentedProgress } from "@/components/ui/metric";
import { formatDuration } from "@/lib/duration";
import { formatMaybe } from "@/lib/tracker";
import { MAX_AVAILABLE_MINUTES, type TrackerDaySummary } from "@/types/tracker";
import { DurationField } from "./fields";

const PRESETS = [4, 6, 8, 9, 10];

/**
 * "Your day": available time (a rough morning estimate, editable any time),
 * one progress bar (logged on top of planned), and three small numbers.
 */
export function DayCard({
  summary,
  isToday,
  readOnly,
  onAvailable,
}: {
  summary: TrackerDaySummary;
  isToday: boolean;
  readOnly?: boolean;
  onAvailable: (minutes: number | null) => void;
}) {
  const { availableMinutes: available, plannedMinutes: planned, actualMinutes: actual } = summary;
  // Past days without an available time fall back to the plan.
  const target = available ?? planned;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Clock />
          {isToday ? "Your day" : "The day"}
        </CardTitle>
        {available !== null && (
          <CardAction className="gap-0 text-xs text-muted-foreground">
            <span>Available</span>
            <DurationField
              value={available}
              onCommit={onAvailable}
              max={MAX_AVAILABLE_MINUTES}
              readOnly={readOnly}
              aria-label="Available time today"
              className="w-16 font-medium"
            />
          </CardAction>
        )}
      </CardHeader>

      {available === null && !readOnly ? (
        <AvailablePrompt onPick={onAvailable} />
      ) : (
        <Well className="space-y-3.5 py-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <DurationValue minutes={actual} />
              <span className="text-sm text-muted-foreground">
                {available ? `of ${formatDuration(available)}` : "logged"}
              </span>
            </div>
            {target > 0 && (
              <span className="tabular text-sm text-muted-foreground">
                {Math.min(Math.round((actual / target) * 100), 100)}%
              </span>
            )}
          </div>
          {/* Same segmented bar as the skill cards: logged time against available time. */}
          <SegmentedProgress
            value={actual}
            max={target || 1}
            segments={32}
            height={22}
            label="Time logged today"
          />
          <dl className="grid grid-cols-3 gap-2 border-t border-border/70 pt-3">
            <Stat label="Planned" value={formatMaybe(planned)} />
            <Stat label="Done" value={`${summary.done}/${summary.total}`} />
            <Stat
              label={available !== null && planned > available ? "Over plan" : "Unplanned"}
              value={available === null ? "—" : formatMaybe(Math.abs(available - planned), "0m")}
            />
          </dl>
        </Well>
      )}

      {available !== null && planned > available && (
        <p className="flex items-start gap-1.5 px-2.5 pb-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-px size-3.5 shrink-0" aria-hidden />
          {formatDuration(planned - available)} more planned than available. Whatever doesn&apos;t
          fit can move to tomorrow.
        </p>
      )}
    </Card>
  );
}

/** "4h 15m" as big mono numbers with small muted units, like MetricValue. */
function DurationValue({ minutes }: { minutes: number }) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  const parts: [number, string][] = h ? (m ? [[h, "h"], [m, "m"]] : [[h, "h"]]) : [[m, "m"]];
  return (
    <span className="flex items-baseline gap-1.5 text-foreground">
      {parts.map(([n, u]) => (
        <span key={u} className="flex items-baseline gap-0.5">
          <span className="tabular text-[28px] leading-none font-medium">{n}</span>
          <span className="text-sm text-muted-foreground">{u}</span>
        </span>
      ))}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-subtle-foreground">{label}</dt>
      <dd className="tabular truncate text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

/** Morning: no available time yet. One tap on a preset, or type it. */
function AvailablePrompt({ onPick }: { onPick: (minutes: number) => void }) {
  const [custom, setCustom] = useState<number | null>(null);
  return (
    <Well className="space-y-3 py-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">How much time do you have today?</p>
        <p className="text-xs text-muted-foreground">A rough guess is enough. You can change it later.</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {PRESETS.map((h) => (
          <Chip key={h} active={false} onClick={() => onPick(h * 60)}>
            <span className="tabular">{h}h</span>
          </Chip>
        ))}
        <DurationField
          value={custom}
          onCommit={(m) => {
            setCustom(m);
            if (m) onPick(m);
          }}
          max={MAX_AVAILABLE_MINUTES}
          placeholder="Other…"
          aria-label="Other amount of time"
          className="h-7 w-20 rounded-full border border-dashed border-border-strong text-center text-xs"
        />
      </div>
    </Well>
  );
}
