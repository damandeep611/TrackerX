"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Clock, FileText } from "lucide-react";
import { useSkillAnalytics } from "@/hooks/useSkillAnalytics";

interface SkillAnalyticsCardsProps {
  skillId: string;
  skillCurrentHours: string;
  onRefresh?: () => void;
}

export default function SkillAnalyticsCards({
  skillId,
  skillCurrentHours,
  onRefresh,
}: SkillAnalyticsCardsProps) {
  const { analytics, isLoading, error, refreshAnalytics } =
    useSkillAnalytics(skillId);

  const handleRefresh = async () => {
    await refreshAnalytics();
    onRefresh?.();
  };

  // Loading skeleton component
  const LoadingSkeleton = ({ className }: { className: string }) => (
    <div className={`${className} animate-pulse`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="w-14 h-14 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = ({ message }: { message: string }) => (
    <div className="text-center p-6">
      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
        <div className="w-6 h-6 bg-red-500 rounded-full"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{message}</p>
      <button
        onClick={handleRefresh}
        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition-colors"
      >
        Try again
      </button>
    </div>
  );

  return (
    <div className="p-4 px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Time spent card */}
        <motion.div
          className="relative overflow-hidden dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl px-6 py-4 shadow-sm hover:shadow-md transition-all duration-300"
          whileHover={{ y: -2 }}
        >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Total Time Spent
                  </p>
                  <Clock size={18}/>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <p className="text-4xl font-bold ">
                    {skillCurrentHours}
                  </p>
                  <p className="text-lg font-medium ">
                    hours
                  </p>
                </div>

                {/* Stats grid */}
                <div className="">
                  <div className="flex items-center justify-between py-2   rounded-lg">
                    <span className="text-xs ">
                     Skill Created On
                    </span>
                    <span className="text-xs font-medium ">
                      {isLoading
                        ? "Loading..."
                        : error
                        ? "Error"
                        : analytics.createdAt
                        ? new Date(analytics.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "Not available"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2  rounded-lg">
                    <span className="text-xs ">
                      Days Since Creation
                    </span>
                    <span className="text-xs font-medium ">
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
              </div>
            
            </div>
         
        </motion.div>

        {/* Average time daily spend */}
        <motion.div
          className="relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          whileHover={{ y: -2 }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-emerald-50/30 dark:from-green-900/20 dark:via-transparent dark:to-emerald-900/10 rounded-xl"></div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/20 rounded-full -translate-y-12 translate-x-12 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-50 to-emerald-50 dark:from-green-800/20 dark:to-emerald-800/10 rounded-full translate-y-8 -translate-x-8 opacity-40"></div>

          <div className="relative z-10">
            {isLoading ? (
              <LoadingSkeleton className="text-gray-600 dark:text-gray-400" />
            ) : error ? (
              <ErrorState message={error} />
            ) : (
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Avg Time Per Day
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {analytics.averageDailyHours}
                    </p>
                    <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                      hours
                    </p>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Last 7 days
                      </span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {analytics.totalDaysWithActivity > 0
                          ? `${analytics.totalDaysWithActivity} days`
                          : "No activity"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Activity Rate
                      </span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {analytics.totalDaysWithActivity > 0
                          ? `${Math.round(
                              (analytics.totalDaysWithActivity / 7) * 100
                            )}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Total tasks done */}
        <motion.div
          className="relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          whileHover={{ y: -2 }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-pink-50/30 dark:from-purple-900/20 dark:via-transparent dark:to-pink-900/10 rounded-xl"></div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/20 rounded-full -translate-y-12 translate-x-12 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-50 to-pink-50 dark:from-purple-800/20 dark:to-pink-800/10 rounded-full translate-y-8 -translate-x-8 opacity-40"></div>

          <div className="relative z-10">
            {isLoading ? (
              <LoadingSkeleton className="text-gray-600 dark:text-gray-400" />
            ) : error ? (
              <ErrorState message={error} />
            ) : (
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Tasks This Week
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {analytics.completedTasks}
                    </p>
                    <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                      completed
                    </p>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Total Tasks
                      </span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {analytics.totalTasks}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Completion Rate
                      </span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {analytics.totalTasks > 0
                          ? `${Math.round(
                              (analytics.completedTasks /
                                analytics.totalTasks) *
                                100
                            )}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
