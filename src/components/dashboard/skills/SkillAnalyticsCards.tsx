"use client";

import React from "react";
import { BarChart3, Calendar1, Clock1, CheckCircle2 } from "lucide-react";
import { useSkillAnalytics, useSkillHours } from "@/hooks/useSkills";

interface SkillAnalyticsCardsProps {
  skillId: string;
  skillSlug: string;
  /** Server-rendered value; kept fresh by React Query afterwards. */
  skillCurrentHours: string;
  skillName: string;
}

export default function SkillAnalyticsCards({
  skillId,
  skillSlug,
  skillCurrentHours: initialHours,
}: SkillAnalyticsCardsProps) {
  const { analytics, isLoading, error } = useSkillAnalytics(skillId);
  const { data: skillCurrentHours = initialHours } = useSkillHours(skillId, skillSlug, initialHours);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkillStatCard
          label="Total Time"
          value={`${skillCurrentHours}h`}
          subValue={
            isLoading
              ? "Loading..."
              : error
              ? "Error"
              : typeof analytics.daysSinceCreation === "number"
              ? `Over ${analytics.daysSinceCreation} days`
              : "Not available"
          }
          icon={<Clock1 size={18} className="text-blue-500" />}
          iconBg="bg-blue-500/10"
        />

        <SkillStatCard
          label="Daily Avg"
          value={`${analytics.averageDailyHours}h`}
          subValue="Time per active day"
          icon={<BarChart3 size={18} className="text-purple-500" />}
          iconBg="bg-purple-500/10"
        />

        <SkillStatCard
          label="Days Active"
          value={
            isLoading
              ? "..."
              : error
              ? "Error"
              : typeof analytics.daysSinceCreation === "number"
              ? `${analytics.daysSinceCreation}`
              : "-"
          }
          subValue="Total days tracked"
          icon={<Calendar1 size={18} className="text-orange-500" />}
          iconBg="bg-orange-500/10"
        />

        <SkillStatCard
          label="Tasks Done"
          value={`${analytics.completedTasks}`}
          subValue={`Out of ${analytics.totalTasks} created`}
          icon={<CheckCircle2 size={18} className="text-green-500" />}
          iconBg="bg-green-500/10"
        />
      </div>
    </div>
  );
}

const SkillStatCard: React.FC<{
  label: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
  iconBg?: string;
}> = ({ label, value, subValue, icon, iconBg }) => {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-card border border-border p-5 hover:border-border/80 transition-all duration-300 hover:shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${iconBg || "bg-primary/10"}`}>
          {icon}
        </div>
        {/* Optional decorative element */}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        <p className="text-xs text-muted-foreground/80 font-medium">
          {subValue}
        </p>
      </div>
    </div>
  );
};