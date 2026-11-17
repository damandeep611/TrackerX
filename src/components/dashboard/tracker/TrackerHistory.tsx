"use client";

import { useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BarChart3, CalendarDays, CheckCircle2, Clock, Gauge, Lightbulb, NotebookPen, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardFooter, CardHeader, CardTitle, Well } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { formatDuration } from "@/lib/duration";
import { formatHours } from "@/lib/insights";
import { estimateDrift, formatMaybe, formatShortDate, shiftDate } from "@/lib/tracker";
import { cn } from "@/lib/utils";
import type { TrackerDaySummary } from "@/types/tracker";

const CHART_DAYS = 14;
const CAL_WEEKS = 5;

const chartConfig = {
  actual: { label: "Logged", color: "var(--brand)" },
  available: { label: "Available", color: "var(--surface-3)" },
} satisfies ChartConfig;

/** Past days at a glance: hours, completion, estimate accuracy, and what you learned. */
export function TrackerHistory({
  days,
  today,
  onOpenDay,
}: {
  /** Summaries of the days that exist, any order. */
  days: TrackerDaySummary[];
  today: string;
  onOpenDay: (date: string) => void;
}) {
  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);
  const range = (n: number, end = today) => Array.from({ length: n }, (_, i) => shiftDate(end, i - n + 1));

  if (days.length === 0) {
    return (
      <EmptyState
        icon={<NotebookPen />}
        title="No history yet"
        description="Each day you plan here is kept automatically. Come back after a few days to see how your hours add up."
      />
    );
  }

  const week = range(7).map((k) => byDate.get(k));
  const prevWeek = range(7, shiftDate(today, -7)).map((k) => byDate.get(k));
  const weekMinutes = sum(week.map((d) => d?.actualMinutes ?? 0));
  const prevWeekMinutes = sum(prevWeek.map((d) => d?.actualMinutes ?? 0));

  const recent = range(CHART_DAYS)
    .map((k) => byDate.get(k))
    .filter((d): d is TrackerDaySummary => !!d && d.total > 0);
  const avgMinutes = recent.length ? sum(recent.map((d) => d.actualMinutes)) / recent.length : 0;
  const doneCount = sum(recent.map((d) => d.done));
  const totalCount = sum(recent.map((d) => d.total));
  const drift = estimateDrift(recent);

  return (
    <div className="space-y-4">
      <StatGrid>
        <StatCard
          icon={<Clock />}
          title="This week"
          value={round1(weekMinutes / 60)}
          decimals={1}
          unit="h"
          sparkline={week.map((d) => d?.actualMinutes ?? 0)}
          caption={`Last 7 days · ${formatHours(prevWeekMinutes)} the week before`}
        />
        <StatCard
          icon={<Timer />}
          title="Daily average"
          value={round1(avgMinutes / 60)}
          decimals={1}
          unit="h"
          color="var(--chart-2)"
          sparkline={recent.slice(-7).map((d) => d.actualMinutes)}
          caption={`Over ${recent.length} planned day${recent.length === 1 ? "" : "s"}`}
        />
        <StatCard
          icon={<CheckCircle2 />}
          title="Tasks done"
          value={totalCount ? Math.round((doneCount / totalCount) * 100) : 0}
          unit="%"
          color="var(--chart-4)"
          sparkline={recent.slice(-7).map((d) => (d.total ? d.done / d.total : 0))}
          caption={`${doneCount} of ${totalCount} in ${CHART_DAYS} days`}
        />
        <StatCard
          icon={<Gauge />}
          title="Estimates"
          value={drift === null ? "—" : `${drift > 0 ? "+" : ""}${drift}`}
          unit={drift === null ? undefined : "%"}
          color="var(--chart-3)"
          sparkline={recent
            .slice(-7)
            .map((d) => (d.estimatedWithActual ? d.actualWithEstimate / d.estimatedWithActual : 0))}
          caption={
            drift === null
              ? "Fill in actual times to see this"
              : Math.abs(drift) <= 5
                ? "Close to your estimates"
                : drift > 0
                  ? "Tasks take longer than planned"
                  : "Tasks take less than planned"
          }
        />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <HoursChart className="lg:col-span-2" rows={range(CHART_DAYS).map((k) => ({ date: k, day: byDate.get(k) }))} today={today} />
        <MonthGrid byDate={byDate} today={today} onOpenDay={onOpenDay} />
      </div>

      <Journal days={days} today={today} onOpenDay={onOpenDay} />
    </div>
  );
}

