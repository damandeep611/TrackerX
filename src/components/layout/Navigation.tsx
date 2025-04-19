"use client"
import React, { useEffect, useRef } from "react";
import { ModeToggle } from "./mode-toggle";
import Link from "next/link";
import gsap from "gsap";
import AnimatedLeafLogo from "./animated-leaf-logo";

export default function Navigation() {
  const navRef = useRef<HTMLDivElement>(null)
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/blog", label: "Blog" },
    { href: "/tools", label: "Tools" },
  ];

  useEffect(() => {
    gsap.from(navRef.current, {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });
    gsap.from(".nav-item", {
      opacity: 0,
      y: -20,
      stagger: 0.1,
      duration: 0.6,
      delay: 0.5,
      ease: "power2.out",
    });
  }, []);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-4">
      <div
        ref={navRef}
        className="flex items-center justify-between w-full px-6 py-2 bg-black rounded-full shadow-lg max-w-5xl text-white border border-gray-400 "
      >
        <Link href="/" className="flex items-center gap-2">
          <AnimatedLeafLogo />
          <span className="text-xl font-bold">BuildxSkill</span>
        </Link>

        <nav className="hidden md:flex items-center justify-center flex-1 px-4">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="nav-item hover:text-orange-300 transition-colors px-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <button className="nav-item hidden md:block px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-orange-300 transition-colors">
            Login
          </button>
        </div>
      </div>
    </header>
  );
}
