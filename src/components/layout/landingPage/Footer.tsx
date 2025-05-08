"use client"

import type React from "react";
import { motion } from "framer-motion";
import { FaXTwitter, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa6";
import Link from "next/link";
import AnimatedLeafLogo from "../animated-leaf-logo";

export default function Footer() {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const buttonHover = {
    rest: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Hero Section with Gradient Background */}
      <div className="w-full bg-gradient-to-b from-gray-800 to-black py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden ">
        <motion.div
          className="max-w-4xl mx-auto space-y-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
            variants={fadeIn}
          >
            Ready to Start Tracking ?
          </motion.h1>

          <motion.p
            className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto"
            variants={fadeIn}
          >
            Join early to get access to beta testing of AI driven feedback
          </motion.p>

          <motion.div variants={fadeIn}>
            <motion.button
              className="mt-6 px-8 py-3 bg-white text-gray-900 rounded-md font-medium text-lg shadow-lg"
              variants={buttonHover}
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              Start for free
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Section */}
      <div className="w-full bg-white py-16 px-4 sm:px-6 lg:px-8 rounded-t-3xl shadow-lg relative -mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-10">
            {/* Logo and Description */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center space-x-2">
                <div className="">
                  <AnimatedLeafLogo />
                </div>
                <span className="text-xl font-bold">BuildXSkill</span>
              </div>

              <p className="text-gray-600 text-sm">
                Connect on Social media for any feedback and query
              </p>

              <div className="flex space-x-4">
                <motion.a
                  href="#"
                  className="text-gray-600 hover:text-black"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaXTwitter size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="text-gray-600 hover:text-black"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaInstagram size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="text-gray-600 hover:text-black"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaLinkedin size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  className="text-gray-600 hover:text-black"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaGithub size={20} />
                </motion.a>
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <Link href="#" className="text-gray-800 hover:text-black text-xl">
                Demo
              </Link>
            </div>

            <div>
              <Link href="#" className="text-gray-800 hover:text-black text-xl">
                Self Hosting
              </Link>
            </div>

            <div>
              <Link href="#" className="text-gray-800 hover:text-black text-xl">
                Feedback
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Peeking Heading at Bottom */}
      <div className="relative w-full overflow-hidden h-40 bg-gray-100">
        <motion.h1
          className="absolute bottom-0 left-0 w-full text-[180px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-300 leading-none"
          style={{ y: "40%" }}
          initial={{ y: "60%" }}
          animate={{
            y: "40%",
            transition: {
              duration: 1,
              yoyo: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              repeatDelay: 2,
            },
          }}
        >
          BuildXSkill
        </motion.h1>
      </div>
    </div>
  );
}