function HoursChart({
  rows,
  today,
  className,
}: {
  rows: { date: string; day: TrackerDaySummary | undefined }[];
  today: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const data = rows.map(({ date, day }) => ({
    date,
    label: date === today ? "Today" : formatShortDate(date).split(" ").slice(1).join(" "),
    actual: round1((day?.actualMinutes ?? 0) / 60),
    available: round1((day?.availableMinutes ?? 0) / 60),
    day,
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          <BarChart3 />
          Hours per day
        </CardTitle>
        <CardAction className="gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-brand" aria-hidden />
            Logged
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-border-strong" aria-hidden />
            Available
          </span>
        </CardAction>
      </CardHeader>
      <Well className="px-2 pt-4 pb-1">
        <ChartContainer config={chartConfig} className="aspect-auto h-60 w-full">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }} barGap={0}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              xAxisId="bg"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              interval="preserveStartEnd"
            />
            <XAxis xAxisId="fg" dataKey="label" hide />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              fontSize={11}
              width={40}
              tickFormatter={(v: number) => `${v}h`}
            />
            <ChartTooltip
              cursor={{ fill: "var(--surface-3)", radius: 6, opacity: 0.5 }}
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as (typeof data)[number] | undefined;
                if (!active || !row) return null;
                return (
                  <div className="space-y-0.5 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-raised">
                    <div className="text-muted-foreground">{formatShortDate(row.date)}</div>
                    {row.day ? (
                      <>
                        <div className="tabular font-medium text-foreground">
                          {formatMaybe(row.day.actualMinutes, "0m")}
                          {row.day.availableMinutes ? (
                            <span className="font-normal text-muted-foreground">
                              {" "}
                              of {formatDuration(row.day.availableMinutes)}
                            </span>
                          ) : null}
                        </div>
                        <div className="tabular text-muted-foreground">
                          {row.day.done}/{row.day.total} tasks done
                        </div>
                      </>
                    ) : (
                      <div className="text-muted-foreground">Not tracked</div>
                    )}
                  </div>
                );
              }}
            />
            <Bar
              xAxisId="bg"
              dataKey="available"
              fill="var(--border)"
              radius={[4, 4, 1, 1]}
              maxBarSize={30}
              isAnimationActive={!reduceMotion}
            />
            <Bar
              xAxisId="fg"
              dataKey="actual"
              fill="var(--brand)"
              radius={[4, 4, 1, 1]}
              maxBarSize={30}
              isAnimationActive={!reduceMotion}
            />
          </BarChart>
        </ChartContainer>
      </Well>
      <CardFooter>
        <span>Last {rows.length} days</span>
      </CardFooter>
    </Card>
  );
}

