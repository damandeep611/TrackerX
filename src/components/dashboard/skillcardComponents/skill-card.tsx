"use client";
import { Skill } from "@/types/skillDashboardTypes";
import { useRouter } from "next/navigation";
import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Clock, Layers, MoreHorizontal, Zap } from "lucide-react";

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const percentage = (skill.currentHours / skill.targetHours) * 100;
  const totalSegments = 38;
  const completedSegments = Math.round((percentage / 100) * totalSegments);

  // const remainingHours = Math.max(0, skill.targetHours - skill.currentHours);
  //use this remaining hours of skill in the skill overview with tasks list
  const segmentBg = "#27272a";
  const navigate = useRouter();
  // skill.skillColor
  const activeColor = skill.skillColor;

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
    if (progress === 0) return "Stalled ";
    if (progress < 5) return "Low";
    if (progress < 20) return "Progress⚡";
    if (progress < 50) return "Halfway There!";
    if (progress < 80) return "Almost There!";
    return "On Fire 🔥";
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

  const getSkillColor = getCategoryColor(skill.category);

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.25, 0, 1] }}
    >
      <motion.div
        onClick={() => navigate.push(`/dashboard/skills/${skill.slug}`)}
        className="relative flex flex-col p-5  bg-[#09090b] dark:bg-[#050505] border border-border/60 rounded-xl transition-all duration-300 shadow-sm cursor-pointer overflow-hidden"
      >
        <div
          className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${getSkillColor}`}
        />

        <div className="relative pb-2">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 z-10">
            <div className="flex gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-900 shadow-inner border border-white/5 transition-colors duration-300 `}
              >
                <Layers
                  size={18}
                  strokeWidth={1.5}
                  className={`${getSkillColor} bg-zinc-800`}
                />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-zinc-100 leading-tight  transition-colors">
                  {skill.skillName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    {skill.category}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
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
            </div>

            <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Progress Bar with glassmorphism effect */}
          <div className="relative mb-2 flex flex-col justify-between">
            {/* percentage text show */}
            <div className="flex justify-between items-end mb-2">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500 dark:text-zinc-600 mb-1">
                  Progress
                </span>
                <span className="text-2xl font-medium   text-zinc-200 tabular-nums tracking-tight">
                  {percentage.toFixed(0)}%
                  <span className="text-zinc-400 dark:text-zinc-600 text-lg">
                    %
                  </span>
                </span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface border border-border text-[10px] font-medium text-zinc-500 dark:text-zinc-300">
                  <Zap
                    size={10}
                    className={`text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400`}
                  />
                  {getMotivationTags(percentage)}
                </div>
              </div>
            </div>

            <div className="w-full flex items-center justify-between gap-[1px] h-6 relative pt-4">
              {Array.from({ length: totalSegments }).map((_, index) => {
                const isActiveSegement = index < completedSegments;
                return (
                  <motion.div
                    key={index}
                    initial={{ height: "6px", opacity: 1 }}
                    animate={{
                      height: isActiveSegement ? "30px" : "10px",
                      backgroundColor:
                        index < completedSegments ? activeColor : segmentBg,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.015,
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      ease: "easeOut",
                    }}
                    className="w-1.5 h-10 rounded-xs"
                    style={{
                      backgroundColor: isActiveSegement
                        ? activeColor
                        : segmentBg,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Stats Footer */}
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 text-zinc-400 ">
              <Clock size={12} strokeWidth={2} />
              <span className="font-mono">
                {formatTime(skill.currentHours)}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="font-mono">{formatTime(skill.targetHours)}</span>
            </div>

            {/* details */}
            <button
              className={`flex items-center gap-1 cursor-pointer text-[10px] ${getSkillColor} bg-zinc-900 font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0`}
            >
              Open Project <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}