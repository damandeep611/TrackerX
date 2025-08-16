"use client"
import React, { useState } from "react";
import Link from "next/link";
import AnimatedLeafLogo from "./animated-leaf-logo";
import LoginModal from "./landingPage/LoginModal";

export default function Navigation() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // modal open and close functions
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/blog", label: "Blog" },
    { href: "/feedback", label: "Feeback" },
  ];

  return (
    <header className=" flex justify-center px-4 py-4 ">
      <div className="flex items-center justify-between w-full px-6 py-2 rounded-xl max-w-7xl  ">
        <Link href="/" className="flex items-center gap-2">
          <AnimatedLeafLogo />
          <span className="text-xl font-bold">BuildxSkill</span>
        </Link>

        <div className="flex items-center justify-between gap-8">
          <nav className="hidden md:flex items-center justify-center flex-1 px-4">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="nav-item p-2 text-sm font-medium hover:rounded-xl transition-colors px-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between gap-3 text-sm font-medium">
            <button className="nav-item hidden md:block px-4 py-2 border border-gray-300 text-shadow rounded-md  cursor-pointer  transition-colors">
              Suggestions
            </button>
            <button
              onClick={openModal}
              className="nav-item hidden md:block px-6 py-2 bg-black text-white hover:bg-emerald-400 text-shadow rounded-md  cursor-pointer  transition-colors"
            >
              Get started
            </button>
          </div>
        </div>
      </div>
      <LoginModal isOpen={isModalOpen} onClose={closeModal} />
    </header>
  );
}
