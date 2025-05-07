"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export default function PersonalizedWorkspaces() {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return

    // Animate the card content
    gsap.fromTo(
      cardRef.current.querySelectorAll(".animate-item"),
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.6 },
    )

    // Animate the timer
    const timerEl = cardRef.current.querySelector(".timer")
    if (timerEl) {
      gsap.to(timerEl, {
        scale: 1.05,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }

    // Animate the grid lines
    const gridLines = cardRef.current.querySelectorAll(".grid-line")
    gsap.fromTo(
      gridLines,
      { opacity: 0 },
      {
        opacity: 0.2,
        duration: 1.5,
        stagger: 0.1,
        ease: "power2.inOut",
      },
    )
  }, [])

  return (
    <div ref={cardRef} className="flex h-full flex-col rounded-3xl bg-[#1E1E1E] p-6">
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="animate-item">
          <h3 className="mb-4 text-center text-sm font-medium text-white">Tasks</h3>
          <div className="space-y-3 rounded-lg bg-[#2A2A2A] p-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-600 bg-gray-700" />
              <span className="text-xs text-gray-300">IOS-222 - Selector Fix</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-600 bg-gray-700" />
              <span className="text-xs text-gray-300">Discord auth</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-600 bg-gray-700" />
              <span className="text-xs text-gray-300">Discord auth</span>
            </div>
          </div>
        </div>

        <div className="animate-item">
          <h3 className="mb-4 text-center text-sm font-medium text-white">Widgets</h3>
          <div className="timer rounded-lg bg-yellow-400 p-4">
            <div className="mb-2 text-center text-3xl font-bold text-yellow-900">05:40</div>
            <div className="flex justify-center space-x-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-yellow-900">
                <PlayIcon />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-yellow-900">
                <PauseIcon />
              </button>
            </div>
            <div className="mt-2 flex justify-end">
              <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
              <div className="ml-1 h-4 w-4 rounded-full bg-yellow-500"></div>
            </div>
          </div>
        </div>

        <div className="animate-item">
          <h3 className="mb-4 text-center text-sm font-medium text-white">Tasks View</h3>
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#2A2A2A] p-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-md bg-[#333] text-gray-400 hover:bg-[#444] hover:text-white">
              <DocumentIcon />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-md bg-[#333] text-gray-400 hover:bg-[#444] hover:text-white">
              <ShareIcon />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-md bg-[#333] text-gray-400 hover:bg-[#444] hover:text-white">
              <CalendarIcon />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-md bg-[#333] text-gray-400 hover:bg-[#444] hover:text-white">
              <ClipboardIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-auto flex-1 animate-item">
        {/* Grid lines */}
        <div className="grid-line absolute left-0 top-0 h-full w-px bg-gray-600 opacity-20"></div>
        <div className="grid-line absolute left-1/4 top-0 h-full w-px bg-gray-600 opacity-20"></div>
        <div className="grid-line absolute left-1/2 top-0 h-full w-px bg-gray-600 opacity-20"></div>
        <div className="grid-line absolute left-3/4 top-0 h-full w-px bg-gray-600 opacity-20"></div>
        <div className="grid-line absolute right-0 top-0 h-full w-px bg-gray-600 opacity-20"></div>

        <div className="grid-line absolute left-0 top-0 h-px w-full bg-gray-600 opacity-20"></div>
        <div className="grid-line absolute left-0 top-1/4 h-px w-full bg-gray-600 opacity-20"></div>
        <div className="grid-line absolute left-0 top-1/2 h-px w-full bg-gray-600 opacity-20"></div>
        <div className="grid-line absolute left-0 top-3/4 h-px w-full bg-gray-600 opacity-20"></div>
        <div className="grid-line absolute bottom-0 left-0 h-px w-full bg-gray-600 opacity-20"></div>

        <div className="absolute left-6 top-6">
          <h2 className="mb-2 text-xl font-bold text-white">Data Visulization</h2>
          <p className="text-sm text-gray-400">Overview of time spend by days and resources added </p>
        </div>
      </div>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
      <polyline points="16 6 12 2 8 6"></polyline>
      <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
  )
}
