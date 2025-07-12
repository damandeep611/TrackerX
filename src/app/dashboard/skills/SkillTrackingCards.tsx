"use client"
import React from 'react'
import SkillAnalyticsCards from "@/components/dashboard/skills/SkillAnalyticsCards";

interface SkillTrackingCardsProps {
  skillCurrentHours: string;
  skillId: string;
}

export default function SkillTrackingCards({
  skillCurrentHours,
  skillId,
}: SkillTrackingCardsProps) {
  return (
    <SkillAnalyticsCards
      skillId={skillId}
      skillCurrentHours={skillCurrentHours}
    />
  );
}
