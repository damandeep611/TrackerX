"use client";

import { CalendarCheck, Clock, History, Target } from "lucide-react";
import { WeeklyHoursCard } from "@/components/dashboard/insights/WeeklyHoursCard";
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
import type { SandboxLog } from "@/types/sandbox";

/** Pace, trend and consistency for one sandbox. */
export function SandboxInsightsTab({
  insights,
  logs,
  targetHours,
}: {
  insights: SkillInsights;
  logs: SandboxLog[];
  targetHours: number;
}) {
  const eta = projectEta(insights, targetHours);
  const { last7, consistency } = insights;
  const recent = logs.filter((l) => l.date >= insights.weekly[0].start);
  const avg = recent.length ? recent.reduce((a, l) => a + l.minutes, 0) / recent.length : 0;

  return (
    <div className="space-y-4">
      <StatGrid>
        <StatCard
          icon={<Target />}
          title="Finish estimate"
          value={eta.remainingMinutes === 0 ? "Done" : eta.date ? formatDay(eta.date) : "—"}
          unit={eta.date && eta.date.slice(0, 4) !== insights.today.slice(0, 4) ? eta.date.slice(0, 4) : undefined}
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
          icon={<History />}
          title="Sessions"
          value={recent.length}
          unit="in 8 wks"
          color="var(--chart-2)"
          caption={recent.length ? `Average session ${formatDuration(Math.round(avg))}` : "No sessions yet"}
        />
      </StatGrid>

      <WeeklyHoursCard insights={insights} remainingMinutes={eta.remainingMinutes} color="var(--brand)" />
    </div>
  );
}
