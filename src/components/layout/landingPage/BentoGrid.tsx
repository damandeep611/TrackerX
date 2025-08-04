"use client"

import type React from "react"
import { motion } from "framer-motion"
import AutomationCard from "./cards/AutomationCard"
import { PlayIcon } from "lucide-react"



interface TeamMember {
  id: number
  avatar: string
  name: string
}

export default function BentoGrid() {

  

  const teamMembers: TeamMember[] = [
    { id: 1, avatar: "/placeholder.svg?height=32&width=32", name: "John" },
    { id: 2, avatar: "/placeholder.svg?height=32&width=32", name: "Sarah" },
    { id: 3, avatar: "/placeholder.svg?height=32&width=32", name: "Mike" },
    { id: 4, avatar: "/placeholder.svg?height=32&width=32", name: "Lisa" },
    { id: 5, avatar: "/placeholder.svg?height=32&width=32", name: "+6" },
  ]

  const calendarDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const calendarDates = [11, 12, 13, 14, 15, 16, 17]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className=" bg-gray-50 p-6">
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-10 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Column - 70% width (7 out of 10 columns) */}
        <div className="col-span-7 space-y-6">
          {/* Top Section - 2 column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Tracker - Left */}
            <motion.div
              className="bg-gradient-to-br from-sky-200 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-xl font-semibold">Time Tracker</h3>
                <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">⋯</span>
                </button>
              </div>

              <div className="text-center mb-8">
                <motion.div
                  className="text-6xl font-light mb-6"
                >
                  04:21:24


                </motion.div>

                <div className="flex justify-center space-x-4">
                 <PlayIcon/>
                 
                </div>
              </div>
            </motion.div>

            {/* Task Status and Statistics - Right */}
            <div className="space-y-6">
              {/* Task Status List */}
             <AutomationCard/>
            </div>
          </div>

          {/* Bottom Section - Single Full Width Card */}
          <motion.div className="bg-white rounded-2xl p-6 shadow-sm" variants={itemVariants} whileHover={{ y: -2 }}>
            <div className="grid grid-cols-2 gap-8">
              {/* Refine & Improve - Left */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Refine & Improve</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Keep evolving and delivering the best results on time.
                </p>
                <motion.button
                  className="text-orange-500 font-medium flex items-center hover:text-orange-600"
                  whileHover={{ x: 5 }}
                >
                  Learn More
                  <span className="ml-2">→</span>
                </motion.button>
              </div>

              {/* Employee Update Task - Right */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">May 28, 2024</span>
                </div>

                <h4 className="font-semibold text-gray-900 mb-3">Update Employee Hand...</h4>
                <p className="text-gray-600 text-sm mb-4">Revise the employee handbook to include re...</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">📎 8</span>
                    <span className="text-sm text-gray-500">👍 15+</span>
                  </div>

                  <div className="flex -space-x-2">
                    {teamMembers.slice(0, 4).map((member, index) => (
                      <motion.img
                        key={member.id}
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full border-2 border-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      />
                    ))}
                    <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                      +6
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - 30% width (3 out of 10 columns) */}
        <div className="col-span-3 space-y-6">
          {/* Progress Tracker */}
          <motion.div className="bg-white rounded-2xl p-6 shadow-sm   " variants={itemVariants} whileHover={{ y: -2 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">📅 Wed, 14 Jan 2022</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">75%</span>
            </div>

            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-orange-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                ></motion.div>
              </div>
            </div>

            <div className="flex -space-x-2 mb-6">
              {teamMembers.slice(0, 4).map((member, index) => (
                <motion.img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full border-2 border-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                />
              ))}
              <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                +6
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracker</h3>
            <p className="text-gray-600 text-sm">Collaborate with your team to achieve milestones efficiently.</p>
          </motion.div>

          {/* Calendar */}
          <motion.div className="bg-white rounded-2xl p-6 shadow-sm" variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Calendar</p>
                <h3 className="text-xl font-semibold text-gray-900">January, 2024</h3>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ←
                </motion.button>
                <motion.button
                  className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  →
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-6">
              {calendarDays.map((day) => (
                <div key={day} className="text-center text-xs text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {calendarDates.map((date, index) => (
                <motion.div
                  key={date}
                  className={`text-center py-2 text-sm font-medium cursor-pointer rounded-lg ${
                    date === 15
                      ? "bg-orange-500 text-white"
                      : date === 14
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {date}
                </motion.div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Calendar View</h4>
              <p className="text-gray-600 text-sm">
                Plan your days with an intuitive calendar. Highlight important deadlines and never miss a task.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}


