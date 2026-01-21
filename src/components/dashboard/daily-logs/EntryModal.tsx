import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Clock, Trash2 } from 'lucide-react'
import { TimeSlot, EntryType, MODAL_COLORS, Entry } from '@/types/dailyLogTypes'
import { formatTime } from '@/utils/dailyLogUtils'
import { cn } from '@/lib/utils'

interface EntryModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTime: number
  onSave: (entryData: { 
    type: EntryType
    content?: string
    title?: string
    slots?: TimeSlot[]
    color?: string
  }) => void
  onPreviewChange: (data: { slots: TimeSlot[], color: string, type: EntryType }) => void
}

export function EntryModal({ isOpen, onClose, selectedTime, onSave, onPreviewChange }: EntryModalProps) {
  const [modalType, setModalType] = useState<EntryType>('log-note')
  const [tempLogNote, setTempLogNote] = useState('')
  const [tempActivityTitle, setTempActivityTitle] = useState('')
  const [tempActivitySlots, setTempActivitySlots] = useState<TimeSlot[]>([])
  const [selectedColor, setSelectedColor] = useState(MODAL_COLORS[0].value)

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalType('log-note')
      setTempLogNote('')
      setTempActivityTitle('')
      setTempActivitySlots([{ id: crypto.randomUUID(), start: selectedTime, end: Math.min(selectedTime + 60, 1440) }])
      setSelectedColor(MODAL_COLORS[0].value)
    }
  }, [isOpen, selectedTime])

  // Broadcast preview changes
  useEffect(() => {
    if (isOpen) {
      onPreviewChange({
        slots: tempActivitySlots,
        color: selectedColor,
        type: modalType
      })
    }
  }, [tempActivitySlots, selectedColor, modalType, isOpen, onPreviewChange])

  const handleSave = () => {
    if (modalType === 'log-note') {
      if (!tempLogNote.trim()) return
      onSave({
        type: 'log-note',
        content: tempLogNote
      })
    } else {
      if (!tempActivityTitle.trim()) return
      const validSlots = tempActivitySlots.filter(s => s.end > s.start)
      if (validSlots.length === 0) return

      onSave({
        type: 'activity',
        title: tempActivityTitle,
        slots: validSlots,
        color: selectedColor
      })
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                      onClick={onClose}
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
                      onClick={onClose}
                      className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2"
                  >
                      Cancel
                  </button>
                  <button 
                      onClick={handleSave}
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
  )
}
