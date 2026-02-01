"use client";

import React, { useState } from "react";
import { Box, Share2, MoreHorizontal } from "lucide-react";
import SandboxWorkspace from "./sandbox-workspace";
import SandboxStructure from "./sandbox-structure";

export interface Phase {
  id: number;
  title: string;
  description: string;
  milestones: string[];
  allocatedHours: number;
}

export interface ActivityLog {
  id: string;
  phaseId: number;
  title: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  date: string;
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
}

type TabType = "workspace" | "analytics" | "structure";

export default function SandboxDetailView({ sandbox }: SandboxDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("workspace");
  const [phases, setPhases] = useState<Phase[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between gap-6 p-3 px-6 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2 min-w-50">
          <div className="p-2 bg-surfaceHighlight rounded-lg border border-border">
            <Box size={16} className="text-blue-500" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
              {sandbox.name}
            </h1>
            <p className="text-[10px] text-zinc-500">
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
          <button className="p-2 hover:bg-surfaceHighlight rounded-md text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-border">
            <Share2 size={18} />
          </button>
          <button className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-surfaceHighlight border border-transparent hover:border-border transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-hidden">
        {activeTab === "workspace" && (
          <SandboxWorkspace 
            phases={phases} 
            logs={logs}
            onAddLog={(log) => setLogs([log, ...logs])}
          />
        )}
        
        {activeTab === "analytics" && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl">📈</span>
            </div>
            <h2 className="text-xl font-semibold">Sandbox Analytics</h2>
            <p className="text-muted-foreground max-w-md">
                Deep insights into your sandbox activity will appear here.
            </p>
          </div>
        )}

        {activeTab === "structure" && (
          <SandboxStructure 
            sandboxName={sandbox.name} 
            targetHours={sandbox.targetHours} 
            phases={phases}
            setPhases={setPhases}
            logs={logs}
          />
        )}
      </main>
    </div>
  );
}

