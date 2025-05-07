"use client"
import React, { useEffect, useRef } from 'react'
import { gsap } from "gsap"
import OfflineSupport from './cards/offline-support'
import AlwaysConnected from './cards/always-connected'
import MyWorkspaces from './cards/my-workspaces'
import PersonalizedWorkspaces from './cards/personal-workspaces'
import WorkspaceCard from './cards/team-schedule'

export default function FeaturesPage() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return

    const cards = gridRef.current.querySelectorAll(".bento-card")

    gsap.fromTo(
      cards,
      {
        y: 20,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      },
    )

    // Add hover animations
    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          y: -5,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          duration: 0.3,
        })
      })

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          y: 0,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          duration: 0.3,
        })
      })
    })
  }, [])
  return (
    <div className='my-14 py-8 '>
      <div className='border border-gray-200 rounded-xl m-4 bg-neutral-50 '>
        <div className='max-w-7xl mx-auto'>
          {/* heading text  */}
        <div className='my-6 flex flex-col space-y-8 items-center justify-center'>
        <span className="bg-neutral-100 p-2 px-8 my-8 rounded-full border border-neutral-300 shadow-lg shadow-gray-400">
            Features
          </span>
          <div className='flex flex-col items-center space-y-6'>
            <h2 className='text-3xl md:text-4xl lg:text-5xl font-medium'>Keep everything in one place</h2>
            <p className='text-lg text-gray-700'>Forget complex management tools</p>
          </div>
        </div>
        {/* Bento Grid features */}
        <div ref={gridRef} className="grid w-full my-12 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="bento-card lg:col-span-1 rounded-3xl">
        <OfflineSupport />
      </div>
      <div className="bento-card lg:col-span-1 rounded-3xl">
        <AlwaysConnected />
      </div>
      <div className="bento-card lg:col-span-1 rounded-3xl">
        <WorkspaceCard/>
      </div>
      <div className="bento-card lg:col-span-1 lg:row-span-1 rounded-3xl">
        <MyWorkspaces />
      </div>
      <div className="bento-card lg:col-span-2 lg:row-span-1 rounded-3xl">
        <PersonalizedWorkspaces />
      </div>
    </div>
        </div>
      </div>
    </div>
  )
}


