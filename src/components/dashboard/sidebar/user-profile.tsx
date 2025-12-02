"use client"

import { MessageSquarePlus, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignOutButton } from "@/components/auth/sign-out";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "@/components/layout/mode-toggle";

interface UserProfileProps {
  isCollapsed?: boolean;
}

export default function UserProfile({ isCollapsed = false }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data } = authClient.useSession();
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  //close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <motion.div
        onClick={toggleDropdown}
        className={`flex items-center mb-1  rounded-lg cursor-pointer hover:bg-surface-highlight transition-colors border  hover:border-border ${
          isCollapsed ? "justify-center p-1" : "gap-3 p-2"
        }`}
      >
        <img
          src={
            data?.user.image ||
            "https://robohash.org/DF9.png?set=set4&size=150x150"
          }
          alt={`${data?.user.name}`}
          className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
        />

        {!isCollapsed && (
          <div className="flex-1 overflow-hidden animate-in fade-in duration-200">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {data?.user.name}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
              User Profile
            </p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{
              duration: 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
            className={`absolute w-full  bottom-14 mt-2   shadow-xl overflow-hidden z-50 border border-border bg-background rounded-2xl ${
              isCollapsed ? "left-16" : "left-0"
            }`}
          >
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-xs text-text-tertiary">Signed in as</p>
              <p className="text-sm font-bold text-primary truncate">
                {data?.user.email}
              </p>
            </div>
            <div className="py-1">
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-primary hover:bg-surface-highlight rounded-lg transition-colors">
                <User className="w-4 h-4 " />
                My Profile
              </button>

              <ModeToggle />
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-primary hover:bg-surface-highlight rounded-lg transition-colors">
                <MessageSquarePlus className="w-4 h-4" />
                Feedback
              </button>
            </div>
            <div className="py-1">
              <div className="border-t border-gray-700/50 my-1"></div>
              <SignOutButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