/** Last 5 weeks, Monday first. Darker = more hours. Click a day to open it. */
function MonthGrid({
  byDate,
  today,
  onOpenDay,
}: {
  byDate: Map<string, TrackerDaySummary>;
  today: string;
  onOpenDay: (date: string) => void;
}) {
  const dow = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7; // 0 = Monday
  const start = shiftDate(today, -dow - (CAL_WEEKS - 1) * 7);
  const cells = Array.from({ length: CAL_WEEKS * 7 }, (_, i) => shiftDate(start, i));
  const tracked = cells.filter((k) => byDate.get(k)?.total).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <CalendarDays />
          Last {CAL_WEEKS} weeks
        </CardTitle>
        <CardAction className="text-xs text-muted-foreground">
          <span className="tabular">{tracked}</span>&nbsp;tracked
        </CardAction>
      </CardHeader>
      <Well className="py-3.5">
        <div className="mx-auto grid max-w-[19rem] grid-cols-7 gap-1.5">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i} className="pb-0.5 text-center text-[11px] text-subtle-foreground">
              {d}
            </span>
          ))}
          {cells.map((k) => {
            const d = byDate.get(k);
            const future = k > today;
            const hours = (d?.actualMinutes ?? 0) / 60;
            const level = hours === 0 ? 0 : hours < 2 ? 1 : hours < 4 ? 2 : hours < 6 ? 3 : 4;
            const label = `${formatShortDate(k)}: ${d ? `${formatMaybe(d.actualMinutes, "0m")}, ${d.done}/${d.total} done` : "not tracked"}`;
            return (
              <button
                key={k}
                type="button"
                disabled={future || !d}
                onClick={() => onOpenDay(k)}
                title={label}
                aria-label={label}
                className={cn(
                  "tabular flex aspect-square items-center justify-center rounded-md text-[11px] outline-none transition-[transform,box-shadow] duration-150 focus-visible:ring-[3px] focus-visible:ring-ring",
                  "enabled:hover:scale-105 enabled:hover:shadow-raised",
                  future ? "text-transparent" : level === 0 ? "bg-surface-3/70 text-subtle-foreground" : "",
                  level > 0 && "text-foreground",
                  k === today && "ring-1 ring-foreground/40"
                )}
                style={
                  level > 0
                    ? { background: `color-mix(in oklab, var(--brand) ${[0, 18, 32, 50, 72][level]}%, var(--surface-3))` }
                    : undefined
                }
              >
                {Number(k.slice(8))}
              </button>
            );
          })}
        </div>
      </Well>
      <CardFooter>
        <span>Click a day to open it</span>
        <span className="flex items-center gap-1" aria-hidden>
          Less
          {[0, 18, 32, 50, 72].map((p) => (
            <span
              key={p}
              className="size-2.5 rounded-[3px]"
              style={{ background: `color-mix(in oklab, var(--brand) ${p}%, var(--surface-3))` }}
            />
          ))}
          More
        </span>
      </CardFooter>
    </Card>
  );
}

/** Newest first: the day's numbers and the one thing you learned. */
function Journal({
  days,
  today,
  onOpenDay,
}: {
  days: TrackerDaySummary[];
  today: string;
  onOpenDay: (date: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const list = [...days]
    .filter((d) => d.date <= today && d.total > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, showAll ? 31 : 7);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <NotebookPen />
          Recent days
        </CardTitle>
        <CardAction>
          <Button size="xs" variant="ghost" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show less" : "Show more"}
          </Button>
        </CardAction>
      </CardHeader>
      <Well className="p-1.5">
        <ul className="divide-y divide-border/60">
          {list.map((d) => (
            <li key={d.date}>
              <button
                type="button"
                onClick={() => onOpenDay(d.date)}
                className="grid w-full gap-x-6 gap-y-1.5 rounded-lg px-3 py-3 text-left outline-none transition-colors hover:bg-card/70 focus-visible:ring-[3px] focus-visible:ring-ring sm:grid-cols-[9.5rem_minmax(0,1fr)] dark:hover:bg-surface-3/40"
              >
                <div className="space-y-1.5">
                  <div className="text-sm font-medium text-foreground">
                    {d.date === today ? "Today" : formatShortDate(d.date)}
                  </div>
                  <div className="tabular flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatMaybe(d.actualMinutes, "0m")}</span>
                    <span className="text-subtle-foreground">·</span>
                    <span>
                      {d.done}/{d.total} done
                    </span>
                  </div>
                  <MiniBar value={d.actualMinutes} max={d.availableMinutes ?? d.plannedMinutes} />
                </div>
                {d.learned ? (
                  <p className="flex items-start gap-2 text-[13px] leading-relaxed text-foreground/85">
                    <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-chart-3" aria-hidden />
                    {d.learned}
                  </p>
                ) : (
                  <p className="text-[13px] text-subtle-foreground sm:pt-0.5">—</p>
                )}
              </button>
            </li>
          ))}
        </ul>
      </Well>
    </Card>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-1 w-28 overflow-hidden rounded-full bg-surface-3" aria-hidden>
      <div className="h-full rounded-full bg-brand/80" style={{ width: `${pct}%` }} />
    </div>
  );
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const round1 = (n: number) => Math.round(n * 10) / 10;
