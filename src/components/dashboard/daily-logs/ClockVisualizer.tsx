import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { 
  Entry, 
  ActivityEntry, 
  LogNoteEntry, 
  EntryType, 
  TimeSlot 
} from '@/types/dailyLogTypes'
import {
  MINUTES_PER_DAY,
  OUTER_RADIUS,
  INNER_RADIUS,
  CENTER,
  CLOCK_SIZE,
  minutesToDegrees,
  degreesToMinutes,
  polarToCartesian,
  describeDonut,
} from '@/utils/dailyLogUtils'

interface ClockVisualizerProps {
  entries: Entry[]
  onTimeSelect: (minutes: number) => void
  isModalOpen: boolean
  previewSlots?: TimeSlot[]
  previewColor?: string
  previewType?: EntryType
}

export function ClockVisualizer({ 
  entries, 
  onTimeSelect, 
  isModalOpen,
  previewSlots = [],
  previewColor,
  previewType
}: ClockVisualizerProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Hover interaction state
  const [hoverTime, setHoverTime] = useState<Date | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [cursorAngle, setCursorAngle] = useState<number | null>(null)

  useEffect(() => {
    setIsMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    const angle = Math.atan2(y, x) * (180 / Math.PI)
    setCursorAngle(angle)
    
    const minutes = degreesToMinutes(angle)
    const d = new Date()
    d.setHours(Math.floor(minutes / 60))
    d.setMinutes(minutes % 60)
    setHoverTime(d)
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setHoverTime(null)
    setCursorAngle(null)
  }

  const handleClockClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    const distance = Math.sqrt(x*x + y*y);
    if (distance < INNER_RADIUS - 30 || distance > OUTER_RADIUS + 50) return;

    const angle = Math.atan2(y, x) * (180 / Math.PI)
    const minutes = degreesToMinutes(angle)
    const snapped = Math.round(minutes / 15) * 15
    
    onTimeSelect(snapped)
  }

  const displayTime = isHovering && hoverTime ? hoverTime : currentTime

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex items-center justify-center relative"
    >
      <div className="relative group">
         
         <svg 
           width={CLOCK_SIZE} 
           height={CLOCK_SIZE} 
           viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
           className="cursor-crosshair active:scale-[0.99] transition-transform duration-200"
           onClick={handleClockClick}
           onMouseMove={handleMouseMove}
           onMouseLeave={handleMouseLeave}
         >
           <defs>
             <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
               <feGaussianBlur stdDeviation="3" result="blur" />
               <feComposite in="SourceGraphic" in2="blur" operator="over" />
             </filter>
             <linearGradient id="grad-sleep" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#4f46e5" />
               <stop offset="100%" stopColor="#9333ea" />
             </linearGradient>
           </defs>
           
           {/* Background Tracks */}
           <circle 
              cx={CENTER} cy={CENTER} r={OUTER_RADIUS} 
              fill="none" 
              stroke="currentColor" 
              strokeOpacity={0.05} 
              strokeWidth={1} 
           />
           <circle 
              cx={CENTER} cy={CENTER} r={INNER_RADIUS} 
              fill="none" 
              stroke="currentColor" 
              strokeOpacity={0.05} 
              strokeWidth={1} 
           />
           
           {/* Ticks & Labels */}
           {isMounted && Array.from({ length: 12 }).map((_, i) => {
             const hour = i * 2
             const angle = (hour * 15) - 90
             const isMain = hour % 4 === 0
             
             const tickInner = isMain ? OUTER_RADIUS - 8 : OUTER_RADIUS - 5
             const tickOuter = OUTER_RADIUS
             
             const start = polarToCartesian(CENTER, CENTER, tickInner, angle)
             const end = polarToCartesian(CENTER, CENTER, tickOuter, angle)
             
             const labelPos = polarToCartesian(CENTER, CENTER, OUTER_RADIUS + 24, angle)

             return (
               <g key={i}>
                 <line 
                  x1={start.x} y1={start.y} x2={end.x} y2={end.y} 
                  stroke="currentColor" 
                  strokeWidth={isMain ? 2 : 1} 
                  strokeOpacity={isMain ? 0.3 : 0.1} 
                 />
                 {isMain && (
                   <text 
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-text-tertiary font-mono select-none font-medium"
                    style={{ fontSize: '11px' }}
                   >
                     {hour === 0 ? '12AM' : hour === 12 ? '12PM' : hour > 12 ? `${hour-12}PM` : `${hour}AM`}
                   </text>
                 )}
               </g>
             )
           })}

           {/* Dynamic Center Time */}
           <g className="pointer-events-none select-none transition-all duration-300">
              <text 
                  x={CENTER} 
                  y={CENTER - 5} 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className={cn(
                      "text-5xl font-extralight tracking-tighter transition-colors duration-200",
                      isHovering ? "fill-primary" : "fill-text-secondary"
                  )}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                  {isMounted ? format(displayTime, 'HH:mm') : '--:--'}
              </text>
              <text 
                  x={CENTER} 
                  y={CENTER + 25} 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className={cn(
                      "text-sm font-medium uppercase tracking-widest transition-colors duration-200",
                       isHovering ? "fill-accent" : "fill-text-tertiary"
                  )}
              >
                  {isMounted ? format(displayTime, 'a') : ''}
              </text>
           </g>

           {/* Activities (Donut Segments) */}
           {isMounted && entries.filter((e): e is ActivityEntry => e.type === 'activity').map((activity) => (
             <g key={activity.id}>
               {activity.slots.map((slot, idx) => {
                 const startAngle = minutesToDegrees(slot.start)
                 const endAngle = minutesToDegrees(slot.end)
                 const path = describeDonut(CENTER, CENTER, INNER_RADIUS, OUTER_RADIUS, startAngle, endAngle)
                 return (
                   <motion.path
                     key={`${activity.id}-${idx}`}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 0.9 }}
                     d={path}
                     fill={activity.color}
                     stroke="none"
                     className="hover:opacity-100 transition-opacity"
                   />
                 )
               })}
             </g>
           ))}

          {/* Modal Preview */}
          {isModalOpen && previewType === 'activity' && previewSlots.map((slot, idx) => {
               const startAngle = minutesToDegrees(slot.start)
               const endAngle = minutesToDegrees(slot.end)
               const path = describeDonut(CENTER, CENTER, INNER_RADIUS, OUTER_RADIUS, startAngle, endAngle)
               return (
                  <motion.path
                      key={`preview-${idx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      d={path}
                      fill={previewColor}
                      fillOpacity={0.5}
                      stroke={previewColor?.startsWith('url') ? undefined : previewColor}
                      strokeWidth={1}
                      className="animate-pulse"
                  />
               )
          })}

           {/* Log Notes */}
           {isMounted && entries.filter((e): e is LogNoteEntry => e.type === 'log-note').map((note) => {
             const angle = minutesToDegrees(note.time)
             const p = polarToCartesian(CENTER, CENTER, INNER_RADIUS - 8, angle)
             return (
               <motion.g key={note.id} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <circle cx={p.x} cy={p.y} r={2} fill="var(--foreground)" className="opacity-80" />
               </motion.g>
             )
           })}

          {/* Hover Cursor */}
          {(isHovering || isModalOpen) && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <line
                      x1={polarToCartesian(CENTER, CENTER, INNER_RADIUS - 10, cursorAngle || (isModalOpen ? minutesToDegrees(previewSlots[0]?.start || 0) : 0)).x}
                      y1={polarToCartesian(CENTER, CENTER, INNER_RADIUS - 10, cursorAngle || (isModalOpen ? minutesToDegrees(previewSlots[0]?.start || 0) : 0)).y}
                      x2={polarToCartesian(CENTER, CENTER, OUTER_RADIUS + 10, cursorAngle || (isModalOpen ? minutesToDegrees(previewSlots[0]?.start || 0) : 0)).x}
                      y2={polarToCartesian(CENTER, CENTER, OUTER_RADIUS + 10, cursorAngle || (isModalOpen ? minutesToDegrees(previewSlots[0]?.start || 0) : 0)).y}
                      stroke={isModalOpen ? "#6366f1" : "currentColor"}
                      strokeOpacity={isModalOpen ? 1 : 0.2}
                      strokeWidth={1}
                      strokeDasharray={isModalOpen ? "none" : "2 4"}
                   />
                   <circle 
                      cx={polarToCartesian(CENTER, CENTER, OUTER_RADIUS, cursorAngle || (isModalOpen ? minutesToDegrees(previewSlots[0]?.start || 0) : 0)).x} 
                      cy={polarToCartesian(CENTER, CENTER, OUTER_RADIUS, cursorAngle || (isModalOpen ? minutesToDegrees(previewSlots[0]?.start || 0) : 0)).y} 
                      r={2} 
                      fill={isModalOpen ? "#6366f1" : "currentColor"}
                  />
              </motion.g>
          )}

         </svg>
      </div>
    </motion.div>
  )
}
