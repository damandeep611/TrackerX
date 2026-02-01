"use client";

import React, { useState } from "react";
import { Box, Share2, MoreHorizontal } from "lucide-react";
import SandboxWorkspace from "./sandbox-workspace";
import SandboxStructure from "./sandbox-structure";

export interface Phase {
  id: string;
  title: string;
  description: string | null;
  milestones: string[] | null;
  allocatedHours: number;
  orderIndex: number;
}

export interface ActivityLog {
  id: string;
  phaseId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in hours
}

interface Sandbox {
  id: string;
  name: string;
  targetHours: number;
  currentHours: string;
  createdAt: Date;
}

interface SandboxDetailViewProps {
  sandbox: Sandbox;
  initialPhases?: Phase[];
  initialLogs?: ActivityLog[];
}

type TabType = "workspace" | "analytics" | "structure";

export default function SandboxDetailView({ sandbox, initialPhases = [], initialLogs = [] }: SandboxDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("workspace");
  // In a real app with React Query/Server Actions, these might be managed differently, 
  // but for now we initialize state with server props.
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);

  // Sorting phases by orderIndex
  const sortedPhases = [...phases].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between gap-6 p-3 px-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2 min-w-50">
          <div className="p-2 bg-accent rounded-lg border border-border">
            <Box size={16} className="text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-foreground">
              {sandbox.name}
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Sandbox • Target {sandbox.targetHours}h
            </p>
          </div>
        </div>

        {/* Tabs - Middle Section */}
        <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-6 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "workspace"
                ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Workspace
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "analytics"
                ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("structure")}
            className={`px-6 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "structure"
                ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Structure
          </button>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-4 min-w-50 justify-end">
          <button className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border">
            <Share2 size={18} />
          </button>
          <button className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-hidden">
        {activeTab === "workspace" && (
          <SandboxWorkspace 
            phases={sortedPhases} 
            logs={logs}
            onAddLog={(log) => setLogs([log, ...logs])}
            sandboxId={sandbox.id}
          />
        )}
        
        {activeTab === "analytics" && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl">📈</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground">Sandbox Analytics</h2>
            <p className="text-muted-foreground max-w-md">
                Deep insights into your sandbox activity will appear here.
            </p>
          </div>
        )}

        {activeTab === "structure" && (
          <SandboxStructure 
            sandboxName={sandbox.name} 
            sandboxId={sandbox.id}
            targetHours={sandbox.targetHours} 
            phases={sortedPhases}
            setPhases={setPhases}
            logs={logs}
          />
        )}
      </main>
    </div>
  );
}