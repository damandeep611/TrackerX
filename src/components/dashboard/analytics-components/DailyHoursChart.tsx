"use client"
import { BarChart3 } from 'lucide-react'
import React from 'react'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const dailyLoggedData = [
  { date: "Mon", total: 5.5, "UI Design": 2, React: 2.5, Writing: 1 },
  { date: "Tue", total: 7.2, "UI Design": 3, React: 2.2, Writing: 1.5, Reading: 0.5 },
  { date: "Wed", total: 6.8, "UI Design": 2.5, React: 3, Writing: 1.3 },
  { date: "Thu", total: 8.1, "UI Design": 3.5, React: 2.5, Writing: 1.6, Reading: 0.5 },
  { date: "Fri", total: 6.3, "UI Design": 2.8, React: 2, Writing: 1.5 },
  { date: "Sat", total: 4.5, "UI Design": 1.5, React: 1.5, Writing: 1, Reading: 0.5 },
  { date: "Sun", total: 6.5, "UI Design": 2.5, React: 2.5, Writing: 1.5 },
]
export const skillColors = {
  "UI Design": "#3B82F6",
  React: "#10B981",
  Writing: "#F59E0B",
  Reading: "#EF4444",
}


export default function DailyHoursChart() {
  return (
   <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className=" rounded-md p-6 shadow-sm border border-border w-full m-2"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Daily Logged Time</h3>
          <p className="text-sm ">Last 7 days</p>
        </div>
        <BarChart3 className="w-5 h-5 " />
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyLoggedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              label={{ value: "Hours", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar dataKey="UI Design" stackId="a" fill={skillColors["UI Design"]} radius={[0, 0, 0, 0]} />
            <Bar dataKey="React" stackId="a" fill={skillColors["React"]} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Writing" stackId="a" fill={skillColors["Writing"]} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Reading" stackId="a" fill={skillColors["Reading"]} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
