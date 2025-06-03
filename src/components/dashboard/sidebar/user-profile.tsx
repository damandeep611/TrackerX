"use client"

import { ChevronDown, Settings, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SignOutButton } from "@/components/auth/sign-out";

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
        className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors"
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
            <h4 className="text-sm font-medium text-gray-100">{name}</h4>
            <p className="text-xs text-gray-400">{email}</p>
          </div>
        )}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          <ChevronDown size={16} />
        </motion.div>
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
            className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl overflow-hidden z-50 border border-gray-700/50"
          >
            <div className="py-1">
              <UserProfileMenuItem
                icon={<User size={16} />}
                label="Profile"
                href="/profile"
              />
              <UserProfileMenuItem
                icon={<Settings size={16} />}
                label="Settings"
                href="/settings"
              />
              <div className="border-t border-gray-700/50 my-1"></div>
              <SignOutButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface UserProfileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  href?: string;
}

const UserProfileMenuItem: React.FC<UserProfileMenuItemProps> = ({
  icon,
  label,
  onClick,
  className = "",
  href,
}) => {
  const Component = href ? "a" : "div";

  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.3)" }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm transition-colors ${className}`}
    >
      <Component href={href} className="flex items-center gap-2 w-full">
        <div className="">{icon}</div>
        <span>{label}</span>
      </Component>
    </motion.div>
  );
};