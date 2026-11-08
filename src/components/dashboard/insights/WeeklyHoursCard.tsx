"use client";

import { BarChart3 } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts";
import { Card, CardFooter, CardHeader, CardTitle, Well } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { formatDay, formatHours, type SkillInsights } from "@/lib/insights";

const chartConfig = { hours: { label: "Hours", color: "var(--chart-1)" } } satisfies ChartConfig;

/**
 * Hours per rolling 7-day week (8 weeks), with a dashed line at the weekly
 * pace that would finish the remaining time in ~3 months. Used by the skill
 * and sandbox Insights tabs.
 */
export function WeeklyHoursCard({
  insights,
  remainingMinutes,
  color,
}: {
  insights: SkillInsights;
  remainingMinutes: number;
  color: string;
}) {
  const reduceMotion = useReducedMotion();
  const neededWeekly = remainingMinutes > 0 ? remainingMinutes / 13 / 60 : 0;

  const weekRows = insights.weekly.map((w, i, all) => ({
    key: w.start,
    label: i === all.length - 1 ? "This wk" : formatDay(w.start),
    detail: `${formatDay(w.start)} – ${formatDay(w.end)}`,
    hours: Math.round((w.minutes / 60) * 10) / 10,
    current: i === all.length - 1,
  }));

  return (
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
            <Bar dataKey="hours" radius={[4, 4, 1, 1]} maxBarSize={40} isAnimationActive={!reduceMotion}>
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
  );
}
