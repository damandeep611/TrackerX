"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { PlusIcon } from "lucide-react"

export default function MyWorkspaces() {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return

    // Animate the card content
    gsap.fromTo(
      cardRef.current.querySelectorAll(".animate-item"),
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.5 },
    )

    // Animate the workspace cards
    const cards = cardRef.current.querySelectorAll(".workspace-card")

    gsap.set(cards, {
      rotateY: -10,
      rotateX: 5,
      transformOrigin: "center center",
    })

    // Create hover effect for workspace cards
    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          scale: 1.05,
          zIndex: 10,
          duration: 0.3,
        })
      })

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotateY: -10,
          rotateX: 5,
          scale: 1,
          zIndex: 1,
          duration: 0.3,
        })
      })
    })
  }, [])

  return (
    <div ref={cardRef} className="flex h-full flex-col rounded-3xl bg-white p-6">
      <div className="relative mb-4 h-52 lg:h-72 animate-item">
        <div className="workspace-card absolute left-4 top-4 z-[1] w-48 rounded-xl bg-[#222] p-4 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Data tracking</h3>
            <button className="flex h-6 w-6 items-center justify-center rounded-full bg-[#333] text-white">
              <PlusIcon />
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-orange-500">🔥</span>
              <span className="text-sm text-white">Branding and Identity</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">🎨</span>
              <span className="text-sm text-white">Marketing and Business</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✨</span>
              <span className="text-sm text-white">Product Landing</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-500">🎯</span>
              <span className="text-sm text-white">UX Writing</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">🎭</span>
              <span className="text-sm text-white">UI Designer</span>
            </div>
          </div>
        </div>

        <div className="workspace-card absolute left-20 top-16 z-[2] w-56 rounded-xl bg-[#222] p-4 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Marketing Team</h3>
            <button className="flex h-6 w-6 items-center justify-center rounded-full bg-[#333] text-white">
              <PlusIcon />
            </button>
          </div>
          <div className="mb-2 rounded-md bg-[#333] px-2 py-1 text-xs text-white">
            <span>Members: 4</span>
          </div>
          <div className="mb-4 flex items-center">
            <div className="relative mr-2">
              <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-300">
                <div className="flex h-full w-full items-center justify-center bg-purple-500 text-white">A</div>
              </div>
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
            </div>
            <div className="relative mr-2">
              <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-300">
                <div className="flex h-full w-full items-center justify-center bg-blue-500 text-white">S</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white">Invite Members</div>
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 overflow-hidden rounded-full bg-gray-300">
                <div className="flex h-full w-full items-center justify-center bg-red-500 text-xs text-white">A</div>
              </div>
              <span className="text-xs text-white">Alexander pati</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 overflow-hidden rounded-full bg-gray-300">
                <div className="flex h-full w-full items-center justify-center bg-pink-500 text-xs text-white">S</div>
              </div>
              <span className="text-xs text-white">Serlina Olivia</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto animate-item">
        <h2 className="mb-2 text-xl font-bold text-gray-900">Sorting pattern</h2>
        <p className="text-sm text-gray-600">Filter and Sort by days and weeks</p>
      </div>
    </div>
  )
}


