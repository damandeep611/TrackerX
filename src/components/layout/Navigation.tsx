"use client"
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import AnimatedLeafLogo from "./animated-leaf-logo";
import LoginModal from "./landingPage/LoginModal";


export default function Navigation() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // modal open and close functions
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const navRef = useRef<HTMLDivElement>(null);
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/blog", label: "Blog" },
    { href: "/feedback", label: "Feeback" },
  ];

  useEffect(() => {
    // Store current ref value inside the effect
    const navElement = navRef.current;
    const navItems = document.querySelectorAll(".nav-item");
    // clearing existing animations before remounting
    gsap.killTweensOf(navElement);
    gsap.killTweensOf(navItems);
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
    //cleanup function
    return () => {
      gsap.killTweensOf(navElement);
      gsap.killTweensOf(navItems);
    };
  }, []);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-4 ">
      <div
        ref={navRef}
        className="flex items-center justify-between w-full bg-white text-zinc-700 px-6 py-2 rounded-2xl max-w-3xl  border border-zinc-200 "
      >
        <Link href="/" className="flex items-center gap-2">
          <AnimatedLeafLogo />
        </Link>

        <nav className="hidden md:flex items-center justify-center flex-1 px-4">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="nav-item text-lg font-semibold text-gray-500  hover:bg-gray-100 p-2 hover:rounded-xl transition-colors px-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={openModal}
            className="nav-item hidden md:block px-6 py-2 bg-sky-500 text-white  text-shadow rounded-2xl font-medium cursor-pointer  transition-colors"
          >
            Login
          </button>
        </div>
      </div>
      <LoginModal isOpen={isModalOpen} onClose={closeModal} />
    </header>
  );
}
