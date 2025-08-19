"use client";

import React from "react";
import { Calendar, CheckCircle, Clock, Plus, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useSkillAnalytics } from "@/hooks/useSkillAnalytics";

interface SkillAnalyticsCardsProps {
  skillId: string;
  skillCurrentHours: string;
  onRefresh?: () => void;
}

export default function SkillAnalyticsCards({
  skillId,
  skillCurrentHours,
}: SkillAnalyticsCardsProps) {
  const { analytics, isLoading, error } = useSkillAnalytics(skillId);
  const todayDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Error state component
  // const ErrorState = ({ message }: { message: string }) => (
  //   <div className="text-center p-6">
  //     <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
  //       <div className="w-6 h-6 bg-red-500 rounded-full"></div>
  //     </div>
  //     <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{message}</p>
  //     <button
  //       onClick={handleRefresh}
  //       className="px-4 py-2  text-sm transition-colors"
  //     >
  //       Try again
  //     </button>
  //   </div>
  // );

  return (
    <div className=" dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl m-2 p-6">
      <div className="flex  items-center justify-between mb-6 ">
        <div className="flex flex-col items-start justify-between gap-2 font-medium ">
          <p className="text-2xl font-semibold  capitalize tracking-wide">
            Total Time Spent
          </p>
          <div className="text-sm text-zinc-500 space-x-1">
            <span>
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
            <span>-</span>
            <span>{todayDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-emerald-600">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">10.45%</span>
        </div>
      </div>
      <div className="mb-8">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-5xl font-bold ">{skillCurrentHours}</span>
          <span className="text-lg text-gray-500 font-medium">
            hours in{" "}
            {isLoading
              ? "Loading..."
              : error
              ? "Error"
              : typeof analytics.daysSinceCreation === "number"
              ? `${analytics.daysSinceCreation} days`
              : "Not available"}
          </span>
        </div>
      </div>

      <div className="p-2 grid grid-cols-2 lg:grid-cols-4 gap-4 ">
        {/* avg time per day */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="group border-r mx-2"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-50/70 dark:bg-zinc-700 rounded-md ">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xs font-medium  uppercase tracking-wide">
              Recent Avg. per Day
            </div>
          </div>
          <div className="text-xl font-semibold ">
            {analytics.averageDailyHours} Hours
          </div>
        </motion.div>
        {/* days since creation  */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="group border-r mx-2"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50/70 dark:bg-zinc-700 rounded-md ">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xs font-medium  uppercase tracking-wide">
              Days Active
            </div>
          </div>
          <div className="text-xl font-semibold ">
            {isLoading
              ? "Loading..."
              : error
              ? "Error"
              : typeof analytics.daysSinceCreation === "number"
              ? `${analytics.daysSinceCreation} days`
              : "Not available"}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="group border-r mx-2"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50/70 dark:bg-zinc-700 rounded-md ">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xs font-medium  uppercase tracking-wide">
              This week
            </div>
          </div>
          <div className="text-xl font-semibold ">
            {analytics.completedTasks} Task Completed
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="group "
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50/70 dark:bg-zinc-700 rounded-md ">
              <Plus className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xs font-medium uppercase tracking-wide">
              This week
            </div>
          </div>
          <div className="text-xl font-semibold ">
            {analytics.totalTasks} Task created
          </div>
        </motion.div>
      </div>

      {/* <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400  rounded-lg">
            <span className="text-xs ">Last 7 days</span>
            <span className="text-xs font-medium ">
              {analytics.totalDaysWithActivity > 0
                ? `${analytics.totalDaysWithActivity} days`
                : "No activity"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400  rounded-lg">
          <span className="text-xs ">Activity Rate</span>
          <span className="text-xs font-medium ">
            {analytics.totalDaysWithActivity > 0
              ? `${Math.round((analytics.totalDaysWithActivity / 7) * 100)}%`
              : "0%"}
          </span>
        </div>
        <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 rounded-lg">
          <span className="text-xs ">Completion Rate</span>
          <span className="text-xs font-medium ">
            {analytics.totalTasks > 0
              ? `${Math.round(
                  (analytics.completedTasks / analytics.totalTasks) * 100
                )}%`
              : "0%"}
          </span>
        </div>
      </div> */}
    </div>
  );
}
