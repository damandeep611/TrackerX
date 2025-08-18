"use client";

import React from "react";
import { ArrowUp, Hourglass } from "lucide-react";
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
    <div className="p-4  border border-zinc-300 dark:border-zinc-800 rounded-xl m-2">
      <div className="flex items-start justify-between ">
        <div className="flex-1">
          <div className="flex flex-col items-start ">
            <p className="text-xl font-medium  capitalize tracking-wide">
              Total Time Spent
            </p>
            <div className="flex items-start justify-between gap-3 font-medium text-zinc-400">
              <span className="text-sm  ">
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
              <span>-</span>
              <span className="text-sm ">{todayDate}</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <Hourglass size={30} />
            <div className="flex items-baseline gap-2 my-4">
              <p className="text-4xl font-bold ">{skillCurrentHours}</p>
              <p className="text-lg font-medium ">hours</p>
            </div>
            <div className="flex items-center justify-between gap-1 mx-2 text-xs">
              <span className="bg-green-700 p-1 rounded-full">
                <ArrowUp className=" text-white " size={10} />
              </span>
              <span className="text-green-700 font-semibold">10.45%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start justify-between w-full gap-3 p-2 border-r mx-4">
            <p className=" font-semibold text-zinc-500">Avg. Time per Day</p>
            <span className="text-xl font-semibold">
              {" "}
              {analytics.averageDailyHours} hours
            </span>
          </div>
          <div className="flex flex-col items-start justify-between w-full gap-3 p-2  border-r mx-4">
            <p className=" font-semibold text-zinc-500">Days since creation</p>
            <span className="text-xl font-semibold">
              {isLoading
                ? "Loading..."
                : error
                ? "Error"
                : typeof analytics.daysSinceCreation === "number"
                ? `${analytics.daysSinceCreation} days`
                : "Not available"}
            </span>
          </div>
          <div className="flex flex-col items-start justify-between w-full gap-3 p-2  border-r mx-4">
            <p className=" font-semibold text-zinc-500">
              Tasks Comp. this week
            </p>
            <span className="text-xl font-semibold">
              {" "}
              {analytics.completedTasks}
            </span>
          </div>
          <div className="flex flex-col items-start justify-between w-full gap-3 p-2  border-r mx-4">
            <p className=" font-semibold text-zinc-500">
              Tasks created this week
            </p>
            <span className="text-xl font-semibold">
              {analytics.totalTasks}
            </span>
          </div>
        </div>
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
