import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  onClick?: () => void;
  isActive?: boolean;
  rightIcon?: ReactNode;
  className?: string;
}

export default function SidebarItem({
  icon,
  label,
  href,
  onClick,
  isActive = false,
  rightIcon,
  className = "",
}: SidebarItemProps) {
  return (
    <Link href={href}>
     <motion.div whileHover={{x: 4}} whileTap={{scale: 0.98}}
      onClick={onClick}
      className={`flex items-center px-4 py-2 cursor-pointer ${
        isActive
          ? "bg-gray-100 text-gray-900 mx-2 rounded-md"
          : "hover:bg-gray-800 rounded-md mx-2 text-gray-300"
      } ${className} `}
    >
      <div className={`mr-3 ${isActive ? 'text-gray-900' : "text-gray-500"}`}>{icon}</div>
      <span className="flex-grow font-medium text-sm">{label}</span>
      {rightIcon && <div className=" ml-2 text-gray-500">{rightIcon}</div>}
    </motion.div>
    </Link>
   
  );
}
