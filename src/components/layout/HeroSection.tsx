"use client";

import SignIn from "../auth/sign-in";

export default function HeroSection() {
  return (
    <section className="w-full h-screen bg-gradient-to-br from-[#fff8f0] via-[#ffe0d0] to-[#ffc0c0] dark:from-[#1a1c2c] dark:via-[#2e2f45] dark:to-[#3f4160]">
      <div className="relative px-4 pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-black dark:text-white">
            <p className="inline-block uppercase px-4 py-1 mb-4 font-medium tracking-wide bg-white/30 dark:bg-white/10 backdrop-blur-sm rounded-full">
              Track your skill learning easily
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl capitalize font-bold mb-6">
              Master Your Time. Track Your Growth
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-700 dark:text-gray-200">
              Stay on top of your tasks while leveling up your skills. Organize
              your day, measure your progress, and build a smarter routine—one
              task at a time.
            </p>

            <div className="flex items-center justify-between gap-4">
              <button className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
                Get Started
              </button>
              <SignIn />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
