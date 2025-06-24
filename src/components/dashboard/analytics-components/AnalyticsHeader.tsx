"use client"
import { ChartLine,  House, InfoIcon, Search } from 'lucide-react'
import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import DataOverviewCards from './DataOverviewCards'

export default function AnalyticsHeader() {
  return (
    <div>
      <div className='flex items-center justify-between p-2 px-4'>
      <div>
       <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                className="flex items-center justify-center gap-2"
              >
             
                <House size={15} /> Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center justify-center gap-2">
              
               <ChartLine size={15}/>
                Analytics
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
     <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Ask AI for better feedback on habits"
            className="pl-12 pr-6 py-2 w-80 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-lg"
          />
        </div>

        <button className="p-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
         <InfoIcon/>
        </button>
      </div>
    </div>
    <DataOverviewCards/>
    </div>
  )
}
