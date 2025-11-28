"use client"
import React from 'react'
import { motion } from 'framer-motion';

interface FeatureItemProps {
  label: string;
  delay: number;
  children: React.ReactNode;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ label, delay, children }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center gap-4 group cursor-pointer"
    >
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ 
          y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay * 2 },
          scale: { duration: 0.2 },
          rotate: { duration: 0.2 }
        }}
        className="w-16 h-16 flex items-center justify-center text-[#1A1A1A]"
      >
        {children}
      </motion.div>
      <span className="font-sans font-medium text-gray-900 text-sm tracking-wide">{label}</span>
    </motion.div>
  );
};

export default function HeroFoot() {
  return (
    <section className="w-full bg-white pb-32 pt-12 px-6 flex flex-col items-center z-50 relative">
      {/* Heading */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-24 max-w-3xl"
      >
        <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] leading-[1.2] mb-4">
          Learning isn&apos;t just about content,<br />
          it’s about <span className="italic font-serif">mastery</span>.
        </h2>
      </motion.div>

      {/* Doodles Row */}
      <div className="flex flex-wrap justify-center gap-12 md:gap-24 max-w-6xl mx-auto">
        
        {/* Doodle 1: Courses (Book) */}
        <FeatureItem label="Courses" delay={0.1}>
          <svg viewBox="0 0 50 50" className="w-full h-full fill-none stroke-current stroke-[1.5] stroke-linecap-round stroke-linejoin-round">
            <path d="M10,15 Q25,20 40,15" />
            <path d="M10,35 Q25,40 40,35" />
            <path d="M10,15 L10,35" />
            <path d="M40,15 L40,35" />
            <path d="M10,15 Q5,15 5,20 L5,30 Q5,35 10,35" />
            {/* Page lines */}
            <path d="M15,20 Q25,23 35,20" className="opacity-50" />
            <path d="M15,25 Q25,28 35,25" className="opacity-50" />
            <path d="M15,30 Q25,33 35,30" className="opacity-50" />
          </svg>
        </FeatureItem>

        {/* Doodle 2: Assessments (Checkmark Circle) */}
        <FeatureItem label="Assessments" delay={0.2}>
          <svg viewBox="0 0 50 50" className="w-full h-full fill-none stroke-current stroke-[1.5] stroke-linecap-round stroke-linejoin-round">
             {/* Imperfect Circle */}
            <path d="M25,5 C35,5 45,15 45,25 C45,35 35,45 25,45 C15,45 5,35 5,25 C5,15 15,5 25,5 Z" 
                  strokeDasharray="100" strokeDashoffset="0" />
            {/* Checkmark */}
            <path d="M15,25 L22,32 L35,18" strokeWidth="2" />
          </svg>
        </FeatureItem>

        {/* Doodle 3: Schedule (Calendar) */}
        <FeatureItem label="Schedule" delay={0.3}>
          <svg viewBox="0 0 50 50" className="w-full h-full fill-none stroke-current stroke-[1.5] stroke-linecap-round stroke-linejoin-round">
            <rect x="8" y="10" width="34" height="30" rx="2" />
            <path d="M8,18 L42,18" />
            <path d="M15,5 L15,12" />
            <path d="M35,5 L35,12" />
            {/* Dots */}
            <circle cx="15" cy="24" r="1" fill="currentColor" stroke="none" />
            <circle cx="25" cy="24" r="1" fill="currentColor" stroke="none" />
            <circle cx="35" cy="24" r="1" fill="currentColor" stroke="none" />
            <circle cx="15" cy="30" r="1" fill="currentColor" stroke="none" />
            <circle cx="25" cy="30" r="1" fill="currentColor" stroke="none" />
            <circle cx="35" cy="30" r="1" fill="currentColor" stroke="none" />
          </svg>
        </FeatureItem>

        {/* Doodle 4: Collaboration (Loop/Scribble) */}
        <FeatureItem label="Collaboration" delay={0.4}>
          <svg viewBox="0 0 50 50" className="w-full h-full fill-none stroke-current stroke-[1.5] stroke-linecap-round">
            <path d="M10,25 C10,10 25,10 25,25 C25,40 40,40 40,25 C40,15 30,10 25,15 C20,20 20,30 25,35" />
          </svg>
        </FeatureItem>

        {/* Doodle 5: Notes (Pencil) */}
        <FeatureItem label="Study Notes" delay={0.5}>
          <svg viewBox="0 0 50 50" className="w-full h-full fill-none stroke-current stroke-[1.5] stroke-linecap-round stroke-linejoin-round">
            <path d="M35,10 L40,15 L15,40 L10,40 L10,35 Z" />
            <path d="M32,13 L37,18" />
            <path d="M13,37 L18,37" className="opacity-50" />
          </svg>
        </FeatureItem>

      </div>
    </section>
  )
}
