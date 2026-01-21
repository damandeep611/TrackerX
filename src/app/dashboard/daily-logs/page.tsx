"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  X, 
  Calendar, 
  Trash2,
  Clock,
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Types ---
type TimeSlot = {
  id: string
  start: number // Minutes from midnight (0-1440)
  end: number   // Minutes from midnight
}

type EntryType = 'log-note' | 'activity'

interface BaseEntry {
  id: string
  type: EntryType
  createdAt: Date
}

interface LogNoteEntry extends BaseEntry {
  type: 'log-note'
  time: number // Minutes from midnight
  content: string
}

interface ActivityEntry extends BaseEntry {
  type: 'activity'
  title: string
  slots: TimeSlot[]
  color: string
}

type Entry = LogNoteEntry | ActivityEntry

// --- Constants ---
const MINUTES_PER_DAY = 1440
const OUTER_RADIUS = 180
const INNER_RADIUS = 115
const CENTER = 260 // SVG Center (width/height 520)
const CLOCK_SIZE = 520

const MODAL_COLORS = [
  { label: 'Exercise', value: '#10b981', type: 'solid' }, // Emerald
  { label: 'Work', value: '#0ea5e9', type: 'solid' }, // Sky Blue
  { label: 'Sleep', value: 'url(#grad-sleep)', css: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)', type: 'gradient' },
  { label: 'Deep Work', value: '#6366f1', type: 'solid' }, // Indigo
  { label: 'Health', value: '#f43f5e', type: 'solid' }, // Rose
  { label: 'Learning', value: '#f59e0b', type: 'solid' }, // Amber
  { label: 'Relax', value: '#8b5cf6', type: 'solid' }, // Violet
]

// --- Helper Functions ---
const minutesToDegrees = (minutes: number) => {
  // 0 minutes = -90 degrees (12 AM at top)
  // 1440 minutes = 360 degrees
  return (minutes / MINUTES_PER_DAY) * 360 - 90
}

const degreesToMinutes = (degrees: number) => {
  // Adjust for -90 offset
  let adjusted = degrees + 90
  if (adjusted < 0) adjusted += 360
  // Normalize to 0-360
  adjusted = adjusted % 360
  return Math.round((adjusted / 360) * MINUTES_PER_DAY)
}

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

const describeDonut = (x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
    const startOuter = polarToCartesian(x, y, outerRadius, startAngle);
    const endOuter = polarToCartesian(x, y, outerRadius, endAngle);
    const startInner = polarToCartesian(x, y, innerRadius, startAngle);
    const endInner = polarToCartesian(x, y, innerRadius, endAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M", startOuter.x, startOuter.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
        "L", endInner.x, endInner.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 0, startInner.x, startInner.y,
        "Z"
    ].join(" ");
}

