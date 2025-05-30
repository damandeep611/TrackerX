"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useState } from "react";

interface ResourceModalProps {
  onClose: () => void;
  onAddResource: (resourceTitle: string, url: string) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ResourceModal({
  onClose,
  onAddResource,
  isSubmitting = false,
}: ResourceModalProps) {
  const [resourceTitle, setResourceTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("URL is required");
      return;
    }

    try {
      await onAddResource(resourceTitle.trim(), url.trim());
      onClose();
    } catch (error) {
      console.error("Error adding resource:", error);
      setError("Failed to add resource");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 400,
          duration: 0.1,
        }}
        className="bg-background rounded-xl p-6 w-full max-w-md shadow-lg border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Add Resource
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-md transition-colors duration-150"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resource Title */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Resource Title
            </label>
            <input
              type="text"
              value={resourceTitle}
              onChange={(e) => setResourceTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-colors duration-150 bg-background text-foreground placeholder-muted-foreground"
              placeholder="Enter resource title..."
              autoFocus
            />
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              className={`w-full px-3 py-2.5 border ${
                error ? "border-red-500" : "border-border"
              } rounded-lg focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-colors duration-150 bg-background text-foreground placeholder-muted-foreground`}
              placeholder="https://example.com"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add Resource"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}