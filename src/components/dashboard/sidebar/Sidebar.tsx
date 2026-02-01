"use client";
import {
  BookOpen,
  Box,
  HelpCircle,
  Hourglass,
  House,
  PanelLeft,
  PanelRight,
  Settings,
  Terminal,
  Zap,
} from "lucide-react";
import { useState } from "react";

import SidebarSection from "./sidebar-section";
import SidebarItem from "./sidebar-item";
import { usePathname } from "next/navigation";
import UserProfile from "./user-profile";

const navigation = {
  quicklinks: [
    {
      id: "settings",
      title: "Settings",
      icon: Settings,
      path: "/dashboard/usersetting",
    },
    {
      id: "Help",
      title: "Help Center",
      icon: HelpCircle,
      path: "/dashboard/help",
    },
  ],
  mainMenu: [
    {
      id: "dashboard-main",
      title: "Dashboard",
      icon: House,
      path: "/dashboard",
    },
    {
      id: "80-hour-goals",
      title: "80 Hour Goals",
      icon: Hourglass,
      path: "/dashboard/80-hour-goals",
    },
    {
      id: "daily-logs",
      title: "Daily Logs",
      icon: BookOpen,
      path: "/dashboard/daily-logs",
    },
    {
      id: "sandbox",
      title: "Sandbox",
      icon: Terminal,
      path: "/dashboard/sandbox",
    },
  ],
};

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  //for path checking
  const isActive = (path: string) => {
    // For the dashboard main page, only be active on exact match
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  return (
    <div
      className={`relative h-screen flex flex-col border-r border-zinc-800 bg-[#09090b] text-zinc-400 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-18" : "w-65"
      }`}
    >
      {/* Header / Logo Area */}
      <div
        className={`flex items-center justify-between mb-4 pt-5 px-4 ${isCollapsed ? "flex-col gap-4 px-2" : ""}`}
      >
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="bg-white text-black p-1 rounded-md">
              <Box size={18} strokeWidth={3} />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">
              BuildxSkill
            </span>
          </div>
        ) : (
          <div className="bg-white text-black p-1 rounded-md">
            <Box size={20} strokeWidth={3} />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {isCollapsed ? <PanelRight size={18} /> : <PanelLeft size={18} />}
        </button>
      </div>

      {/* User Profile */}
      <UserProfile isCollapsed={isCollapsed} />

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 scrollbar-hide py-2 px-2">
        <SidebarSection title="Main Menu" isCollapsed={isCollapsed}>
          {navigation.mainMenu.map((item) => (
            <SidebarItem
              href={item.path}
              key={item.id}
              label={item.title}
              icon={<item.icon size={18} strokeWidth={2} />}
              isActive={isActive(item.path)}
              isCollapsed={isCollapsed}
            />
          ))}
        </SidebarSection>

        <SidebarSection title="Support" isCollapsed={isCollapsed}>
          {navigation.quicklinks.map((item) => (
            <SidebarItem
              href={item.path}
              key={item.id}
              label={item.title}
              icon={<item.icon size={18} strokeWidth={2} />}
              isActive={isActive(item.path)}
              isCollapsed={isCollapsed}
            />
          ))}
        </SidebarSection>
      </div>

      {/* Compact Upgrade Card */}
      {!isCollapsed && (
        <div className="p-3 mt-auto">
          <div className="relative group overflow-hidden rounded-xl bg-linear-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 p-3 shadow-lg">
            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full"></div>

            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold text-[11px] leading-tight">
                    Access Pro Features
                  </h3>
                  <p className="text-zinc-500 text-[10px] leading-tight mt-1">
                    Upgrade for exclusive tools & analytics.
                  </p>
                </div>
                {/* <Zap size={14} className="text-yellow-400 fill-yellow-400" /> */}
              </div>

              <button className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-white hover:bg-zinc-100 text-black text-[10px] font-bold uppercase tracking-wide rounded-md transition-all shadow-sm">
                <Zap size={10} className="fill-black" />
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
