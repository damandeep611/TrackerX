"use client";

import { BarChart3, CalendarCheck, CheckCircle2, Clock, ListOrdered, Tag, Target } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts";
import { Card, CardFooter, CardHeader, CardTitle, Well } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/metric";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { formatDuration } from "@/lib/duration";
import {
  formatDay,
  formatHours,
  PACE_WEEKS,
  percentChange,
  projectEta,
  type SkillInsights,
} from "@/lib/insights";
import type { SkillTask } from "@/types/skillDashboardTypes";

const chartConfig = { hours: { label: "Hours", color: "var(--chart-1)" } } satisfies ChartConfig;

/** Every widget answers "how am I doing / what next" for this one skill. */
export function SkillInsightsTab({
  insights,
  tasks,
  targetHours,
  color,
}: {
  insights: SkillInsights;
  tasks: SkillTask[];
  targetHours: number;
  color: string;
}) {
  const eta = projectEta(insights, targetHours);
  const { last7, consistency } = insights;
  const done = tasks.filter((t) => t.status === "done").length;
  const doing = tasks.filter((t) => t.status === "in_progress").length;

  // Time needed per week to finish in ~3 months, as a reference for the trend chart.
  const neededWeekly = eta.remainingMinutes > 0 ? eta.remainingMinutes / 13 / 60 : 0;

  const weekRows = insights.weekly.map((w, i, all) => ({
    key: w.start,
    label: i === all.length - 1 ? "This wk" : formatDay(w.start),
    detail: `${formatDay(w.start)} – ${formatDay(w.end)}`,
    hours: Math.round((w.minutes / 60) * 10) / 10,
    current: i === all.length - 1,
  }));

  return (
    <div className="space-y-4">
      <StatGrid>
        <StatCard
          icon={<Target />}
          title="Finish estimate"
          value={eta.remainingMinutes === 0 ? "Done" : eta.date ? formatDay(eta.date) : "—"}
          unit={eta.date && eta.date.slice(0, 4) !== insights.today.slice(0, 4) ? eta.date.slice(0, 4) : undefined}
          color={color}
          caption={
            eta.remainingMinutes === 0
              ? "Target reached"
              : eta.date
                ? `${formatHours(eta.remainingMinutes)} left at ${formatHours(eta.weeklyMinutes)}/week`
                : `No time in the last ${PACE_WEEKS} weeks`
          }
        />
        <StatCard
          icon={<Clock />}
          title="Last 7 days"
          value={last7.minutes / 60}
          decimals={1}
          unit="h"
          sparkline={last7.daily}
          color={color}
          delta={percentChange(last7.minutes, last7.prevMinutes)}
          deltaLabel="vs prior 7 days"
          caption={last7.prevMinutes > 0 ? undefined : "Nothing the week before"}
        />
        <StatCard
          icon={<CalendarCheck />}
          title="Consistency"
          value={(consistency.activeDays / consistency.windowDays) * 100}
          unit="%"
          sparkline={consistency.weekly}
          color="var(--chart-4)"
          caption={`${consistency.activeDays} of ${consistency.windowDays} days · streak ${insights.streak.current}d`}
        />
        <StatCard
          icon={<CheckCircle2 />}
          title="Tasks done"
          value={done}
          unit={`/ ${tasks.length}`}
          color="var(--chart-2)"
          caption={`${doing} in progress · ${tasks.length - done - doing} to do`}
        />
      </StatGrid>

      <Card>
          <CardHeader>
            <CardTitle>
              <BarChart3 />
              Hours per week
            </CardTitle>
          </CardHeader>
          <Well className="px-2 pt-4 pb-1">
            <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
              <BarChart data={weekRows} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  fontSize={11}
                  width={40}
                  domain={[0, (max: number) => Math.ceil(Math.max(max, neededWeekly * 1.15))]}
                  tickFormatter={(v: number) => `${v}h`}
                />
                {neededWeekly > 0 && (
                  <ReferenceLine
                    y={Math.round(neededWeekly * 10) / 10}
                    stroke="var(--muted-foreground)"
                    strokeDasharray="4 4"
                  />
                )}
                <ChartTooltip
                  cursor={{ fill: "var(--surface-3)", radius: 6 }}
                  content={({ active, payload }) => {
                    const row = payload?.[0]?.payload as (typeof weekRows)[number] | undefined;
                    if (!active || !row) return null;
                    return (
                      <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-raised">
                        <div className="text-muted-foreground">{row.detail}</div>
                        <div className="tabular mt-0.5 font-medium text-foreground">
                          {formatHours(row.hours * 60)}
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="hours" radius={[4, 4, 1, 1]} maxBarSize={40}>
                  {weekRows.map((r) => (
                    <Cell key={r.key} fill={color} fillOpacity={r.current ? 1 : 0.45} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </Well>
          <CardFooter>
            <span>Rolling 7-day weeks</span>
            {neededWeekly > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-4 border-t border-dashed border-muted-foreground" aria-hidden />
                {formatHours(neededWeekly * 60)}/week finishes in ~3 months
              </span>
            )}
          </CardFooter>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Breakdown
            icon={<Tag />}
            title="Time by tag"
            footer="A task's time is split evenly across its tags"
            rows={timeByTag(tasks)}
            color={color}
          />
          <Breakdown
            icon={<ListOrdered />}
            title="Top tasks"
            rows={tasks
              .filter((t) => t.minutes > 0)
              .sort((a, b) => b.minutes - a.minutes)
              .slice(0, 5)
              .map((t) => ({ label: t.title, minutes: t.minutes }))}
            color={color}
          />
      </div>
    </div>
  );
}

function timeByTag(tasks: SkillTask[]) {
  const totals = new Map<string, number>();
  for (const t of tasks) {
    if (!t.minutes) continue;
    const tags = t.tags.length ? t.tags : ["Untagged"];
    for (const tag of tags) totals.set(tag, (totals.get(tag) ?? 0) + t.minutes / tags.length);
  }
  const sorted = [...totals].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 4).map(([label, minutes]) => ({ label, minutes }));
  const rest = sorted.slice(4).reduce((a, [, m]) => a + m, 0);
  return rest > 0 ? [...top, { label: "Other tags", minutes: rest }] : top;
}

function Breakdown({
  icon,
  title,
  rows,
  color,
  footer,
}: {
  icon: React.ReactNode;
  title: string;
  rows: { label: string; minutes: number }[];
  color: string;
  footer?: string;
}) {
  const max = Math.max(...rows.map((r) => r.minutes), 0);
  const total = rows.reduce((a, r) => a + r.minutes, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <Well className="space-y-2.5 py-3">
        {rows.length === 0 ? (
          <EmptyState compact title="No time logged yet" className="border-none bg-transparent py-4" />
        ) : (
          rows.map((r) => (
            <div key={r.label} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="truncate text-foreground">{r.label}</span>
                <span className="tabular shrink-0 text-muted-foreground">
                  {formatDuration(Math.round(r.minutes))}
                  <span className="text-subtle-foreground"> · {Math.round((r.minutes / total) * 100)}%</span>
                </span>
              </div>
              <ProgressBar value={r.minutes} max={max} color={color} label={`${r.label} share`} />
            </div>
          ))
        )}
      </Well>
      {footer && rows.length > 0 && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
