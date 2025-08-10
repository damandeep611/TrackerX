"use client";

import { motion } from "framer-motion";

import demodash from "../../../public/landing/demodash.jpeg";
import { useState } from "react";
import LoginModal from "./landingPage/LoginModal";
import Image from "next/image";
import { Zap } from "lucide-react";

const child = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // login modal fn
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  return (
    <section className="relative  overflow-hidden">
      {/* Background grid and aurora */}
      <BackgroundDecor />
      <div className="max-w-7xl mx-auto py-16 ">
        <div className="flex flex-col items-center justify-between py-24 max-w-3xl mx-auto text-center space-y-4 ">
          <motion.div
            variants={child}
            className="inline-flex items-center gap-2 text-xs lg:text-sm text-zinc-500 border rounded-2xl p-1 px-4"
          >
            <Zap className="h-4 w-4 text-teal-600" />
            Faster execution, clearer visibility
          </motion.div>
          <h2 className=" text-4xl lg:text-[64px]  font-semibold tracking-tighter leading-tight">
            Task Management Made Simple and Powerful
          </h2>
          <p className=" text-sm lg:text-[18px] font-medium">
            Boost productivity with seamless task and team management.
          </p>
          <button
            onClick={openModal}
            className="bg-black text-white py-1 px-4 text-sm lg:py-3 lg:px-6 font-semibold lg:text-lg rounded-md"
          >
            Join Now
          </button>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full overflow-hidden"
          >
            <Image
              src={demodash}
              alt="Dashboard showing tasks across To Do, In Progress, and Done columns."
              width={1194}
              height={768}
              priority
              className=" h-full w-full rounded-2xl   border-4 lg:border-8 border-blue-600"
            />
          </motion.div>
        </div>
      </div>
      <LoginModal isOpen={isModalOpen} onClose={closeModal} />
    </section>
  );
}



function BackgroundDecor() {
  return (
    <>
      {/* subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(24,24,27,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at top, black, transparent 65%)",
        }}
      />
      {/* aurora shapes */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-[conic-gradient(from_140deg,rgba(99,102,241,0.25),rgba(20,184,166,0.2),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
    </>
  );
}