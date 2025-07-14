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
    <div className="">
      <div className="flex items-center justify-between p-3 px-6 dark:bg-zinc-900">
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
                  <ChartLine size={15} />
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
              placeholder="AI powered search soon...."
              className="pl-12 pr-6 py-2 w-80 border rounded-lg"
            />
          </div>

          <button className="p-3 ">
            <InfoIcon />
          </button>
        </div>
      </div>
      <DataOverviewCards />
    </div>
  );
}
