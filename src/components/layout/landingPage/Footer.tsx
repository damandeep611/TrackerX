"use client"

import type React from "react";
import { motion } from "framer-motion";
import { FaXTwitter, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa6";
import AnimatedLeafLogo from "../animated-leaf-logo";

export default function Footer() {
  return (
    <div className="relative w-full max-w-7xl mx-auto overflow-hidden">
      {/* Footer Section */}
      <div className="w-full  py-16 px-4 sm:px-6 lg:px-8  relative -mt-6">
        <div className="border-t border-b py-8 border-gray-50">
          <div className="flex items-center justify-between gap-10">
            {/* Logo and Description */}
            <div className=" space-y-2">
              <div className="flex items-center space-x-2">
                <div className="">
                  <AnimatedLeafLogo />
                </div>
                <span className="text-xl font-bold">BuildXSkill</span>
              </div>

              <p className="text-gray-600 text-sm">
                Connect on Social media for any feedback and query
              </p>
            </div>
            <button className="bg-blue-600 text-white text-xl font-semibold p-2 px-6 rounded-full">
              Try now
            </button>
          </div>
        </div>
      </div>
      {/* logos social */}
      <div className="flex items-center justify-between space-x-4">
        <motion.a
          href="#"
          className="text-gray-600 hover:text-black flex items-center justify-between gap-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaXTwitter size={20} />
          <span>TWITTER</span>
        </motion.a>
        <motion.a
          href="#"
          className="text-gray-600 hover:text-black flex items-center justify-between gap-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaInstagram size={20} />
          <span>INSTAGRAM</span>
        </motion.a>
        <motion.a
          href="#"
          className="text-gray-600 hover:text-black flex items-center justify-between gap-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaLinkedin size={20} />
          <span>LINKEDIN</span>
        </motion.a>
        <motion.a
          href="#"
          className="text-gray-600 hover:text-black flex items-center justify-between gap-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaGithub size={20} />
          <span>GITHUB</span>
        </motion.a>
      </div>

      {/* Peeking Heading at Bottom */}
      <div className="relative w-full overflow-hidden h-40 ">
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

