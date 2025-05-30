"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useState } from "react";

export default function ResourceModal({ onClose }: { onClose: () => void }) {
  const [resourceTitle, setResourceTitle] = useState("");
  const [url, setUrl] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className=" bg-white dark:bg-black rounded-xl p-6 w-full max-w-md shadow-xl"
      >
        {/* form header */}
        <div>
          <h3 className="text-xl font-semibold">Add Resource</h3>
          <button className="p-1">
            <X />
          </button>
        </div>
        <form>
          <div>
            <label className="block text-sm font-medium mb-2">
              Resource Title
            </label>
            <input
              type="text"
              value={resourceTitle}
              onChange={(e) => setResourceTitle(e.target.value)}
              className="w-full p-3 border border-border rounded-lg "
              placeholder="Enter resource title.."
              autoFocus
            />
          </div>
          <div>
            <label >URL</label>
            <input type="url" value={url} onChange={(e)=> setUrl(e.target.value)}  className="w-full p-3 border border-border" placeholder="https://..."/>
          </div>
          <div className="flex space-x-3 pt-4">
            <button className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              Add Resources
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
