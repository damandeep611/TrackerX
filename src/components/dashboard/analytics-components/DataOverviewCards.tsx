"use client";
import {
  ArrowRightLeft,
  CalendarClock,
  Clock,
  Pencil,
  RefreshCcw,
} from "lucide-react";
import TotalHoursCard from "./TotalHoursCard";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import DailyTimeSetup from "./DailyTimeSetup";
import { getTodayTotalTimeSpent } from "@/actions/skillTaskAction";
import { getTodayTotalTimeSpentFromLogs } from "@/actions/timeLogAction"; // Enable after schema generation
import { calculateRemainingHours, formatTimeSpent } from "@/utils/format-time";
import NumberSkeleton from "@/components/skeletons/NumberSkeleton";

export default function DataOverviewCards() {
  const [showModal, setShowModal] = useState(false);
  const [totalHours, setTotalHours] = useState("17");
  const [timeSpent, setTimeSpent] = useState("0");
  const [remainingHours, setRemainingHours] = useState("17");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [useTimeLogs, setUseTimeLogs] = useState(true); // Toggle between old and new system

  // Fetch today's time spent data
  const fetchTodayTimeSpent = useCallback(async () => {
    try {
      setIsLoading(true);
      let todayTimeSpent: number;

      if (useTimeLogs) {
        todayTimeSpent = await getTodayTotalTimeSpentFromLogs();
      } else {
        // Fallback to old system for backward compatibility
        // console.log("📊 Fetching time spent from legacy system...");
        todayTimeSpent = await getTodayTotalTimeSpent();
      }

      setTimeSpent(todayTimeSpent.toString());

      // Calculate remaining hours using utility function
      const totalAvailable = parseFloat(totalHours);
      const remaining = calculateRemainingHours(totalAvailable, todayTimeSpent);
      setRemainingHours(remaining.toFixed(1));
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch today's time spent:", error);
      setTimeSpent("0");
      setRemainingHours(totalHours);
    } finally {
      setIsLoading(false);
    }
  }, [useTimeLogs, totalHours]); // Include proper dependencies

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchTodayTimeSpent();
  }, [fetchTodayTimeSpent]);

  // Set up periodic refresh every 30 seconds
  // COMMENTED OUT: Automatic refresh to prevent high AWS costs
  // Uncomment this section if you want automatic refresh in the future
  /*
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTodayTimeSpent();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchTodayTimeSpent]); // Depend on the stable callback
  */

  const handleTimeSubmit = (hours: number) => {
    setTotalHours(hours.toString());

    // Recalculate remaining hours immediately using utility function
    const spent = parseFloat(timeSpent);
    const remaining = calculateRemainingHours(hours, spent);
    setRemainingHours(remaining.toFixed(1));
  };

  // Refresh time spent data (can be called manually)
  const refreshTimeData = useCallback(() => {
    fetchTodayTimeSpent();
  }, [fetchTodayTimeSpent]);

  // Toggle between time log and legacy system
  const toggleTimeSystem = () => {
    setUseTimeLogs(!useTimeLogs);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TotalHoursCard onHoursUpdate={setTotalHours} />
        <DataCards
          title="Time Spent"
          value={formatTimeSpent(parseFloat(timeSpent))}
          subtitle={`Time spent on skills (${
            useTimeLogs ? "New" : "Legacy"
          } system)`}
          icon={<CalendarClock size={18} />}
          isLoading={isLoading}
          onRefresh={refreshTimeData}
          onToggle={toggleTimeSystem}
          lastUpdated={lastUpdated}
          showToggle={true}
        />
        {/* this is the remaining hours card */}
        <DataCards
          title="Remaining Hours"
          value={formatTimeSpent(parseFloat(remainingHours))}
          subtitle="Remaining hours today"
          icon={<Clock size={18} />}
          isLoading={isLoading}
        />
      </div>
      <DailyTimeSetup
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleTimeSubmit}
      />
    </motion.div>
  );
}

interface DataCardsProps {
  title: string;
  value: string;
  subtitle: string;
  onEdit?: () => void;
  onRefresh?: () => void;
  onToggle?: () => void;
  icon: React.ReactNode;
  isLoading?: boolean;
  lastUpdated?: Date;
  showToggle?: boolean;
}

const DataCards = ({
  title,
  value,
  subtitle,
  onEdit,
  onRefresh,
  onToggle,
  icon,
  isLoading = false,
  lastUpdated,
  showToggle = false,
}: DataCardsProps) => {
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <div className="border border-border rounded-md dark:bg-zinc-900">
      <div className="flex flex-col justify-center gap-2 p-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold capitalize">{title}</h3>
            <span className="p-2  rounded-md ">{icon}</span>
          </div>
          <div className="flex items-center space-x-1">
            {showToggle && onToggle && (
              <button
                onClick={onToggle}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                title="Toggle time system"
              >
                <ArrowRightLeft size={18} />
              </button>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                title="Refresh data"
              >
                <RefreshCcw size={18} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                title="Edit time window"
              >
                <Pencil />
              </button>
            )}
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold">
            {isLoading ? <NumberSkeleton /> : value}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs">{subtitle}</p>
          {lastUpdated && (
            <p className="text-xs text-zinc-700 dark:text-zinc-400">
              Updated {formatLastUpdated(lastUpdated)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
