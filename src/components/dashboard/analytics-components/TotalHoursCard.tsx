"use client";

import React, { useState, useEffect } from "react";
import { setDailyHours, getTodayRoutine } from "@/actions/dailyRoutineAction";
import DailyTimeSetup from "./DailyTimeSetup";
import { Edit2 } from "lucide-react";
import NumberSkeleton from "@/components/skeletons/NumberSkeleton";

interface TotalHoursCardProps {
  onHoursUpdate: (hours: string) => void;
}

export default function TotalHoursCard({ onHoursUpdate }: TotalHoursCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalHours, setTotalHours] = useState("12"); // Default to 12 hours

  useEffect(() => {
    const loadTodayRoutine = async () => {
      try {
        const result = await getTodayRoutine();
        if (result.success && result.data) {
          setTotalHours(result.data.totalHoursAvailable);
          onHoursUpdate(result.data.totalHoursAvailable);
        } else {
          // If no routine exists, set default to 12 hours
          const defaultResult = await setDailyHours(12);
          if (defaultResult.success) {
            setTotalHours("12");
            onHoursUpdate("12");
          }
        }
      } catch (error) {
        console.error("Failed to load today's routine:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodayRoutine();
  }, [onHoursUpdate]);

  const handleTimeSubmit = async (hours: number) => {
    try {
      setIsLoading(true);
      const result = await setDailyHours(hours);
      if (result.success) {
        const hoursString = hours.toString();
        setTotalHours(hoursString);
        onHoursUpdate(hoursString);
      }
    } catch (error) {
      console.error("Failed to update hours:", error);
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="border border-border rounded-md dark:bg-zinc-900 p-6 ">
        <div className="flex flex-col justify-center gap-2">
          <div className="w-full flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 capitalize">
              Total Hours
            </h3>
            <button
              onClick={() => setShowModal(true)}
              className="p-2  rounded-lg transition-colors cursor-pointer"
              title="Edit time window"
            >
              <Edit2 size={16} />
            </button>
          </div>
          <div>
            <div className="text-3xl font-bold">
              {isLoading ? <NumberSkeleton /> : totalHours}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-400">
              Available Hours Today
            </p>
          </div>
        </div>
      </div>

      <DailyTimeSetup
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleTimeSubmit}
      />
    </>
  );
}
