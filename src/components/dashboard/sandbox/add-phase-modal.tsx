"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phase: { title: string; description: string; milestones: string[]; allocatedHours: number }) => void;
  targetHours: number;
  totalAllocatedHours: number;
  initialData?: {
    title: string;
    description: string | null;
    milestones: string[] | null;
    allocatedHours: number;
  } | null;
}

export default function AddPhaseModal({ isOpen, onClose, onConfirm, targetHours, totalAllocatedHours, initialData }: AddPhaseModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [milestonesText, setMilestonesText] = useState("");
  const [allocatedHours, setAllocatedHours] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setMilestonesText((initialData.milestones || []).join("\n"));
        setAllocatedHours(initialData.allocatedHours.toString());
      } else {
        setTitle("");
        setDescription("");
        setMilestonesText("");
        setAllocatedHours("");
      }
    }
  }, [isOpen, initialData]);

  const availableHours = targetHours - totalAllocatedHours + (initialData ? initialData.allocatedHours : 0);
  
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
    
    // Reset fields if just creating, though useEffect handles this on open
    if (!initialData) {
      setTitle("");
      setDescription("");
      setMilestonesText("");
      setAllocatedHours("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "MODIFY PHASE PROTOCOL" : "INITIALIZE PHASE PROTOCOL"}>
      <div className="space-y-5">
        {/* Resource Monitor */}
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 relative overflow-hidden",
            isOverBudget
              ? "bg-destructive/5 border-destructive/20 shadow-[0_0_20px_-10px_rgba(239,68,68,0.3)]"
              : "bg-primary/5 border-primary/20 shadow-[0_0_20px_-10px_rgba(59,130,246,0.3)]",
          )}
        >
          {/* Background Pulse Effect */}
          <div
            className={cn(
              "absolute inset-0 opacity-10 animate-pulse pointer-events-none",
              isOverBudget ? "bg-destructive" : "bg-primary",
            )}
          />

          <div className="flex flex-col relative z-10">
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-0.5">
              Available Capacity
            </span>
            <span
              className={cn(
                "text-xl font-mono font-bold tracking-tight flex items-baseline gap-1",
                isOverBudget ? "text-destructive" : "text-primary",
              )}
            >
              {availableHours.toFixed(1)}
              <span className="text-xs opacity-70">H</span>
            </span>
          </div>

          <div
            className={cn(
              "h-8 w-8 rounded-lg border flex items-center justify-center transition-colors duration-300 relative z-10",
              isOverBudget
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-primary/30 bg-primary/10 text-primary",
            )}
          >
            {isOverBudget ? (
              <AlertCircle size={16} />
            ) : (
              <Zap size={16} fill="currentColor" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {/* Phase Identifier */}
            <div className="col-span-3 space-y-1.5">
              <Label
                htmlFor="title"
                className="text-[9px] uppercase text-muted-foreground tracking-[0.2em] font-bold"
              >
                Phase Identifier
              </Label>
              <Input
                id="title"
                placeholder="e.g. CORE_SYSTEM_ARCH"
                className="bg-muted/50 border-border focus:border-primary/40 text-foreground placeholder:text-muted-foreground/50 font-bold uppercase tracking-tight h-9 text-xs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            {/* Allocation Input */}
            <div className="col-span-1 space-y-1.5">
              <Label
                htmlFor="hours"
                className="text-[9px] uppercase text-muted-foreground tracking-[0.2em] font-bold"
              >
                Alloc. (H)
              </Label>
              <Input
                id="hours"
                type="number"
                placeholder="0.0"
                className={cn(
                  "bg-muted/50 border-border font-mono text-center font-bold h-9 text-xs transition-colors",
                  isOverBudget
                    ? "text-destructive focus:border-destructive/40"
                    : "text-primary focus:border-primary/40",
                )}
                value={allocatedHours}
                onChange={(e) => setAllocatedHours(e.target.value)}
              />
            </div>
          </div>

          {/* Operational Objective */}
          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="text-[9px] uppercase text-muted-foreground tracking-[0.2em] font-bold"
            >
              Operational Objective
            </Label>
            <textarea
              id="description"
              placeholder="Define primary mission parameters..."
              className="flex min-h-17.5 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors resize-none font-sans leading-relaxed"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Tactical Milestones */}
          <div className="space-y-1.5">
            <Label
              htmlFor="points"
              className="text-[9px] uppercase text-muted-foreground tracking-[0.2em] font-bold"
            >
              Tactical Milestones
            </Label>
            <div className="relative">
              <textarea
                id="points"
                placeholder={
                  "• Establish connection protocols\n• Verify data integrity\n• Optimize latency"
                }
                className="flex min-h-25 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors resize-none font-mono custom-scrollbar leading-relaxed"
                value={milestonesText}
                onChange={(e) => setMilestonesText(e.target.value)}
              />
              <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-muted rounded text-[9px] text-muted-foreground font-mono pointer-events-none">
                ONE PER LINE
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 py-5 bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 uppercase tracking-widest text-[10px] font-bold transition-all"
            onClick={onClose}
          >
            Abort
          </Button>
          <Button
            className={cn(
              "flex-2 py-5 text-primary-foreground font-bold uppercase tracking-widest text-[10px] shadow-lg transition-all",
              isOverBudget
                ? "bg-destructive hover:bg-destructive/90 shadow-destructive/20"
                : "bg-primary hover:bg-primary/90 shadow-primary/20",
            )}
            onClick={handleCreate}
          >
            {initialData ? "Update Phase" : "Confirm Allocation"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}