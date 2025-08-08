"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import heroImg from "../../../public/landing/dashboardpreview.png";
import { ArrowRight, GitFork, Zap } from "lucide-react";

import { useState } from "react";
import LoginModal from "./landingPage/LoginModal";

function classNames(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

const parent = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

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
    <section className="relative overflow-hidden">
      {/* Background grid and aurora */}
      <BackgroundDecor />

      <div className="relative mx-auto w-full  py-16 md:py-24">
        {/* Heading and description */}
        <div className="px-4 md:px-10 lg:px-16">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerParent}
            className="max-w-3xl"
          >
            <motion.div
              variants={child}
              className="inline-flex items-center gap-2 text-sm text-zinc-500"
            >
              <Zap className="h-4 w-4 text-teal-600" />
              Faster execution, clearer visibility
            </motion.div>

            <motion.h1
              variants={child}
              className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl"
            >
              Achieve Your Goals with Smarter
              <span className="inline-block align-middle lg:ml-4 mt-2">
                <HighlightPill>
                  <GitFork className="h-6 w-6" />
                  <span>Tracking</span>
                </HighlightPill>
              </span>{" "}
            </motion.h1>

            <motion.p
              variants={child}
              className="mt-5 max-w-xl text-base leading-7 text-zinc-600 md:text-lg"
            >
              Get the tools you need to save time, increase productivity, and
              achieve your goals faster. From automation to insights, manage
              everything in one place.
            </motion.p>
          </motion.div>
        </div>

        {/* Below row: 30% (CTA + trust) / 70% (dashboard image) */}
        <div className="mt-10 md:mt-12 grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] md:gap-10">
          {/* Left column */}
          <motion.aside
            variants={parent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="flex w-full flex-col gap-6 px-6 md:px-10 lg:px-16"
          >
            <button
              type="button"
              onClick={openModal}
              className={classNames(
                "group relative inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 cursor-pointer",
                "bg-zinc-900 text-white shadow-sm ring-1 ring-black/10 transition-colors hover:bg-zinc-800"
              )}
              aria-label="Start 7Day Free Trial"
            >
              <span className="relative z-10 font-medium">Try it Now</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              {/* animated gradient border on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/10"
              />
            </button>
          </motion.aside>

          {/* Right column: dashboard image */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full overflow-hidden"
          >
            <Image
              src={heroImg}
              alt="Dashboard showing tasks across To Do, In Progress, and Done columns."
              width={1194}
              height={768}
              priority
              className=" h-full w-full rounded-2xl translate-x-5 md:translate-x-10 lg:translate-x-16  border-4 lg:border-8 border-blue-600"
            />
          </motion.div>
        </div>
      </div>
      <LoginModal isOpen={isModalOpen} onClose={closeModal} />
    </section>
  );
}

/* ---------- Subcomponents ---------- */

function HighlightPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative -rotate-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 px-3 py-2 text-white">
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
      <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/25" />
    </span>
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