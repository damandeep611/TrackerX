"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { skillTodo } from "@/types/skillDashboardTypes";
import { format, addDays, isSameDay, eachDayOfInterval, subDays } from "date-fns";
import { motion } from "framer-motion";
import { CalendarDays, Timer, Plus } from "lucide-react";

interface SkillTimelineProps {
  tasks: skillTodo[];
  skillName: string;
  timeByDate?: Record<string, number>;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export default function SkillTimeline({ tasks, skillName, timeByDate = {}, selectedDate = new Date(), onDateSelect }: SkillTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate date range: 3 days before today and 7 days after
  const dateRange = useMemo(() => {
    const today = new Date();
    const start = subDays(today, 3);
    const end = addDays(today, 7);
    return eachDayOfInterval({ start, end });
  }, []);

  const today = new Date();

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, skillTodo[]> = {};
    tasks.forEach((task) => {
      const dateKey = format(new Date(task.date), "yyyy-MM-dd");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(task);
    });
    return map;
  }, [tasks]);

  // Center the timeline on today initially
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
    <div className="w-full bg-card/40 border border-border/60 rounded-3xl overflow-hidden mb-10 shadow-sm backdrop-blur-sm">
      <div className="p-5 border-b border-border/50 bg-card/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
            <CalendarDays size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">Focus Timeline</h3>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-70">{skillName} Schedule</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold">
                   {String.fromCharCode(64 + i)}
                </div>
              ))}
           </div>
           <div className="h-4 w-px bg-border mx-1" />
           <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-tight">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
           </span>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="overflow-x-auto custom-scrollbar relative p-8 min-h-[260px] bg-grid-zinc-900/[0.02] dark:bg-grid-white/[0.02]"
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
                className={`flex flex-col items-center w-40 relative px-4 border-l border-border/30 last:border-r transition-colors text-left
                  ${isToday ? "bg-primary/[0.01]" : ""}
                  ${isSelected ? "bg-primary/[0.03]" : "hover:bg-muted/30"}
                `}
                data-today={isToday}
              >
                {/* Date Header */}
                <div className={`mb-10 text-center transition-all duration-300 ${isSelected ? "scale-110" : "opacity-80"}`}>
                  <span className={`text-[10px] font-black uppercase block tracking-widest mb-1 ${isSelected ? "text-primary" : "text-muted-foreground/60"}`}>
                    {format(date, "EEE")}
                  </span>
                  <div className={`relative inline-block px-3 py-1 rounded-full transition-all ${isSelected ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-foreground font-bold"}`}>
                    <span className="text-sm">
                      {format(date, "d MMM")}
                    </span>
                  </div>
                  
                  {dayMinutes > 0 && (
                     <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-2 text-[10px] font-black text-primary/80 flex items-center justify-center gap-1"
                    >
                        <Timer size={10} />
                        {formatMinutes(dayMinutes)}
                     </motion.div>
                  )}
                </div>

                {/* Vertical Line for Today */}
                {isToday && (
                   <div className="absolute top-0 bottom-0 w-0.5 bg-primary/40 -z-10">
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-4 border-background shadow-xl" />
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-primary/20" />
                   </div>
                )}

                {/* Tasks for this day */}
                <div className="flex flex-col gap-3 w-full mt-4 z-10">
                  {dayTasks.map((task, idx) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className={`group relative px-3 py-2.5 rounded-xl text-[11px] font-bold shadow-sm border transition-all duration-300 cursor-default
                        ${task.status === 'done' 
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20" 
                          : task.status === 'in_progress'
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
                          : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                         <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'done' ? "bg-emerald-500" : task.status === 'in_progress' ? "bg-amber-500" : "bg-primary"}`} />
                         <span className="opacity-60 text-[9px] uppercase tracking-tighter">Task</span>
                      </div>
                      <div className="truncate w-full">{task.title}</div>
                      
                      {/* Hover decoration */}
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-0 group-hover:h-1/2 bg-current opacity-50 transition-all rounded-full" />
                    </motion.div>
                  ))}
                  
                  {dayTasks.length === 0 && (
                    <div className="h-14 rounded-xl border border-dashed border-border/20 bg-muted/5 w-full flex items-center justify-center opacity-40 group hover:opacity-100 transition-opacity">
                       <div className="w-8 h-8 rounded-full border border-dashed border-border/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus size={12} className="text-muted-foreground" />
                       </div>
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
