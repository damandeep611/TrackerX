"use client";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { FcIdea } from "react-icons/fc";
import { MdDashboard } from "react-icons/md";
import { LiaTasksSolid } from "react-icons/lia";

import SidebarSection from "./sidebar/sidebar-section";
import SidebarItem from "./sidebar/sidebar-item";
import { SignOutButton } from "../auth/sign-out";




const navigation = {
  quicklinks: [
    {
      id: "tech-docs",
      title: "Technical Docs",
      icon: IoDocumentAttachOutline,
      path: "/docs",
    },
    {
      id: "ideas-snap",
      title: "Idea Capture",
      icon: FcIdea,
      path: "/ideas",
    },
  ],
  mainMenu: [
    {id: "dashboard-main", title: "Dashboard", icon: MdDashboard, path: "/dashboard"},
    {id: "todo-manager", title: "Todos", icon: LiaTasksSolid, path: "/dashboard/tasks"},
    {id: "bookmark", title: "BookMarks", icon: LiaTasksSolid, path: "/dashboard/bookmarks"}
  ]
};



export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div
      className={`relative h-screen bg-[#1a1a1a] border-r border-gray-800 transition-all duration-200 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <div className={`flex items-center `}>
          <div className="w-8 h-8 rounded-md bg-green-600" />
          {!isCollapsed && (
            <span className="ml-2 font-semibold">Dashboard</span>
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
    
        <SidebarSection title="Main Menu">
          {navigation.mainMenu.map((item)=> (
            <SidebarItem href={item.path} key={item.id} label={item.title} icon={<item.icon/>}/>
          ))}
        </SidebarSection>
        {/* Sidebar Projects Section */}
      
      <SignOutButton/>
     
    </div>
  );
}
