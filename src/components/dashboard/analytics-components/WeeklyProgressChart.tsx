"use client"
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingUpIcon } from "lucide-react";
import { getLastSevenWeeksProgress } from "@/actions/timeLogAction";

interface WeeklyProgressData {
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  hours: number;
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
        // Fallback to empty data
        setWeeklyData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyProgress();
  }, []);

  // Calculate statistics
  const currentWeekHours = weeklyData[weeklyData.length - 1]?.hours || 0;
  const previousWeekHours = weeklyData[weeklyData.length - 2]?.hours || 0;
  const weeklyChange =
    previousWeekHours > 0
      ? ((currentWeekHours - previousWeekHours) / previousWeekHours) * 100
      : currentWeekHours > 0
      ? 100
      : 0;

  // ECharts options
  const chartOptions = {
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: weeklyData.map((week) => {
        // Format date range for display
        const startDate = new Date(week.weekStart);
        const endDate = new Date(week.weekEnd);
        const startMonth = startDate.toLocaleDateString("en-US", {
          month: "short",
        });
        const endMonth = endDate.toLocaleDateString("en-US", {
          month: "short",
        });
        const startDay = startDate.getDate();
        const endDay = endDate.getDate();

        if (startMonth === endMonth) {
          return `${startMonth} ${startDay}-${endDay}`;
        } else {
          return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
        }
      }),
      axisLabel: {
        color: "#64748b",
        fontSize: 11,
        interval: 0,
        rotate: 0,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#71717a",
        fontSize: 10,
        formatter: "{value}h",
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      interval: 10,
      max: 70,
    },
    series: [
      {
        data: weeklyData.map((week, index) => ({
          value: week.hours,
          itemStyle: {
            color:
              index === weeklyData.length - 1
                ? "#05fa8c" // Current week - indigo
                : "#818cf8", // Previous weeks - zinc
          },
        })),
        type: "bar",

        barWidth: "50%",
        itemStyle: {
          borderRadius: [2, 2, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: "#818cf8",
          },
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      backgroundColor: "#18181b",
      borderColor: "#27272a",
      textStyle: {
        color: "#f4f4f5",
      },
      formatter: function (params: unknown) {
        const data = (params as Array<{ dataIndex: number }>)[0];
        const weekInfo = weeklyData[data.dataIndex];
        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${weekInfo.weekLabel}</div>
            <div style="color: #a1a1aa; font-size: 12px; margin-bottom: 4px;">${weekInfo.weekStart} to ${weekInfo.weekEnd}</div>
            <div style="color: #6366f1; font-weight: 600;">${weekInfo.hours}h logged</div>
          </div>
        `;
      },
    },
  };

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
                : "text-red-700 bg-red-300 "
            } `}
          >
            {weeklyChange >= 0 ? "+" : ""}
            {weeklyChange.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* ECharts Bar Chart */}
      <div className="h-60">
        <ReactECharts
          option={chartOptions}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "svg" }}
        />
      </div>

      {/* Legend / Footer */}
      <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
        <p className="text-xs text-text-secondary">
          {currentWeekHours === 0
            ? "No hours logged , bitch ass"
            : weeklyChange > 20
            ? "slow ass work , Lock in more ! "
            : weeklyChange < -20
            ? "Consider increasing your weekly hours"
            : "Steady progress! Keep it up "}
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-4 rounded-xs bg-blue-500" />
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">
              Past Weeks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-4 rounded-xs bg-emerald-500" />
            <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">
              Current Week
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 