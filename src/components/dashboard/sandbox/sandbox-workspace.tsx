"use client";

import React, { useState, useEffect } from "react";
import RadialProgress from "./radial-progress";
import { Clock, Zap, Target, Layers, PlayCircle } from "lucide-react";
import { Phase, ActivityLog } from "./sandbox-detail-view";
import { cn } from "@/lib/utils";
import LogSprintModal from "./log-sprint-modal";
import { format } from "date-fns";

interface SandboxWorkspaceProps {
  sandboxName: string;
  phases: Phase[];
  logs: ActivityLog[];
  onAddLog: (log: ActivityLog) => void;
}

export default function SandboxWorkspace({ sandboxName, phases, logs, onAddLog }: SandboxWorkspaceProps) {
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  useEffect(() => {
    if (phases.length > 0 && activePhaseId === null) {
      setActivePhaseId(phases[0].id);
    }
  }, [phases, activePhaseId]);

  const activePhase = phases.find(p => p.id === activePhaseId);

  // Filter logs for the active phase
  const activePhaseLogs = logs.filter(log => log.phaseId === activePhaseId);
  const currentHours = activePhaseLogs.reduce((acc, log) => acc + log.duration, 0);

  const handleSaveSession = (session: { title: string; startTime: string; endTime: string; duration: number }) => {
    if (!activePhaseId) return;

    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      phaseId: activePhaseId,
      title: session.title,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      date: new Date().toISOString(),
    };

    onAddLog(newLog);
  };

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
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar px-2 pb-6">
        {/* Compact Phase Navigation */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 mb-4 border-b border-zinc-900/50 flex items-center gap-2 overflow-x-auto custom-scrollbar">
            {phases.map((phase) => (
                <button
                    key={phase.id}
                    onClick={() => setActivePhaseId(phase.id)}
                    className={cn(
                        "px-4 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all border uppercase tracking-wider",
                        activePhaseId === phase.id
                            ? "bg-blue-600/10 border-blue-500/50 text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.15)]"
                            : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                    )}
                >
                    PHASE {String(phase.id).padStart(2, '0')}
                </button>
            ))}
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 pt-2">
            
            {/* Left Col: Core Metrics (6 cols) */}
            <div className="lg:col-span-6 flex flex-col">
                <div className="bg-[#09090b] border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden group flex flex-col items-center justify-center min-h-[500px]">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/5 blur-[60px] rounded-full" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-50" />
                    
                    <div className="w-full flex items-center justify-between mb-8 relative z-10 px-2">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">System Core</p>
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight pl-3 border-l-2 border-blue-500/50">{activePhase?.title}</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                            <Zap size={16} fill="currentColor" />
                        </div>
                    </div>

                    <div 
                        className="relative z-10 cursor-pointer transition-all duration-500 hover:scale-[1.02] active:scale-95 group/dial"
                        onClick={() => setIsLogModalOpen(true)}
                    >
                        <RadialProgress 
                            current={currentHours} 
                            target={activePhase?.allocatedHours || 100} 
                            label="COMPLETION"
                            size={380}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/dial:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.4)] backdrop-blur-md border border-blue-400/50 transform translate-y-20">
                                Log Session
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-10 relative z-10 w-full max-w-md mx-auto">
                        <div className="p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl text-center backdrop-blur-sm">
                            <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-1">Current</p>
                            <p className="text-xl font-mono font-bold text-white">{currentHours.toFixed(1)}<span className="text-zinc-600 text-sm ml-1">H</span></p>
                        </div>
                        <div className="p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl text-center backdrop-blur-sm">
                            <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-1">Target</p>
                            <p className="text-xl font-mono font-bold text-white">{activePhase?.allocatedHours}<span className="text-zinc-600 text-sm ml-1">H</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Col: Activity & Controls (6 cols) */}
            <div className="lg:col-span-6 flex flex-col h-full">
                <div className="bg-[#09090b] border border-zinc-800/50 rounded-2xl p-6 flex flex-col h-full min-h-[500px]">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/50">
                         <div>
                            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Telemetry Log</h2>
                            <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase mt-1">Real-time data stream</p>
                         </div>
                         <button 
                            className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white w-9 h-9 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                            onClick={() => setIsLogModalOpen(true)}
                        >
                            <Clock size={16} />
                         </button>
                    </div>

                    {activePhaseLogs.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800/50 p-6 text-center group">
                            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-600">
                                <Target size={18} />
                            </div>
                            <h4 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-1">Awaiting Data</h4>
                            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed max-w-[160px]">
                                No telemetry detected for this phase.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             {activePhaseLogs.map((log) => (
                                 <div key={log.id} className="flex flex-col p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all group">
                                     <div className="flex items-center justify-between mb-3">
                                         <h4 className="text-xs font-bold text-zinc-200 truncate pr-2">{log.title}</h4>
                                         <div className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono font-bold text-blue-500">
                                            {log.duration.toFixed(2)}h
                                         </div>
                                     </div>
                                     <div className="flex items-center justify-between border-t border-zinc-800/30 pt-2">
                                        <span className="text-[9px] font-mono text-zinc-500">{format(new Date(log.date), "MMM d")}</span>
                                        <span className="text-[9px] font-mono text-zinc-600">{log.startTime} - {log.endTime}</span>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <LogSprintModal 
            isOpen={isLogModalOpen}
            onClose={() => setIsLogModalOpen(false)}
            onSave={handleSaveSession}
        />
    </div>
  );
}

