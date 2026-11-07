"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "How does the tracking system work?",
    answer: "We use a combination of manual entry and automated integrations with platforms like GitHub and Figma. Your activity is analyzed to provide velocity metrics."
  },
  {
    question: "Is there a free tier available?",
    answer: "Yes! BuildXskill offers a generous free tier that includes basic tracking, 3 active projects, and community access. Pro plans start at $12/mo."
  },
  {
    question: "Can I collaborate with a team?",
    answer: "Absolutely. Our Team plan allows you to create shared workspaces, assign tasks, and view aggregated team velocity charts."
  },
  {
    question: "Does it integrate with my existing tools?",
    answer: "We currently support linear sync, GitHub pull request tracking, and Notion embed. More integrations are coming soon."
  },
  {
    question: "What makes the AI 'predictive'?",
    answer: "Our AI analyzes your historical completion rates and complexity tags to estimate when you'll likely finish a module or project."
  }
];

export default function FaqSection  () {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-500">Everything you need to know about the platform.</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQItem: React.FC<{ question: string, answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left bg-white"
      >
        <span className="font-bold text-gray-900 text-lg">{question}</span>
        <span className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-gray-500 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};