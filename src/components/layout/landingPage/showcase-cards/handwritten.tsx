"use client"
import React from 'react';
import { motion } from 'framer-motion';

export const HandwrittenArrow = () => {
  return (
    <div className="absolute -top-16 -right-12 md:-right-24 z-50 pointer-events-none hidden md:block">
      <div className="relative">
        <span className="handwritten text-2xl text-gray-600 absolute -top-8 left-4 -rotate-12">
          click me!
        </span>
        <svg
          width="100"
          height="80"
          viewBox="0 0 100 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-500"
        >
          <motion.path
            d="M80 10 C 60 40, 90 60, 20 75"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M20 75 L 30 65 M 20 75 L 32 78"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.8, ease: "easeOut" }}
          />
        </svg>
      </div>
    </div>
  );
};
