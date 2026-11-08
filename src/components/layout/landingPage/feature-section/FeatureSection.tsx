"use client"

import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, ListChecks, Terminal, type LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  bgColor: string;
  icon: LucideIcon;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, bgColor, icon: Icon, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-[2.5rem] ${bgColor} p-8 flex flex-col min-h-[320px] group`}
    >
      <div className="flex flex-1 items-center justify-center z-10 relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-12 w-12 text-white" strokeWidth={1.5} />
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center text-white mt-8 z-10 relative">
        <h3 className="text-2xl font-bold mb-3 tracking-tight">{title}</h3>
        <p className="text-white/90 font-medium leading-snug px-4">{description}</p>
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
          Track <span className="text-brand-orange">Hours</span>, Build<br className="hidden md:block" />
          Real <span className="text-brand-orange">Mastery</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          Log focused time against the skills you care about, run deep-work projects, and see exactly where your hours go.
        </motion.p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          title="Skill Tracking" 
          description="Break each skill into tasks and log time on them in one tap." 
          bgColor="bg-[#0096FF]"
          delay={0.2}
          icon={ListChecks}
        />

        <FeatureCard 
          title="Sandboxes" 
          description="Deep-work projects with an hour target, a milestone every 20h, and saved resources." 
          bgColor="bg-[#7470E9]"
          delay={0.4}
          icon={Terminal}
        />

        <FeatureCard 
          title="Analytics" 
          description="Weekly trends and per-skill breakdowns of the time you've put in." 
          bgColor="bg-[#045D46]"
          delay={0.5}
          icon={BarChart3}
        />
      </div>
    </section>
  );
};

export default FeatureSection;