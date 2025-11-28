"use client"

import SignIn from '@/components/auth/sign-in';
import React from 'react'

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/blog", label: "Blog" },
  { href: "/feedback", label: "Feeback" },
];

export default function Navbar() {
  return (
     <nav className="absolute top-6 left-0 right-0 z-50 flex justify-center w-full px-4">
      <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 px-6 py-3 flex items-center gap-8 max-w-4xl w-full justify-between transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
            <path d="M20 0L40 20L20 40L0 20L20 0Z" fill="currentColor"/>
            <path d="M20 8L32 20L20 32L8 20L20 8Z" fill="white"/>
          </svg>
          <span className="font-bold text-xl tracking-tight">LEARN</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a 
              key={item.label} 
              href={item.href}
              className="text-gray-600 hover:text-black font-medium text-sm transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <SignIn/>
         
        </div>
      </div>
    </nav>
  )
}
