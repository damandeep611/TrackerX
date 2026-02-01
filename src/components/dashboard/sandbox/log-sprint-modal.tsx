"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInMinutes, format, parse } from "date-fns";

interface LogSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: { title: string; startTime: string; endTime: string; duration: number }) => void;
}

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
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
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
        end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="LOG SPRINT">
      <div className="space-y-6">
        <p className="text-zinc-500 text-xs -mt-4">Record your deep work block.</p>

        <div className="space-y-4">
          {/* Activity Name */}
          <div className="space-y-2">
            <Label htmlFor="activity-name" className="text-[10px] uppercase text-zinc-500 tracking-widest font-bold">Activity Name</Label>
            <Input
              id="activity-name"
              placeholder="e.g., Read Documentation, Code Feature X"
              className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500/40 text-white placeholder:text-zinc-700 font-medium h-11 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="start-time" className="text-[10px] uppercase text-zinc-500 tracking-widest font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Start
              </Label>
              <div className="relative">
                <Input
                  id="start-time"
                  type="time"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500/40 text-white font-mono h-11 text-sm pl-4 pr-10"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={14} />
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="end-time" className="text-[10px] uppercase text-zinc-500 tracking-widest font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                End
              </Label>
              <div className="relative">
                <Input
                  id="end-time"
                  type="time"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500/40 text-white font-mono h-11 text-sm pl-4 pr-10"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Calculated Duration */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg py-3 flex items-center justify-center gap-2">
            <Clock size={14} className="text-zinc-500" />
            <span className="text-zinc-500 text-xs font-medium">Calculated Duration:</span>
            <span className="text-white font-mono font-bold text-sm">{durationStr}</span>
        </div>

        {/* Save Button */}
        <Button 
            className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
            onClick={handleSave}
            disabled={!title || !startTime || !endTime}
        >
            <Save size={16} />
            Save Session
        </Button>
      </div>
    </Modal>
  );
}
