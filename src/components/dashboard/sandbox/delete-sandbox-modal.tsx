"use client";
import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { deleteSandbox } from "@/actions/sandboxActions";
import toast from "react-hot-toast";

interface DeleteSandboxModalProps {
  sandboxId: string;
  sandboxName: string;
}

export default function DeleteSandboxModal({ sandboxId, sandboxName }: DeleteSandboxModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    try {
      await deleteSandbox(sandboxId);
      toast.success("Sandbox deleted successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to delete sandbox:", error);
      toast.error("Failed to delete sandbox");
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <div className="relative z-20">
      <motion.button
        ref={buttonRef}
        onClick={handleOpen}
        className="p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all duration-200 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Trash2 size={14} />
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={handleCancel}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.2,
              }}
              className="relative bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 text-destructive border border-destructive/20">
                  <Trash2 size={24} />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">
                  Delete Sandbox?
                </h3>
                
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Are you sure you want to delete <span className="text-foreground font-medium">"{sandboxName}"</span>? This will permanently remove all phases and logs associated with it.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-secondary hover:bg-accent text-foreground text-sm font-medium rounded-lg transition-colors border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm font-medium rounded-lg transition-colors shadow-lg shadow-destructive/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
