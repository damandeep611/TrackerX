"use client";

import { CalendarCheck, CheckCircle2, Clock, ListOrdered, Tag, Target } from "lucide-react";
import { Card, CardFooter, CardHeader, CardTitle, Well } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/metric";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { WeeklyHoursCard } from "@/components/dashboard/insights/WeeklyHoursCard";
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

      <WeeklyHoursCard insights={insights} remainingMinutes={eta.remainingMinutes} color={color} />

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
