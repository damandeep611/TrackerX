"use client"

import { ChevronDown, ChevronUp, Settings, User } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SignOutButton } from "@/components/auth/sign-out"


interface UserProfileProps {
  name: string;
  email: string;
  avatarUrl?: string;
  isCollapsed?: boolean;
}

export default function UserProfile({
  name,
  email,
  avatarUrl,
  isCollapsed = false,
}: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        whileHover={{ y: -2 }}
        onClick={toggleDropdown}
        className="flex items-center p-2 rounded-lg bg-gray-800/50 cursor-pointer"
      >
        <div
          className={`w-10 h-10 rounded-md overflow-hidden mr-3 ${
            isCollapsed ? "w-6 mr-0" : ""
          }`}
        >
          <img
            src={avatarUrl || "/placeholder.svg"}
            alt={`${name}'s avatar`}
            className="w-full h-full object-cover"
            width={30}
            height={30}
          />
        </div>
        {!isCollapsed && (
          <div className="flex-grow">
            <h4 className="text-sm font-medium">{name}</h4>
            <p className="text-xs text-gray-400">{email}</p>
          </div>
        )}
        <div className="text-gray-400">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
          >
            <UserProfileMenuItem icon={<User size={16} />} label="Profile" />
            <UserProfileMenuItem
              icon={<Settings size={16} />}
              label="Settings"
            />
            <div className="border-t border-gray-700 my-1"></div>
            <SignOutButton />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



interface UserProfileMenuItemProps {
  icon: React.ReactNode
  label: string
  onClick?: ()=> void
  className?: string
}

const UserProfileMenuItem: React.FC<UserProfileMenuItemProps> = ({ icon, label, onClick, className = "" }) => {
  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm ${className}`}
    >
      <div className="text-gray-400">{icon}</div>
      <span>{label}</span>
    </motion.div>
  )
}