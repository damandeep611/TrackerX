"use client";

import React, { useState } from "react";
import { Plus, Edit3, Minimize2, Maximize2 } from "lucide-react";
import AddPhaseModal from "./add-phase-modal";
import { cn } from "@/lib/utils";
import { Phase } from "./sandbox-detail-view";

interface SandboxStructureProps {
  sandboxName: string;
  targetHours: number;
  phases: Phase[];
  setPhases: React.Dispatch<React.SetStateAction<Phase[]>>;
}

export default function SandboxStructure({ sandboxName, targetHours, phases, setPhases }: SandboxStructureProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPhaseId, setExpandedPhaseId] = useState<number | null>(null);

  const totalAllocatedHours = phases.reduce((acc, phase) => acc + phase.allocatedHours, 0);

  const handleAddPhase = (newPhase: Omit<Phase, "id">) => {
    setPhases([...phases, { ...newPhase, id: phases.length + 1 }]);
    setIsModalOpen(false);
  };

  const handleToggleExpand = (id: number) => {
      setExpandedPhaseId(currentId => currentId === id ? null : id);
  }

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
        {/* Structure Header */}
        <div className="flex items-end justify-between border-b border-border/50 pb-6 mb-8 mt-2">
            <div>
                <p className="text-[10px] text-blue-500 font-bold tracking-widest uppercase mb-1">Manual_Arch_Mode</p>
                <h1 className="text-4xl font-bold text-foreground tracking-tight uppercase">{sandboxName}</h1>
            </div>
            
            <div className="flex items-center gap-6">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-xs font-medium border border-zinc-700 transition-all"
                >
                    <Plus size={14} />
                    Add Phase
                </button>
                <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Architecture</p>
                    <p className="text-xl font-bold text-foreground leading-none">{phases.length} PHASES</p>
                </div>
            </div>
        </div>

        {/* Phase List / Empty State */}
        <div className="min-h-[400px]">
             {phases.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px]">
                    <div className="text-center space-y-4 opacity-50">
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">No structural phases defined</p>
                        <p className="text-xs text-muted-foreground/60">Total Budget: {targetHours}h</p>
                    </div>
                </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-8 auto-rows-min">
                     {phases.map((phase) => (
                         <PhaseCard 
                            key={phase.id} 
                            phaseNumber={phase.id} 
                            title={phase.title} 
                            description={phase.description} 
                            milestones={phase.milestones}
                            allocatedHours={phase.allocatedHours}
                            isExpanded={expandedPhaseId === phase.id}
                            onToggleExpand={() => handleToggleExpand(phase.id)}
                        />
                     ))}
                 </div>
             )}
        </div>

        <AddPhaseModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onConfirm={handleAddPhase}
            targetHours={targetHours}
            totalAllocatedHours={totalAllocatedHours}
        />
    </div>
  );
}

function PhaseCard({ phaseNumber, title, description, milestones, allocatedHours, isExpanded, onToggleExpand }: {
    phaseNumber: number;
    title: string;
    description: string;
    milestones: string[];
    allocatedHours: number;
    isExpanded: boolean;
    onToggleExpand: () => void;
}) {
    return (
        <div className={cn(
            "bg-[#09090b] border border-zinc-800/50 rounded-2xl p-6 flex flex-col gap-6 hover:border-zinc-700/80 transition-all duration-300 ease-in-out group relative overflow-hidden",
            isExpanded ? "col-span-1 md:col-span-2 row-span-2" : "col-span-1"
        )}>
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                    <p className="text-[9px] text-zinc-500 font-bold tracking-[0.3em] uppercase">PHASE {String(phaseNumber).padStart(2, '0')}</p>
                    <p className="text-[9px] text-blue-500/60 font-bold tracking-widest uppercase">SYSTEM_STABLE</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600/5 border border-blue-500/10 px-2.5 py-1 rounded-md text-[10px] font-bold text-blue-500/80 flex items-center gap-1.5 font-mono">
                        <span className="opacity-40">0.0</span> 
                        <span className="opacity-20 text-zinc-600">/</span> 
                        <span>{allocatedHours}H</span>
                    </div>
                    <button className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors border border-transparent hover:border-zinc-800 text-zinc-600 hover:text-white">
                        <Edit3 size={12} />
                    </button>
                </div>
            </div>

            <div className="space-y-2.5 relative z-10">
                <h3 className="text-2xl font-bold text-white leading-tight tracking-tight group-hover:text-blue-500 transition-colors uppercase">
                    {title}
                </h3>
                <p className={cn(
                    "text-[12px] text-zinc-500 leading-relaxed font-medium transition-all",
                    isExpanded ? "" : "line-clamp-2"
                )}>
                    {description || "No operational objectives defined for this phase."}
                </p>
            </div>

            <div className="space-y-4 relative z-10 flex-1">
                <h4 className="text-[9px] text-zinc-600 font-bold tracking-[0.2em] uppercase border-b border-zinc-900/50 pb-2">Operational Milestones</h4>
                <ul className="space-y-2.5">
                    {(milestones.length > 0 ? milestones : ["Awaiting milestone definitions..."]).map((milestone, i) => (
                        <li key={i} className="flex gap-2.5 text-[11px] text-zinc-400 font-medium leading-snug">
                            <span className="text-blue-500/40 mt-0.5 font-mono">[{i + 1}]</span>
                            <span className={isExpanded ? "" : "line-clamp-2"}>{milestone}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-900/50 flex justify-between items-center text-[9px] font-bold tracking-[0.2em] text-zinc-600 uppercase relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500/50 animate-pulse" />
                    STANDBY_MODE
                </div>
                <button 
                    onClick={onToggleExpand}
                    className="hover:text-blue-500 transition-colors cursor-pointer tracking-widest flex items-center gap-2 group/btn"
                >
                    {isExpanded ? (
                        <>COLLAPSE <Minimize2 size={10} className="group-hover/btn:scale-110 transition-transform" /></>
                    ) : (
                        <>EXPAND_VIEW <Maximize2 size={10} className="group-hover/btn:scale-110 transition-transform" /></>
                    )}
                </button>
            </div>
        </div>
    );
}

