"use client";

import React, { useState, useEffect } from "react";
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
  const numTicks = 120; 
  const tickLength = 8;
  const longTickLength = 16;
  
    const labels = [
      { text: "0H", angle: -90 },
      { text: `${(target * 0.25).toFixed(0)}H`, angle: 0 },
      { text: `${(target * 0.5).toFixed(0)}H`, angle: 90 },
      { text: `${(target * 0.75).toFixed(0)}H`, angle: 180 },
    ];
  
    const viewBoxSize = size + 60;
    const center = viewBoxSize / 2;
    const dashArray = 2 * Math.PI * (radius - 20);
    const dashOffset = dashArray - (dashArray * percentage) / 100;

    return (
      <div className="relative flex flex-col items-center justify-center group/radial">
        <svg width={viewBoxSize} height={viewBoxSize} className="overflow-visible select-none">
          {/* Outer Glow Ring */}
          <circle 
            cx={center} 
            cy={center} 
            r={radius - 15} 
            className="stroke-zinc-900/50 fill-none" 
            strokeWidth="1"
          />
          <circle 
            cx={center} 
            cy={center} 
            r={radius - 15} 
            className="stroke-blue-500/10 fill-none transition-all duration-1000" 
            strokeWidth="8"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />

          {/* Progress Path (Thin Line) */}
          <circle 
            cx={center} 
            cy={center} 
            r={radius - 20} 
            className="stroke-zinc-800/30 fill-none" 
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle 
            cx={center} 
            cy={center} 
            r={radius - 20} 
            className="stroke-blue-600 fill-none transition-all duration-1000" 
            strokeWidth="2"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />

          {/* Ticks */}
          {Array.from({ length: numTicks }).map((_, i) => {
            const angle = (i * 360) / numTicks - 90; 
            const isMajor = i % 10 === 0; 
            const isMedium = i % 5 === 0 && !isMajor;
            const length = isMajor ? longTickLength : isMedium ? 12 : tickLength;
            const isActive = (i / numTicks) * 100 < percentage;
            
            const angleRad = (angle * Math.PI) / 180;
            const innerRadius = radius - length - 30; 
            const outerRadius = radius - 30;

            const x1 = parseFloat((center + innerRadius * Math.cos(angleRad)).toFixed(3));
            const y1 = parseFloat((center + innerRadius * Math.sin(angleRad)).toFixed(3));
            const x2 = parseFloat((center + outerRadius * Math.cos(angleRad)).toFixed(3));
            const y2 = parseFloat((center + outerRadius * Math.sin(angleRad)).toFixed(3));

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={cn(
                  "transition-all duration-700",
                  isActive ? "stroke-blue-500" : "stroke-zinc-800/50",
                  isMajor && !isActive && "stroke-zinc-700/50"
                )}
                strokeWidth={isMajor ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}
          
          {/* Label Markers */}
          {labels.map((l, i) => {
              const angleRad = (l.angle * Math.PI) / 180;
              const textRadius = radius + 5; 
              const x = parseFloat((center + textRadius * Math.cos(angleRad)).toFixed(3));
              const y = parseFloat((center + textRadius * Math.sin(angleRad)).toFixed(3));
              
              return (
                  <text 
                      key={i} 
                      x={x} 
                      y={y} 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      className="fill-zinc-600 text-[9px] font-bold font-mono tracking-tighter"
                  >
                      {l.text}
                  </text>
              )
          })}

          {/* Decorative Brackets */}
          <path d={`M ${center - 40} ${center - radius + 50} L ${center - 60} ${center - radius + 50} L ${center - 60} ${center - radius + 70}`} fill="none" className="stroke-zinc-800" strokeWidth="1" />
          <path d={`M ${center + 40} ${center - radius + 50} L ${center + 60} ${center - radius + 50} L ${center + 60} ${center - radius + 70}`} fill="none" className="stroke-zinc-800" strokeWidth="1" />
          <path d={`M ${center - 40} ${center + radius - 50} L ${center - 60} ${center + radius - 50} L ${center - 60} ${center + radius - 70}`} fill="none" className="stroke-zinc-800" strokeWidth="1" />
          <path d={`M ${center + 40} ${center + radius - 50} L ${center + 60} ${center + radius - 50} L ${center + 60} ${center + radius - 70}`} fill="none" className="stroke-zinc-800" strokeWidth="1" />
        </svg>
  
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">{label}</p>
            <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
          </div>
          
          <div className="flex items-baseline mb-3">
              <span className="text-7xl font-bold text-white tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{current.toFixed(1)}</span>
              <span className="text-xl text-zinc-700 font-bold mb-1 ml-2 tracking-tighter">/ {target}H</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-1.5 rounded-full backdrop-blur-md">
                 <span className="text-blue-500 text-[10px] font-bold tracking-[0.2em]">{percentage.toFixed(1)}% NOMINAL</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
