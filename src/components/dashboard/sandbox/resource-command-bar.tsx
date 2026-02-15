"use client";

import React, { useState, useEffect } from "react";
import { Plus, Link as LinkIcon, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchResourceMetadata, addResource } from "@/actions/sandboxActions";
import { Phase } from "./sandbox-detail-view";
import toast from "react-hot-toast";

interface ResourceCommandBarProps {
  sandboxId: string;
  phases: Phase[];
  onAdd: (resource: any) => void;
}

export default function ResourceCommandBar({ sandboxId, phases, onAdd }: ResourceCommandBarProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("general");
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<{ thumbnailUrl?: string; resourceType: string } | null>(null);

  const handleUrlBlur = async () => {
    if (!url || !url.startsWith("http")) return;
    
    setIsLoading(true);
    try {
      const data = await fetchResourceMetadata(url);
      setTitle(data.title);
      setMetadata({ thumbnailUrl: data.thumbnailUrl, resourceType: data.resourceType });
    } catch (error) {
      console.error("Metadata fetch failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;

    try {
      const newResource = await addResource(sandboxId, {
        url,
        title,
        phaseId: selectedPhaseId === "general" ? null : selectedPhaseId,
        resourceType: metadata?.resourceType || "article",
        thumbnailUrl: metadata?.thumbnailUrl
      });
      
      onAdd(newResource);
      setUrl("");
      setTitle("");
      setMetadata(null);
      setSelectedPhaseId("general");
      toast.success("Resource added successfully");
    } catch (error) {
      toast.error("Failed to add resource");
    }
  };

  return (
    <form 
      onSubmit={handleAddResource}
      className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-2 bg-muted/30 border border-border/50 rounded-2xl backdrop-blur-sm group focus-within:border-primary/30 transition-all"
    >
      <div className="relative flex-1 group/input">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors">
          <LinkIcon size={14} />
        </div>
        <input 
          type="url"
          placeholder="Paste resource URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleUrlBlur}
          className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-mono pl-9 h-10 placeholder:text-muted-foreground/50 uppercase tracking-widest"
          required
        />
      </div>

      <div className="relative flex-1 group/input">
        <input 
          type="text"
          placeholder={isLoading ? "Fetching metadata..." : "Resource title..."}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-bold pl-3 h-10 placeholder:text-muted-foreground/50 uppercase tracking-tight"
          required
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 size={14} className="animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="relative min-w-[160px]">
        <select 
          value={selectedPhaseId}
          onChange={(e) => setSelectedPhaseId(e.target.value)}
          className="w-full bg-background/50 border border-border/50 rounded-xl px-3 h-10 text-[10px] font-bold appearance-none uppercase tracking-widest cursor-pointer hover:border-border focus:border-primary/50 transition-all pr-8"
        >
          <option value="general">General Resources</option>
          {phases.map((phase) => (
            <option key={phase.id} value={phase.id}>
              P{String(phase.orderIndex + 1).padStart(2, "0")}: {phase.title.substring(0, 15)}...
            </option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>

      <button 
        type="submit"
        disabled={isLoading || !url || !title}
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
      >
        <Plus size={14} />
        Add Resource
      </button>
    </form>
  );
}
