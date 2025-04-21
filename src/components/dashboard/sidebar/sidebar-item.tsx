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
        className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${
          isActive
            ? "bg-gray-100 text-gray-900 mx-2 rounded-md"
            : "hover:bg-gray-800 rounded-md mx-2 text-gray-300"
        } ${isCollapsed ? "justify-center" : ""}  `}
      >
        <div className={`${isCollapsed ? "" : "mr-3"}`}>{icon}</div>
        {!isCollapsed && <span className=" font-medium text-sm">{label}</span>}
      </motion.div>
    </Link>
  );
}
