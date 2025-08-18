"use client"
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import { TrendingUpIcon } from 'lucide-react';
import { getLastSevenWeeksProgress } from '@/actions/timeLogAction';

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
        console.error('Failed to fetch weekly progress:', error);
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
  const weeklyChange = previousWeekHours > 0 
    ? ((currentWeekHours - previousWeekHours) / previousWeekHours) * 100 
    : currentWeekHours > 0 ? 100 : 0;

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
        lineStyle: {
          color: "#27272a",
          type: "dashed",
        },
      },
    },
    series: [
      {
        data: weeklyData.map((week, index) => ({
          value: week.hours,
          itemStyle: {
            color:
              index === weeklyData.length - 1
                ? "#6366f1" // Current week - indigo
                : "#52525b", // Previous weeks - zinc
          },
        })),
        type: "bar",
        barWidth: "60%",
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
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
        className="dark:bg-zinc-900 p-6 rounded-2xl shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUpIcon className="w-5 h-5 dark:text-zinc-400" />
          <h3 className="text-sm dark:text-zinc-400 font-medium">Weekly Progress</h3>
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
      className="dark:bg-zinc-900 p-6 rounded-2xl shadow-sm dark:hover:bg-zinc-800/50 transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <TrendingUpIcon className="w-5 h-5 dark:text-zinc-400" />
        <h3 className="text-sm dark:text-zinc-400 font-medium">Weekly Progress</h3>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold">{currentWeekHours.toFixed(1)}h</span>
          <span className="text-sm dark:text-zinc-400">this week</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${weeklyChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {weeklyChange >= 0 ? "+" : ""}
            {weeklyChange.toFixed(0)}%
          </span>
          <span className="text-sm dark:text-zinc-400">compared to last week</span>
        </div>
      </div>

      {/* ECharts Bar Chart */}
      <div className="h-40">
        <ReactECharts 
          option={chartOptions} 
          style={{ height: '100%', width: '100%' }} 
          opts={{ renderer: 'svg' }}
        />
      </div>

      {/* Additional insights */}
      <div className="pt-3 border-t border-zinc-800 mt-3">
        <p className="text-xs dark:text-zinc-400">
          {currentWeekHours === 0 
            ? "No hours logged this week yet" 
            : weeklyChange > 20 
            ? "Great improvement this week! 📈" 
            : weeklyChange < -20
            ? "Consider increasing your weekly hours 📊"
            : "Steady progress! Keep it up 💪"}
        </p>
      </div>
    </motion.div>
  );
} 