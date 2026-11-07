"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Clock, Box } from "lucide-react";
import DeleteSandboxModal from "./delete-sandbox-modal";

interface Sandbox {
  id: string;
  name: string;
  targetHours: number;
  currentHours: string;
}

interface SandboxCardProps {
  sandbox: Sandbox;
}

export default function SandboxCard({ sandbox }: SandboxCardProps) {
  const currentHours = parseFloat(sandbox.currentHours);
  const percentage = (currentHours / sandbox.targetHours) * 100;
  const totalSegments = 38;
  const completedSegments = Math.round((percentage / 100) * totalSegments);
  
  const navigate = useRouter();

  const formatTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (wholeHours === 0 && minutes === 0) return `0m`;
    if (wholeHours === 0) return `${minutes}m`;
    if (minutes === 0) return `${wholeHours}h`;
    return `${wholeHours}h ${minutes}m`;
  };

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.25, 0, 1] }}
    >
      <motion.div
        onClick={() => navigate.push(`/dashboard/sandbox/${sandbox.id}`)}
        className="relative flex flex-col p-5 bg-card border border-border rounded-xl transition-all duration-300 shadow-sm cursor-pointer overflow-hidden hover:border-primary/50"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative pb-2">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 z-10">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted shadow-inner border border-border/50">
                <Box size={18} strokeWidth={1.5} className="text-primary" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-card-foreground leading-tight">
                  {sandbox.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Sandbox
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-2 flex flex-col justify-between">
            <div className="flex justify-between items-end mb-2">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
                  Progress
                </span>
                <span className="text-2xl font-medium text-foreground tabular-nums tracking-tight">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="w-full flex items-center justify-between gap-px h-6 relative pt-4">
              {Array.from({ length: totalSegments }).map((_, index) => {
                const isActive = index < completedSegments;
                return (
                  <motion.div
                    key={index}
                    initial={{ height: "6px", opacity: 1 }}
                    animate={{
                      height: isActive ? "30px" : "10px",
                    }}
                    className={`w-1.5 h-10 rounded-xs ${isActive ? "bg-primary" : "bg-muted"}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Stats Footer */}
          <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock size={12} strokeWidth={2} />
              <span className="font-mono">{formatTime(currentHours)}</span>
              <span className="text-muted-foreground/70">/</span>
              <span className="font-mono">
                {formatTime(sandbox.targetHours)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DeleteSandboxModal
                sandboxId={sandbox.id}
                sandboxName={sandbox.name}
              />

              <button className="flex items-center gap-1 cursor-pointer text-[10px] text-primary font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                Open Sandbox <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
