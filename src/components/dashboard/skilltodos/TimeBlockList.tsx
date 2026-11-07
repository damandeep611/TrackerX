"use client";
import React, { useCallback, useRef } from "react";
import { motion } from "motion/react";
import { Play } from "lucide-react";

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
    <div className="   ">
      <div className="flex items-center justify-between">
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
                className={`relative flex items-center gap-1 rounded  px-2 py-1 text-[10px] font-medium cursor-pointer  border transition-all duration-300 focus:outline-none  ${
                  isUpdating
                    ? " cursor-wait"
                    : isActive
                    ? " opacity-20"
                    : isNext
                    ? "border border-black/10 bg-black/5  text-gray-900 transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    : "border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed"
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
                <Play size={12} className="fill-gray-900 dark:fill-white" />{" "}
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
