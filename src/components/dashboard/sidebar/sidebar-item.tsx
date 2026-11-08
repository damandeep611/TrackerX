"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { NavItem } from "./nav-config";

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed?: boolean;
  /** Distinguishes the shared active-indicator animation per sidebar instance. */
  layoutGroup?: string;
  onNavigate?: () => void;
}

export default function SidebarItem({
  item,
  isActive,
  isCollapsed = false,
  layoutGroup = "sidebar",
  onNavigate,
}: SidebarItemProps) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13px] font-medium outline-none transition-colors duration-150",
        "focus-visible:ring-[3px] focus-visible:ring-ring",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        isCollapsed && "justify-center px-0"
      )}
    >
      {isActive && (
        <motion.span
          layoutId={`${layoutGroup}-active`}
          aria-hidden
          className="absolute top-1/2 -left-2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-brand"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}
      <Icon
        className={cn(
          "size-[17px] shrink-0 transition-colors",
          isActive ? "text-brand" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
        )}
        strokeWidth={1.9}
      />
      {!isCollapsed && <span className="truncate">{item.title}</span>}
    </Link>
  );

  if (!isCollapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  );
}
