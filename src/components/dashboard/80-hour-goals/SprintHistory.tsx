"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Calendar, Clock } from "lucide-react";

interface Log {
  id: string;
  title: string;
  startTime: string; // ISO string
  durationMinutes: number;
}

interface SprintHistoryProps {
  logs: Log[];
  onDelete: (id: string) => void;
}

export function SprintHistory({ logs, onDelete }: SprintHistoryProps) {
  
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-muted/5">
         <Clock size={24} className="opacity-20 mb-2" />
         <p className="text-sm">No sprints logged yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Recent Velocity</h3>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className="group flex items-center justify-between p-4 bg-card hover:bg-muted/30 border border-border rounded-xl transition-all"
            >
              <div className="flex flex-col gap-1">
                 <span className="font-semibold text-foreground text-sm">{log.title}</span>
                 <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                       <Calendar size={10} />
                       {new Date(log.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                       <Clock size={10} />
                       {new Date(log.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="text-right">
                    <div className="font-mono font-bold text-blue-500 text-sm">
                       +{Math.floor(log.durationMinutes / 60)}h {log.durationMinutes % 60}m
                    </div>
                 </div>
                 
                 <button 
                    onClick={() => onDelete(log.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                 >
                    <Trash2 size={14} />
                 </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
