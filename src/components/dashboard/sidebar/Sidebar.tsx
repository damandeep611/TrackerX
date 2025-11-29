"use client";
import {
  Box,
  ChartPie,
  GoalIcon,
  HelpCircle,
  House,
  ListTodo,
  PanelLeft,
  PanelRight,
  Settings,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import SidebarSection from "./sidebar-section";
import SidebarItem from "./sidebar-item";
import { usePathname } from "next/navigation";
import UserProfile from "./user-profile";

const navigation = {
  quicklinks: [
    {
      id: "analytics",
      title: "Analytics",
      icon: ChartPie,
      path: "/dashboard/analytics",
    },
    {
      id: "settings",
      title: "Settings",
      icon: Settings,
      path: "/dashboard/usersetting",
    },
    {
      id: "Help",
      title: "Help",
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
      id: "goals-list",
      title: "Goals List",
      icon: GoalIcon,
      path: "/dashboard/goals",
    },
    {
      id: "tasks0",
      title: "Tasks",
      icon: ListTodo,
      path: "/dashboard/tasks",
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
      className={`relative h-screen flex flex-col p-2 border-r border-gray-200 dark:border-gray-800  transition-all duration-200 ease-in-out  ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between ">
          {!isCollapsed && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <Box size={20} />
              <span className="text-lg font-semibold">BuildxSkill</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between  ">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200  rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors "
          >
            {isCollapsed ? <PanelRight size={20} /> : <PanelLeft size={20} />}
          </button>
        </div>
      </div>
      {/* sidebar menu items */}

      <div className="flex-1">
        <SidebarSection title="Main Menu" isCollapsed={isCollapsed}>
          {navigation.mainMenu.map((item) => (
            <SidebarItem
              href={item.path}
              key={item.id}
              label={item.title}
              icon={<item.icon size={16} />}
              isActive={isActive(item.path)}
              isCollapsed={isCollapsed}
            />
          ))}
        </SidebarSection>

        <SidebarSection title="Quick Links" isCollapsed={isCollapsed}>
          {navigation.quicklinks.map((item) => (
            <SidebarItem
              href={item.path}
              key={item.id}
              label={item.title}
              icon={<item.icon size={16} />}
              isActive={isActive(item.path)}
              isCollapsed={isCollapsed}
            />
          ))}
        </SidebarSection>
      </div>

      <UserProfile />

      {/* Upgrade to Pro Button */}
      <button
        className={`mt-4 w-full relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-md shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-300
            ${
              isCollapsed
                ? "p-2 aspect-square flex items-center justify-center"
                : "py-2 px-4"
            }`}
      >
        <div className="absolute inset-0 bg-white/20 group-hover:bg-white/10 transition-colors" />
        <div
          className={`relative flex items-center ${
            isCollapsed ? "justify-center" : "justify-center gap-2.5"
          }`}
        >
          <Sparkles
            className={`text-yellow-200 ${isCollapsed ? "w-4 h-4" : "w-4 h-4"}`}
          />
          {!isCollapsed && (
            <div className="text-left">
              <span className="block text-sm font-bold leading-none">
                Upgrade to Pro
              </span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
