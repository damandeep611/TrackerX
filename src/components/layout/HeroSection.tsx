"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import heroImg from "../../../public/landing/dashboardpreview.png";
import { ArrowRight, Star, UserRound, Waypoints } from "lucide-react";
import { useState } from "react";
import LoginModal from "./landingPage/LoginModal";

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // login modal fn
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  return (
    <section className="w-full bg-white overflow-hidden ">
      <div className="bg-hero m-4 lg:m-6 rounded-2xl overflow-hidden  ">
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgb(148,163,184,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgb(148, 163,184,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
        {/* hero text content */}
        <div className="flex items-start justify-between p-4 px-6 lg:p-6 lg:px-10 max-w-4xl">
          <div className=" pt-8 lg:pt-12">
            <div className=" text-4xl lg:text-[56px]">
              Achieve Your Goals with
            </div>
            <div className=" relative flex items-center text-4xl  lg:text-[56px]">
              <div>Smarter</div>
              <div className=" -rotate-2 lg:-rotate-4 bg-blue-500 text-white ml-8 px-6 text-4xl lg:text-6xl  rounded-2xl flex items-center justify-between">
                <Waypoints size={30} />
                Workflows
              </div>
            </div>
            <div className="max-w-xl mt-4">
              <p className=" text-sm lg:text-lg font-medium text-gray-600">
                Get the tools you need to save time, increase productivity, and
                achieve your goals faster. From automation to insights, manage
                everything.
              </p>
            </div>
          </div>
        </div>
        {/* grid container */}
        <div className="grid grid-cols-1 lg:grid-cols-[20%_80%] gap-4">
          <div className="flex flex-col items-start space-y-4 max-w-sm pl-6 lg:pl-8">
            {/* CTA Button */}
            <motion.button
              onClick={openModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center cursor-pointer justify-between text-sm lg:text-base gap-2 px-3 py-2 lg:px-6 lg:py-3 bg-white border-2 border-blue-600 text-blue-600 font-medium rounded-full shadow-sm hover:bg-blue-50 transition-all"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            {/* Review Section */}
            <div className="flex items-center gap-4">
              {/* Icons as Avatars */}
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600"
                  >
                    <UserRound className="w-5 h-5" />
                  </div>
                ))}
              </div>

              {/* Stars and Review Text */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-1 text-blue-900">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-blue-900 stroke-blue-900"
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600">From 20k+ Reviews</p>
              </div>
            </div>
          </div>
          {/* image right side */}
          <div className=" rounded-2xl ">
            <Image
              src={heroImg}
              alt="Hero image"
              width={1320}
              height={880}
              className="rounded-2xl translate-x-20 translate-y-6 border-4 lg:border-8 border-blue-600"
            />
          </div>
        </div>
      </div>
      <LoginModal isOpen={isModalOpen} onClose={closeModal} />
    </section>
  );
}
