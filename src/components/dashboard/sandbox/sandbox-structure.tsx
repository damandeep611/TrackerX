"use client";

import React, { useState } from "react";
import { Plus, Edit3, Minimize2, Maximize2, Trash2 } from "lucide-react";
import AddPhaseModal from "./add-phase-modal";
import { cn } from "@/lib/utils";
import { Phase, ActivityLog } from "./sandbox-detail-view";
import { createPhase, updatePhase, deletePhase } from "@/actions/sandboxActions";
import toast from "react-hot-toast";

interface SandboxStructureProps {
  sandboxName: string;
  sandboxId: string;
  targetHours: number;
  phases: Phase[];
  setPhases: React.Dispatch<React.SetStateAction<Phase[]>>;
  logs: ActivityLog[];
}

export default function SandboxStructure({
  sandboxName,
  sandboxId,
  targetHours,
  phases,
  setPhases,
  logs,
}: SandboxStructureProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);

  const totalAllocatedHours = phases.reduce(
    (acc, phase) => acc + phase.allocatedHours,
    0,
  );

  const handleOpenAddModal = () => {
    setEditingPhase(null);
    setIsModalOpen(true);
  };

  const handleEditPhase = (phase: Phase) => {
    setEditingPhase(phase);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingPhase(null), 300); // Clear after animation roughly
  };

  const handleSavePhase = async (phaseData: Omit<Phase, "id" | "orderIndex">) => {
    if (editingPhase) {
      // Update existing phase
      try {
        // Optimistic update
        setPhases(current => current.map(p => p.id === editingPhase.id ? {
          ...p,
          ...phaseData
        } : p));
        setIsModalOpen(false);

        // Server action
        const updated = await updatePhase(editingPhase.id, sandboxId, {
          ...phaseData,
          milestones: phaseData.milestones || [],
          description: phaseData.description || ""
        });

        // Sync with real data
        setPhases(current => current.map(p => p.id === editingPhase.id ? {
          ...updated,
          allocatedHours: Number(updated.allocatedHours),
          description: updated.description,
          milestones: updated.milestones
        } : p));
        
        toast.success("Phase parameters updated");
      } catch (error) {
        console.error("Failed to update phase:", error);
        toast.error("Failed to update phase");
        // Revert?
      }
    } else {
      // Create new phase
      try {
        // Optimistic update
        const tempId = Math.random().toString(36).substr(2, 9);
        const tempPhase: Phase = {
          ...phaseData,
          id: tempId,
          orderIndex: phases.length,
          milestones: phaseData.milestones || [],
          description: phaseData.description || null
        };
        setPhases([...phases, tempPhase]);
        setIsModalOpen(false);

        // Server action
        const createdPhase = await createPhase(sandboxId, {
          ...phaseData,
          milestones: phaseData.milestones || [], // Ensure array
          description: phaseData.description || ""
        });

        // Update state with real data
        setPhases(current => current.map(p => p.id === tempId ? {
          ...createdPhase,
          allocatedHours: Number(createdPhase.allocatedHours),
          description: createdPhase.description,
          milestones: createdPhase.milestones
        } : p));
        
        toast.success("Phase initialized");
      } catch (error) {
        console.error("Failed to create phase:", error);
        toast.error("Failed to initialize phase");
      }
    }
    setEditingPhase(null);
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm("Are you sure you want to dismantle this phase protocol?")) return;

    try {
      // Optimistic update
      setPhases(current => current.filter(p => p.id !== phaseId));

      await deletePhase(phaseId, sandboxId);
      toast.success("Phase protocol dismantled");
    } catch (error) {
      console.error("Failed to delete phase:", error);
      toast.error("Failed to delete phase");
      // Revert?
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedPhaseId((currentId) => (currentId === id ? null : id));
  };

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      {/* Structure Header */}
      <div className="flex items-end justify-between border-b border-border/50 pb-6 mb-8 mt-2">
        <div>
          <p className="text-[10px] text-primary font-bold tracking-widest uppercase mb-1">
            System Architecture
          </p>
          <h1 className="text-4xl font-bold text-foreground tracking-tight uppercase">
            {sandboxName}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-secondary hover:bg-accent text-foreground px-4 py-2 rounded-lg text-xs font-medium border border-border transition-all"
          >
            <Plus size={14} />
            Add Phase
          </button>
          <div className="flex items-center gap-6 pl-6 border-l border-border">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">
                Architecture
              </p>
              <p className="text-xl font-bold text-foreground leading-none">
                {phases.length} PHASES
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-primary uppercase tracking-widest font-semibold mb-1">
                Allocation
              </p>
              <p className="text-xl font-bold text-foreground leading-none">
                {totalAllocatedHours}
                <span className="text-muted-foreground text-sm ml-0.5">/</span>
                {targetHours}
                <span className="text-muted-foreground text-xs ml-0.5">H</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Phase List / Empty State */}
      <div className="min-h-100">
        {phases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-100">
            <div className="text-center space-y-4 opacity-50">
              <p className="text-sm text-muted-foreground uppercase tracking-widest">
                No structural phases defined
              </p>
              <p className="text-xs text-muted-foreground/60">
                Total Budget: {targetHours}h
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-8 auto-rows-min">
            {phases.map((phase) => {
              const phaseLogs = logs.filter((log) => log.phaseId === phase.id);
              const loggedHours = phaseLogs.reduce(
                (acc, log) => acc + log.duration,
                0,
              );

              return (
                <PhaseCard
                  key={phase.id}
                  phaseNumber={phase.orderIndex + 1}
                  title={phase.title}
                  description={phase.description || ""}
                  milestones={phase.milestones || []}
                  allocatedHours={phase.allocatedHours}
                  loggedHours={loggedHours}
                  isExpanded={expandedPhaseId === phase.id}
                  onToggleExpand={() => handleToggleExpand(phase.id)}
                  onEdit={() => handleEditPhase(phase)}
                  onDelete={() => handleDeletePhase(phase.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      <AddPhaseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleSavePhase}
        targetHours={targetHours}
        totalAllocatedHours={totalAllocatedHours}
        initialData={editingPhase}
      />
    </div>
  );
}

function PhaseCard({
  phaseNumber,
  title,
  description,
  milestones,
  allocatedHours,
  loggedHours,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
}: {
  phaseNumber: number;
  title: string;
  description: string;
  milestones: string[];
  allocatedHours: number;
  loggedHours: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-6 hover:border-border transition-all duration-300 ease-in-out group relative overflow-hidden",
        isExpanded ? "col-span-1 md:col-span-2 row-span-2" : "col-span-1",
      )}
    >
      {/* Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <p className="text-[9px] text-muted-foreground font-bold tracking-[0.3em] uppercase">
            PHASE {String(phaseNumber).padStart(2, "0")}
          </p>
          <p className="text-[9px] text-primary/60 font-bold tracking-widest uppercase">
            SYSTEM_STABLE
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">
              Added Hours
            </span>
            <div className="bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-md text-[10px] font-bold text-primary flex items-center gap-1.5 font-mono">
              <span>{loggedHours.toFixed(1)}</span>
              <span className="opacity-20 text-muted-foreground">/</span>
              <span>{allocatedHours}H</span>
            </div>
          </div>
          <button 
            onClick={onEdit}
            className="p-1.5 hover:bg-accent rounded-md transition-colors border border-transparent hover:border-border text-muted-foreground hover:text-foreground"
          >
            <Edit3 size={12} />
          </button>
          <button 
            onClick={onDelete}
            className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors border border-transparent hover:border-destructive/20 text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="space-y-2.5 relative z-10">
        <h3 className="text-2xl font-bold text-card-foreground leading-tight tracking-tight group-hover:text-primary transition-colors uppercase">
          {title}
        </h3>
        <p
          className={cn(
            "text-[12px] text-muted-foreground leading-relaxed font-medium transition-all",
            isExpanded ? "" : "line-clamp-2",
          )}
        >
          {description || "No operational objectives defined for this phase."}
        </p>
      </div>

      <div className="space-y-4 relative z-10 flex-1">
        <h4 className="text-[9px] text-muted-foreground font-bold tracking-[0.2em] uppercase border-b border-border/50 pb-2">
          Operational Milestones
        </h4>
        <ul className="space-y-2.5">
          {(milestones.length > 0
            ? milestones
            : ["Awaiting milestone definitions..."]
          ).map((milestone, i) => (
            <li
              key={i}
              className="flex gap-2.5 text-[11px] text-muted-foreground/80 font-medium leading-snug"
            >
              <span className="text-primary/40 mt-0.5 font-mono">
                [{i + 1}]
              </span>
              <span className={isExpanded ? "" : "line-clamp-2"}>
                {milestone}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-6 border-t border-border/50 flex justify-between items-center text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-primary/50 animate-pulse" />
          STANDBY_MODE
        </div>
        <button
          onClick={onToggleExpand}
          className="hover:text-primary transition-colors cursor-pointer tracking-widest flex items-center gap-2 group/btn"
        >
          {isExpanded ? (
            <>
              COLLAPSE{" "}
              <Minimize2
                size={10}
                className="group-hover/btn:scale-110 transition-transform"
              />
            </>
          ) : (
            <>
              EXPAND_VIEW{" "}
              <Maximize2
                size={10}
                className="group-hover/btn:scale-110 transition-transform"
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

