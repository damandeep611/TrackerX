"use client";

import { Hourglass } from "lucide-react";
import React, { useState, useEffect } from "react";
import { setDailyHours, getTodayRoutine } from "@/actions/dailyRoutineAction";
import DailyTimeSetup from "./DailyTimeSetup";

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
      <div className="border border-border rounded-md">
        <div className="flex flex-col justify-center gap-2 p-4">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-blue-50 rounded-md">
                <Hourglass size={18} className="text-blue-500" />
              </span>
              <h3 className="text-lg font-bold capitalize">Total Hours</h3>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              title="Edit time window"
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
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
          <div>
            <p className="text-3xl font-bold">
              {isLoading ? (
                <span className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                totalHours
              )}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs">Available Hours Today</p>
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
