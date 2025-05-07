"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { SiNotion } from "react-icons/si";
import { MdOutlineElectricBolt } from "react-icons/md";
import { FaChrome, FaYoutube } from "react-icons/fa";
import { IoMdTimer } from "react-icons/io";

export default function AlwaysConnected() {
  const cardRef = useRef<HTMLDivElement>(null)
  const circlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current || !circlesRef.current) return

    // Animate the card content
    gsap.fromTo(
      cardRef.current.querySelectorAll(".animate-item"),
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.3 },
    )

    // Animate the circles
    const circles = circlesRef.current.querySelectorAll(".circle")

    // Create rotation animation for icons
    gsap.to(circles, {
      rotation: 360,
      duration: 120,
      repeat: -1,
      ease: "none",
      transformOrigin: "center center",
      stagger: 30,
    })

    // Pulse animation for the center icon
    const centerIcon = circlesRef.current.querySelector(".center-icon")
    gsap.to(centerIcon, {
      scale: 1.1,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    })
  }, [])

  return (
    <div ref={cardRef} className="flex h-full flex-col rounded-3xl bg-[#1E1E1E] p-6">
      <div ref={circlesRef} className="relative mx-auto mb-6 flex h-72 w-72 items-center justify-center">
        {/* Dashed circles */}
        <div className="absolute h-full w-full rounded-full border border-dashed border-gray-600 opacity-50"></div>
        <div className="absolute h-3/4 w-3/4 rounded-full border border-dashed border-gray-600 opacity-50"></div>
        <div className="absolute h-2/4 w-2/4 rounded-full border border-dashed border-gray-600 opacity-50"></div>

        {/* Center icon */}
        <div className="center-icon z-10 rounded-full bg-[#333] p-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
          <MdOutlineElectricBolt size={25} />

          </div>
        </div>

        {/* Notion icon */}
        <div className="circle absolute bottom-4 left-1/2 -translate-x-1/2 transform">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white p-1">
            <SiNotion/>
          </div>
        </div>

        {/* Figma icon */}
        <div className="circle absolute left-4 top-1/2 -translate-y-1/2 transform">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E90FF] p-1">
          <IoMdTimer />

          </div>
        </div>

        {/* Slack icon */}
        <div className="circle absolute right-4 top-1/2 -translate-y-1/2 transform">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E01E5A] p-1">
          <FaYoutube />
          </div>
        </div>

        {/* Google icon */}
        <div className="circle absolute left-1/2 -translate-x-1/2 top-4 transform">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBBC05] p-1">
          <FaChrome />
          </div>
        </div>
      </div>

      <div className="mt-auto animate-item">
        <h2 className="mb-2 text-xl font-bold text-white">Always Connected</h2>
        <p className="text-sm text-gray-400">Always Connected for Seamless</p>
      </div>
    </div>
  )
}

