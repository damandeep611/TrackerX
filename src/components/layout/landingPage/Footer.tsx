"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"

// Define types for our footer links
type FooterLink = {
  title: string
  href: string
}

export default function Footer() {
  // Refs for animation targets
  const iconsRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  // Footer links data
  const leftLinks: FooterLink[] = [
    { title: "About Us", href: "#" },
    { title: "Contact", href: "#" },
    { title: "What's New", href: "#" },
    { title: "Careers", href: "#" },
  ]

  const rightLinks: FooterLink[] = [
    { title: "Product", href: "#" },
    { title: "Solutions", href: "#" },
    { title: "Integrations", href: "#" },
    { title: "Price", href: "#" },
  ]

  useEffect(() => {
    // Animate the heading
    gsap.from(headingRef.current, {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: "power3.out",
      delay: 0.2,
    })

    // Animate the logo
    gsap.from(logoRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.8,
      ease: "back.out(1.7)",
    })

    // Animate the floating icons
    if (iconsRef.current) {
      const icons = iconsRef.current.children
      gsap.fromTo(
        icons,
        {
          opacity: 0,
          scale: 0.5,
          y: 40,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          delay: 0.4,
        },
      )

    
    }

    // Animate the links
    gsap.from(".footer-link", {
      opacity: 0,
      x: 20,
      duration: 0.5,
      stagger: 0.05,
      ease: "power2.out",
      delay: 0.6,
    })
  }, [])

  return (
    <footer className=" py-16 px-8 md:px-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Logo */}
        <div ref={logoRef} className="mb-8">
          <div className="flex items-center">
            <div className="w-6 h-6 grid grid-cols-2 gap-1">
              <div className="bg-emerald-500 rounded-sm"></div>
              <div className="bg-emerald-500 rounded-sm"></div>
              <div className="bg-emerald-500 rounded-sm"></div>
              <div className="bg-emerald-500 rounded-sm"></div>
            </div>
            <span className="ml-2 font-semibold text-gray-800">BuildXSkill</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Left side with heading */}
          <div>
            <h2 ref={headingRef} className="text-4xl font-bold text-gray-800 leading-tight mb-16">
              Stay organized and
              <br />
              boost your productivity
            </h2>

            {/* Floating icons */}
            <div ref={iconsRef} className="relative h-64">
              {/* Chat icon */}
              <div className="absolute left-0 top-10 bg-white rounded-2xl shadow-lg p-4 w-14 h-14 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <path d="M8 9h8"></path>
                  <path d="M8 13h6"></path>
                </svg>
              </div>

              {/* Calendar icon */}
              <div className="absolute left-20 top-0 bg-white rounded-2xl shadow-lg p-4 w-14 h-14 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>

              {/* Flag icon */}
              <div className="absolute left-48 top-4 bg-white rounded-2xl shadow-lg p-4 w-14 h-14 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500"
                >
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
              </div>

              {/* Clock icon */}
              <div className="absolute right-20 top-24 bg-white rounded-2xl shadow-lg p-4 w-14 h-14 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>

              {/* Lightbulb icon */}
              <div className="absolute right-0 top-4 bg-white rounded-2xl shadow-lg p-4 w-14 h-14 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-yellow-500"
                >
                  <path d="M9 18h6"></path>
                  <path d="M10 22h4"></path>
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                </svg>
              </div>

              {/* Checklist icon */}
              <div className="absolute left-32 top-32 bg-white rounded-2xl shadow-lg p-4 w-14 h-14 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>

              {/* Timer icon */}
              <div className="absolute left-0 top-48 bg-white rounded-2xl shadow-lg p-4 w-14 h-14 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600"
                >
                  <path d="M10 2h4"></path>
                  <path d="M12 14v-4"></path>
                  <circle cx="12" cy="14" r="8"></circle>
                </svg>
              </div>

              {/* Arrow icon */}
              <div className="absolute right-0 top-48 bg-white rounded-2xl shadow-lg p-4 w-14 h-14 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500"
                >
                  <polyline points="13 17 18 12 13 7"></polyline>
                  <polyline points="6 17 11 12 6 7"></polyline>
                </svg>
              </div>
            </div>
          </div>

          {/* Right side with links */}
          <div className="flex justify-end">
            <div className="grid grid-cols-2 gap-x-16 gap-y-2">
              <div>
                {leftLinks.map((link, index) => (
                  <div key={index} className="mb-4">
                    <Link
                      href={link.href}
                      className="footer-link text-gray-500 hover:text-gray-800 transition-colors flex items-center"
                    >
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
                        className="mr-2 text-gray-300"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                      {link.title}
                    </Link>
                  </div>
                ))}
              </div>
              <div>
                {rightLinks.map((link, index) => (
                  <div key={index} className="mb-4">
                    <Link
                      href={link.href}
                      className="footer-link text-gray-500 hover:text-gray-800 transition-colors flex items-center"
                    >
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
                        className="mr-2 text-gray-300"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                      {link.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between text-xs text-gray-400">
          <div>© 2024. All rights reserved.</div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-gray-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-gray-600 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
