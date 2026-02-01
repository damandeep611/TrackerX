"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Save, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInMinutes, format, parse, addMinutes } from "date-fns";

interface LogSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: { title: string; startTime: string; endTime: string; duration: number }) => void;
}

const DURATION_PRESETS = [
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "45m", value: 45 },
  { label: "1h", value: 60 },
  { label: "1.5h", value: 90 },
  { label: "2h", value: 120 },
];

export default function LogSprintModal({ isOpen, onClose, onSave }: LogSprintModalProps) {
  const [title, setTitle] = useState("");
  // Default to current time and 1 hour later for convenience
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationStr, setDurationStr] = useState("0h 0m");
  const [durationMinutes, setDurationMinutes] = useState(0);

  // Initialize times when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      // Round down to nearest 5 minutes for cleaner start times
      const minutes = now.getMinutes();
      const roundedMinutes = Math.floor(minutes / 5) * 5;
      now.setMinutes(roundedMinutes);
      
      const oneHourLater = addMinutes(now, 60);
      
      setStartTime(format(now, "HH:mm"));
      setEndTime(format(oneHourLater, "HH:mm"));
      setTitle("");
    }
  }, [isOpen]);

  // Recalculate duration whenever times change
  useEffect(() => {
    if (startTime && endTime) {
      const today = format(new Date(), "yyyy-MM-dd");
      const start = parse(`${today} ${startTime}`, "yyyy-MM-dd HH:mm", new Date());
      let end = parse(`${today} ${endTime}`, "yyyy-MM-dd HH:mm", new Date());

      // Handle overnight shifts (if end time is earlier than start time, assume next day)
      if (end < start) {
        end = addMinutes(end, 24 * 60);
      }

      const diffMins = differenceInMinutes(end, start);
      setDurationMinutes(diffMins);

      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      setDurationStr(`${hours}h ${mins}m`);
    }
  }, [startTime, endTime]);

  const handleSave = () => {
    if (!title || !startTime || !endTime) return;
    
    onSave({
      title,
      startTime,
      endTime,
      duration: durationMinutes / 60 // Store as hours for consistency
    });
    onClose();
  };

  const setDurationFromStart = (minutes: number) => {
    if (!startTime) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const start = parse(`${today} ${startTime}`, "yyyy-MM-dd HH:mm", new Date());
    const newEnd = addMinutes(start, minutes);
    setEndTime(format(newEnd, "HH:mm"));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="LOG SPRINT">
      <div className="space-y-6">
        <p className="text-zinc-500 text-xs -mt-4">Record your deep work block.</p>

        <div className="space-y-5">
          {/* Activity Name */}
          <div className="space-y-2">
            <Label htmlFor="activity-name" className="text-[10px] uppercase text-zinc-500 tracking-widest font-bold">Activity Name</Label>
            <Input
              id="activity-name"
              placeholder="e.g., Read Documentation, Code Feature X"
              className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500/40 text-white placeholder:text-zinc-700 font-medium h-12 text-sm transition-all focus:ring-1 focus:ring-blue-500/20"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Time Block */}
            <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-800/60 hover:border-zinc-700/80 transition-colors group">
              <Label htmlFor="start-time" className="text-[10px] uppercase text-zinc-500 tracking-widest font-bold flex items-center gap-1.5 mb-2 group-hover:text-zinc-400 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                Start Time
              </Label>
              <div className="relative">
                <Input
                  id="start-time"
                  type="time"
                  className="bg-transparent border-none text-white font-mono text-2xl h-auto p-0 focus-visible:ring-0 focus:border-none w-full cursor-pointer hover:text-blue-200 transition-colors"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>

            {/* End Time Block */}
            <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-800/60 hover:border-zinc-700/80 transition-colors group">
              <Label htmlFor="end-time" className="text-[10px] uppercase text-zinc-500 tracking-widest font-bold flex items-center gap-1.5 mb-2 group-hover:text-zinc-400 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]"></span>
                End Time
              </Label>
              <div className="relative">
                <Input
                  id="end-time"
                  type="time"
                  className="bg-transparent border-none text-white font-mono text-2xl h-auto p-0 focus-visible:ring-0 focus:border-none w-full cursor-pointer hover:text-pink-200 transition-colors"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Quick Duration Presets */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase text-zinc-500 tracking-widest font-bold flex items-center gap-1.5">
                <Zap size={10} className="text-yellow-500" />
                Quick Duration
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {DURATION_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant="outline"
                  onClick={() => setDurationFromStart(preset.value)}
                  className={cn(
                    "h-8 text-xs font-mono border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 hover:text-white text-zinc-400 transition-all",
                    durationMinutes === preset.value && "border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                  )}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Duration Display */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-900 border border-zinc-800/50 rounded-lg py-3 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                <Clock size={14} className="text-zinc-500" />
                <span className="text-zinc-500 text-xs font-medium">Total Session:</span>
            </div>
            <span className="text-white font-mono font-bold text-sm bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">
                {durationStr}
            </span>
        </div>

        {/* Save Button */}
        <Button 
            className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group"
            onClick={handleSave}
            disabled={!title || !startTime || !endTime}
        >
            <Save size={16} className="group-hover:scale-110 transition-transform" />
            Save Session
        </Button>
      </div>
    </Modal>
  );
}