"use client"
import { motion } from 'framer-motion'
import { BarChart3Icon, TrendingUpIcon } from 'lucide-react'
import React from 'react'

interface WeeklyData {
  day: string
  hours: number
  hasActivity: boolean
}

export default function InsightsCards() {
   // Mock data - in real app this would come from props or API
  const weeklyData: WeeklyData[] = [
    { day: "Mon", hours: 2.5, hasActivity: true },
    { day: "Tue", hours: 1.8, hasActivity: true },
    { day: "Wed", hours: 0, hasActivity: false },
    { day: "Thu", hours: 3.2, hasActivity: true },
    { day: "Fri", hours: 2.1, hasActivity: true },
    { day: "Sat", hours: 1.5, hasActivity: true },
    { day: "Sun", hours: 0, hasActivity: false },
  ]

 
   const thisWeekHours = weeklyData.reduce((sum, day) => sum + day.hours, 0)
  const lastWeekHours = 8.5 // Mock data
  const weeklyChange = ((thisWeekHours - lastWeekHours) / lastWeekHours) * 100
  const activeDays = weeklyData.filter((day) => day.hasActivity).length
  return (
   
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Progress Comparison */}
        <motion.div
          className="dark:bg-zinc-900 p-6 rounded-2xl shadow-sm dark:hover:bg-zinc-800/50 transition-all duration-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUpIcon className="w-5 h-5 dark:text-zinc-400" />
            <h3 className="text-sm dark:text-zinc-400 font-medium">Weekly Progress</h3>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold ">{thisWeekHours.toFixed(1)}h</span>
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

          {/* Simple Bar Comparison */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs dark:text-zinc-400">This week</span>
              <span className="text-xs dark:text-zinc-300">{thisWeekHours.toFixed(1)}h</span>
            </div>
            <div className="w-full dark:bg-zinc-800 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(thisWeekHours / Math.max(thisWeekHours, lastWeekHours)) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs dark:text-zinc-400">Last week</span>
              <span className="text-xs dark:text-zinc-300">{lastWeekHours}h</span>
            </div>
            <div className="w-full dark:bg-zinc-800 rounded-full h-2">
              <div
                className="bg-zinc-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(lastWeekHours / Math.max(thisWeekHours, lastWeekHours)) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Consistency Tracker */}
        <motion.div
          className="dark:bg-zinc-900 p-6 rounded-2xl shadow-sm dark:hover:bg-zinc-800/50 transition-all duration-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3Icon className="w-5 h-5 dark:text-zinc-400" />
            <h3 className="text-sm dark:text-zinc-400 font-medium">Weekly Consistency</h3>
          </div>

          <div className="mb-4">
            <span className="text-2xl font-bold ">{activeDays} of 7 days</span>
            <p className="text-sm dark:text-zinc-400 mt-1">You&#39;ve logged time this week</p>
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
              <p className="text-xs dark:text-zinc-400">Your most consistent days are Thursday and Monday</p>
            </div>
          </div>
        </motion.div>
      </div>
  )
}
