"use client";

import React, { useState, useCallback } from "react";
import SkillKanbanBoard from "../skilltodos/kanban/SkillKanbanBoard";
import SkillAnalyticsCards from "./SkillAnalyticsCards";
import SkillAnalytics from "../../../app/dashboard/skills/SkillAnalytics";
import { skillTodo } from "@/types/skillDashboardTypes";
import SkillHeader from "../../../app/dashboard/skills/SkillHeader";
import { motion, AnimatePresence } from "framer-motion";

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
  const [activeTab, setActiveTab] = useState<"workflow" | "analytics">(
    "workflow",
  );

  const handleTimeUpdate = useCallback(() => {
    // Trigger a refresh of analytics data
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleTagUpdate = useCallback(() => {
    // Trigger a refresh of tag analytics data
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="flex flex-col bg-background">
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
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full mx-auto"
            >
              <SkillKanbanBoard
                initialSkillTodos={initialSkillTodos}
                skillId={skillId}
                onTimeUpdate={handleTimeUpdate}
              />
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
