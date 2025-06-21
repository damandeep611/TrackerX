import React from 'react'
import { motion } from 'framer-motion'

export default function HeaderLogo() {
  return (
  <motion.div
      className="relative w-8 h-8 rounded-md bg-gradient-to-r from-blue-600 to-purple-600"
      whileHover={{ scale: 1.05 }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -bottom-1 -right-1 w-4 h-4"
        initial={{ opacity: 0, x: 4, y: 4 }}
        whileHover={{ opacity: 1, x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        viewBox="0 0 24 24"
        fill="white"
        stroke="black"
        strokeWidth="1"
      >
        {/* Glove hand icon - cartoonish style */}
        <path d="M7 12V7.5a1.5 1.5 0 1 1 3 0V11h1V6.5a1.5 1.5 0 1 1 3 0V11h1V8a1.5 1.5 0 1 1 3 0v8c0 1.5-1 3-3 3H10a3 3 0 0 1-3-3v-1z" />
      </motion.svg>
    </motion.div>

  )
}
