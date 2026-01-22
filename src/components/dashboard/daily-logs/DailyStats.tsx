import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Moon } from 'lucide-react'
import { format } from 'date-fns'

interface DailyStatsProps {
  totalActivityMinutes: number
  totalFocusedMinutes: number
  totalSleepMinutes: number
  totalLogNotes: number
}

export function DailyStats({ 
  totalActivityMinutes, 
  totalFocusedMinutes, 
  totalSleepMinutes, 
  totalLogNotes 
}: DailyStatsProps) {
  const isMounted = true 

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-64 flex flex-col gap-8 pt-10"
    >
      <div>
        <h1 className="text-3xl font-light tracking-tight text-primary">Daily Log</h1>
        <p className="text-text-secondary mt-1 text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {format(new Date(), 'EEEE, MMMM do')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Total Focused Work */}
        <div className="p-4 rounded-xl bg-surface/50 border border-border backdrop-blur-sm">
          <div className="text-xs text-text-tertiary uppercase tracking-wider mb-1">Total Focused Work</div>
          <div className="text-4xl font-extralight text-primary">
            {Math.floor(totalFocusedMinutes / 60)}<span className="text-lg text-text-tertiary">h</span> {totalFocusedMinutes % 60}<span className="text-lg text-text-tertiary">m</span>
          </div>
        </div>

        {/* Sleep Widget */}
        {totalSleepMinutes > 0 && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm flex items-center gap-3">
             <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
               <Moon className="w-4 h-4" />
             </div>
             <div>
                <div className="text-[10px] text-indigo-400/80 uppercase tracking-wider">Sleep</div>
                <div className="text-xl font-light text-indigo-300">
                   {Math.floor(totalSleepMinutes / 60)}<span className="text-sm opacity-60">h</span> {totalSleepMinutes % 60}<span className="text-sm opacity-60">m</span>
                </div>
             </div>
          </div>
        )}

        {/* Log Notes */}
        <div className="p-4 rounded-xl bg-surface/50 border border-border backdrop-blur-sm">
          <div className="text-xs text-text-tertiary uppercase tracking-wider mb-1">Log Notes</div>
          <div className="text-4xl font-extralight text-primary flex items-baseline gap-2">
            {totalLogNotes}
            <span className="text-sm text-text-tertiary font-normal">captured</span>
          </div>
        </div>
      </div>

      <div className="mt-auto text-xs text-text-tertiary max-w-50">
        <p>Time is a canvas. Paint it with intention, not just activity.</p>
      </div>
    </motion.div>
  )
}