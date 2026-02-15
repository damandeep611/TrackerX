"use client";

import React, { useState, useEffect } from "react";
import { Link, Video, FileText, Github, Trash2, ExternalLink, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleResourceStatus, deleteResource } from "@/actions/sandboxActions";
import toast from "react-hot-toast";

export interface SandboxResource {
  id: string;
  sandboxId: string;
  phaseId: string | null;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  resourceType: string;
  status: string;
  createdAt: Date;
}

interface ResourceCardProps {
  resource: SandboxResource;
  onDelete: (id: string) => void;
}

export default function ResourceCard({ resource, onDelete }: ResourceCardProps) {
  const [isRead, setIsRead] = useState(resource.status === "read");

  const getTypeIcon = (size = 18) => {
    switch (resource.resourceType) {
      case "video": return <Video size={size} className="text-red-500" />;
      case "repo": return <Github size={size} className="text-foreground" />;
      case "article": return <FileText size={size} className="text-blue-500" />;
      default: return <Link size={size} className="text-primary" />;
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newStatus = isRead ? "unread" : "read";
      setIsRead(!isRead);
      await toggleResourceStatus(resource.id, resource.sandboxId, resource.status);
      toast.success(newStatus === "read" ? "Marked as completed" : "Marked as unread");
    } catch (error) {
      setIsRead(isRead);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this resource?")) return;
    try {
      onDelete(resource.id);
      await deleteResource(resource.id, resource.sandboxId);
      toast.success("Resource removed");
    } catch (error) {
      toast.error("Failed to remove resource");
    }
  };

  return (
    <div 
      className={cn(
        "group relative flex items-center gap-5 p-4 bg-card/50 hover:bg-card border border-border/50 rounded-2xl hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md",
        isRead && "opacity-60 grayscale-[0.5]"
      )}
    >
      {/* Thumbnail or Icon */}
      <div className="relative flex-shrink-0 w-20 h-20 rounded-xl bg-muted border border-border/50 overflow-hidden flex items-center justify-center shadow-inner">
        {resource.thumbnailUrl ? (
          <img 
            src={resource.thumbnailUrl} 
            alt={resource.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="transform transition-transform group-hover:scale-110 duration-300">
            {getTypeIcon(24)}
          </div>
        )}
        
        {/* Type Overlay Badge */}
        <div className="absolute bottom-0 right-0 p-1 bg-background/90 backdrop-blur-sm rounded-tl-lg border-t border-l border-border/50">
          {getTypeIcon(14)}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold text-primary/80 uppercase tracking-[0.1em]">
            {resource.resourceType}
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="text-[11px] font-medium text-muted-foreground truncate lowercase">
            {new URL(resource.url).hostname.replace("www.", "")}
          </span>
        </div>
        <h4 className="text-[14px] font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {resource.title}
        </h4>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
        <button 
          onClick={handleToggleStatus}
          className="p-2 hover:bg-primary/10 rounded-xl text-muted-foreground hover:text-primary transition-colors shadow-sm"
          title={isRead ? "Mark as unread" : "Mark as completed"}
        >
          {isRead ? <CheckCircle2 size={18} className="text-primary" /> : <Circle size={18} />}
        </button>
        <a 
          href={resource.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 hover:bg-primary/10 rounded-xl text-muted-foreground hover:text-primary transition-colors shadow-sm"
        >
          <ExternalLink size={18} />
        </a>
        <button 
          onClick={handleDelete}
          className="p-2 hover:bg-destructive/10 rounded-xl text-muted-foreground hover:text-destructive transition-colors shadow-sm"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
