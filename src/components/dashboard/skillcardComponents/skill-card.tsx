"use client";
import { Skill } from "@/types/skillDashboardTypes";
import {
  ChevronDown,
  Edit3,
  Trash2,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
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
  const [isHovered, setIsHovered] = useState(false);
  const percentage = (skill.currentHours / skill.targetHours) * 100;
  const remainingHours = Math.max(0, skill.targetHours - skill.currentHours);

  const navigate = useRouter();

  // Original formatting time function
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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "from-emerald-500 to-green-600";
    if (percentage >= 70) return "from-blue-500 to-indigo-600";
    if (percentage >= 40) return "from-amber-500 to-orange-600";
    return "from-slate-500 to-gray-600";
  };

  // Dynamic category color generator based on category name
  const getCategoryColor = (category: string) => {
    const hash = category.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-red-100 text-red-800 border-red-200",
      "bg-yellow-100 text-yellow-800 border-yellow-200",
      "bg-teal-100 text-teal-800 border-teal-200",
      "bg-cyan-100 text-cyan-800 border-cyan-200",
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.25, 0, 1] }}
    >
      <motion.div
        onClick={() => navigate.push(`/dashboard/skills/${skill.slug}`)}
        className="relative bg-white rounded-2xl border border-gray-200/60 cursor-pointer overflow-hidden transition-all duration-300 hover:border-gray-300/80"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{
          y: -4,
          transition: { duration: 0.2, ease: [0.25, 0.25, 0, 1] },
        }}
        style={{
          boxShadow: isHovered
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-gray-50/30 pointer-events-none" />

        {/* Header Section */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <motion.span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getCategoryColor(
                  skill.category
                )} mb-3`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {skill.category}
              </motion.span>
              <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-1 group-hover:text-gray-700 transition-colors">
                {skill.skillName}
              </h2>
            </div>

            <div className="text-right ml-4 flex-shrink-0">
              <motion.div
                className="text-2xl font-bold text-gray-900 mb-1"
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {percentage.toFixed(0)}%
              </motion.div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Complete
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${getProgressColor(
                  percentage
                )} rounded-full relative`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ x: ["0%", "100%"] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 3,
                  }}
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                    width: "30%",
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg mx-auto mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatTime(skill.currentHours)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Current</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-lg mx-auto mb-2">
                <Target className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatTime(skill.targetHours)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Target</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-50 rounded-lg mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatTime(remainingHours)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Remaining</div>
            </div>
          </div>

          {/* Expand Toggle */}
          <div className="flex justify-center pt-2">
            <motion.button
              onClick={(event) => {
                event.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200 group/button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover/button:text-gray-600 transition-colors" />
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
              className="overflow-hidden border-t border-gray-100"
            >
              <div className="p-4 bg-gray-50/50">
                <div className="flex gap-2 justify-end">
                  <motion.button
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(skill);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200 hover:shadow-sm"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </motion.button>

                  <motion.button
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(skill.id);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors duration-200 hover:shadow-sm"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.1 }}
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
    </motion.div>
  );
}