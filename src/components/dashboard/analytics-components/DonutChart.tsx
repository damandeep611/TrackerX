"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { skillColors } from './DailyHoursChart'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export default function DonutChart() {
  const data = [
    { name: "Sleep", value: 8, color: "#9CA3AF" },
    { name: "UI Design", value: 2.5, color: skillColors["UI Design"] },
    { name: "React", value: 2.5, color: skillColors["React"] },
    { name: "Writing", value: 1.5, color: skillColors["Writing"] },
    { name: "Free Time", value: 9.5, color: "#E5E7EB" },
  ]
  return (
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className=" rounded-md p-6 shadow-sm border border-border"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold ">Todays 24h Breakdown</h3>
        <p className="text-sm ">How you spent your day</p>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}h`, "Hours"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm ">{item.name}</span>
            </div>
            <span className="text-sm font-medium ">{item.value}h</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
