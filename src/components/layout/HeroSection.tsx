"use client";

import { motion } from "framer-motion";

import demodash from "../../../public/landing/demodash.jpeg";
import { useState } from "react";
import LoginModal from "./landingPage/LoginModal";
import Image from "next/image";
import { Zap } from "lucide-react";



export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // login modal fn
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  return (
    <section className="relative  overflow-hidden">
      <div className="max-w-7xl mx-auto py-6 ">
        <div className="flex flex-col items-center justify-between py-6 max-w-3xl mx-auto text-center space-y-4 ">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="inline-flex items-center gap-2 text-xs  text-zinc-500 border rounded-2xl p-1 px-4"
          >
            <Zap className="h-4 w-4 text-teal-600" />
            Faster execution, clearer visibility
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className=" text-4xl lg:text-[64px]   font-bold tracking-tighter leading-tight"
          >
            Learn smarter with smooth time Tracking system
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className=" text-sm lg:text-[16px] max-w-xl font-medium"
          >
            BuildXskill transforms learning chaos into structured clarity with
            smart tracking, with predictive timelines and weekly analysis.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="flex items-center justify-between gap-4 mx-auto"
          >
            <button
              onClick={openModal}
              className="bg-emerald-500 text-white border border-emerald-700 hover:bg-emerald-800 py-2 px-4 text-sm lg:py-2 lg:px-4 font-semibold  rounded-md cursor-pointer"
            >
              Start Tracking
            </button>
            <button className="border  border-gray-200 hover:border-emerald-400 py-2 px-4 text-sm lg:py-2 lg:px-4 font-semibold cursor-pointer  rounded-md">
              Demo
            </button>
          </motion.div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
            className="relative w-full overflow-hidden"
          >
            <Image
              src={demodash}
              alt="Dashboard showing tasks across To Do, In Progress, and Done columns."
              width={1150}
              height={768}
              priority
              className=" h-full w-5xl mx-auto  rounded-2xl   border-4 lg:border-8 border-emerald-600"
            />
          </motion.div>
        </div>
      </div>
      <LoginModal isOpen={isModalOpen} onClose={closeModal} />
    </section>
  );
}



