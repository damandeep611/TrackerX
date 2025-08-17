"use client"
import React from "react";
import { motion } from "framer-motion";

export default function SeparateDashboard() {
  return (
     <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-violet-100 rounded-xl border border-gray-300  p-6  lg:mr-6"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gray-50 rounded-md p-6 border mb-6 py-10 "
        >
          <div className="flex gap-4">
            {/* Sidebar */}
            <div className="flex flex-col gap-3 w-16">
              <div  className="bg-gray-200 rounded h-4 w-full" />
              <div  className="bg-gray-200 rounded h-3 w-full" />
              <div  className="bg-gray-200 rounded h-3 w-full" />
              <div  className="bg-gray-200 rounded h-3 w-full" />
              <div  className="bg-gray-200 rounded h-3 w-full" />
              <div  className="bg-gray-200 rounded h-3 w-full" />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Top Bar */}
              <div className="flex justify-between items-center mb-4 mt-8">
                <div className="bg-gray-200 rounded h-3 w-32" />
                <div className="bg-gray-200 rounded h-3 w-8" />
              </div>

              {/* Content Area */}
              <div className="flex gap-4">
                <div className="flex-1">
                  {/* Chart Header */}
                  <div className="bg-gray-200 rounded h-3 w-24 mb-2" />
                  <div className="bg-gray-200 rounded h-2 w-16 mb-4" />

                  {/* Chart Area - Bar Chart Loading */}
                  <div className="space-y-2 mb-8">
                    <div className="flex items-end gap-1 h-16">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "60%" }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                        className="bg-blue-200 rounded-sm w-3"
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "80%" }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                        className="bg-blue-300 rounded-sm w-3"
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "40%" }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                        className="bg-blue-200 rounded-sm w-3"
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "90%" }}
                        transition={{ delay: 0.7, duration: 0.3 }}
                        className="bg-blue-400 rounded-sm w-3"
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "70%" }}
                        transition={{ delay: 0.8, duration: 0.3 }}
                        className="bg-blue-300 rounded-sm w-3"
                      />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex gap-2">
                    <div className="bg-gray-200 rounded h-2 w-12" />
                    <div className="bg-gray-200 rounded h-2 w-16" />
                    <div className="bg-gray-200 rounded h-2 w-10" />
                  </div>
                </div>

                {/* Right Panel */}
                <div className="w-20 flex flex-col gap-2">
                  <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-200 rounded h-3 w-full" />
                  <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-200 rounded h-2 w-12" />
                  <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-200 rounded h-2 w-10" />

                  {/* Data Cards */}
                  <div className="mt-3 space-y-2">
                    <motion.div whileHover={{ scale: 1.02 }} className="bg-white border rounded p-2">
                      <div className="bg-gray-300 rounded h-2 w-full mb-1" />
                      <div className="bg-gray-200 rounded h-1 w-8" />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} className="bg-white border rounded p-2">
                      <div className="bg-gray-300 rounded h-2 w-full mb-1" />
                      <div className="bg-gray-200 rounded h-1 w-10" />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} className="bg-white border rounded p-2">
                      <div className="bg-gray-300 rounded h-2 w-full mb-1" />
                      <div className="bg-gray-200 rounded h-1 w-6" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 pt-4 p-4"
        >
         <h2 className="text-2xl font-bold text-gray-900 mb-3">Skill Specific Dashboards</h2>
        <p className="text-gray-600 text-base leading-relaxed">
          Automatically reorders your task list based on shifting project urgency and dependencies.
        </p>
        </motion.div>
      </motion.div>
  );
}
