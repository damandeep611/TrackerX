"use client"
import React from 'react'
import { motion } from "framer-motion"
import { Flag, Sparkles, Calendar } from "lucide-react"


export default function ShowcaseTaskCards() {
   const tasks = [
    {
      title: "Mood Boards & Style Guides",
      description: "Explore and define the visual direction.",
      priority: "High" as const,
      confidence: 99,
      status: "In Progress",
      statusColor: "bg-yellow-100 text-yellow-800",
      dueDate: "Jun 01",
      avatars: ["https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e53588fd399239e9b54dc11_peep-59.png", "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5355f3f5fa1a1fd7f79760_peep-37.png", "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e53521c4600805ff88b3bb5_peep-16.png"],
    },
    {
      title: "Micro-interactions & Animations",
      description: "Plan subtle visual feedback and animations.",
      priority: "Medium" as const,
      confidence: 80,
      status: "In Review",
      statusColor: "bg-blue-100 text-blue-800",
      dueDate: "Jun 16",
      avatars: ["https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e53588fd399239e9b54dc11_peep-59.png", "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5355f3f5fa1a1fd7f79760_peep-37.png", "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e53521c4600805ff88b3bb5_peep-16.png"],
    },
    {
      title: "Design Review with Stakeholders",
      description: "Present and gather feedback on design concepts.",
      priority: "Low" as const,
      confidence: 100,
      status: "Completed",
      statusColor: "bg-gray-100 text-gray-600",
      dueDate: "May 28",
      avatars: ["https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e53588fd399239e9b54dc11_peep-59.png", "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5355f3f5fa1a1fd7f79760_peep-37.png", ],
      isCompleted: true,
    },
  ]

  const duplicatedTasks = [...tasks, ...tasks]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className=" px-8 py-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-gray-300 "
    >
      <div className="relative h-80 overflow-hidden mb-8">
        <motion.div
          className="space-y-3"
          animate={{
            y: [0, -300], // Animate upward movement
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          {duplicatedTasks.map((task, index) => (
            <TaskCard key={index} {...task} />
          ))}
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-11 bg-gradient-to-br from-blue-50 to-indigo-100 pointer-events-none" />
      </div>

      {/* Auto-Prioritization section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-left"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Auto-Prioritization</h2>
        <p className="text-gray-600 text-base leading-relaxed">
          Automatically reorders your task list based on shifting project urgency and dependencies.
        </p>
      </motion.div>
    </motion.div>
  )
}


interface TaskCardProps {
  title: string
  description: string
  priority: "High" | "Medium" | "Low"
  confidence: number
  status: string
  statusColor: string
  dueDate: string
  avatars: string[]
  isCompleted?: boolean
}

const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  priority,
  confidence,
  status,
  statusColor,
  dueDate,
  avatars,
  isCompleted = false,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-500"
      case "Medium":
        return "text-orange-500"
      case "Low":
        return "text-purple-400"
      default:
        return "text-gray-500"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-purple-400"
    if (confidence >= 80) return "text-purple-400"
    return "text-purple-400"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-100 ${isCompleted ? "opacity-60" : ""}`}
    >
      {/* Header with priority and confidence */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Flag className={`w-3.5 h-3.5 ${getPriorityColor(priority)}`} />
          <span className={`text-xs font-medium ${getPriorityColor(priority)}`}>{priority}</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className={`w-3.5 h-3.5 ${getConfidenceColor(confidence)}`} />
          <span className={`text-xs ${getConfidenceColor(confidence)}`}>{confidence}% sure</span>
        </div>
      </div>

      {/* Title and description */}
      <div className="mb-3">
        <h3 className={`text-base font-semibold mb-1.5 ${isCompleted ? "text-gray-400" : "text-gray-900"}`}>{title}</h3>
        <p className={`text-xs ${isCompleted ? "text-gray-400" : "text-gray-600"}`}>{description}</p>
      </div>

      {/* Footer with status, due date, and avatars */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>{status}</span>
          <div className="flex items-center gap-1 text-gray-500">
            <input type="checkbox" className="w-3 h-3 rounded border-gray-300" checked={isCompleted} readOnly />
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs">Due {dueDate}</span>
          </div>
        </div>

        {/* Avatar stack */}
        <div className="flex -space-x-1.5">
          {avatars.map((avatar, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="w-6 h-6 rounded-full border-2 border-white overflow-hidden"
            >
              <img
                src={avatar || "/placeholder.svg"}
                alt={`Avatar ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}