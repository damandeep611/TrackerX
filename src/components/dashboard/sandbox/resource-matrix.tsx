"use client";

import React, { useState } from "react";
import { Database } from "lucide-react";
import ResourceCard, { SandboxResource } from "./resource-card";
import ResourceCommandBar from "./resource-command-bar";
import { Phase } from "./sandbox-detail-view";
import { cn } from "@/lib/utils";

interface ResourceMatrixProps {
  sandboxId: string;
  phases: Phase[];
  initialResources: SandboxResource[];
}

export default function ResourceMatrix({ sandboxId, phases, initialResources }: ResourceMatrixProps) {
  const [resources, setResources] = useState<SandboxResource[]>(initialResources);
  const [filterPhaseId, setFilterPhaseId] = useState<string | null>(null);

  const handleAddResource = (newResource: SandboxResource) => {
    setResources([newResource, ...resources]);
  };

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
  };

  // Grouping logic
  const groupedResources = resources.reduce((acc, resource) => {
    const key = resource.phaseId || "general";
    if (!acc[key]) acc[key] = [];
    acc[key].push(resource);
    return acc;
  }, {} as Record<string, SandboxResource[]>);

  const sortedGroupKeys = [
    "general",
    ...phases.map(p => p.id).filter(id => groupedResources[id])
  ];

  return (
    <div className="mt-12 space-y-12">
      {/* Top Command Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Add New Resource</span>
        </div>
        <ResourceCommandBar 
          sandboxId={sandboxId} 
          phases={phases} 
          onAdd={handleAddResource} 
        />
      </div>

      <div className="space-y-8">
        {/* Matrix Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground uppercase tracking-[0.2em]">Resources</h2>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Reference materials and learning assets</p>
            </div>
          </div>

          {/* Quick Filter - Just Phase Tabs */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFilterPhaseId(null)}
              className={cn(
                "px-3 py-1 rounded-md text-[9px] font-bold border transition-all uppercase tracking-widest",
                filterPhaseId === null ? "bg-primary/10 border-primary/50 text-primary" : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
              )}
            >
              ALL
            </button>
            {phases.map(p => (
              <button 
                key={p.id}
                onClick={() => setFilterPhaseId(p.id)}
                className={cn(
                  "px-3 py-1 rounded-md text-[9px] font-bold border transition-all uppercase tracking-widest",
                  filterPhaseId === p.id ? "bg-primary/10 border-primary/50 text-primary" : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                )}
              >
                P{String(p.orderIndex + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Resources grouped by Phase */}
        <div className="space-y-10 min-h-40">
          {resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border/50 rounded-2xl bg-muted/10 opacity-50">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">No resources linked to this sandbox</p>
            </div>
          ) : (
            sortedGroupKeys
              .filter(key => filterPhaseId === null || key === filterPhaseId)
              .map(key => {
                const groupResources = groupedResources[key] || [];
                if (groupResources.length === 0) return null;

                const phase = phases.find(p => p.id === key);
                const phaseTitle = phase ? `PHASE ${String(phase.orderIndex + 1).padStart(2, "0")}: ${phase.title}` : "GENERAL RESOURCES";

                return (
                  <div key={key} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                        {phaseTitle}
                      </h3>
                      <div className="h-[1px] flex-1 bg-border/30" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {groupResources.map(resource => (
                        <ResourceCard 
                          key={resource.id} 
                          resource={resource} 
                          onDelete={handleDeleteResource}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
