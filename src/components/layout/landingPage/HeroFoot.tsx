"use client"
import React from 'react'
import { motion } from 'framer-motion';
import { Calendar, ChartPie, TimerIcon } from "lucide-react";

interface FeatureItemProps {
  label: string;
  delay: number;
  children: React.ReactNode;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  label,
  delay,
  children,
}) => {
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
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay * 2,
          },
          scale: { duration: 0.2 },
          rotate: { duration: 0.2 },
        }}
        className="w-16 h-16 flex items-center justify-center text-[#1A1A1A]"
      >
        {children}
      </motion.div>
      <span className="font-sans font-medium text-gray-900 text-sm tracking-wide">
        {label}
      </span>
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
          Learning isn&apos;t just about content,
          <br />
          it’s about <span className="italic font-serif">mastery</span>.
        </h2>
      </motion.div>

      {/* Doodles Row */}
      <div className="flex flex-wrap justify-center gap-12 md:gap-24 max-w-6xl mx-auto">
        {/* Doodle 1 */}
        <FeatureItem label="Time Tracking" delay={0.1}>
          <TimerIcon strokeWidth={1} size={60} />
        </FeatureItem>

        {/* Doodle 2 */}
        <FeatureItem label="Analytics" delay={0.2}>
          <ChartPie strokeWidth={1} size={60} />
        </FeatureItem>

        {/* Doodle 3 */}
        <FeatureItem label="Schedule" delay={0.3}>
          <Calendar strokeWidth={1} size={60} />
        </FeatureItem>

        {/* Doodle 4 */}
        <FeatureItem label="Collaboration" delay={0.4}>
          <svg
            viewBox="0 0 50 50"
            className="w-full h-full fill-none stroke-current stroke-[1.5] stroke-linecap-round"
          >
            <path d="M10,25 C10,10 25,10 25,25 C25,40 40,40 40,25 C40,15 30,10 25,15 C20,20 20,30 25,35" />
          </svg>
        </FeatureItem>

        {/* Doodle 5 */}
        <FeatureItem label="Study Notes" delay={0.5}>
          <svg
            viewBox="0 0 50 50"
            className="w-full h-full fill-none stroke-current stroke-[1.5] stroke-linecap-round stroke-linejoin-round"
          >
            <path d="M35,10 L40,15 L15,40 L10,40 L10,35 Z" />
            <path d="M32,13 L37,18" />
            <path d="M13,37 L18,37" className="opacity-50" />
          </svg>
        </FeatureItem>
      </div>
    </section>
  );
}
