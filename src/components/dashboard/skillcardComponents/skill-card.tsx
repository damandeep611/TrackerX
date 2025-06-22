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

  // Dynamic category color generator with dark theme support
  const getCategoryColor = (category: string) => {
    const hash = category.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const colors = [
      "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20",
      "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/20",
      "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/20",
      "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/20",
      "bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-500/20",
      "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/20",
      "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20",
      "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/20",
      "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/20",
      "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/20",
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
        className="relative bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-300/60 dark:border-gray-700/50 cursor-pointer overflow-hidden transition-all duration-300 hover:border-gray-300/80 dark:hover:border-gray-600/60"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{
          y: -4,
          transition: { duration: 0.2, ease: [0.25, 0.25, 0, 1] },
        }}
      >
        {/* Simple border beam effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${
              percentage >= 10 ? "#3B82F6" : "#6B7280"
            }, transparent)`,
            maskImage:
              "linear-gradient(90deg, transparent 0%, black 20%, black 10%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, black 20%, black 10%, transparent 100%)",
          }}
          animate={{
            x: isHovered ? ["0%", "100%"] : "0%",
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
        >
          <div className="w-full h-0.5 bg-current absolute top-0" />
          <div className="w-full h-0.5 bg-current absolute bottom-0" />
          <div className="h-full w-0.5 bg-current absolute left-0" />
          <div className="h-full w-0.5 bg-current absolute right-0" />
        </motion.div>

        {/* Header Section */}
        <div className="relative p-4 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <motion.span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border backdrop-blur-sm ${getCategoryColor(
                  skill.category
                )} mb-3`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {skill.category}
              </motion.span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                {skill.skillName}
              </h2>
            </div>

            <div className="text-right ml-4 flex-shrink-0">
              <motion.div
                className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1"
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {percentage.toFixed(0)}%
              </motion.div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                Complete
              </div>
            </div>
          </div>

          {/* Progress Bar with glassmorphism effect */}
          <div className="relative mb-4">
            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className={`h-full bg-gradient-to-r ${getProgressColor(
                  percentage
                )} rounded-full relative shadow-sm`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  animate={{ x: ["0%", "100%"] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 3,
                  }}
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                    width: "30%",
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Modern Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <motion.div
              className="text-center p-2 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-lg mx-auto mb-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(skill.currentHours)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Current
              </div>
            </motion.div>

            <motion.div
              className="text-center p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-500/20 rounded-lg mx-auto mb-2">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(skill.targetHours)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Target
              </div>
            </motion.div>

            <motion.div
              className="text-center p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-500/20 rounded-lg mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(remainingHours)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Remaining
              </div>
            </motion.div>
          </div>

          {/* Expand Toggle */}
          <div className="flex justify-center pt-2">
            <motion.button
              onClick={(event) => {
                event.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group/button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.25, 0, 1] }}
              >
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover/button:text-gray-600 dark:group-hover/button:text-gray-300 transition-colors" />
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
              transition={{ duration: 0.3, ease: [0.25, 0.25, 0, 1] }}
              className="overflow-hidden border-t border-gray-100 dark:border-gray-700/50"
            >
              <div className="p-4 bg-gray-50/30 dark:bg-gray-800/20 backdrop-blur-sm">
                <div className="flex gap-2 justify-end">
                  <motion.button
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(skill);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-lg transition-all duration-200 hover:shadow-sm backdrop-blur-sm"
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
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-lg transition-all duration-200 hover:shadow-sm backdrop-blur-sm"
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