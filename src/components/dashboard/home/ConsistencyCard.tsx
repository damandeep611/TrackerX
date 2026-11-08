"use client";

import { CalendarCheck, Flame } from "lucide-react";
import { Card, CardFooter, CardHeader, CardTitle, Well } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatHours, type DashboardInsights } from "@/lib/insights";

// Intensity buckets (minutes) → share of the accent color.
const LEVELS = [
  { min: 120, mix: 100 },
  { min: 60, mix: 75 },
  { min: 30, mix: 50 },
  { min: 1, mix: 30 },
];

const fmt = (key: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

/** 28-day heat grid (4 rows × 7 days, oldest first) plus the streak. */
export function ConsistencyCard({ insights }: { insights: DashboardInsights }) {
  const { daily28, streak, consistency, today } = insights;
  const weeks = Array.from({ length: daily28.length / 7 }, (_, i) => daily28.slice(i * 7, i * 7 + 7));

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>
          <CalendarCheck />
          Consistency
        </CardTitle>
        <span className="ml-auto text-xs text-muted-foreground">
          <span className="tabular text-foreground">{consistency.activeDays}</span> /{" "}
          {consistency.windowDays} days
        </span>
      </CardHeader>
      <Well className="flex flex-1 flex-col justify-center gap-2">
        <div className="grid grid-cols-[2.75rem_repeat(7,minmax(0,1fr))] gap-1.5">
          <span />
          {weeks[0]?.map((d) => (
            <span key={d.date} className="text-center text-[11px] text-subtle-foreground">
              {fmt(d.date, { weekday: "narrow" })}
            </span>
          ))}
          {weeks.map((week) => (
            <Week key={week[0].date} week={week} today={today} />
          ))}
        </div>
        <div className="flex items-center justify-end gap-1 pt-1 text-[11px] text-subtle-foreground">
          Less
          {[0, ...LEVELS.map((l) => l.mix).reverse()].map((mix) => (
            <span
              key={mix}
              className={cn("size-2.5 rounded-[3px]", mix === 0 && "bg-surface-3")}
              style={mix ? { background: `color-mix(in oklab, var(--chart-4) ${mix}%, transparent)` } : undefined}
              aria-hidden
            />
          ))}
          More
        </div>
      </Well>
      <CardFooter>
        <span className="flex items-center gap-1.5">
          <Flame className="size-3.5 text-chart-3" aria-hidden />
          {streak.current > 0 ? (
            <>
              <span>
                <span className="tabular text-foreground">{streak.current}</span>-day streak
                {!streak.activeToday && " · log today to keep it"}
              </span>
            </>
          ) : (
            "No active streak"
          )}
        </span>
        <span>Longest {streak.best}d</span>
      </CardFooter>
    </Card>
  );
}

function Week({ week, today }: { week: DashboardInsights["daily28"]; today: string }) {
  return (
    <>
      <span className="self-center text-[11px] text-subtle-foreground tabular">
        {fmt(week[0].date, { month: "short", day: "numeric" })}
      </span>
      {week.map((d) => {
        const level = LEVELS.find((l) => d.minutes >= l.min);
        const label = `${fmt(d.date, { weekday: "short", month: "short", day: "numeric" })}: ${
          d.minutes ? formatHours(d.minutes) : "no logs"
        }`;
        return (
          <span
            key={d.date}
            title={label}
            aria-label={label}
            role="img"
            className={cn(
              "h-7 w-full rounded-md transition-colors sm:h-8",
              !level && "bg-surface-3",
              d.date === today && "ring-2 ring-foreground/40 ring-offset-1 ring-offset-surface-2"
            )}
            style={
              level
                ? { background: `color-mix(in oklab, var(--chart-4) ${level.mix}%, transparent)` }
                : undefined
            }
          />
        );
      })}
    </>
  );
}
