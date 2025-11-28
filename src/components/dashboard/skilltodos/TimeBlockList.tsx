"use client";
import { Hourglass } from "lucide-react";
import React, { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { formatDuration } from "@/utils/format-time";

interface TimeBlockListProps {
  currentMinutes: number; // Total minutes from time logs
  onTimeUpdate: (minutes: number) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export default function TimeBlockList({
  currentMinutes,
  onTimeUpdate,
  isUpdating = false,
  isDeleting = false,
}: TimeBlockListProps) {
  // Debounce mechanism to prevent rapid clicking
  const lastClickTime = useRef<number>(0);
  const DEBOUNCE_DELAY = 300; // 300ms debounce

  // This component handles time tracking via the timeLog system
  // When a time block is clicked, it triggers onTimeUpdate which creates a time log entry
  // The time log entry updates the skill card's current hours and triggers revalidation
  const handleTimeBlockClick = useCallback(
    (blockIndex: number) => {
      // Debounce rapid clicks
      const now = Date.now();
      if (now - lastClickTime.current < DEBOUNCE_DELAY) {
        return;
      }
      lastClickTime.current = now;

      // Calculate the target duration in minutes based on the clicked block
      const targetMinutes = (blockIndex + 1) * 30;

      // Prevent unnecessary updates if clicking the same block
      if (targetMinutes === currentMinutes) {
        return;
      }

      // Only allow incrementing by 30 minutes or decrementing to valid blocks
      if (
        targetMinutes === currentMinutes + 30 ||
        (targetMinutes < currentMinutes && targetMinutes + 30 > currentMinutes)
      ) {
        onTimeUpdate(targetMinutes);
      }
    },
    [currentMinutes, onTimeUpdate]
  );

  return (
    <div className="w-full  p-3 rounded-md bg-zinc-200  dark:bg-zinc-900 ">
      <div className="flex items-center justify-between">
        {/* Time Spent Display */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 text-purple-500 rounded-md flex items-center justify-center shadow-sm">
            <Hourglass size={12} />
          </div>
          <div className="mr-2">
            <p className="text-sm font-medium ">
              {formatDuration(currentMinutes)}{" "}
              <span className="text-xs text-zinc-700 dark:text-zinc-500 ml-2">
                logged{" "}
              </span>
              {isUpdating && (
                <span className="ml-1 text-blue-500 animate-pulse">●</span>
              )}
            </p>
          </div>
        </div>

        {/* Time Block List */}
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, index) => {
            const isActive = currentMinutes >= (index + 1) * 30;
            const isNext = currentMinutes === index * 30;
            const minuteLabel = (index + 1) * 30;

            return (
              <motion.button
                key={index}
                onClick={() => handleTimeBlockClick(index)}
                disabled={isUpdating || isDeleting || (!isActive && !isNext)}
                whileHover={{ scale: isUpdating ? 1 : 1.1 }}
                whileTap={{ scale: isUpdating ? 1 : 0.95 }}
                className={`relative text-xs font-medium   px-3 p-1  rounded-md border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 ${
                  isUpdating
                    ? " cursor-wait"
                    : isActive
                    ? " shadow-sm bg-emerald-600"
                    : isNext
                    ? "border-emerald-400 hover:border-emerald-500-500 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer"
                    : "border-gray-300 dark:border-gray-600 opacity-40 cursor-not-allowed"
                }`}
                aria-label={`${minuteLabel} minute milestone ${
                  isUpdating
                    ? "updating"
                    : isActive
                    ? "completed"
                    : isNext
                    ? "available"
                    : "locked"
                }`}
                title={isUpdating ? "Updating..." : `${minuteLabel} minutes`}
              >
                +30m
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-1 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
