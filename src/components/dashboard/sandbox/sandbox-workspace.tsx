"use client";

import React, { useState, useEffect } from "react";
import RadialProgress from "./radial-progress";
import { Clock, Zap, Target, Layers } from "lucide-react";
import { Phase } from "./sandbox-detail-view";
import { cn } from "@/lib/utils";

interface SandboxWorkspaceProps {
  sandboxName: string;
  phases: Phase[];
}

export default function SandboxWorkspace({ sandboxName, phases }: SandboxWorkspaceProps) {
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);

  useEffect(() => {
    if (phases.length > 0 && activePhaseId === null) {
      setActivePhaseId(phases[0].id);
    }
  }, [phases, activePhaseId]);

  const activePhase = phases.find(p => p.id === activePhaseId);

  if (phases.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center justify-center text-zinc-500 shadow-2xl">
          <Layers size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight uppercase">System Offline</h2>
          <p className="text-zinc-500 text-sm max-w-xs font-medium">
            No architectural phases detected. Define your strategy in the <span className="text-blue-500">Structure</span> tab to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
        {/* Compact Phase Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar border-b border-zinc-900/50">
            {phases.map((phase) => (
                <button
                    key={phase.id}
                    onClick={() => setActivePhaseId(phase.id)}
                    className={cn(
                        "px-4 py-2 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all border uppercase tracking-wider",
                        activePhaseId === phase.id
                            ? "bg-blue-600/10 border-blue-500/50 text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.15)]"
                            : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                    )}
                >
                    PHASE {String(phase.id).padStart(2, '0')}
                </button>
            ))}
        </div>

        {/* Main Workspace Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Col: Core Metrics (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-[#09090b] border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-600/5 blur-[40px] rounded-full" />
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="space-y-1">
                            <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Operational Status</p>
                            <h3 className="text-lg font-bold text-white uppercase tracking-tight">{activePhase?.title}</h3>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                            <Zap size={14} fill="currentColor" />
                        </div>
                    </div>

                    <div className="flex justify-center py-4 relative z-10">
                        <RadialProgress 
                            current={0.0} 
                            target={activePhase?.allocatedHours || 100} 
                            label="PHASE COMPLETION"
                            size={240}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                        <div className="p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl">
                            <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-1">Current</p>
                            <p className="text-lg font-mono font-bold text-white">0.0<span className="text-zinc-600 ml-1">H</span></p>
                        </div>
                        <div className="p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl">
                            <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-1">Target</p>
                            <p className="text-lg font-mono font-bold text-white">{activePhase?.allocatedHours}<span className="text-zinc-600 ml-1">H</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Col: Activity & Controls (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="flex-1 bg-[#09090b] border border-zinc-800/50 rounded-2xl p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                         <div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Phase Activity Log</h2>
                            <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase mt-1">Real-time session telemetry</p>
                         </div>
                         <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20">
                            <Clock size={14} />
                            Start Session
                         </button>
                    </div>

                    <div className="flex-1 border border-dashed border-zinc-800/50 rounded-2xl flex flex-col items-center justify-center bg-zinc-900/10 p-12 text-center group hover:border-zinc-700/50 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-600 group-hover:scale-110 transition-transform">
                            <Target size={20} />
                        </div>
                        <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-2">No Active Telemetry</h4>
                        <p className="text-xs text-zinc-500 font-medium max-w-[240px] leading-relaxed">
                            Start a focus session to begin tracking progress for <span className="text-blue-500/80">{activePhase?.title}</span>.
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">System Load</p>
                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[12%] animate-pulse" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">Efficiency</p>
                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[94%]" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">Uptime</p>
                            <p className="text-[11px] font-mono font-bold text-zinc-400 tracking-tighter">00:00:00</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}

