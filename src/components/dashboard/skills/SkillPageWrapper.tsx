"use client";

import React, { useState, useCallback } from "react";
import SkillTodoList from "../skilltodos/skill-todo-list";
import SkillAnalyticsCards from "./SkillAnalyticsCards";
import SkillAnalytics from "../../../app/dashboard/skills/SkillAnalytics";
import { skillTodo } from "@/types/skillDashboardTypes";

interface SkillPageWrapperProps {
  initialSkillTodos: skillTodo[];
  skillId: string;
  skillCurrentHours: string;
}

export default function SkillPageWrapper({
  initialSkillTodos,
  skillId,
  skillCurrentHours,
}: SkillPageWrapperProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTimeUpdate = useCallback(() => {
    // Trigger a refresh of analytics data
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleTagUpdate = useCallback(() => {
    // Trigger a refresh of tag analytics data
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <>
      {/* Main Content Area (Scrollable) */}
      <div className="flex  justify-between">
        <div className="flex flex-col w-full ">
          <SkillAnalyticsCards
            key={refreshKey}
            skillId={skillId}
            skillCurrentHours={skillCurrentHours}
            onRefresh={handleTimeUpdate}
          />
          <SkillTodoList
            initialSkillTodos={initialSkillTodos}
            skillId={skillId}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>
        <SkillAnalytics skillId={skillId} onRefresh={handleTagUpdate} />
      </div>
    </>
  );
}
