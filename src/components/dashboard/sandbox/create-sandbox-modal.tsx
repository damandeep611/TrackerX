"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSandbox } from "@/actions/sandboxActions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface CreateSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateSandboxModal({ isOpen, onClose }: CreateSandboxModalProps) {
  const [name, setName] = useState("");
  const [targetHours, setTargetHours] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetHours) return;

    setLoading(true);
    try {
      await createSandbox({
        name,
        targetHours: parseInt(targetHours),
      });
      toast.success("Sandbox created successfully!");
      router.refresh();
      onClose();
      setName("");
      setTargetHours("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create sandbox");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Sandbox">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Sandbox Name</Label>
          <Input
            id="name"
            placeholder="e.g. Experimental Project"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="targetHours">Target Hours</Label>
          <Input
            id="targetHours"
            type="number"
            min="1"
            placeholder="100"
            value={targetHours}
            onChange={(e) => setTargetHours(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Sandbox"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
