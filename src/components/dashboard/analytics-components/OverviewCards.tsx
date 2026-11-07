"use client";

import { Loader2, Calendar, Box, Activity, Layers } from "lucide-react";

import React from "react";
import { useOverviewAnalytics } from "@/hooks/useOverviewAnalytics";
import { motion } from "motion/react";

export default function OverviewCards() {
  const { analytics, isLoading, error } = useOverviewAnalytics();

  //get short form of most used skill to show on widget
  const getShortform = (text: string, maxLength = 3): string => {
    if (typeof text !== "string" || !text.trim()) return "";
    //remove special characters and split words
    const words = text
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    //take first two letters
    if (words.length === 1) {
      return words[0].slice(0, maxLength).toUpperCase();
    }
    return words
      .slice(0, maxLength)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");
  };

  const shortFormName = getShortform(analytics.mostActiveSkill.skillName);
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-2 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="p-6  rounded-2xl animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gray-200 dark:bg-zinc-800 p-2 rounded-lg w-8 h-8"></div>
              <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-32"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-16"></div>
              <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="p-6 border border-border rounded-xl">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Failed to load data</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 p-2 gap-6 mb-8 "
      >
        <AnalyticsCard
          title="Time Spent Yesterday"
          value={`${analytics.timeSpentYesterday.hoursSpent}h`}
          subtitle2={`${analytics.timeSpentYesterday.tasksCompleted} Tasks completed`}
          icon={<Calendar size={16} strokeWidth={2} />}
          visualContent={
            <div className="w-full flex gap-1 h-8 items-end">
              {[40, 60, 30, 80, 20].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-xs transition-all duration-500 bg-text-secondary`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          }
        />
        <AnalyticsCard
          title="Time spend last 7 days"
          value={`${analytics.weeklyTime.totalHours}h`}
          subtitle={`${analytics.weeklyTime.daysWithActivity} days active`}
          subtitle2=" Across All Skills"
          icon={<Box size={16} strokeWidth={2} />}
          visualContent={
            <div className="w-full flex gap-1 h-10 items-end">
              {[40, 60, 30, 80, 20, 90, 10].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-xs transition-all duration-500 bg-text-secondary`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          }
        />
        <AnalyticsCard
          title="Total spend last 30 days"
          value={`${analytics.monthlyTime.totalHours}h`}
          subtitle={`${analytics.monthlyTime.daysWithActivity} days active`}
          subtitle2=" Total Time Logged "
          icon={<Layers size={16} strokeWidth={2} />}
        />
        {/* !todo --- use widgetcharts component to show the analytics on widgets======================  */}
        {/* <AnalyticsCard
          title="Most productive time"
          value={`5 Am - 11Am`}
          subtitle2="Based on average task logging window"
          subtitle={`${analytics.weeklyTime.daysWithActivity} days active`}
          icon={<ActivityIcon size={16} />}
        /> */}
        <AnalyticsCard
          title="Most Active Skill"
          value={analytics.mostActiveSkill.skillName}
          subtitle={`${analytics.mostActiveSkill.hoursSpent}h this week`}
          icon={<Activity size={16} strokeWidth={2} />}
          visualContent={
            <div className=" group flex h-full w-full items-center justify-end">
              <div className="relative h-8 w-8 flex items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400">
                <span className="text-[10px] font-bold">{shortFormName}</span>
                <div className="absolute inset-0 group-hover:animate-ping rounded-full border border-blue-500/20" />
              </div>
            </div>
          }
        />
      </motion.div>
    </>
  );
}

interface AnalyticsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  subtitle2?: string;
  icon: React.ReactNode;
  visualContent?: React.ReactNode;
}

const AnalyticsCard = ({
  title,
  value,
  subtitle,
  subtitle2,
  icon,
  visualContent,
}: AnalyticsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className=" group relative flex flex-col justify-between overflow-hidden p-5 rounded-md border border-border  bg-surface "
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center text-blue-500 bg-blue-500/10 rounded-lg   transition-colors group-hover:text-text-primary",
            `}
          >
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary group-hover:text-text-secondary transition-colors">
              {title}
            </span>

            <span className="text-xs text-text-secondary font-medium">
              {subtitle2}
            </span>
          </div>
        </div>
      </div>
      {/* Main Value Area */}
      <div className="flex flex-col gap-1">
        <h3
          className={` text-2xl font-semibold tracking-tight text-text-primary font-sans ${
            value === "0h" && "text-text-tertiary"
          }`}
        >
          {value}
        </h3>
      </div>
      {/* Footer / Visuals */}
      <div className="mt-2 flex h-10 items-end justify-between">
        <div className="flex flex-col justify-end">
          {subtitle && (
            <p className="text-[11px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">
              {subtitle}
            </p>
          )}
        </div>

        {visualContent && (
          <div className="w-24 h-full flex items-end opacity-50 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0">
            {visualContent}
          </div>
        )}
      </div>
    </motion.div>
  );
};
