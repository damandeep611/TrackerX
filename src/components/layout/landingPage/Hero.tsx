"use client"

import React from 'react'
import Navbar from './Navbar'
import HeroBackground from './HeroBackground'
import { motion } from 'motion/react'

export default function Hero() {
  return (
   <div className="relative min-h-screen w-full bg-paper-blue overflow-hidden flex flex-col items-center">
      <Navbar />
      <HeroBackground/>

      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 pt-32 pb-12 flex flex-col items-center text-center">
        
        {/* Headline Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-10 max-w-3xl"
        >
          <h1 className="font-serif text-5xl md:text-7xl text-gray-900 leading-[1.1] mb-6 tracking-tight">
            Your hub for growth, <br />
            <span className="italic">skills</span>, and big ideas
          </h1>
          <p className="text-lg text-gray-700 max-w-xl mx-auto mb-8 font-light">
             The all-in-one learning platform designed to organize your educational journey, track progress, and master new concepts beautifully.
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all border border-gray-100"
          >
            Start Learning Free
          </motion.button>
        </motion.div>
      </div>
      
      {/* Bottom fade to blend with next section if existed */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-40 pointer-events-none"></div>
    </div>
  )
}
