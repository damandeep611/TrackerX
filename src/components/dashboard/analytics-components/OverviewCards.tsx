"use client";

import { Loader2, Clock, Calendar, ActivityIcon } from "lucide-react";
import React from "react";
import { useOverviewAnalytics } from "@/hooks/useOverviewAnalytics";
import { motion } from "framer-motion";

export default function OverviewCards() {
  const { analytics, isLoading, error } = useOverviewAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="p-6  rounded-2xl animate-pulse"
          >
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
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      {/* <AnalyticsCard
        title="Time Spent Yesterday"
        value={`${analytics.timeSpentYesterday.hoursSpent}h`}
        subtitle={`${analytics.timeSpentYesterday.tasksCompleted} Tasks completed`}
        icon={<Target size={14} />}
      /> */}
      <AnalyticsCard
        title="Total time this week"
        value={`${analytics.weeklyTime.totalHours}h`}
        subtitle={`${analytics.weeklyTime.daysWithActivity} days active`}
        subtitle2="Logged across all skills"
        icon={<Clock size={20} />}
      />
       <AnalyticsCard
        title="Total time this month"
        value={`${analytics.monthlyTime.totalHours}h`}
        subtitle={`${analytics.monthlyTime.daysWithActivity} days active`}
        subtitle2="your total time investment this month"
        icon={<Calendar size={20} />}
      />
       <AnalyticsCard
        title="Most productive time"
        value={`5 Am - 11Am`}
        subtitle2="Based on average task logging window"
        subtitle={`${analytics.weeklyTime.daysWithActivity} days active`}
        icon={<ActivityIcon size={20} />}
      />
      {/* <AnalyticsCard
        title="Most Active Skill"
        value={analytics.mostActiveSkill.skillName}
        subtitle={`${analytics.mostActiveSkill.hoursSpent}h this week`}
        icon={<TrendingUp size={14} />}
      /> */}
    </motion.div>
    </>
  );
}

interface AnalyticsCardProps {
  title: string;
  value: string;
  subtitle: string;
  subtitle2?: string;
  icon: React.ReactNode;
}

const AnalyticsCard = ({
  title,
  value,
  subtitle,
  subtitle2,
  icon,
}: AnalyticsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="p-6 dark:bg-zinc-900 shadow-sm dark:hover:bg-zinc-800 rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="dark:text-zinc-400">
          {icon}
        </div>
        <div className="">
          <p className="font-medium text-sm capitalize text-zinc-600 dark:text-zinc-400">{title}</p>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-semibold capitalize">{subtitle2}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-semibold">{subtitle}</p>
         
      </div>
    </motion.div>
  );
};
