"use client"
import React, { useState } from 'react';
import { CARDS, CARD_OFFSET, CardData, SCALE_FACTOR } from './constants';
import { StackedCard } from './StackedCards';
import { HandwrittenArrow } from './handwritten';


export default function ShowcaseCards() {
  // State to manage the visual order of cards.
  // The last element in this array is visually at the front (bottom of stack).
  const [cards, setCards] = useState<CardData[]>(CARDS);

  const moveCardToFront = (id: number) => {
    setCards((prevCards) => {
      const index = prevCards.findIndex((c) => c.id === id);
      // If it's already at the end (front), do nothing
      if (index === prevCards.length - 1) return prevCards;

      const newCards = [...prevCards];
      const [movedCard] = newCards.splice(index, 1);
      newCards.push(movedCard);
      return newCards;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 flex flex-col items-center py-20 px-4 sm:px-6">
      
      {/* Header Section */}
      <header className="max-w-3xl mx-auto text-center mb-24 space-y-6">
        <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-gray-900">
          All-in-one platform to <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
            level up your sales process
          </span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Give your team the power to sell smarter and faster from day one
          with our integrated suite of tools.
        </p>
      </header>

      {/* Stacked Cards Container */}
      {/* The height needs to account for the stack offset + card height */}
      <div 
        className="relative w-full max-w-5xl mx-auto"
        style={{
          height: 500 + (CARDS.length * CARD_OFFSET) // Base height + offsets
        }}
      >
        <HandwrittenArrow />
        
        {/* Render Cards */}
        {cards.map((card, index) => (
          <StackedCard
            key={card.id}
            data={card}
            index={index}
            totalCards={CARDS.length}
            moveCardToFront={moveCardToFront}
            offset={CARD_OFFSET}
            scaleFactor={SCALE_FACTOR}
          />
        ))}
      </div>
      
      {/* Footer / Context */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-400 font-medium tracking-wider uppercase">
          Trusted by over 10,000 growth teams
        </p>
      </div>
    </div>
  );
};
