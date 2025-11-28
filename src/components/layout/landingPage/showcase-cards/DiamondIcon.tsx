"use client"
import React from 'react';

interface DiamondIconProps {
  color: string;
}

export const DiamondIcon: React.FC<DiamondIconProps> = ({ color }) => {
  return (
    <div 
      className="w-3 h-3 rotate-45 flex-shrink-0" 
      style={{ backgroundColor: color }}
    />
  );
};
