"use client"
import { motion } from 'framer-motion'
import { BarChart3Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getLastSevenDaysActivity } from "@/actions/timeLogAction";
import WeeklyProgressChart from "./WeeklyProgressChart";

interface WeeklyData {
  day: string;
  hours: number;
  hasActivity: boolean;
}

export default function InsightsCards() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);

  useEffect(() => {
    const fetchWeeklyActivity = async () => {
      try {
        const data = await getLastSevenDaysActivity();
        setWeeklyData(data);
      } catch (error) {
        console.error("Failed to fetch weekly activity:", error);
        // Fallback to default empty data structure
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date();
        const fallbackData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(today.getDate() - (6 - i));
          return {
            day: dayNames[date.getDay()],
            hours: 0,
            hasActivity: false,
          };
        });
        setWeeklyData(fallbackData);
      }
    };

    fetchWeeklyActivity();
  }, []);

  const activeDays = weeklyData.filter((day) => day.hasActivity).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Weekly Progress Chart - New ECharts Component */}
      <WeeklyProgressChart />

      {/* Consistency Tracker */}
      <motion.div
        className="dark:bg-zinc-900 p-6 rounded-2xl shadow-sm dark:hover:bg-zinc-800/50 transition-all duration-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <BarChart3Icon className="w-5 h-5 dark:text-zinc-400" />
          <h3 className="text-sm dark:text-zinc-400 font-medium">
            Weekly Consistency
          </h3>
        </div>

        <div className="mb-4">
          <span className="text-2xl font-bold ">{activeDays} of 7 days</span>
          <p className="text-sm dark:text-zinc-400 mt-1">
            You&#39;ve logged time this week
          </p>
        </div>

        {/* Weekly Heatmap */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    day.hasActivity
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                  }`}
                >
                  {day.hours > 0 ? day.hours.toFixed(1) : "—"}
                </div>
                <span className="text-xs dark:text-zinc-400">{day.day}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <p className="text-xs dark:text-zinc-400">
              {activeDays === 0
                ? "No activity logged this week"
                : activeDays === 7
                ? "Perfect consistency! You logged time every day"
                : `Great progress! ${activeDays} active days this week`}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
