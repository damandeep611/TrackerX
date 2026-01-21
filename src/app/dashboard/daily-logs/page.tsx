"use client"

import React, { useState } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useDailyLog } from "@/hooks/useDailyLog";
import { DailyStats } from "@/components/dashboard/daily-logs/DailyStats";
import { ClockVisualizer } from "@/components/dashboard/daily-logs/ClockVisualizer";
import { LogTimeline } from "@/components/dashboard/daily-logs/LogTimeline";
import { EntryModal } from "@/components/dashboard/daily-logs/EntryModal";
import { EntryType, TimeSlot, Entry } from "@/types/dailyLogTypes";
import { cn } from "@/lib/utils";

export default function DailyLogPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { entries, addEntry, deleteEntry, stats, isLoading } =
    useDailyLog(currentDate);

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(0);

  // Preview State (Lifted from EntryModal)
  const [previewData, setPreviewData] = useState<{
    slots: TimeSlot[];
    color: string;
    type: EntryType;
  }>({
    slots: [],
    color: "",
    type: "log-note",
  });

  const handleTimeSelect = (minutes: number) => {
    setSelectedTime(minutes);
    setIsModalOpen(true);
  };

  const handleSaveEntry = (data: any) => {
    const newEntryPayload: any = {
      type: data.type,
      // For log-note
      ...(data.type === "log-note"
        ? {
            time: selectedTime,
            content: data.content,
          }
        : {
            // For activity
            title: data.title,
            slots: data.slots,
            color: data.color,
          }),
    };

    addEntry(newEntryPayload);
    // Modal closes automatically via its own logic or we close it here?
    // The previous code had `setIsModalOpen(false)` implicitly or handled by parent?
    // Ah, previous code: `addEntry(newEntry)` then nothing. But `EntryModal` calls `onSave` then `onClose`.
    // Wait, `EntryModal` implementation:
    // `handleSave = () => { ... onSave(...) ; onClose() }`
    // So we don't need to close it here.
  };

  const navigateDate = (direction: "prev" | "next") => {
    setCurrentDate((prev) =>
      direction === "prev" ? subDays(prev, 1) : addDays(prev, 1),
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-2rem)] w-full items-center justify-center bg-background text-primary font-sans p-6">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-800/50"></div>
          <div className="text-sm text-slate-500">Loading Daily Log...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] w-full overflow-hidden bg-background text-primary font-sans p-6 gap-6">
      {/* Header with Date Navigation */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Log</h1>
          <p className="text-sm text-muted-foreground">
            Track your day, every day.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-lg shadow-sm">
          <button
            onClick={() => navigateDate("prev")}
            className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2 min-w-[140px] justify-center font-mono text-sm">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span
              className={cn(
                "font-medium",
                isToday(currentDate) ? "text-primary" : "text-foreground",
              )}
            >
              {isToday(currentDate)
                ? "Today"
                : format(currentDate, "MMM dd, yyyy")}
            </span>
          </div>

          <button
            onClick={() => navigateDate("next")}
            disabled={isToday(currentDate)} // Optional: disable future? No, let them plan.
            className={cn(
              "p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
              isToday(currentDate) && "opacity-50 cursor-not-allowed hidden", // Maybe hide next if today?
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {/* Allow next even if today? The logic `isToday` hides it. 
                 If user wants to plan tomorrow, they can't. 
                 But typically logs are for past/present. I'll unhide it.
              */}
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
        {/* Left Panel: Stats */}
        <DailyStats
          totalActivityMinutes={stats.totalActivityMinutes}
          totalLogNotes={stats.totalLogNotes}
        />

        {/* Center Panel: Visualization */}
        <ClockVisualizer
          entries={entries}
          onTimeSelect={handleTimeSelect}
          isModalOpen={isModalOpen}
          previewSlots={previewData.slots}
          previewColor={previewData.color}
          previewType={previewData.type}
        />

        {/* Right Panel: Timeline */}
        <LogTimeline entries={entries} onDelete={deleteEntry} />
      </div>

      {/* Modal */}
      <EntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTime={selectedTime}
        onSave={handleSaveEntry}
        onPreviewChange={setPreviewData}
      />
    </div>
  );
}
