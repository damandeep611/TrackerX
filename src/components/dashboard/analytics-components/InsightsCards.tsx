"use client"
import { motion } from 'framer-motion'
import { ChartNoAxesCombined } from "lucide-react";
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
        className=" p-6 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50  dark:bg-zinc-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20"
          >
            <ChartNoAxesCombined className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em] block mb-1">
              Weekly Rhythm
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Consistency Analytics
            </span>
          </div>
        </div>

        <div className="mb-6">
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
                  className={`w-16 h-12 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    day.hasActivity
                      ? "dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/30"
                      : "dark:bg-zinc-800 dark:text-zinc-500 border border-zinc-700"
                  }`}
                >
                  {day.hours > 0 ? day.hours.toFixed(1) : "—"}
                </div>
                <span className="text-sm font-medium dark:text-zinc-400">
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className=" border-t mt-6 pt-6">
          <p className="text-xs dark:text-zinc-300">
            {activeDays === 0
              ? "No activity logged this week"
              : activeDays === 7
              ? "Perfect consistency! You logged time every day"
              : `Great progress! ${activeDays} active days this week`}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
