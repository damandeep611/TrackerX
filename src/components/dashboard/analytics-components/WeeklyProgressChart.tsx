"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingUpIcon } from "lucide-react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { getLastSevenWeeksProgress } from "@/actions/timeLogAction";

interface WeeklyProgressData {
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  hours: number;
}

interface ChartRow extends WeeklyProgressData {
  range: string;
}

const PAST_COLOR = "var(--chart-2)";
const CURRENT_COLOR = "var(--chart-4)";

const chartConfig = {
  hours: { label: "Hours" },
} satisfies ChartConfig;

function formatRange(weekStart: string, weekEnd: string) {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  return startMonth === endMonth
    ? `${startMonth} ${start.getDate()}-${end.getDate()}`
    : `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
}

function getTakeaway(currentWeekHours: number, weeklyChange: number) {
  if (currentWeekHours === 0) return "No hours logged this week yet.";
  if (weeklyChange > 20) return "Great momentum, you're ahead of last week.";
  if (weeklyChange < -20) return "Behind last week. A short session today helps.";
  return "Steady progress. Keep it up.";
}

export default function WeeklyProgressChart() {
  const [weeklyData, setWeeklyData] = useState<WeeklyProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyProgress = async () => {
      try {
        setIsLoading(true);
        const data = await getLastSevenWeeksProgress();
        setWeeklyData(data);
      } catch (error) {
        console.error("Failed to fetch weekly progress:", error);
        setWeeklyData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyProgress();
  }, []);

  const currentWeekHours = weeklyData[weeklyData.length - 1]?.hours || 0;
  const previousWeekHours = weeklyData[weeklyData.length - 2]?.hours || 0;
  const weeklyChange =
    previousWeekHours > 0
      ? ((currentWeekHours - previousWeekHours) / previousWeekHours) * 100
      : currentWeekHours > 0
      ? 100
      : 0;

  const chartData: ChartRow[] = weeklyData.map((week) => ({
    ...week,
    range: formatRange(week.weekStart, week.weekEnd),
  }));

  if (isLoading) {
    return (
      <motion.div
        className=" p-6 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50  dark:bg-zinc-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUpIcon className="w-5 h-5 dark:text-zinc-400" />
          <h3 className="text-sm dark:text-zinc-400 font-medium">
            Weekly Progress
          </h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-zinc-800 rounded mb-2"></div>
          <div className="h-32 bg-zinc-800 rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className=" relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface p-6 transition-colors hover:border-text-tertiary/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-surface-highlight  border border-border text-text-tertiary`}
          >
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
              Weekly Comparison
            </h3>
            <p className="text-xs font-medium text-text-secondary mt-0.5">
              Last 7 week analysis
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-text-tertiary mb-1">
            Compared to last week
          </p>
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ${
              weeklyChange >= 0
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-red-500/10 text-red-500"
            } `}
          >
            {weeklyChange >= 0 ? "+" : ""}
            {weeklyChange.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <ChartContainer config={chartConfig} className="h-60 w-full aspect-auto">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <XAxis
            dataKey="range"
            tickLine={false}
            axisLine={false}
            interval={0}
            tickMargin={8}
            fontSize={11}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            fontSize={10}
            width={40}
            tickFormatter={(value: number) => `${value}h`}
          />
          <ChartTooltip
            cursor={false}
            content={({ active, payload }) => {
              const week = payload?.[0]?.payload as ChartRow | undefined;
              if (!active || !week) return null;
              return (
                <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-xl">
                  <div className="font-semibold text-foreground mb-1">
                    {week.weekLabel}
                  </div>
                  <div className="text-muted-foreground mb-1">
                    {week.weekStart} to {week.weekEnd}
                  </div>
                  <div className="font-semibold text-foreground tabular-nums">
                    {week.hours}h logged
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="hours" radius={[2, 2, 0, 0]} maxBarSize={48}>
            {chartData.map((week, index) => (
              <Cell
                key={week.weekStart}
                fill={index === chartData.length - 1 ? CURRENT_COLOR : PAST_COLOR}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Legend / Footer */}
      <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
        <p className="text-xs text-text-secondary">
          {getTakeaway(currentWeekHours, weeklyChange)}
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-4 rounded-xs" style={{ background: PAST_COLOR }} />
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">
              Past Weeks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-4 rounded-xs" style={{ background: CURRENT_COLOR }} />
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">
              Current Week
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
