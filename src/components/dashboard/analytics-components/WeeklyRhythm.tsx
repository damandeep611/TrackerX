"use client"

import { getLastSevenDaysActivity } from '@/actions/timeLogAction';
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Activity, Flame, Target, TrendingUp } from "lucide-react";

interface WeeklyData {
  day: string;
  hours: number;
  hasActivity: boolean;
}

export default function WeeklyRhythm() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

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

  // Calculate metrics based on 80-hour week goal
  const WEEKLY_GOAL = 80;
  const DAILY_TARGET = WEEKLY_GOAL / 7; // ~11.43 hours per day

  const activeDays = weeklyData.filter((day) => day.hasActivity).length;
  const totalHours = weeklyData.reduce((sum, day) => sum + day.hours, 0);
  const weeklyProgress = (totalHours / WEEKLY_GOAL) * 100;
  const remainingHours = Math.max(WEEKLY_GOAL - totalHours, 0);
  const isOnTrack = totalHours >= (WEEKLY_GOAL / 7) * activeDays;

  // Calculate bar height percentage - scale based on daily target
  const getBarHeight = (hours: number) => {
    if (hours === 0) return 5; // Minimum 5% height for visibility
    // Scale bars relative to daily target (11.43h = 100%)
    const percent = (hours / DAILY_TARGET) * 100;
    return Math.max(percent, 5);
  };

  // Check if day meets target
  const meetsTarget = (hours: number) => hours >= DAILY_TARGET;

  const hasData = weeklyData.some((day) => day.hasActivity);

  return (
    <motion.div
      className="lg:col-span-2 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="flex flex-col h-full rounded-xl border border-border bg-surface p-6 transition-all duration-300 hover:border-text-tertiary/50 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 z-10 relative">
          <div className="flex gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-surface-highlight border border-border text-text-tertiary transition-colors duration-500 ${
                hasData &&
                "text-violet-400 border-violet-500/20 bg-violet-500/10 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]"
              }`}
            >
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
                Weekly Rhythm
              </h3>
              <p className="text-xs font-medium text-text-secondary mt-0.5">
                80-Hour Work Week
              </p>
            </div>
          </div>

          {/* Progress Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wide transition-all ${
              weeklyProgress >= 100
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : isOnTrack
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                : "bg-orange-500/10 text-orange-400 border-orange-500/20"
            }`}
          >
            <TrendingUp size={12} />
            <span>{weeklyProgress.toFixed(0)}% Complete</span>
          </div>
        </div>

        {/* Main Visualization: Bar Chart */}
        <div className="flex-1 flex flex-col justify-end relative mt-2 mb-4">
          {/* Target Line */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-violet-500/30 pointer-events-none z-0"
            style={{ bottom: "100%" }}
          >
            <div className="absolute right-0 -top-2.5 text-[9px] text-violet-400 bg-surface px-1 rounded">
              Target: {DAILY_TARGET.toFixed(1)}h
            </div>
          </div>

          <div className="flex items-end justify-between h-40 gap-2 sm:gap-3">
            {weeklyData.map((dayData, i) => {
              const barHeight = getBarHeight(dayData.hours);
              const isHovered = hoveredDay === i;
              const isDimmed = hoveredDay !== null && hoveredDay !== i;
              const reachedTarget = meetsTarget(dayData.hours);

              return (
                <div
                  key={`${dayData.day}-${i}`}
                  className="flex flex-col items-center justify-end h-full flex-1 group"
                  onMouseEnter={() => setHoveredDay(i)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Hours Display */}
                  <div className="h-6 mb-1 flex items-end justify-center">
                    <span
                      className={`text-xs font-bold transition-colors duration-300 ${
                        isHovered
                          ? "text-text-primary"
                          : reachedTarget
                          ? "text-green-400"
                          : dayData.hours > 0
                          ? "text-text-secondary"
                          : "text-text-tertiary"
                      }`}
                    >
                      {dayData.hours > 0 ? `${dayData.hours}h` : "—"}
                    </span>
                  </div>

                  {/* The Bar Container */}
                  <div
                    className="relative w-full h-full bg-surface-highlight/30 rounded-lg overflow-hidden backdrop-blur-sm transition-opacity duration-300"
                    style={{ opacity: isDimmed ? 0.3 : 1 }}
                  >
                    {/* The Fill Bar */}
                    <motion.div
                      initial={{ height: "5%" }}
                      animate={{ height: `${barHeight}%` }}
                      transition={{
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1],
                        delay: i * 0.05,
                      }}
                      className={`absolute bottom-0 left-0 right-0 w-full rounded-t-[2px] transition-all duration-300 ${
                        reachedTarget
                          ? "bg-gradient-to-t from-green-600 via-emerald-500 to-green-400"
                          : dayData.hasActivity
                          ? "bg-gradient-to-t from-violet-600 via-fuchsia-500 to-pink-400"
                          : "bg-surface-highlight"
                      }`}
                    >
                      {/* Glow Effect */}
                      {dayData.hasActivity && dayData.hours > 0 && (
                        <div
                          className={`absolute top-0 left-0 right-0 h-[2px] shadow-[0_0_10px_2px_rgba(255,255,255,0.4)] ${
                            reachedTarget ? "bg-green-200/70" : "bg-white/50"
                          }`}
                        />
                      )}

                      {/* Target Achievement Badge */}
                      {reachedTarget && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[8px] font-bold px-1 rounded">
                          ✓
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Day Label */}
                  <div className="mt-3 text-center">
                    <span
                      className={`text-[10px] font-bold uppercase transition-colors duration-300 ${
                        isHovered
                          ? "text-text-primary"
                          : reachedTarget
                          ? "text-green-400"
                          : dayData.hasActivity
                          ? "text-text-secondary"
                          : "text-text-tertiary"
                      }`}
                    >
                      {dayData.day}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer / Stats */}
        <div className="flex items-center justify-between border-t border-border pt-4 z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Target size={12} />
              <span className="text-[10px] uppercase font-bold tracking-wider">
                Remaining
              </span>
            </div>
            <span className="text-xs font-medium text-text-primary mt-0.5">
              {remainingHours.toFixed(1)}h / {WEEKLY_GOAL}h
            </span>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Flame size={12} />
              <span className="text-[10px] uppercase font-bold tracking-wider">
                Logged
              </span>
            </div>
            <span
              className={`text-xs font-medium mt-0.5 ${
                weeklyProgress >= 100 ? "text-green-400" : "text-text-primary"
              }`}
            >
              {totalHours.toFixed(1)}h This Week
            </span>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-text-secondary text-center">
            {weeklyProgress >= 100
              ? " Weekly goal achieved! Now fuck off and hike"
              : isOnTrack
              ? ` On track biatch! ${remainingHours.toFixed(
                  1
                )}h to reach your 80h goal`
              : ` Push harder bruh! or apply mcdonald's | ${remainingHours.toFixed(
                  1
                )}h remaining to hit target`}
          </p>
        </div>

        {/* Background Gradient Blob */}
        {hasData && (
          <div
            className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
              weeklyProgress >= 100 ? "bg-green-500/10" : "bg-violet-500/10"
            }`}
          />
        )}
      </div>
    </motion.div>
  );
}