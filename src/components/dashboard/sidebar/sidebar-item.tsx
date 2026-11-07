import { ReactNode } from "react";
import { motion } from "motion/react";
import Link from "next/link";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  onClick?: () => void;
  isActive?: boolean;
  isCollapsed?: boolean;
}

export default function SidebarItem({
  icon,
  label,
  href,
  onClick,
  isActive = false,
  isCollapsed = false,
}: SidebarItemProps) {
  return (
    <Link href={href} className="block px-2">
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`relative group flex items-center px-3 py-2 cursor-pointer transition-all duration-200 
          ${
            isActive
              ? "bg-zinc-800 text-white dark:bg-white/10 dark:text-white"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5"
          } 
          ${isCollapsed ? "justify-center px-2 rounded-lg" : "rounded-lg"} 
        `}
      >
        <div
          className={`${
            isCollapsed ? "" : "mr-3"
          } ${
            !isActive &&
            "group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors"
          }`}
        >
          {icon}
        </div>
        {!isCollapsed && (
          <span className={`text-[13px] font-medium ${isActive ? "text-white" : ""}`}>
            {label}
          </span>
        )}

        {/* Active Indicator (Right Blue Line for active state, similar to reference) */}
        {!isCollapsed && isActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-500 rounded-l-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
        )}
      </motion.div>
    </Link>
  );
}
