"use client";

import React, { useState, useCallback, useEffect } from "react";
import SkillKanbanBoard from "../skilltodos/kanban/SkillKanbanBoard";
import SkillAnalyticsCards from "./SkillAnalyticsCards";
import SkillAnalytics from "../../../app/dashboard/skills/SkillAnalytics";
import { skillTodo } from "@/types/skillDashboardTypes";
import SkillHeader from "../../../app/dashboard/skills/SkillHeader";
import { motion, AnimatePresence } from "motion/react";
import SkillTimeline from "./SkillTimeline";
import { getTimeLogsByDateForSkill } from "@/actions/timeLogAction";
import { subDays, addDays } from "date-fns";

interface SkillPageWrapperProps {
  initialSkillTodos: skillTodo[];
  skillId: string;
  skillCurrentHours: string;
  skillName: string;
  skillSlug: string;
  createdAt: Date | null;
}

export default function SkillPageWrapper({
  initialSkillTodos,
  skillId,
  skillCurrentHours,
  skillName,
  skillSlug,
  createdAt,
}: SkillPageWrapperProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [timeByDate, setTimeByDate] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"workflow" | "analytics">(
    "workflow",
  );
  const [view, setView] = useState<"grid" | "kanban">("kanban");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const fetchTimelineTimeData = useCallback(async () => {
    const start = subDays(new Date(), 3);
    const end = addDays(new Date(), 7);
    const data = await getTimeLogsByDateForSkill(skillId, start, end);
    setTimeByDate(data);
  }, [skillId]);

  useEffect(() => {
    fetchTimelineTimeData();
  }, [fetchTimelineTimeData, refreshKey]);

  const handleTimeUpdate = useCallback(() => {
    // Trigger a refresh of analytics data and timeline time
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleTagUpdate = useCallback(() => {
    // Trigger a refresh of tag analytics data
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <SkillHeader
        skillSlug={skillSlug}
        skillId={skillId}
        skillName={skillName}
        createdAt={createdAt}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {activeTab === "workflow" ? (
            <motion.div
              key="workflow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-[1600px] mx-auto space-y-8"
            >
              <SkillTimeline 
                tasks={initialSkillTodos} 
                skillName={skillName} 
                timeByDate={timeByDate}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
              
              <div className="space-y-4">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">All Tasks</h2>
                    
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border">
                       <button 
                          onClick={() => setView("grid")}
                          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium transition-all rounded-lg ${
                             view === "grid" 
                             ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                             : "text-muted-foreground hover:text-foreground"
                          }`}
                       >
                          <span>Grid</span>
                       </button>
                       <button 
                          onClick={() => setView("kanban")}
                          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium transition-all rounded-lg ${
                             view === "kanban" 
                             ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                             : "text-muted-foreground hover:text-foreground"
                          }`}
                       >
                          <span>Kanban</span>
                       </button>
                    </div>
                 </div>
                 
                 <SkillKanbanBoard
                  initialSkillTodos={initialSkillTodos}
                  skillId={skillId}
                  onTimeUpdate={handleTimeUpdate}
                  view={view}
                  selectedDate={selectedDate}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              <div className="w-full">
                <SkillAnalyticsCards
                  skillName={skillName}
                  key={refreshKey}
                  skillId={skillId}
                  skillCurrentHours={skillCurrentHours}
                  onRefresh={handleTimeUpdate}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">
                    Tag Distribution
                  </h3>
                  <SkillAnalytics
                    skillId={skillId}
                    onRefresh={handleTagUpdate}
                  />
                </div>

                {/* Placeholder for future charts (e.g., Activity Heatmap, Progress Over Time) */}
                <div className=" md:block p-6 rounded-xl border border-border border-dashed flex items-center justify-center text-muted-foreground text-sm bg-muted/5">
                  Activity Trends (Coming Soon)
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
