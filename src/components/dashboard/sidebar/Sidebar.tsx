"use client";
import {
  ChartPie,
  ChevronLeftIcon,
  ChevronRightIcon,
  GoalIcon,
  HelpCircle,
  House,
  ListTodo,
  Settings,
} from "lucide-react";
import { useState } from "react";

import SidebarSection from "./sidebar-section";
import SidebarItem from "./sidebar-item";
import { usePathname } from "next/navigation";
import { ModeToggle } from "../../layout/mode-toggle";
import SidebarProfile from "./SidebarProfile";

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
      className={`relative h-screen flex flex-col bg-[#F5F5F5] dark:bg-zinc-900  transition-all duration-200 ease-in-out  ${
        isCollapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="flex items-center justify-between  p-4">
        <div className={`flex items-center justify-between gap-2`}>
          {!isCollapsed && (
            <div className="flex items-center">
              <SidebarProfile />
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-5 bg-white text-black hover:bg-black hover:text-white p-1 border border-gray-200 rounded-full"
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
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
      {/* Sidebar Projects Section */}
      <div className="p-4 flex items-center justify-end ">
        <span className="">
          <ModeToggle />
        </span>
      </div>
    </div>
  );
}
