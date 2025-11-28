"use client"

import React from 'react'
import Navbar from './Navbar'
import HeroBackground from './HeroBackground'
import { motion } from 'framer-motion'
import AppMockup from './app-mockup'

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

        {/* Mockup Container */}
        <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 50 }}
            className="w-full max-w-[1100px] h-[600px] md:h-[700px] relative perspective-1000"
        >
            {/* The Mockup Itself */}
            <div className="w-full h-full rounded-2xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] bg-white relative z-20 border-[6px] border-white/50 overflow-hidden backdrop-blur-sm">
                <AppMockup />
            </div>

            {/* Decorative Elements around Mockup */}
            {/* Left sticky note */}
            <motion.div 
                initial={{ opacity: 0, x: -50, rotate: -10 }}
                animate={{ opacity: 1, x: 0, rotate: -6 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute -left-4 md:-left-12 top-20 w-32 h-32 bg-[#FFD5D5] shadow-lg z-30 p-4 font-handwriting transform rotate-[-6deg]"
                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 90%, 90% 100%, 0% 100%)' }}
            >
                <div className="w-full h-full flex items-center justify-center text-center font-serif italic text-red-800 text-sm">
                    Don&apos;t forget the React assignment!&apos;
                </div>
            </motion.div>

            {/* Right floating element */}
            <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 md:-right-20 top-40 z-10 hidden md:block"
            >
                <div className="w-24 h-24 rounded-full bg-blue-500/20 backdrop-blur-md border border-white/30"></div>
            </motion.div>
        </motion.div>

      </div>
      
      {/* Bottom fade to blend with next section if existed */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-40 pointer-events-none"></div>
    </div>
  )
}
