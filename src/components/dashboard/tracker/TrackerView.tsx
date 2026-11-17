"use client";

import { useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Lock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatLongDate, relativeDayLabel, shiftDate, summarizeDay } from "@/lib/tracker";
import type { TrackerCarryIn, TrackerDay, TrackerDayActions, TrackerDaySummary } from "@/types/tracker";
import { CarryInBanner } from "./CarryInBanner";
import { DayCard } from "./DayCard";
import { EndOfDayCard } from "./EndOfDayCard";
import { ReminderNote } from "./ReminderNote";
import { TaskTable } from "./TaskTable";
import { TrackerHistory } from "./TrackerHistory";

export type TrackerTab = "day" | "history";

/**
 * /dashboard/tracker. Presentational: data in, actions out, so the design
 * preview and the real page (React Query) share it.
 */
export function TrackerView({
  today,
  day,
  carryIn,
  history,
  historyLoading,
  loading = false,
  actions,
  tab,
  onTab,
  onNavigate,
  /** Oldest date that can be opened with the ‹ button. */
  earliest,
}: {
  today: string;
  day: TrackerDay;
  carryIn: TrackerCarryIn | null;
  history: TrackerDaySummary[];
  historyLoading?: boolean;
  /** Another day is loading: show this one read-only and dimmed. */
  loading?: boolean;
  actions: TrackerDayActions;
  tab: TrackerTab;
  onTab: (tab: TrackerTab) => void;
  onNavigate: (date: string) => void;
  earliest?: string;
}) {
  const isToday = day.date === today;
  const [editingPast, setEditingPast] = useState<string | null>(null);
  const readOnly = loading || (!isToday && editingPast !== day.date);
  const summary = summarizeDay(day);

  return (
    <TooltipProvider delayDuration={300}>
      <Tabs value={tab} onValueChange={(v) => onTab(v as TrackerTab)} className="contents">
        <PageShell className="space-y-5">
          <PageHeader
            eyebrow={isToday ? formatLongDate(day.date) : relativeDayLabel(day.date, today)}
            title={tab === "history" ? "History" : isToday ? "Today" : formatLongDate(day.date)}
            actions={
              <>
                {tab === "day" && (
                  <DayNav
                    date={day.date}
                    today={today}
                    earliest={earliest}
                    onNavigate={(d) => {
                      setEditingPast(null);
                      onNavigate(d);
                    }}
                  />
                )}
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
              </>
            }
          />

          <TabsContent
            value="day"
            aria-busy={loading || undefined}
            className={cn("space-y-5 transition-opacity duration-200", loading && "pointer-events-none opacity-60")}
          >
            {!isToday && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  {readOnly ? <Lock className="size-3.5" aria-hidden /> : <Pencil className="size-3.5" aria-hidden />}
                  {readOnly ? "You're looking at a past day." : "Editing a past day. Changes save as you go."}
                </span>
                <Button
                  size="xs"
                  variant={readOnly ? "outline" : "secondary"}
                  onClick={() => setEditingPast(readOnly ? day.date : null)}
                >
                  {readOnly ? "Edit" : "Done editing"}
                </Button>
              </div>
            )}

            <ReminderNote
              value={day.reminder}
              readOnly={readOnly}
              onChange={(reminder) => actions.updateDay({ reminder: reminder || null })}
            />

            {isToday && carryIn && (
              <CarryInBanner
                carryIn={carryIn}
                today={today}
                onImport={actions.importCarryIn}
                onDismiss={actions.dismissCarryIn}
              />
            )}

            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_23rem]">
              <div className="order-2 min-w-0 lg:order-1">
                <TaskTable tasks={day.tasks} readOnly={readOnly} actions={actions} />
              </div>
              <div className="order-1 space-y-4 lg:order-2">
                <DayCard
                  summary={summary}
                  isToday={isToday}
                  readOnly={readOnly}
                  onAvailable={(availableMinutes) => actions.updateDay({ availableMinutes })}
                />
                <div className="hidden lg:block">
                  <EndOfDayCard day={day} readOnly={readOnly} actions={actions} />
                </div>
              </div>
              {/* Phones / tablets: End of day after the tasks. */}
              <div className="order-3 lg:hidden">
                <EndOfDayCard day={day} readOnly={readOnly} actions={actions} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {historyLoading ? (
              <div className="space-y-4" aria-busy="true" aria-label="Loading history">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-36 rounded-2xl" />
                  ))}
                </div>
                <Skeleton className="h-80 rounded-2xl" />
              </div>
            ) : (
            <TrackerHistory
              days={history}
              today={today}
              onOpenDay={(d) => {
                setEditingPast(null);
                onNavigate(d);
                onTab("day");
              }}
            />
            )}
          </TabsContent>
        </PageShell>
      </Tabs>
    </TooltipProvider>
  );
}

function DayNav({
  date,
  today,
  earliest,
  onNavigate,
}: {
  date: string;
  today: string;
  earliest?: string;
  onNavigate: (date: string) => void;
}) {
  const prev = shiftDate(date, -1);
  const next = shiftDate(date, 1);
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Previous day"
            disabled={!!earliest && prev < earliest}
            onClick={() => onNavigate(prev)}
          >
            <ChevronLeft />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{relativeDayLabel(prev, today)}</TooltipContent>
      </Tooltip>
      {date !== today && (
        <Button size="sm" variant="outline" onClick={() => onNavigate(today)}>
          <CalendarClock />
          Today
        </Button>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Next day"
            disabled={next > today}
            onClick={() => onNavigate(next)}
          >
            <ChevronRight />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{relativeDayLabel(next, today)}</TooltipContent>
      </Tooltip>
    </div>
  );
}
