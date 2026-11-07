"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { skillTodo } from "@/types/skillDashboardTypes";
import { format, addDays, isSameDay, eachDayOfInterval, subDays } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { Timer, Plus, Calendar, ChevronRight } from "lucide-react";

interface SkillTimelineProps {
  tasks: skillTodo[];
  skillName: string;
  timeByDate?: Record<string, number>;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export default function SkillTimeline({ tasks, skillName, timeByDate = {}, selectedDate = new Date(), onDateSelect }: SkillTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const dateRange = useMemo(() => {
    const today = new Date();
    const start = subDays(today, 4);
    const end = addDays(today, 8);
    return eachDayOfInterval({ start, end });
  }, []);

  const today = new Date();

  const tasksByDate = useMemo(() => {
    const map: Record<string, skillTodo[]> = {};
    tasks.forEach((task) => {
      const dateKey = format(new Date(task.date), "yyyy-MM-dd");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(task);
    });
    return map;
  }, [tasks]);

  useEffect(() => {
    if (containerRef.current) {
      const todayElement = containerRef.current.querySelector('[data-today="true"]');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, []);

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="w-full bg-card/30 border border-border/50 rounded-2xl overflow-hidden mb-8 shadow-sm backdrop-blur-md">
      {/* Compact Header */}
      <div className="px-4 py-2.5 border-b border-border/40 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-primary/70" />
          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.15em]">Neural Timeline</h3>
          <span className="text-[9px] text-muted-foreground font-medium px-2 py-0.5 bg-background/50 rounded-full border border-border/40 uppercase tracking-tighter">
            {skillName}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-black text-primary uppercase tracking-tighter">Active Sync</span>
           </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="overflow-x-auto custom-scrollbar relative p-4 min-h-[180px] bg-grid-white/[0.01]"
      >
        <div className="flex min-w-max gap-0 h-full relative">
          {dateRange.map((date) => {
            const dateKey = format(date, "yyyy-MM-dd");
            const dayTasks = tasksByDate[dateKey] || [];
            const dayMinutes = timeByDate[dateKey] || 0;
            const isToday = isSameDay(date, today);
            const isSelected = isSameDay(date, selectedDate);

            return (
              <button 
                key={dateKey} 
                onClick={() => onDateSelect?.(date)}
                className={`flex flex-col items-center w-32 relative px-3 transition-all duration-300
                  ${isSelected ? "z-10" : "opacity-80 hover:opacity-100"}
                `}
                data-today={isToday}
              >
                {/* Date Header */}
                <div className={`mb-6 text-center transition-all duration-300 ${isSelected ? "scale-105" : ""}`}>
                  <span className={`text-[8px] font-black uppercase block tracking-widest mb-1.5 ${isSelected ? "text-primary" : "text-muted-foreground/50"}`}>
                    {format(date, "EEE")}
                  </span>
                  
                  <div className={`relative px-2.5 py-1 rounded-lg transition-all border ${
                    isSelected 
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                      : isToday
                      ? "border-primary/30 text-primary bg-primary/5"
                      : "border-transparent text-foreground font-bold"
                  }`}>
                    <span className="text-[11px] whitespace-nowrap">
                      {format(date, "d MMM")}
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {dayMinutes > 0 && (
                       <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-[9px] font-bold text-primary/70 flex items-center justify-center gap-1"
                      >
                        <Timer size={10} strokeWidth={2.5} />
                        {formatMinutes(dayMinutes)}
                       </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Vertical Connector */}
                <div className={`absolute top-[68px] bottom-0 w-[1px] ${
                  isToday ? "bg-primary/40" : "bg-border/30"
                }`}>
                  {isToday && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-sm" />}
                </div>

                {/* Tasks Container */}
                <div className="flex flex-col gap-1.5 w-full mt-4 z-10">
                  {dayTasks.map((task, idx) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`group relative px-2 py-1.5 rounded-md text-[9px] font-bold border transition-all duration-200 cursor-default
                        ${task.status === 'done' 
                          ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10" 
                          : task.status === 'in_progress'
                          ? "bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10"
                          : "bg-background/50 text-foreground/80 border-border/60 hover:border-primary/30"
                        }`}
                    >
                      <div className="flex items-center gap-1.5">
                         <div className={`w-1 h-1 rounded-full shrink-0 ${
                           task.status === 'done' ? "bg-emerald-500" : 
                           task.status === 'in_progress' ? "bg-amber-500" : 
                           "bg-primary/40"
                         }`} />
                         <span className="truncate flex-1">{task.title}</span>
                      </div>
                      
                      {/* Interaction hint on hover */}
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <ChevronRight size={8} className="text-primary" />
                      </div>
                    </motion.div>
                  ))}
                  
                  {dayTasks.length === 0 && (
                    <div className="h-8 rounded-md border border-dashed border-border/20 bg-muted/5 w-full flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity">
                       <Plus size={10} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

