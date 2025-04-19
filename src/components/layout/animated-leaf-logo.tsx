"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export default function AnimatedLeafLogo() {
  const logoRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!logoRef.current) return

    const leaves = logoRef.current.querySelectorAll(".leaf")

    // Set initial positions
    gsap.set(leaves, {
      transformOrigin: "center bottom",
      rotation: (i) => i * 10 - 10, // Slightly different angles
    })

    // Create the main animation timeline
    const tl = gsap.timeline({ repeat: -1, yoyo: true })

    // Animate each leaf
    leaves.forEach((leaf, i) => {
      tl.to(
        leaf,
        {
          rotation: i * 10 - 10 + (i === 0 ? -8 : i === 2 ? 8 : 0), // Different rotation for each leaf
          y: -3 + i * 1.5,
          duration: 1.5,
          ease: "sine.inOut",
          delay: i * 0.2,
        },
        0,
      )
    })

    // Hover animation
    const hoverTl = gsap.timeline({ paused: true })
    hoverTl.to(leaves, {
      scale: 1.1,
      fill: "#4ADE80",
      stagger: 0.1,
      duration: 0.1,
      ease: "power2.out",
    })

    // Add hover event listeners
    logoRef.current.addEventListener("mouseenter", () => hoverTl.play())
    logoRef.current.addEventListener("mouseleave", () => hoverTl.reverse())

    return () => {
      if (logoRef.current) {
        logoRef.current.removeEventListener("mouseenter", () => hoverTl.play())
        logoRef.current.removeEventListener("mouseleave", () => hoverTl.reverse())
      }
    }
  }, [])

  return (
    <svg
      ref={logoRef}
      width="32"
      height="32"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer"
    >
      {/* Leaf 1 - Left */}
      <path
        className="leaf"
        d="M35 70 C20 50, 20 30, 35 20 C50 30, 50 50, 35 70 Z"
        fill="#22C55E"
        stroke="white"
        strokeWidth="3"
      />

      {/* Leaf 2 - Middle */}
      <path
        className="leaf"
        d="M50 75 C35 55, 35 25, 50 15 C65 25, 65 55, 50 75 Z"
        fill="#22C55E"
        stroke="white"
        strokeWidth="6"
      />

      {/* Leaf 3 - Right */}
      <path
        className="leaf"
        d="M65 70 C50 50, 50 30, 65 20 C80 30, 80 50, 65 70 Z"
        fill="#22C55E"
        stroke="white"
        strokeWidth="3"
      />

      {/* Stem */}
      <path d="M50 150 L50 20" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
