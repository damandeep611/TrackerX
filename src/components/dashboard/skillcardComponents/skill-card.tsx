"use client";
import { Skill } from "@/types/skillDashboardTypes";
import { ChevronDown, Edit3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface SkillCardProps {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onDelete: (id: string) => void;
}

export default function SkillCard({ skill, onEdit, onDelete }: SkillCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentage = (skill.currentHours / skill.targetHours) * 100;

  const navigate = useRouter();

  // formatting time
  const formatTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (wholeHours === 0 && minutes === 0) {
      return `0 m`;
    }
    if (wholeHours === 0) {
      return `${minutes}m`;
    }
    if (minutes === 0) {
      return `${wholeHours}h`;
    }
    return `${wholeHours} h ${minutes}m`;
  };

  return (
    <motion.div
      onClick={() => navigate.push(`/dashboard/skills/${skill.slug}`)}
      className=" rounded-xl hover:shadow-lg cursor-pointer shadow-sm transition-all duration-300 border border-gray-100 overflow-hidden"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between text-white bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
        <div className="flex-1">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-white/20 rounded-full mb-3 backdrop-blur-sm">
            {skill.category}
          </span>
          <h2 className="text-xl font-bold leading-tight">{skill.skillName}</h2>
        </div>
        <div className="text-right ml-4">
          <div className="text-3xl font-bold">{percentage.toFixed(0)}%</div>
          <div className="text-sm opacity-90">completed</div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-medium  mb-2 uppercase tracking-wide">
              Current Progress
            </div>
            <div className="text-2xl font-semibold">
              {formatTime(skill.currentHours)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium  mb-2 uppercase tracking-wide">
              Target
            </div>
            <div className="text-2xl font-semibold">
              {formatTime(skill.targetHours)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full rounded-full shadow-sm"
              style={{ backgroundColor: skill.skillColor }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Expand Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={(event) => {
              event.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center justify-center  rounded-full hover:bg-gray-100 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-600" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Expandable Actions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-gray-100">
              <div className="flex justify-end gap-3">
                <motion.button
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(skill);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </motion.button>
                <motion.button
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(skill.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
