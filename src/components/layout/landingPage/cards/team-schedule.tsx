"use client"

import {  useState } from "react"
import { motion } from "framer-motion"



export default function WorkspaceCard() {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  }

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const placeholderVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.div
      className="relative w-full max-w-md aspect-[4/5] bg-gray-50 rounded-3xl p-6 border-2 border-dashed border-gray-300"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative h-1/2 mb-6">
        <ThemeCard />
        <TimerCard />
        <TasksCard />
      </div>

      <motion.h2 className="text-center text-2xl font-bold text-gray-800 mb-8" variants={titleVariants}>
        Customizable
        <br />
        Workspaces
      </motion.h2>

      <div className="grid grid-cols-3 gap-3 h-1/4">
        <motion.div className="bg-white rounded-xl shadow-sm" variants={placeholderVariants}></motion.div>
        <motion.div className="bg-white rounded-xl shadow-sm col-span-2" variants={placeholderVariants}></motion.div>
        <motion.div className="bg-white rounded-xl shadow-sm col-span-2" variants={placeholderVariants}></motion.div>
        <motion.div className="bg-white rounded-xl shadow-sm" variants={placeholderVariants}></motion.div>
      </div>
    </motion.div>
  )
}



const  TasksCard =()=> {
  

  return (
    <motion.div
      className="absolute right-4 top-8 w-40 h-32 bg-white rounded-xl shadow-md p-3 z-10 transform rotate-6"
      initial={{ opacity: 0, x: 40, rotate: 5 }}
      animate={{ opacity: 1, x: 0, rotate: 6 }}
      transition={{
        duration: 0.8,
        delay: 0.6,
        type: "spring",
        stiffness: 100,
      }}
    >
      <h3 className="font-medium text-gray-800 mb-2">Tasks View</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-100 rounded-md p-1.5 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        <div className="bg-gray-100 rounded-md p-1.5 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <div className="bg-gray-100 rounded-md p-1.5 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="bg-gray-100 rounded-md p-1.5 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}



const ThemeCard =()=> {
 

  return (
    <motion.div
      className="absolute left-4 top-8 w-40 h-32 bg-white rounded-xl shadow-md p-3 z-10 transform -rotate-6"
      initial={{ opacity: 0, x: -40, rotate: -5 }}
      animate={{ opacity: 1, x: 0, rotate: -6 }}
      transition={{
        duration: 0.8,
        delay: 0.2,
        type: "spring",
        stiffness: 100,
      }}
    >
      <h3 className="font-medium text-gray-800 mb-2">Themes</h3>
      <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-gray-200"></div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}


const TimerCard =()=> {
  const [isPaused, setIsPaused] = useState(true)

  

  return (
    <motion.div
      className="absolute left-1/2 top-4 -translate-x-1/2 w-36 h-36 bg-yellow-300 rounded-xl shadow-md p-3 z-20"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: 0.4,
        type: "spring",
        stiffness: 100,
      }}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-4xl font-bold text-gray-800 mb-4">04:21</div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
          >
            {isPaused ? (
              <div className="w-3 h-3 border-l-2 border-r-2 border-gray-800"></div>
            ) : (
              <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-gray-800 ml-0.5"></div>
            )}
          </button>
          <button className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

