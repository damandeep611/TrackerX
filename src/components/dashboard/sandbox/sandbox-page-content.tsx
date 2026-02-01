"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SandboxCard from "./sandbox-card";
import CreateSandboxModal from "./create-sandbox-modal";

interface Sandbox {
  id: string;
  name: string;
  targetHours: number;
  currentHours: string;
  userId: string;
  createdAt: Date;
}

interface SandboxPageContentProps {
  initialSandboxes: Sandbox[];
}

export default function SandboxPageContent({ initialSandboxes }: SandboxPageContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sandbox</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Experimental spaces for testing new ideas.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={16} />
          New Sandbox
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {initialSandboxes.map((sandbox) => (
          <SandboxCard key={sandbox.id} sandbox={sandbox} />
        ))}
        
        {initialSandboxes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl bg-muted/20">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
              <Plus size={24} />
            </div>
            <h3 className="text-lg font-medium text-foreground">No sandboxes yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-6 text-center max-w-sm">
              Create your first sandbox to start experimenting with new features and tracking progress.
            </p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline">
              Create Sandbox
            </Button>
          </div>
        )}
      </div>

      <CreateSandboxModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
