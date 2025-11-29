import { ReactNode } from "react";
import { motion } from "framer-motion";
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
    <Link href={href}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`flex items-center px-2 py-2 cursor-pointer transition-colors ${
          isActive
            ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-200"
        } ${
          isCollapsed ? "justify-center py-3 mt-3 rounded-lg " : " rounded-md"
        }  `}
      >
        <div className={`${isCollapsed ? "" : "mr-3"}`}>{icon}</div>
        {!isCollapsed && <span className="  text-sm">{label}</span>}
      </motion.div>
    </Link>
  );
}
