"use client";
import { CalendarClock, Clock, Edit3, Hourglass } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import DailyTimeSetup from "./DailyTimeSetup";
import { getTodayTotalTimeSpent } from "@/actions/skillTaskAction";
import { calculateRemainingHours, formatTimeSpent } from "@/utils/format-time";

export default function DataOverviewCards() {
  const [showModal, setShowModal] = useState(false);
  const [totalHours, setTotalHours] = useState("17");
  const [timeSpent, setTimeSpent] = useState("0");
  const [remainingHours, setRemainingHours] = useState("17");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch today's time spent data
  const fetchTodayTimeSpent = useCallback(async () => {
    try {
      setIsLoading(true);
      const todayTimeSpent = await getTodayTotalTimeSpent();
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
  }, [totalHours]);

  // Fetch data on component mount and when total hours change
  useEffect(() => {
    fetchTodayTimeSpent();
  }, [fetchTodayTimeSpent]);

  // Set up periodic refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTodayTimeSpent();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchTodayTimeSpent]);

  const handleTimeSubmit = (hours: number) => {
    console.log("Time schedule updated:", hours);
    setTotalHours(hours.toString());

    // Recalculate remaining hours immediately using utility function
    const spent = parseFloat(timeSpent);
    const remaining = calculateRemainingHours(hours, spent);
    setRemainingHours(remaining.toFixed(1));
  };

  // Refresh time spent data (can be called manually)
  const refreshTimeData = () => {
    fetchTodayTimeSpent();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DataCards
          title="Total Hours"
          value={totalHours}
          subtitle="Available Hours Today"
          icon={<Hourglass size={18} className=" text-blue-500" />}
          onEdit={() => setShowModal(true)}
          isLoading={isLoading}
        />
        <DataCards
          title="Time Spent"
          value={formatTimeSpent(parseFloat(timeSpent))}
          subtitle="Time spent on skills and working"
          icon={<CalendarClock size={18} className="text-green-500" />}
          isLoading={isLoading}
          onRefresh={refreshTimeData}
          lastUpdated={lastUpdated}
        />
        <DataCards
          title="Remaining Hours"
          value={formatTimeSpent(parseFloat(remainingHours))}
          subtitle="Remaining hours today"
          icon={<Clock size={18} className="text-red-600" />}
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
  icon: React.ReactNode;
  isLoading?: boolean;
  lastUpdated?: Date;
}

const DataCards = ({
  title,
  value,
  subtitle,
  onEdit,
  onRefresh,
  icon,
  isLoading = false,
  lastUpdated,
}: DataCardsProps) => {
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <div className="border border-border rounded-md">
      <div className="flex flex-col justify-center gap-2 p-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-blue-50 rounded-md">{icon}</span>
            <h3 className="text-lg font-bold capitalize">{title}</h3>
          </div>
          <div className="flex items-center space-x-1">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                title="Refresh data"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                title="Edit time window"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold">
            {isLoading ? (
              <span className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              value
            )}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs">{subtitle}</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500">
              Updated {formatLastUpdated(lastUpdated)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
