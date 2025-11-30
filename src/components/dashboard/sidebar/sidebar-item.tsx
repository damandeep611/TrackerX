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
        className={` group flex items-center px-2 py-2 cursor-pointer transition-colors hover:bg-surface-highlight ${
          isActive
            ? "font-medium bg-surface-highlight text-primary"
            : "text-text-secondary"
        } ${
          isCollapsed ? "justify-center py-3 mt-3 rounded-lg " : " rounded-md"
        }  `}
      >
        <div
          className={`${isCollapsed ? "" : "mr-3 group-hover:text-primary"}`}
        >
          {icon}
        </div>
        {!isCollapsed && <span className="  text-sm">{label}</span>}
      </motion.div>
    </Link>
  );
}
