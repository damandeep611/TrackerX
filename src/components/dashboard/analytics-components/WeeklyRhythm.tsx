"use client"

import { getLastSevenDaysActivity } from '@/actions/timeLogAction';
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface WeeklyData {
  day: string;
  hours: number;
  hasActivity: boolean;
}


export default function WeeklyRhythm() {
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
     <motion.div
        className="lg:col-span-2 h-full "
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div
          className=" flex flex-col h-full  justify-between rounded-xl border border-border bg-surface p-6 transition-colors hover:border-text-tertiary/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Header */}
          <div className="flex gap-4 mb-6">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl  border 
        text-purple-400 border-purple-500/20 bg-purple-500/10`}
            >
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
                Weekly Rhythm
              </h3>
              <p className="text-xs font-medium text-text-secondary mt-0.5">
                Consistency Analytics
              </p>
            </div>
          </div>

          {/* Main Stat */}
          <div className="mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-text-primary mb-1"
            >
              {activeDays} of 7 days
            </motion.h2>
            <p className="text-xs text-text-tertiary">
              You&apos;ve logged time this week
            </p>
          </div>

          {/* Weekly Heatmap */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              {weeklyData.map((day) => (
                <div key={day.day} className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg border text-sm font-medium transition-all duration-300 ${
                      day.hasActivity
                        ? "border-zinc-700 bg-zinc-800 text-zinc-200 shadow-lg shadow-black/40"
                        : "border-border bg-surface-highlight/30 text-text-tertiary"
                    }`}
                  >
                    <span className="text-xs">
                      {day.hours > 0 ? day.hours.toFixed(1) : "—"}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* footer */}
          <div className=" border-t mt-6 pt-6">
            <p className="text-xs text-text-secondary">
              {activeDays === 0
                ? "No activity logged this week"
                : activeDays === 7
                ? "Perfect consistency! You logged time every day"
                : `Great progress! ${activeDays} active days this week`}
            </p>
          </div>
        </motion.div>
      </motion.div>
  )
}
