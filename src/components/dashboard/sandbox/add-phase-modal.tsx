"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phase: { title: string; description: string; milestones: string[]; allocatedHours: number }) => void;
  targetHours: number;
  totalAllocatedHours: number;
}

export default function AddPhaseModal({ isOpen, onClose, onConfirm, targetHours, totalAllocatedHours }: AddPhaseModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [milestonesText, setMilestonesText] = useState("");
  const [allocatedHours, setAllocatedHours] = useState("");

  const availableHours = targetHours - totalAllocatedHours;
  
  // Calculate potential remaining if user inputs a value
  const potentialAllocated = parseFloat(allocatedHours) || 0;
  const remainingAfterAllocation = availableHours - potentialAllocated;
  const isOverBudget = remainingAfterAllocation < 0;

  const handleCreate = () => {
    const milestones = milestonesText
      .split("\n")
      .map((m) => m.trim())
      .filter((m) => m !== "");
    
    const hours = parseFloat(allocatedHours) || 0;

    onConfirm({
      title,
      description,
      milestones,
      allocatedHours: hours,
    });
    
    // Reset fields
    setTitle("");
    setDescription("");
    setMilestonesText("");
    setAllocatedHours("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="INITIALIZE PHASE PROTOCOL">
      <div className="space-y-5">
        
        {/* Resource Monitor */}
        <div className={cn(
            "flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 relative overflow-hidden",
            isOverBudget 
                ? "bg-red-500/5 border-red-500/20 shadow-[0_0_20px_-10px_rgba(239,68,68,0.3)]" 
                : "bg-blue-500/5 border-blue-500/20 shadow-[0_0_20px_-10px_rgba(59,130,246,0.3)]"
        )}>
           {/* Background Pulse Effect */}
           <div className={cn(
               "absolute inset-0 opacity-10 animate-pulse pointer-events-none",
               isOverBudget ? "bg-red-500" : "bg-blue-500"
           )} />

           <div className="flex flex-col relative z-10">
                <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-0.5">Available Capacity</span>
                <span className={cn(
                    "text-xl font-mono font-bold tracking-tight flex items-baseline gap-1",
                    isOverBudget ? "text-red-400" : "text-blue-400"
                )}>
                    {availableHours.toFixed(1)}<span className="text-xs opacity-70">H</span>
                </span>
           </div>
           
           <div className={cn(
               "h-8 w-8 rounded-lg border flex items-center justify-center transition-colors duration-300 relative z-10",
               isOverBudget 
                   ? "border-red-500/30 bg-red-500/10 text-red-500" 
                   : "border-blue-500/30 bg-blue-500/10 text-blue-500"
           )}>
                {isOverBudget ? <AlertCircle size={16} /> : <Zap size={16} fill="currentColor" />}
           </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
             {/* Phase Identifier */}
            <div className="col-span-3 space-y-1.5">
                <Label htmlFor="title" className="text-[9px] uppercase text-zinc-500 tracking-[0.2em] font-bold">Phase Identifier</Label>
                <Input 
                    id="title" 
                    placeholder="e.g. CORE_SYSTEM_ARCH" 
                    className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500/40 text-white placeholder:text-zinc-700 font-bold uppercase tracking-tight h-9 text-xs" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            {/* Allocation Input */}
            <div className="col-span-1 space-y-1.5">
                <Label htmlFor="hours" className="text-[9px] uppercase text-zinc-500 tracking-[0.2em] font-bold">Alloc. (H)</Label>
                <Input 
                    id="hours" 
                    type="number"
                    placeholder="0.0" 
                    className={cn(
                        "bg-zinc-900/50 border-zinc-800 font-mono text-center font-bold h-9 text-xs transition-colors",
                        isOverBudget 
                            ? "text-red-400 focus:border-red-500/40" 
                            : "text-blue-400 focus:border-blue-500/40"
                    )}
                    value={allocatedHours}
                    onChange={(e) => setAllocatedHours(e.target.value)}
                />
            </div>
          </div>

          {/* Operational Objective */}
          <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[9px] uppercase text-zinc-500 tracking-[0.2em] font-bold">Operational Objective</Label>
              <textarea 
                  id="description" 
                  placeholder="Define primary mission parameters..." 
                  className="flex min-h-[70px] w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/40 transition-colors resize-none font-sans leading-relaxed"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
              />
          </div>

          {/* Tactical Milestones */}
          <div className="space-y-1.5">
              <Label htmlFor="points" className="text-[9px] uppercase text-zinc-500 tracking-[0.2em] font-bold">Tactical Milestones</Label>
              <div className="relative">
                  <textarea 
                      id="points" 
                      placeholder={"• Establish connection protocols\n• Verify data integrity\n• Optimize latency"} 
                      className="flex min-h-[100px] w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/40 transition-colors resize-none font-mono custom-scrollbar leading-relaxed"
                      value={milestonesText}
                      onChange={(e) => setMilestonesText(e.target.value)}
                  />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-zinc-800 rounded text-[9px] text-zinc-500 font-mono pointer-events-none">
                      ONE PER LINE
                  </div>
              </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
            <Button 
                variant="outline" 
                className="flex-1 py-5 bg-transparent border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 uppercase tracking-widest text-[10px] font-bold transition-all" 
                onClick={onClose}
            >
                Abort
            </Button>
            <Button 
                className={cn(
                    "flex-[2] py-5 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg transition-all",
                    isOverBudget 
                        ? "bg-red-600 hover:bg-red-700 shadow-red-900/20" 
                        : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
                )} 
                onClick={handleCreate}
            >
                Confirm Allocation
            </Button>
        </div>
      </div>
    </Modal>
  );
}