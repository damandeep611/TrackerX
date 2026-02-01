"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RadialProgressProps {
  current: number;
  target: number;
  label: string;
  size?: number;
}

export default function RadialProgress({
  current,
  target,
  label,
  size = 300,
}: RadialProgressProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const radius = size / 2;
  const strokeWidth = 2;
  const numTicks = 60; // 60 minutes/ticks for a clock-like look
  const tickLength = 10;
  const longTickLength = 20;
  
  // Calculate ticks
  const ticks = Array.from({ length: numTicks }).map((_, i) => {
    const angle = (i * 360) / numTicks - 90; // Start at top
    const isMajor = i % 5 === 0; // Major tick every 5 units
    const length = isMajor ? longTickLength : tickLength;
    const isActive = (i / numTicks) * 100 < percentage;
    
    // Convert polar to cartesian
    const angleRad = (angle * Math.PI) / 180;
    const innerRadius = radius - length - 20; // Padding from text
    const outerRadius = radius - 20;

    const x1 = parseFloat((radius + innerRadius * Math.cos(angleRad)).toFixed(3));
    const y1 = parseFloat((radius + innerRadius * Math.sin(angleRad)).toFixed(3));
    const x2 = parseFloat((radius + outerRadius * Math.cos(angleRad)).toFixed(3));
    const y2 = parseFloat((radius + outerRadius * Math.sin(angleRad)).toFixed(3));

    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className={cn(
          "transition-colors duration-500",
          isActive ? "stroke-blue-500" : "stroke-zinc-800",
          isMajor && !isActive && "stroke-zinc-700"
        )}
        strokeWidth={isMajor ? 2 : 1}
      />
    );
  });
  
      // Labels for 0%, 25%, 50%, 75%
    const labels = [
      { text: "0H", angle: -90 },
      { text: `${(target * 0.25).toFixed(0)}H`, angle: 0 },
      { text: `${(target * 0.5).toFixed(0)}H`, angle: 90 },
      { text: `${(target * 0.75).toFixed(0)}H`, angle: 180 },
    ];
  
    return (
      <div className="relative flex flex-col items-center justify-center">
        <svg width={size} height={size} className="overflow-visible select-none">
          {/* Ticks */}
          {ticks}
          
          {/* Label Markers */}
          {labels.map((l, i) => {
              const angleRad = (l.angle * Math.PI) / 180;
              const textRadius = radius + 15; 
              const x = parseFloat((radius + textRadius * Math.cos(angleRad)).toFixed(3));
              const y = parseFloat((radius + textRadius * Math.sin(angleRad)).toFixed(3));
              
              return (
                  <text 
                      key={i} 
                      x={x} 
                      y={y} 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      className="fill-zinc-700 text-[8px] font-bold font-mono tracking-tighter"
                  >
                      {l.text}
                  </text>
              )
          })}
        </svg>
  
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1">{label}</p>
          <div className="flex items-baseline mb-2">
              <span className="text-5xl font-bold text-white tracking-tighter">{current.toFixed(1)}</span>
              <span className="text-sm text-zinc-700 font-bold mb-1 ml-1 tracking-tighter">/ {target}H</span>
          </div>
          <div className="bg-blue-600/5 border border-blue-500/10 px-3 py-1 rounded-md">
               <span className="text-blue-500 text-[9px] font-bold tracking-widest">{percentage.toFixed(0)}% READY</span>
          </div>
        </div>
      </div>
    );
  }
  
