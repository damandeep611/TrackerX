"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { DiamondIcon } from './DiamondIcon';
import { Search } from 'lucide-react';
import { CardData } from './constants';

interface StackedCardProps {
  data: CardData;
  index: number;
  totalCards: number;
  moveCardToFront: (id: number) => void;
  offset: number;
  scaleFactor: number;
}

export const StackedCard: React.FC<StackedCardProps> = ({
  data,
  index,
  totalCards,
  moveCardToFront,
  offset,
  scaleFactor
}) => {
  // Logic: 
  // The last item in the array is the "active" (frontmost) card.
  // We reverse the index logic for visual stacking so the last item is 0 offset (top/front).
  // Actually, based on the design, it's a vertical stack descending.
  
  const isFront = index === totalCards - 1;
  
  // Calculate vertical position: each card is shifted down by 'offset' relative to the one behind it
  const topOffset = index * offset;
  
  // Calculate scale: cards further back (lower index) are smaller
  // Front card (max index) is scale 1.
  const scale = 1 - (totalCards - 1 - index) * scaleFactor;
  
  // Calculate brightness/opacity overlay for depth
  const brightness = 100 - (totalCards - 1 - index) * 5; // Slight dimming for back cards

  return (
    <motion.div
      layout
      style={{
        zIndex: index,
        originX: 0.5,
        originY: 0, // Scale from top
      }}
      animate={{
        top: topOffset,
        scale: scale,
        filter: `brightness(${brightness}%)`,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      className="absolute w-full left-0 right-0"
    >
      <div
        onClick={() => moveCardToFront(data.id)}
        className={`
          relative w-full bg-white rounded-3xl border border-gray-100 shadow-xl
          overflow-hidden cursor-pointer transition-shadow duration-300
          ${isFront ? 'shadow-2xl shadow-blue-900/5' : 'hover:shadow-lg'}
        `}
        style={{
          // Use a fixed height for the card container to ensure uniformity
          height: '500px', 
        }}
      >
        {/* Card Header (Always Visible Tab) */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 bg-white/50 backdrop-blur-sm">
          <DiamondIcon color={data.accentColor} />
          <span className="font-medium text-gray-600 text-sm tracking-wide">
            {data.title}
          </span>
        </div>

        {/* Card Body - Content only fully interactive/visible when at front, 
            but we render it always to maintain shape. We can fade it out if back.
        */}
        <div 
          className={`
            grid grid-cols-1 md:grid-cols-2 gap-8 p-8 h-full transition-opacity duration-500
            ${isFront ? 'opacity-100 delay-100' : 'opacity-40 pointer-events-none'}
          `}
        >
          {/* Left Column: Text */}
          <div className="flex flex-col justify-start pt-4 space-y-6">
            <h2 className="text-4xl font-serif text-gray-900 leading-tight tracking-tight">
              {data.contentTitle}
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed font-light">
              {data.contentPlaceholderText}
            </p>
            
            {/* Fake Search Bar for "Lead Gen" card specific visual, or just generic action */}
            {data.id === 4 ? (
              <div className="mt-8 bg-gray-50 rounded-lg p-4 flex items-center gap-3 border border-gray-100">
                <Search className="w-5 h-5 text-gray-400" />
                <div className="h-4 w-px bg-gray-300 mx-2"></div>
                <p className="text-gray-500 text-sm font-medium truncate">
                  CEOs of startups that have doubled headcount...
                </p>
              </div>
            ) : (
              <div className="mt-auto">
                 <button className="text-sm font-semibold text-gray-900 border-b border-gray-900 pb-0.5 hover:text-blue-600 hover:border-blue-600 transition-colors">
                  Learn more
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Visual */}
          <div className="relative h-[300px] md:h-auto w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner group">
             {/* Simulated UI Content */}
             <img 
               src={data.image} 
               alt="Feature preview" 
               className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent mix-blend-multiply" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
