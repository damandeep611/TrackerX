"use client"
import React, { ReactNode } from 'react';
import { Zap, BarChart3, Mail, Users } from 'lucide-react';

export interface CardData {
  id: number;
  title: string;
  description: string;
  accentColor: string;
  icon: ReactNode;
  contentTitle: string;
  contentPlaceholderText: string;
  image: string;
}

export const CARD_OFFSET = 45;
export const SCALE_FACTOR = 0.04;

export const CARDS: CardData[] = [
  {
    id: 1,
    title: "Intelligence",
    accentColor: "#3b82f6", // Blue
    icon: <BarChart3 className="w-4 h-4 text-white" />,
    description: "Deep insights into your sales funnel performance.",
    contentTitle: "Smarter decisions, faster growth",
    contentPlaceholderText: "Leverage AI-driven analytics to uncover hidden opportunities in your pipeline. Our intelligence engine processes millions of data points to give you actionable advice.",
    image: "https://picsum.photos/600/400?random=1"
  },
  {
    id: 2,
    title: "Deliverability Optimization",
    accentColor: "#10b981", // Emerald
    icon: <Zap className="w-4 h-4 text-white" />,
    description: "Ensure your emails land in the inbox, every time.",
    contentTitle: "Maximum inbox placement",
    contentPlaceholderText: "Stop worrying about spam folders. Our automated warm-up protocols and domain health monitoring ensure your messages reach the people who matter most.",
    image: "https://picsum.photos/600/400?random=2"
  },
  {
    id: 3,
    title: "Multichannel Engagement",
    accentColor: "#f59e0b", // Amber
    icon: <Users className="w-4 h-4 text-white" />,
    description: "Connect with prospects wherever they are active.",
    contentTitle: "Reach customers everywhere",
    contentPlaceholderText: "Orchestrate seamless campaigns across Email, LinkedIn, and Twitter. Keep the conversation going with unified inboxes and automated follow-up sequences.",
    image: "https://picsum.photos/600/400?random=3"
  },
  {
    id: 4,
    title: "Lead Generation & Signals",
    accentColor: "#f97316", // Orange
    icon: <Mail className="w-4 h-4 text-white" />,
    description: "Find your ideal customer profile with precision.",
    contentTitle: "Better data, more wins",
    contentPlaceholderText: "Get instant access to our top-quality database. Our data is trusted by industry leaders to reduce bounce rates by 50% and 5x increase in interest rates.",
    image: "https://picsum.photos/600/400?random=4"
  }
];
