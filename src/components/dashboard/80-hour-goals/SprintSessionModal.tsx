"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock, PlayCircle, StopCircle, Save } from "lucide-react";

interface SprintSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; startTime: Date; endTime: Date }) => void;
}

export function SprintSessionModal({ isOpen, onClose, onSave }: SprintSessionModalProps) {
  const [title, setTitle] = useState("");
  // Default to 1 hour ago -> Now
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() - 1);
    return d.toTimeString().slice(0, 5);
  });
  const [endTime, setEndTime] = useState(() => {
    return new Date().toTimeString().slice(0, 5);
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Activity name is required");
      return;
    }

    const today = new Date();
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const start = new Date(today);
    start.setHours(startH, startM, 0, 0);

    const end = new Date(today);
    end.setHours(endH, endM, 0, 0);

    // Handle overnight logic roughly (if end < start, assume next day? Or just error?)
    // For simplicity, let's assume same day logging for now.
    if (end <= start) {
      setError("End time must be after start time");
      return;
    }

    onSave({ title, startTime: start, endTime: end });
    // Reset
    setTitle("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6">
               <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Log Sprint</h2>
                    <p className="text-xs text-muted-foreground">Record your deep work block.</p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                    <X size={20} />
                  </button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Activity Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Activity Name</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Read Documentation, Code Feature X"
                      autoFocus
                      className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                    />
                  </div>

                  {/* Time Blocks */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                           <PlayCircle size={12} className="text-blue-500" /> Start
                        </label>
                        <div className="relative">
                          <input 
                             type="time" 
                             value={startTime}
                             onChange={(e) => setStartTime(e.target.value)}
                             className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
                          />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                           <StopCircle size={12} className="text-pink-500" /> End
                        </label>
                        <div className="relative">
                          <input 
                             type="time" 
                             value={endTime}
                             onChange={(e) => setEndTime(e.target.value)}
                             className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
                          />
                        </div>
                     </div>
                  </div>

                  {/* Duration Preview or Error */}
                  {error ? (
                    <div className="text-red-400 text-xs font-medium bg-red-500/10 p-2 rounded-lg text-center">
                       {error}
                    </div>
                  ) : (
                     <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/20 py-2 rounded-lg">
                        <Clock size={12} />
                        <span>Calculated Duration: </span>
                        <span className="font-mono font-bold text-foreground">
                           {(() => {
                              const [sH, sM] = startTime.split(":").map(Number);
                              const [eH, eM] = endTime.split(":").map(Number);
                              const mins = (eH * 60 + eM) - (sH * 60 + sM);
                              if (mins <= 0) return "--";
                              const h = Math.floor(mins/60);
                              const m = mins % 60;
                              return `${h}h ${m}m`;
                           })()}
                        </span>
                     </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Save Session
                  </button>
               </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
