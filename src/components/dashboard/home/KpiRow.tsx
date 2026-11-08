"use client";

import { CalendarCheck, Clock, Flame, Layers } from "lucide-react";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { formatHours, percentChange, type DashboardInsights } from "@/lib/insights";
import type { SkillListItem } from "@/hooks/useSkills";

export function KpiRow({
  insights,
  skills,
}: {
  insights: DashboardInsights;
  skills: SkillListItem[];
}) {
  const { last7, streak, consistency } = insights;

  const hours7 = last7.minutes / 60;
  const consistencyPct = (consistency.activeDays / consistency.windowDays) * 100;
  const consistencyDelta =
    ((consistency.activeDays - consistency.prevActiveDays) / consistency.windowDays) * 100;

  const activity = skills.map((s) => ({ s, m: insights.skills[s.id]?.minutes7d ?? 0 }));
  const activeSkills = activity.filter((a) => a.m > 0).length;
  const top = activity.reduce<(typeof activity)[number] | null>(
    (best, a) => (a.m > 0 && (!best || a.m > best.m) ? a : best),
    null
  );

  return (
    <StatGrid>
      <StatCard
        icon={<Clock />}
        title="Last 7 days"
        value={hours7}
        decimals={1}
        unit="h"
        sparkline={last7.daily}
        color="var(--chart-1)"
        delta={percentChange(last7.minutes, last7.prevMinutes)}
        deltaLabel="vs prior 7 days"
        caption={last7.prevMinutes > 0 ? undefined : "Nothing logged the week before"}
      />
      <StatCard
        icon={<Flame />}
        title="Streak"
        value={streak.current}
        unit={streak.current === 1 ? "day" : "days"}
        sparkline={insights.daily28.slice(-14).map((d) => d.minutes)}
        color="var(--chart-3)"
        caption={
          streak.current > 0 && !streak.activeToday
            ? "Log today to keep it"
            : `Longest: ${streak.best} ${streak.best === 1 ? "day" : "days"}`
        }
      />
      <StatCard
        icon={<CalendarCheck />}
        title="Consistency"
        value={consistencyPct}
        unit="%"
        sparkline={consistency.weekly}
        color="var(--chart-4)"
        delta={consistency.prevActiveDays > 0 ? consistencyDelta : undefined}
        deltaSuffix=" pts"
        deltaLabel="vs prior 28d"
        caption={`${consistency.activeDays} of ${consistency.windowDays} days`}
      />
      <StatCard
        icon={<Layers />}
        title="Active skills"
        value={activeSkills}
        unit={`/ ${skills.length}`}
        color="var(--chart-2)"
        caption={
          top ? `Most time: ${top.s.skillName} · ${formatHours(top.m)}` : "None logged this week"
        }
      />
    </StatGrid>
  );
}
