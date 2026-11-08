"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup } from "motion/react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocalStorageBoolean } from "@/hooks/useLocalStorageState";
import SidebarSection from "./sidebar-section";
import SidebarItem from "./sidebar-item";
import UserProfile from "./user-profile";
import { isNavActive, mainNav } from "./nav-config";

function SidebarBrand({ isCollapsed = false }: { isCollapsed?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      <Brand hideName={isCollapsed} />
    </Link>
  );
}

function NavContent({
  isCollapsed = false,
  layoutGroup,
  onNavigate,
}: {
  isCollapsed?: boolean;
  layoutGroup: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <LayoutGroup id={layoutGroup}>
      <div className="flex-1 space-y-2 overflow-x-hidden overflow-y-auto scrollbar-hide px-3">
        <SidebarSection title="Workspace" isCollapsed={isCollapsed}>
          {mainNav.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              isActive={isNavActive(pathname, item.href)}
              isCollapsed={isCollapsed}
              layoutGroup={layoutGroup}
              onNavigate={onNavigate}
            />
          ))}
        </SidebarSection>
      </div>
    </LayoutGroup>
  );
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useLocalStorageBoolean("sidebar-collapsed", false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <TooltipProvider>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-[var(--ease-out-soft)] md:flex",
          isCollapsed ? "w-[68px]" : "w-60"
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center px-4",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && <SidebarBrand />}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!isCollapsed}
              >
                <ToggleIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{isCollapsed ? "Expand" : "Collapse"}</TooltipContent>
          </Tooltip>
        </div>

        <NavContent isCollapsed={isCollapsed} layoutGroup="sidebar-desktop" />

        <div className="border-t border-sidebar-border p-3">
          <UserProfile isCollapsed={isCollapsed} />
        </div>
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar/90 px-4 backdrop-blur md:hidden">
        <SidebarBrand />
        <Button variant="ghost" size="icon-sm" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu />
        </Button>
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-14 items-center px-4">
            <SidebarBrand />
          </div>
          <NavContent layoutGroup="sidebar-mobile" onNavigate={() => setMobileOpen(false)} />
          <div className="border-t border-sidebar-border p-3">
            <UserProfile />
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
