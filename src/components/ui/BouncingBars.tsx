"use client"

import { motion } from "motion/react"

export default function BouncingBarsLoader() {
  const barHeights = [20, 32, 24, 40, 28]

  return (
    <div className="flex items-end space-x-2">
      {barHeights.map((height, i) => (
        <motion.div
          key={i}
          className="w-3 bg-gradient-to-t from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 rounded-t-full"
          style={{ height }}
          animate={{
            scaleY: [1, 1.5, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
