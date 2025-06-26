"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Clock, FileText } from 'lucide-react'

interface SkillTrackingCardsProps {
  skillCurrentHours: string;
}

export default function SkillTrackingCards({
  skillCurrentHours,
}: SkillTrackingCardsProps) {
  return (
    <div className="p-4 px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* time spend card */}
        <motion.div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium">Total Time Spend</p>
                <p className="text-3xl font-bold">{skillCurrentHours}h</p>
                <p className="text-xs">+12% from last week</p>
              </div>
              <div>
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
        {/* avg time daily spend */}
        <motion.div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-xl p-6">
          <div className="absolute top-0 bottom-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium">Avg Time Per Day</p>
                <p className="text-3xl font-bold">4.0h</p>
                <p className="text-xs">+3% from last week</p>
              </div>
              <div>
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
        {/* Total tasks done */}
        <motion.div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-xl p-6">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium">
                  Total Tasks Done this Week
                </p>
                <p className="text-3xl font-bold">14</p>
                <p className="text-xs">5 Tasks Pending this week</p>
              </div>
              <div>
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