// --- Main Page Component ---
export default function DailyLogPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<EntryType>('log-note')
  const [selectedTime, setSelectedTime] = useState<number>(0) // Minutes
  const [isMounted, setIsMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Hover interaction state
  const [hoverTime, setHoverTime] = useState<Date | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [cursorAngle, setCursorAngle] = useState<number | null>(null)

  // Temporary state for the modal
  const [tempLogNote, setTempLogNote] = useState('')
  const [tempActivityTitle, setTempActivityTitle] = useState('')
  const [tempActivitySlots, setTempActivitySlots] = useState<TimeSlot[]>([])
  const [selectedColor, setSelectedColor] = useState(MODAL_COLORS[0].value)

  // Derived Stats
  const totalActivityMinutes = useMemo(() => {
    return entries
      .filter((e): e is ActivityEntry => e.type === 'activity')
      .reduce((acc, activity) => {
        const activityDuration = activity.slots.reduce((sAcc, slot) => sAcc + (slot.end - slot.start), 0)
        return acc + activityDuration
      }, 0)
  }, [entries])

  const totalLogNotes = useMemo(() => entries.filter(e => e.type === 'log-note').length, [entries])

  useEffect(() => {
    setIsMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000) // Update every second
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
    
    // Calculate distance from center to check if click is within the actionable ring (optional but nice)
    const distance = Math.sqrt(x*x + y*y);
    // Allow clicking slightly inside/outside the ring
    if (distance < INNER_RADIUS - 30 || distance > OUTER_RADIUS + 50) return;

    const angle = Math.atan2(y, x) * (180 / Math.PI)
    const minutes = degreesToMinutes(angle)
    
    // Snap to nearest 15 minutes for easier selection on this scale
    const snapped = Math.round(minutes / 15) * 15
    
    setSelectedTime(snapped)
    setTempActivitySlots([{ id: crypto.randomUUID(), start: snapped, end: Math.min(snapped + 60, 1440) }])
    setTempLogNote('')
    setTempActivityTitle('')
    setSelectedColor(MODAL_COLORS[0].value)
    setModalType('log-note') // Default to log-note
    setIsModalOpen(true)
  }

  const handleSaveEntry = () => {
    if (modalType === 'log-note') {
      if (!tempLogNote.trim()) return
      const newEntry: LogNoteEntry = {
        id: crypto.randomUUID(),
        type: 'log-note',
        createdAt: new Date(),
        time: selectedTime,
        content: tempLogNote
      }
      setEntries(prev => [...prev, newEntry])
    } else {
      if (!tempActivityTitle.trim()) return
      const validSlots = tempActivitySlots.filter(s => s.end > s.start)
      if (validSlots.length === 0) return

      const newEntry: ActivityEntry = {
        id: crypto.randomUUID(),
        type: 'activity',
        createdAt: new Date(),
        title: tempActivityTitle,
        slots: validSlots,
        color: selectedColor
      }
      setEntries(prev => [...prev, newEntry])
    }
    setIsModalOpen(false)
  }

  const displayTime = isHovering && hoverTime ? hoverTime : currentTime

  return (
    <div className="flex h-[calc(100vh-2rem)] w-full overflow-hidden bg-background text-primary font-sans p-6 gap-6">
      
      {/* --- Left Panel: Metadata --- */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 flex flex-col gap-8 pt-10"
      >
        <div>
          <h1 className="text-3xl font-light tracking-tight text-primary">Daily Log</h1>
          <p className="text-text-secondary mt-1 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {isMounted ? format(new Date(), 'EEEE, MMMM do') : "Loading..."}
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

      {/* --- Center Panel: Clock Visualization --- */}
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
             
             {/* Background Tracks (Subtle Rings) */}
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
             
             {/* Ticks & Labels (Minimalist) */}
             {isMounted && Array.from({ length: 12 }).map((_, i) => {
               const hour = i * 2 // 0, 2, 4, ... 22
               const angle = (hour * 15) - 90 // 15 degrees per hour
               const isMain = hour % 4 === 0 // 12, 4, 8
               
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
            {isModalOpen && modalType === 'activity' && tempActivitySlots.map((slot, idx) => {
                 const startAngle = minutesToDegrees(slot.start)
                 const endAngle = minutesToDegrees(slot.end)
                 const path = describeDonut(CENTER, CENTER, INNER_RADIUS, OUTER_RADIUS, startAngle, endAngle)
                 return (
                    <motion.path
                        key={`preview-${idx}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        d={path}
                        fill={selectedColor}
                        fillOpacity={0.5}
                        stroke={selectedColor.startsWith('url') ? undefined : selectedColor}
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

            {/* Hover Cursor / Selection Indicator */}
            {(isHovering || isModalOpen) && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     {/* Radial Line Cursor */}
                     <line
                        x1={polarToCartesian(CENTER, CENTER, INNER_RADIUS - 10, cursorAngle || minutesToDegrees(selectedTime)).x}
                        y1={polarToCartesian(CENTER, CENTER, INNER_RADIUS - 10, cursorAngle || minutesToDegrees(selectedTime)).y}
                        x2={polarToCartesian(CENTER, CENTER, OUTER_RADIUS + 10, cursorAngle || minutesToDegrees(selectedTime)).x}
                        y2={polarToCartesian(CENTER, CENTER, OUTER_RADIUS + 10, cursorAngle || minutesToDegrees(selectedTime)).y}
                        stroke={isModalOpen ? "#6366f1" : "currentColor"}
                        strokeOpacity={isModalOpen ? 1 : 0.2}
                        strokeWidth={1}
                        strokeDasharray={isModalOpen ? "none" : "2 4"}
                     />
                     {/* Tip Dot */}
                     <circle 
                        cx={polarToCartesian(CENTER, CENTER, OUTER_RADIUS, cursorAngle || minutesToDegrees(selectedTime)).x} 
                        cy={polarToCartesian(CENTER, CENTER, OUTER_RADIUS, cursorAngle || minutesToDegrees(selectedTime)).y} 
                        r={2} 
                        fill={isModalOpen ? "#6366f1" : "currentColor"}
                    />
                </motion.g>
            )}

           </svg>
        </div>
      </motion.div>

      {/* --- Right Panel: Timeline --- */}
      <motion.div 
         initial={{ opacity: 0, x: 20 }}
         animate={{ opacity: 1, x: 0 }}
         className="w-80 border-l border-border pl-6 pt-6 flex flex-col"
      >
        <div className="flex items-center justify-between mb-8">
             <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Timeline</h2>
             <div className="text-xs text-text-tertiary">{entries.length} Entries</div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
            <AnimatePresence mode='popLayout'>
                {entries.sort((a,b) => {
                    const timeA = a.type === 'log-note' ? a.time : a.slots[0].start
                    const timeB = b.type === 'log-note' ? b.time : b.slots[0].start
                    return timeA - timeB
                }).map((entry) => (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        layout
                        className="group relative pl-4 border-l-2 border-border hover:border-accent transition-colors duration-200"
                    >
                        {entry.type === 'activity' ? (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono text-text-tertiary">
                                        {formatTime(entry.slots[0].start)}
                                    </span>
                                    <button 
                                        onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive p-1 rounded hover:bg-surface"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="font-medium text-primary flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: MODAL_COLORS.find(c => c.value === entry.color)?.css || entry.color }} />
                                    {entry.title}
                                </div>
                                <div className="text-xs text-text-secondary">
                                    {entry.slots.map(s => `${formatTime(s.start)} - ${formatTime(s.end)}`).join(', ')}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                     <span className="text-xs font-mono text-text-tertiary">{formatTime(entry.time)}</span>
                                     <button 
                                        onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive p-1 rounded hover:bg-surface"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="text-sm text-text-secondary italic">
                                    &quot;{entry.content}&quot;
                                </div>
                            </div>
                        )}
                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-border group-hover:bg-accent transition-colors" />
                    </motion.div>
                ))}
                
                {entries.length === 0 && (
                    <div className="text-center text-text-tertiary py-10 text-sm">
                        No entries yet. Click the clock to log your day.
                    </div>
                )}
            </AnimatePresence>
        </div>
      </motion.div>

      {/* --- Entry Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg bg-[#0f1219] border border-[#2e323e] rounded-3xl shadow-2xl overflow-hidden relative z-10 text-slate-200"
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-2 flex items-center justify-between">
                    <div className="bg-[#1a1d26] p-1 rounded-lg flex items-center gap-1">
                        <button 
                            onClick={() => setModalType('log-note')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                modalType === 'log-note' ? "bg-[#232634] text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            Log Note
                        </button>
                        <button 
                            onClick={() => setModalType('activity')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                modalType === 'activity' ? "bg-[#232634] text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            Activity
                        </button>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {modalType === 'log-note' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recorded At</label>
                                <div className="text-4xl font-mono text-white tracking-wide">
                                    {formatTime(selectedTime)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reflective Note</label>
                                <textarea 
                                    autoFocus
                                    value={tempLogNote}
                                    onChange={(e) => setTempLogNote(e.target.value)}
                                    placeholder="What was on your mind at this moment?"
                                    className="w-full bg-[#161922] border border-[#2e323e] rounded-xl p-4 min-h-[140px] resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-slate-300 placeholder:text-slate-600 transition-all"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Activity Name</label>
                                <input 
                                    autoFocus
                                    type="text"
                                    value={tempActivityTitle}
                                    onChange={(e) => setTempActivityTitle(e.target.value)}
                                    placeholder="Project, Habit, Work..."
                                    className="w-full bg-[#161922] border border-[#2e323e] rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visual Identity & Tag</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {MODAL_COLORS.map((color) => (
                                        <button
                                            key={color.label}
                                            onClick={() => setSelectedColor(color.value)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-2 rounded-xl border transition-all",
                                                selectedColor === color.value 
                                                    ? "bg-[#232634] border-indigo-500/50" 
                                                    : "bg-transparent border-transparent hover:bg-[#1a1d26] hover:border-[#2e323e]"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "w-8 h-8 rounded-full shadow-lg",
                                                    selectedColor === color.value && "ring-2 ring-white ring-offset-2 ring-offset-[#0f1219]"
                                                )}
                                                style={{ background: color.css || color.value }}
                                            />
                                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{color.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time Slots</label>
                                    <button 
                                        onClick={() => setTempActivitySlots(prev => [...prev, { id: crypto.randomUUID(), start: selectedTime, end: Math.min(selectedTime + 60, 1440) }])}
                                        className="text-xs text-[#6366f1] hover:text-[#818cf8] font-semibold flex items-center gap-1 uppercase tracking-wider transition-colors"
                                    >
                                        <Plus className="w-3 h-3" /> Add Range
                                    </button>
                                </div>
                                
                                <div className="space-y-2">
                                    {tempActivitySlots.map((slot, idx) => (
                                        <div key={slot.id} className="bg-[#161922] rounded-xl border border-[#2e323e] p-3 flex items-center justify-between group transition-colors hover:border-[#3e4250]">
                                           <div className="flex items-center gap-4 text-sm text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-slate-500" />
                                                    <input 
                                                        type="time" 
                                                        value={formatTime(slot.start)} 
                                                        onChange={(e) => {
                                                            const [h, m] = e.target.value.split(':').map(Number)
                                                            const mins = h * 60 + m
                                                            const newSlots = [...tempActivitySlots]
                                                            newSlots[idx].start = mins
                                                            setTempActivitySlots(newSlots)
                                                        }}
                                                        className="bg-transparent w-14 focus:outline-none font-mono text-center hover:text-white transition-colors"
                                                    />
                                                </div>
                                                <span className="text-slate-600 font-medium">to</span>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-slate-500" />
                                                    <input 
                                                        type="time" 
                                                        value={formatTime(slot.end)} 
                                                        onChange={(e) => {
                                                            const [h, m] = e.target.value.split(':').map(Number)
                                                            const mins = h * 60 + m
                                                            const newSlots = [...tempActivitySlots]
                                                            newSlots[idx].end = mins
                                                            setTempActivitySlots(newSlots)
                                                        }}
                                                        className="bg-transparent w-14 focus:outline-none font-mono text-center hover:text-white transition-colors"
                                                    />
                                                </div>
                                           </div>
                                           {tempActivitySlots.length > 1 && (
                                                <button 
                                                    onClick={() => setTempActivitySlots(prev => prev.filter(s => s.id !== slot.id))}
                                                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                           )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-2 flex items-center justify-between border-t border-[#2e323e]/50 mt-2">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSaveEntry}
                        className="px-8 py-3 bg-[#4338ca] hover:bg-[#3730a3] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95 flex items-center gap-2"
                    >
                        {/* Simple icon for save button */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                            <path d="M19 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H16L20 7V20C20 20.5523 19.5523 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Save {modalType === 'log-note' ? 'Log Note' : 'Activity'}
                    </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
