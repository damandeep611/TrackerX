import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { Entry, MODAL_COLORS } from '@/types/dailyLogTypes'
import { formatTime } from '@/utils/dailyLogUtils'

interface LogTimelineProps {
  entries: Entry[]
  onDelete: (id: string) => void
}

export function LogTimeline({ entries, onDelete }: LogTimelineProps) {
  // Sort entries chronologically
  const sortedEntries = [...entries].sort((a,b) => {
    const timeA = a.type === 'log-note' ? a.time : a.slots[0].start
    const timeB = b.type === 'log-note' ? b.time : b.slots[0].start
    return timeA - timeB
  })

  return (
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
              {sortedEntries.map((entry) => (
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
                                      onClick={() => onDelete(entry.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive p-1 rounded hover:bg-surface"
                                  >
                                      <Trash2 className="w-3 h-3" />
                                  </button>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                  <div className="flex items-center gap-2">
                                      <div 
                                          className="w-2 h-2 rounded-full" 
                                          style={{ background: MODAL_COLORS.find(c => c.value === entry.color)?.css || entry.color }} 
                                      />
                                      <span className="font-medium text-primary">{entry.title}</span>
                                  </div>
                                  {(() => {
                                      const colorObj = MODAL_COLORS.find(c => c.value === entry.color);
                                      return colorObj && (
                                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface border border-border text-text-tertiary font-bold uppercase tracking-wider">
                                              {colorObj.label}
                                          </span>
                                      );
                                  })()}
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
                                      onClick={() => onDelete(entry.id)}
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
                      <div className="absolute -left-1.25 top-0 w-2 h-2 rounded-full bg-border group-hover:bg-accent transition-colors" />
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
  )
}
