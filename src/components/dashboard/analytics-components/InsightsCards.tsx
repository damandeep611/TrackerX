"use client"
import { motion } from 'framer-motion'
import React from "react";
import WeeklyProgressChart from "./WeeklyProgressChart";
import WeeklyRhythm from "./WeeklyRhythm";

export default function InsightsCards() {
  return (
    <div className="grid grid-cols-1  lg:grid-cols-5 p-2 gap-4">
      {/* last 7 weeks performance comparision */}
      <motion.div
        className="lg:col-span-3 "
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <WeeklyProgressChart />
      </motion.div>

      {/* Consistency Tracker per day of the week*/}
      <motion.div
        className="lg:col-span-2  "
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <WeeklyRhythm />
      </motion.div>
    </div>
  );
}
