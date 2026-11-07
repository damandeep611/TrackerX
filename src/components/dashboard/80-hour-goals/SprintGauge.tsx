"use client";

import React from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";

interface SprintGaugeProps {
  totalMinutes: number;
  onClick: () => void;
}

const TOTAL_HOURS = 80;
const TOTAL_MINUTES = TOTAL_HOURS * 60;
const RADIUS = 200;
const CENTER = 250; // SVG Size 500x500

export function SprintGauge({ totalMinutes, onClick }: SprintGaugeProps) {
  const progressPercent = Math.min((totalMinutes / TOTAL_MINUTES) * 100, 100);
  const activeTicks = Math.floor((totalMinutes / TOTAL_MINUTES) * TOTAL_HOURS);

  // Geometry helper
  const getTickCoords = (index: number, total: number, r: number, length: number) => {
    const angle = (index / total) * 360 - 90; 
    const rad = (angle * Math.PI) / 180;
    
    const x1 = CENTER + r * Math.cos(rad);
    const y1 = CENTER + r * Math.sin(rad);
    const x2 = CENTER + (r - length) * Math.cos(rad);
    const y2 = CENTER + (r - length) * Math.sin(rad);
    
    return { x1, y1, x2, y2, angle };
  };

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-all duration-500" />

      <svg width={500} height={500} className="relative z-10 transform transition-transform group-hover:scale-[1.02] duration-300">
        
        {/* Ticks Ring */}
        {Array.from({ length: TOTAL_HOURS }).map((_, i) => {
          const isMilestone = i === 20 || i === 40 || i === 60;
          const isActive = i < activeTicks;
          const length = isMilestone ? 25 : 12;
          const { x1, y1, x2, y2 } = getTickCoords(i, TOTAL_HOURS, RADIUS, length);

          return (
            <g key={i}>
              <motion.line
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.005 }}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isActive ? (isMilestone ? "var(--color-blue-400)" : "var(--color-blue-500)") : (isMilestone ? "var(--color-text-secondary)" : "var(--color-border)")}
                strokeWidth={isMilestone ? 5 : 2.5}
                strokeLinecap="round"
                className="transition-colors duration-500"
              />
              {/* Milestone Label */}
              {isMilestone && (
                 <text
                  x={CENTER + (RADIUS - 50) * Math.cos(((i / TOTAL_HOURS) * 360 - 90) * Math.PI / 180)}
                  y={CENTER + (RADIUS - 50) * Math.sin(((i / TOTAL_HOURS) * 360 - 90) * Math.PI / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[12px] fill-text-tertiary font-bold"
                 >
                   {i}h
                 </text>
              )}
            </g>
          );
        })}

        {/* Center Text */}
        <foreignObject x={80} y={80} width={340} height={340}>
           <div className="h-full w-full flex flex-col items-center justify-center text-center">
              <div className="text-sm font-bold uppercase tracking-widest text-text-tertiary mb-2 group-hover:text-blue-400 transition-colors">
                Sprint Progress
              </div>
              <div className="flex items-baseline justify-center gap-2">
                 <span className="text-8xl font-extralight tracking-tighter text-primary tabular-nums">
                    {(totalMinutes / 60).toFixed(1)}
                 </span>
                 <span className="text-xl font-bold text-text-secondary">
                    / 80h
                 </span>
              </div>
              <div className="mt-4 text-xs px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                 {progressPercent.toFixed(1)}% COMPLETE
              </div>
           </div>
        </foreignObject>
      </svg>
      
      {/* Click Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-400 flex items-center gap-1">
         <Zap size={12} fill="currentColor" />
         <span>Click to Log</span>
      </div>
    </div>
  );
}
