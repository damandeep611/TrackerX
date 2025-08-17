"use client";
import { Skill } from "@/types/skillDashboardTypes";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import { useTheme } from "next-themes";

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const percentage = (skill.currentHours / skill.targetHours) * 100;
  const totalSegments = 38;
  const completedSegments = Math.round((percentage / 100) * totalSegments);
  // const remainingHours = Math.max(0, skill.targetHours - skill.currentHours);
  //use this remaining hours of skill in the skill overview with tasks list
  const { resolvedTheme } = useTheme();
  const segmentBg = resolvedTheme === "dark" ? "#27272a" : "#f3f4f6";
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

  const getMotivationTags = (progress: number) => {
    if (progress === 0) return "Not Started ";
    if (progress < 5) return "Building Momentum";
    if (progress < 20) return "Making Progress";
    if (progress < 50) return "Halfway There!";
    if (progress < 80) return "Almost There!";
    return "On Fire 🔥";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "#059669"; // emerald-500
    if (percentage >= 70) return "#3b82f6"; // blue-500
    if (percentage >= 40) return "#f59e42"; // amber-500
    return "#fde047"; // yellow-500
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
        className="relative bg-white dark:bg-zinc-900 backdrop-blur-sm rounded-xl p-6 border border-gray-300 dark:border-gray-800  cursor-pointer overflow-hidden transition-all duration-300"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{
          y: -4,
          transition: { duration: 0.2, ease: [0.25, 0.25, 0, 1] },
        }}
      >
        {/* Header Section */}
        <div className="relative pb-2">
          <div className="flex items-start justify-between ">
            <h2 className="text-lg font-semibold capitalize  leading-tight   transition-colors">
              {skill.skillName}
            </h2>
            <motion.span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs uppercase font-medium border backdrop-blur-sm ${getCategoryColor(
                skill.category
              )} mb-3`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {skill.category}
            </motion.span>
          </div>

          {/* Progress Bar with glassmorphism effect */}
          <div className="relative mb-4 flex items-center justify-between">
            <div className="flex gap-1 items-center">
              {Array.from({ length: totalSegments }, (_, index) => (
                <motion.div
                  key={index}
                  initial={{ backgroundColor: segmentBg }}
                  animate={{
                    backgroundColor:
                      index < completedSegments
                        ? getProgressColor(percentage)
                        : segmentBg,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: 0.3 + index * 0.05,
                    ease: "easeOut",
                  }}
                  className="w-1 h-10 rounded-full"
                />
              ))}
            </div>
            <motion.div
              className="text-sm font-medium "
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {percentage.toFixed(0)}%
            </motion.div>
          </div>
          {/* Modern Stats Grid */}
          <div className="flex items-center justify-between py-2 font-medium">
            <div className="flex items-center justify-between gap-2">
              <Timer size={12} className="text-green-600" />
              <span className="text-xs">Total time spend</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-400">
              <div className="flex items-center justify-between ">
                <span className="text-sm">
                  {formatTime(skill.currentHours)}
                </span>
              </div>
              <span>/</span>
              <span className="text-sm">{formatTime(skill.targetHours)}</span>
            </div>
          </div>
          {/* bottom section  */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              {getMotivationTags(percentage)}
            </span>

            {percentage > 0 && (
              <div className="flex items-center justify-baseline gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">
                  Active
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}