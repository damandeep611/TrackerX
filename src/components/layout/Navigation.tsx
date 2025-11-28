"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Hexagon, LogIn, Menu, X } from "lucide-react";
import SignIn from "../auth/sign-in";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/blog", label: "Blog" },
  { href: "/feedback", label: "Feeback" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger the morph effect after scrolling 50px
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial checks
    handleScroll();
    handleResize();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <motion.nav
      initial={{ width: "100%", x: "-50%", y: 0, borderRadius: 0 }}
      animate={{
        width: isScrolled ? (isMobile ? "92%" : "70%") : "100%",
        x: "-50%",
        y: isScrolled ? 24 : 0,
        borderRadius: isScrolled ? (isOpen ? 24 : 9999) : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
      className={`fixed z-50 left-1/2 backdrop-blur-lg bg-white/80 overflow-hidden ${
        isScrolled
          ? "shadow-lg shadow-gray-200/50 border border-gray-100/50"
          : "border-b border-gray-100"
      }`}
    >
      <div className="w-full mx-auto px-6 md:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-accent-electric"
            >
              <Hexagon fill="#E9DFF7" strokeWidth={2.5} size={32} />
            </motion.div>
            <span className="font-display font-bold text-xl tracking-tight text-gray-900 group-hover:text-accent-electric transition-colors">
              BuildXskill
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-accent-electric transition-colors relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-electric scale-x-0 group-hover:scale-x-100 transition-transform origin-right group-hover:origin-left" />
              </Link>
            ))}
            <SignIn />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100"
          >
            <div className="px-6 pt-2 pb-6 space-y-2">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-accent-electric hover:bg-pastel-lilac/30"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4">
                <button className="w-full flex justify-center items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-full font-medium active:scale-95 transition-transform">
                  <LogIn size={18} />
                  Login with Google
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
