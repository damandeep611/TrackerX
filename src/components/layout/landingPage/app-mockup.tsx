"use client"

import React from 'react'
import { 
  BookOpen, 
  Layout, 
  Calendar, 
  Settings, 
  Search, 
  Bell, 
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Clock,
  Plus,
  LucideIcon
} from 'lucide-react';


interface SidebarItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { icon: Layout, label: 'Dashboard', active: true },
  { icon: BookOpen, label: 'My Courses' },
  { icon: Calendar, label: 'Schedule' },
  { icon: Settings, label: 'Settings' },
];



export default function AppMockup() {
  return (
    <div className="w-full h-full bg-[#F7F7F8] flex flex-col rounded-xl overflow-hidden font-sans text-gray-800">
      {/* Window Header */}
      <div className="h-10 bg-[#F7F7F8] border-b border-gray-200 flex items-center px-4 justify-between shrink-0">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]"></div>
          <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
        </div>
        <div className="flex gap-4 text-gray-400">
             <div className="w-4 h-4 rounded border border-gray-300"></div>
        </div>
      </div>

      {/* App Body */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 bg-[#F7F7F8]  flex-col p-3 border-r border-gray-200 hidden md:flex">
          <button className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-200 rounded-md mb-6 transition-colors">
            <div className="w-5 h-5 rounded bg-gray-300 flex items-center justify-center text-[10px] font-bold text-white">L</div>
            <span className="text-sm font-medium text-gray-700">Learner&apos;s Space</span>
            <ChevronRight size={14} className="ml-auto opacity-50" />
          </button>

          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <button 
                key={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.active 
                    ? 'bg-gray-200 text-gray-900' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Folders</h3>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-md text-sm">
                <span className="opacity-70">📁</span> Projects
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-md text-sm">
                <span className="opacity-70">📝</span> Notes
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white flex flex-col overflow-hidden relative">
          
          {/* Top Bar inside Content */}
          <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
                    <Plus size={20} />
                </button>
                <div className="h-4 w-[1px] bg-gray-200 mx-2"></div>
                <h1 className="font-semibold text-lg">All Courses</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 w-48 transition-all"
                />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Bell size={18} />
              </button>
               <img src="https://picsum.photos/100/100" alt="Profile" className="w-7 h-7 rounded-full border border-gray-200" />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto mockup-scroll p-6 md:p-8">
            
            {/* Hero Card inside Mockup */}
            <div className="w-full bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 mb-8 border border-blue-100/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Continue Learning</h2>
                    <p className="text-sm text-gray-500">You have 2 assignments due this week.</p>
                </div>
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                            <img src={`https://picsum.photos/10${i}/10${i}`} alt="User" />
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">+4</div>
                </div>
            </div>

            {/* Grid of Courses */}
    
              
               
               {/* Add New Card */}
               <div className="p-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px]">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Explore New Courses</span>
               </div>
         

            {/* Schedule Section */}
            <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Up Next</h3>
                <div className="space-y-3">
                    <div className="flex items-center p-3 rounded-lg border border-gray-100 bg-white hover:border-blue-200 transition-colors">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-md mr-4">
                            <PlayCircle size={18} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900">Advanced React Patterns</h4>
                            <p className="text-xs text-gray-500">Lecture 4 • 14:00 PM</p>
                        </div>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">Live</span>
                    </div>
                    <div className="flex items-center p-3 rounded-lg border border-gray-100 bg-white hover:border-green-200 transition-colors">
                         <div className="p-2 bg-green-50 text-green-600 rounded-md mr-4">
                            <CheckCircle2 size={18} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900">Submit Final Project</h4>
                            <p className="text-xs text-gray-500">UX Design • Tomorrow</p>
                        </div>
                         <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            <span>1d left</span>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </main>
      </div>
    </div>  
  )
}
