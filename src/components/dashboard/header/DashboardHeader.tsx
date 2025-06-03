"use client";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { authClient } from "@/lib/auth-client";
import { Search } from "lucide-react";
import React from "react";
import { IoNotifications } from "react-icons/io5";
import UserProfile from "../sidebar/user-profile";

export default function DashboardHeader() {
  const { data } = authClient.useSession();
  return (
    <div className="p-4">
      {/* header container */}
      <div className="flex items-center justify-between border-b-2 border-gray-200">
        <div className="flex items-center justify-between ">
          <div>
            <h3 className="text-2xl font-bold">Dashboard</h3>
            <span className="text-sm font-medium text-gray-500">
              3 June 2025
            </span>
          </div>
          <div className=" relative flex items-center justify-center ml-16">
            <input
              type="text"
              placeholder="Ask Ai"
              className=" p-2  px-10 outline-1 outline-border rounded-2xl"
            />
            <span className=" absolute left-1 text-gray-400">
              <Search />
            </span>
          </div>
        </div>
        {/* right header content */}
        <div className="flex items-center justify-between space-x-16">
          <div>
            <ModeToggle />
          </div>
          <div>
            <IoNotifications />
          </div>
          <div>
            <UserProfile
              name={data?.user.name || ""}
              email={data?.user.email || ""}
              avatarUrl={data?.user.image || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
