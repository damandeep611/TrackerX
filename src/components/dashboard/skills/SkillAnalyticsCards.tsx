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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-accent text-sm font-medium mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Active
          </div>
          <h1 className="text-4xl font-bold  tracking-tight">{skillName}</h1>
          <p className="text-text-tertiary mt-2 max-w-xl">
            Architecting the scalable backend and frontend infrastructure for
            the new SaaS platform.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-lg bg-neutral-900 border border-white/10 text-xs text-neutral-400">
            Created:{" "}
            <span className="text-white ml-1">
              {isLoading
                ? "Loading..."
                : error
                ? "Error"
                : analytics.createdAt
                ? new Date(analytics.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Not available"}
            </span>
          </div>
        </div>
      </div>
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
      className="p-5 flex flex-col justify-between h-32 hover:border-white/20 transition-colors  relative overflow-hidden rounded-3xl 
        bg-[#0e0e0f] 
        border border-white/[0.06]
        shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2),0px_8px_20px_-4px_rgba(0,0,0,0.3)]"
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
            accent ? "text-accent" : "text-white"
          }`}
        >
          {value}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1">{subValue}</div>
      </div>
    </div>
  );
};