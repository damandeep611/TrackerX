"use client";
import { Skill } from "@/types/skillDashboardTypes";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { MdDelete } from "react-icons/md";

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
    if (wholeHours === 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
    return `${wholeHours} hour${
      wholeHours !== 1 ? "s" : ""
    } ${minutes} minute'${minutes !== 1 ? "s" : ""}`;
  };

  return (
    <div
      onClick={() => navigate.push(`/dashboard/skills/${skill.slug}`)}
      className=" p-4 rounded-xl hover:shadow-md border border-gray-500 dark:bg-gray-900 cursor-pointer shadow-sm transition-shadow"
    >
      {/* skill card header and expand card */}
      <div className="flex justify-between items-start mb-4">
        <div className="">
          <h3 className="text-xl font-medium">{skill.skillName}</h3>
          <span className="text-sm">{skill.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <button style={{ color: skill.skillColor }}>
            <PlusIcon />
          </button>
          <button
            className="cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
        </div>
      </div>
      {/* skill card data */}
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>{formatTime(skill.currentHours)}</span>
          <span>{formatTime(skill.targetHours)}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: skill.skillColor,
            }}
          />
        </div>
      </div>
      {/* showign percentage of complete skill */}
      <div className="flex justify-between items-center text-sm">
        <div>{percentage.toFixed(1)}% complete</div>
      </div>
      {/* skill card expansion for showing delete and edit button */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onEdit(skill)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                onDelete(skill.id);
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              <MdDelete size={25} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
