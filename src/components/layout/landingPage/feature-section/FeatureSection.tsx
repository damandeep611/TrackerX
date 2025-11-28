"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { BookmarkMock, FilterMock, FolderMock, SearchMock } from './mock-ui';

interface FeatureCardProps {
  title: string;
  description: string;
  bgColor: string;
  children: React.ReactNode;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, bgColor, children, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-[2.5rem] ${bgColor} p-8 pb-0 flex flex-col h-[500px] group`}
    >
      {/* Text Content */}
      <div className="text-center text-white mb-8 z-10 relative">
        <h3 className="text-2xl font-bold mb-3 tracking-tight">{title}</h3>
        <p className="text-white/90 font-medium leading-snug px-4">{description}</p>
      </div>

      {/* Mock UI Container */}
      <div className="flex-1 w-full relative z-0 flex justify-center items-start pt-2">
        {children}
      </div>
      
      {/* Subtle Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none" />
    </motion.div>
  );
};

const FeatureSection: React.FC = () => {
  return (
    <section className="max-w-[1400px] mx-auto w-full px-4 md:px-6">
      {/* Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto space-y-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]"
        >
          Stay <span className="text-brand-orange">Organized</span>, Manage<br className="hidden md:block" />
          Your <span className="text-brand-orange">Notes</span> with Ease
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          Find, save, and sort everything effortlessly so your notes stay neat, searchable, and always within reach.
        </motion.p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <FeatureCard 
          title="Quick Search" 
          description="Search across all notes instantly." 
          bgColor="bg-[#0096FF]"
          delay={0.2}
        >
          <SearchMock />
        </FeatureCard>

        <FeatureCard 
          title="Easy Bookmarks" 
          description="Save your favorites for easy access." 
          bgColor="bg-[#0096FF]"
          delay={0.3}
        >
          <BookmarkMock />
        </FeatureCard>

        <FeatureCard 
          title="Folders & Tags" 
          description="Organize notes with clear structure." 
          bgColor="bg-[#7470E9]"
          delay={0.4}
        >
          <FolderMock />
        </FeatureCard>

        <FeatureCard 
          title="Filters & Sorting" 
          description="Sort or filter by note type in one tap." 
          bgColor="bg-[#045D46]"
          delay={0.5}
        >
          <FilterMock/>
        </FeatureCard>
      </div>
    </section>
  );
};

export default FeatureSection;