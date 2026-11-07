"use client";

import { MessageSquarePlus, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
    <div ref={dropdownRef} className="relative px-2 mb-2">
      <motion.div
        onClick={toggleDropdown}
        className={`flex items-center rounded-xl cursor-pointer transition-all duration-200 border 
          ${
            isOpen
              ? "bg-surface-highlight border-border"
              : "bg-surface/50 border-transparent hover:bg-surface-highlight hover:border-border"
          }
          ${isCollapsed ? "justify-center p-1.5" : "gap-3 p-2.5"}
        `}
      >
        <div className="relative shrink-0">
          <img
            src={
              data?.user.image ||
              "https://robohash.org/DF9.png?set=set4&size=150x150"
            }
            alt={`${data?.user.name}`}
            className={`rounded-lg object-cover bg-surface-highlight border border-border ${
              isCollapsed ? "w-8 h-8" : "w-9 h-9"
            }`}
          />
        </div>

        {!isCollapsed && (
          <div className="flex-1 overflow-hidden min-w-0">
            <p className="text-[13px] font-medium text-primary truncate leading-none mb-1">
              {data?.user.name}
            </p>
            <p className="text-[11px] text-text-secondary truncate leading-none">
              {data?.user.email}
            </p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              duration: 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
            className={`absolute w-full top-full mt-2 shadow-2xl overflow-hidden z-50 border border-border bg-popover rounded-xl p-1 ${
              isCollapsed ? "left-14 w-56" : "left-0"
            }`}
          >
            <div className="px-2 py-2 border-b border-border mb-1">
              <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-bold pl-2">
                My Account
              </p>
            </div>

            <div className="space-y-0.5">
              <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-surface-highlight rounded-lg transition-colors">
                <User className="w-3.5 h-3.5" />
                Profile
              </button>

              <div className="px-1">
                <ModeToggle />
              </div>

              <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-surface-highlight rounded-lg transition-colors">
                <MessageSquarePlus className="w-3.5 h-3.5" />
                Feedback
              </button>
            </div>

            <div className="mt-1 pt-1 border-t border-border">
              <SignOutButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
