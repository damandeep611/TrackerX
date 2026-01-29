"use client";

import React from "react";
import { BarChart3, Calendar1, Clock1, PenIcon } from "lucide-react";
import { useSkillAnalytics } from "@/hooks/useSkillAnalytics";

interface SkillAnalyticsCardsProps {
  skillId: string;
  skillCurrentHours: string;
  onRefresh?: () => void;
  skillName: string;
}

export default function SkillAnalyticsCards({
  skillId,
  skillCurrentHours,
  skillName,
}: SkillAnalyticsCardsProps) {
  const { analytics, isLoading, error } = useSkillAnalytics(skillId);

  return (
    <div className="  rounded-xl m-2 p-4 space-y-4">
      {/* skill analytics widgets */}

      <div className="p-2 grid grid-cols-2 lg:grid-cols-4 gap-4 ">
        <SkillStatCard
          label="Total time spend"
          value={`${skillCurrentHours}h`}
          subValue={
            isLoading
              ? "Loading..."
              : error
              ? "Error"
              : typeof analytics.daysSinceCreation === "number"
              ? `in ${analytics.daysSinceCreation} days`
              : "Not available"
          }
          icon={<Clock1 size={16} />}
        />

        {/* avg time per day */}
        <SkillStatCard
          label="Daily Average"
          value={`${analytics.averageDailyHours}h`}
          subValue="Avg Time per day"
          icon={<BarChart3 size={16} />}
        />
        {/* days since creation  */}

        <SkillStatCard
          label="Days Active"
          value={
            isLoading
              ? "Loading..."
              : error
              ? "Error"
              : typeof analytics.daysSinceCreation === "number"
              ? `${analytics.daysSinceCreation} days`
              : "Not available"
          }
          subValue="From - to -"
          icon={<Calendar1 size={16} />}
        />

        <SkillStatCard
          label="This Week"
          value={`${analytics.completedTasks} Completed`}
          subValue={`${analytics.totalTasks} created`}
          icon={<PenIcon size={16} />}
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
  accent?: boolean;
}> = ({ label, value, subValue, icon, accent }) => {
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-5 flex flex-col justify-between h-32 hover:border-black/20 dark:hover:border-white/20 transition-colors   
        dark:bg-[#0e0e0f] bg-white
        border dark:border-white/[0.06] border-black/[0.06]
        shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05),0px_8px_20px_-4px_rgba(0,0,0,0.1)]
        dark:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2),0px_8px_20px_-4px_rgba(0,0,0,0.3)]"
    >
      {/* Subtle top sheen/gradient for depth */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

      <div className="flex justify-between items-start">
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          {label}
        </span>
        <span className="text-neutral-600 ">{icon}</span>
      </div>
      <div>
        <div
          className={`text-2xl font-semibold ${
            accent ? "text-accent" : "text-gray-900 dark:text-white"
          }`}
        >
          {value}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1">{subValue}</div>
      </div>
    </div>
  );
};