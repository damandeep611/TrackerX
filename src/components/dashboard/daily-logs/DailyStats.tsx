import React from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface DailyStatsProps {
  totalActivityMinutes: number
  totalLogNotes: number
}

export function DailyStats({ totalActivityMinutes, totalLogNotes }: DailyStatsProps) {
  const isMounted = true // Assuming client-side hydration is handled by parent or useEffect

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

      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-surface/50 border border-border backdrop-blur-sm">
          <div className="text-sm text-text-tertiary uppercase tracking-wider mb-1">Total Focused</div>
          <div className="text-4xl font-extralight text-primary">
            {Math.floor(totalActivityMinutes / 60)}<span className="text-lg text-text-tertiary">h</span> {totalActivityMinutes % 60}<span className="text-lg text-text-tertiary">m</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface/50 border border-border backdrop-blur-sm">
          <div className="text-sm text-text-tertiary uppercase tracking-wider mb-1">Log Notes</div>
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
