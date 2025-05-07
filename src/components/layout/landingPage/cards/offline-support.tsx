"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ArrowDownIcon, Calendar, RecycleIcon } from "lucide-react"

export default function OfflineSupport() {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    tl.fromTo(
      cardRef.current.querySelectorAll(".animate-item"),
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.2 },
    )
  }, [])

  return (
    <div ref={cardRef} className="flex h-full flex-col rounded-3xl bg-[#1E1E1E] p-6">
      <div className="mb-4 flex items-center justify-between animate-item">
        <div className="flex space-x-3">
          <button className="rounded-md px-3 py-1 text-sm text-gray-300 hover:bg-gray-700">
            Cancel <span className="ml-1 text-xs text-gray-500">Esc</span>
          </button>
          <button className="rounded-md px-3 py-1 text-sm text-gray-300 hover:bg-gray-700">
            Save <span className="ml-1 text-xs">⌘S</span>
          </button>
        </div>
        <button className="text-gray-400 hover:text-gray-300">•••</button>
      </div>

      <div className="mb-4 animate-item">
        <div className="flex items-center space-x-2">
          <div className="flex-1 rounded-md bg-[#2A2A2A] px-3 py-2 text-sm text-white">Study Component Strucutures</div>
          <button className="rounded-md bg-[#2A2A2A] p-2 text-gray-400">
            <Calendar/>
          </button>
          <button className="rounded-md bg-[#2A2A2A] p-2 text-gray-400">
            <ArrowDownIcon/>
          </button>
        </div>
      </div>

      <div className="mb-4 flex space-x-2 animate-item">
        <div className="rounded-md bg-[#2A2A2A] px-3 py-2 text-sm text-white">Mon 08 Oct</div>
        <div className="rounded-md bg-[#2A2A2A] px-3 py-2 text-sm text-white">20:30</div>
        <div className="rounded-md bg-[#2A2A2A] px-3 py-2 text-sm text-white">23:00</div>
      </div>

      <div className="mb-auto flex space-x-2 animate-item">
        <div className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm text-gray-400">
          <RecycleIcon/>
          <span>Recurrent meeting</span>
        </div>
       
      </div>

      <div className="mt-4 animate-item">
        <h2 className="mb-2 text-xl font-bold text-white">Bookmark Resources</h2>
        <p className="text-sm text-gray-400">add links or other resources to keep track of your progress</p>
      </div>
    </div>
  )
}



