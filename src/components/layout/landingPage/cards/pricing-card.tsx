"use client";
import {  CheckIcon, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function PricingCard() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="w-full max-w-md mx-auto ">
      <div className="rounded-3xl shadow-sm border border-gray-300 overflow-hidden">
        {/* card header */}
        <div className="p-3 bg-neutral-100">
          <div className=" bg-[#121212] text-gray-300 border border-gray-400 p-6 rounded-3xl">
          <div className="flex flex-col justify-between items-start mb-2 space-y-2">
            <h2 className="text-3xl font-bold ">AI integration</h2>
            <p>Bring your dream website to life in just days, not months.</p>
          </div>
          {/* dividing line */}
          <div className="border-t border-gray-100 my-6" />
          {/* features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Includes</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 relative text-green-300 ">
                <span className="p-0.5 rounded-full mt-0.5">
                  <CheckIcon size={16} />
                </span>
                <span className="">AI integration </span>
              </li>
              <li className="flex items-start gap-3 relative text-green-300">
                <span className=" p-0.5 rounded-full mt-0.5">
                  <CheckIcon size={16} />
                </span>
                <span className="">Automated reminders </span>
              </li>
              <li className="flex items-start gap-3 relative text-green-300">
                <span className=" p-0.5 rounded-full mt-0.5">
                  <CheckIcon size={16} />
                </span>
                <span className="">Behavior based feedback </span>
              </li>
            </ul>
          </div>
          </div>
          {/* card footer */}
          <motion.div
            className=" p-4  cursor-pointer"
            onClick={toggleOpen}
            transition={{ duration: 0.2 }}
          >
            <span className="flex items-center justify-center">
              {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </motion.div>

          {/* Expandable Content */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{duration: 0.3, ease: "easeInOut"}}
                className=" overflow-hidden "
                style={{borderTopLeftRadius: 0 , borderTopRightRadius: 0}}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Coming soon..
                  </h3>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
