"use client"

import React from 'react'
import { motion } from 'motion/react'

export default function HeroBackground() {
  return (
      <div className="absolute inset-0 overflow-hidden bg-[#A5D4F5] bg-noise select-none">
      {/* Decorative Scribbles/Lines (Top Left) */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-0" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <path d="M-100,500 C200,400 400,600 600,200" stroke="black" strokeWidth="1" fill="none" />
        <circle cx="200" cy="200" r="300" stroke="black" strokeWidth="0.5" fill="none" />
      </svg>

      {/* Doodle 1: Floating Checklist (Productivity) - Top Left */}
      <motion.div
         initial={{ y: -20, opacity: 0, rotate: -5 }}
         animate={{ y: 0, opacity: 0.4, rotate: -8 }}
         transition={{ duration: 1.2, delay: 0.5 }}
         className="absolute top-[15%] left-[8%] w-32 h-40 z-0 pointer-events-none hidden md:block"
      >
         <svg viewBox="0 0 100 120" className="w-full h-full stroke-[#1A1A1A] fill-none" strokeWidth="1.5" strokeLinecap="round">
             {/* Paper Outline */}
             <rect x="10" y="10" width="80" height="100" rx="2" strokeDasharray="4,4" className="stroke-gray-500" />
             {/* Lines */}
             <line x1="25" y1="30" x2="80" y2="30" />
             <line x1="25" y1="50" x2="80" y2="50" />
             <line x1="25" y1="70" x2="60" y2="70" />
             <line x1="25" y1="90" x2="70" y2="90" />
             {/* Checks */}
             <path d="M15,30 L18,33 L22,27" stroke="#16a34a" strokeWidth="2" />
             <path d="M15,50 L18,53 L22,47" stroke="#16a34a" strokeWidth="2" />
             <circle cx="18" cy="70" r="2" fill="gray" stroke="none" />
         </svg>
      </motion.div>

      {/* Layer 1: White "Torn Mountain" Shape (Bottom/Left) */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute bottom-[-10%] left-[-10%] w-[120%] h-[70%] z-10"
      >
        <svg viewBox="0 0 1440 600" className="w-full h-full fill-[#FDFDFD] drop-shadow-2xl" preserveAspectRatio="none">
           {/* Rough jagged path simulating torn paper */}
           <path d="M0,200 
                    L50,190 L100,210 L150,180 L200,220 
                    L250,150 L300,170 L350,120 L400,160
                    L450,100 L500,130 L550,80 L600,120
                    L700,50 L800,100 L900,20 L1000,80
                    L1100,150 L1200,120 L1300,180 L1440,150
                    L1440,600 L0,600 Z" />
        </svg>
      </motion.div>

      {/* Doodle 2: Upward Growth Graph (Growth) - On top of White Mountain */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-[5%] md:bottom-[15%] left-[-2%] md:left-[10%] w-64 h-48 z-[11] pointer-events-none opacity-60 mix-blend-multiply"
      >
         <svg viewBox="0 0 200 150" className="w-full h-full fill-none" strokeLinecap="round">
            {/* Hand-drawn Axes */}
            <path d="M20,130 L20,20" stroke="black" strokeWidth="1.5" />
            <path d="M20,130 L180,130" stroke="black" strokeWidth="1.5" />
            {/* Growth Line */}
            <motion.path 
              d="M20,130 Q60,120 80,90 T130,50 T180,20" 
              stroke="#dc2626" 
              strokeWidth="2.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }}
            />
            {/* Arrow Head */}
            <motion.path 
               d="M170,25 L180,20 L175,30" 
               stroke="#dc2626" 
               strokeWidth="2.5"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 2.8 }}
            />
            <text x="30" y="145" fontSize="10" fontFamily="sans-serif" fill="gray">Q1</text>
            <text x="80" y="145" fontSize="10" fontFamily="sans-serif" fill="gray">Q2</text>
            <text x="130" y="145" fontSize="10" fontFamily="sans-serif" fill="gray">Q3</text>
         </svg>
      </motion.div>

      {/* Layer 2: Yellow Lined Paper (Right side) */}
      <motion.div 
        initial={{ x: 100, rotate: 5, opacity: 0 }}
        animate={{ x: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
        className="absolute top-[30%] right-[-10%] w-[50%] h-[80%] bg-[#FCF4B6] z-20 shadow-xl transform origin-bottom-right"
        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%, 5% 50%)' }}
      >
        {/* Lined paper texture lines */}
        <div className="w-full h-full opacity-20" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 40px' }}></div>
        
        {/* Torn edge overlay for the left side of yellow paper */}
        <div className="absolute top-0 bottom-0 left-0 w-8 bg-[#FCF4B6]" style={{ filter: 'url(#rough-edge)' }}></div>
      </motion.div>

      {/* Doodle 3: Lightbulb Idea (Learning) - Top Right near/on Yellow Paper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
        animate={{ opacity: 1, scale: 1, rotate: -10 }}
        transition={{ duration: 1, delay: 1.5, type: "spring" }}
        className="absolute top-[25%] right-[5%] md:right-[15%] w-32 h-32 z-[25] pointer-events-none"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none" strokeLinecap="round" strokeLinejoin="round">
            {/* Bulb Glow Background */}
            <circle cx="50" cy="40" r="25" className="fill-yellow-200/50 stroke-none blur-xl animate-pulse" />
            
            {/* Bulb Strokes */}
            <path d="M30,40 C30,20 40,10 50,10 C60,10 70,20 70,40 C70,55 60,60 60,70 L40,70 C40,60 30,55 30,40 Z" stroke="#eab308" strokeWidth="2" fill="rgba(255,255,0,0.1)" />
            {/* Filament */}
            <path d="M42,40 L45,30 L50,45 L55,30 L58,40" stroke="#eab308" strokeWidth="1.5" />
            {/* Base */}
            <path d="M40,70 L40,76 C40,79 60,79 60,76 L60,70" stroke="black" strokeWidth="2" fill="#333" />
            <path d="M40,74 L60,74" stroke="gray" strokeWidth="1" />
            {/* Rays */}
            <g stroke="#eab308" strokeWidth="2">
                <path d="M50,5 L50,0" />
                <path d="M80,20 L84,16" />
                <path d="M90,40 L95,40" />
                <path d="M80,60 L84,64" />
                <path d="M20,20 L16,16" />
                <path d="M10,40 L5,40" />
                <path d="M20,60 L16,64" />
            </g>
        </svg>
      </motion.div>

      {/* Layer 3: Abstract Ink Blot (Right/Middle behind yellow) */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute top-[40%] right-[20%] w-64 h-64 bg-[#1A1A1A] z-[15] rounded-full blur-sm opacity-90 mix-blend-multiply"
        style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
      />
      
      {/* Layer 4: Floating cloud/texture (Left Middle) */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] left-[5%] w-64 h-48 bg-white/40 blur-3xl rounded-full z-0"
      />
    </div>
  )
}
