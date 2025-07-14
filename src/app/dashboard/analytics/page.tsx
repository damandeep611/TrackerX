import AnalyticsHeader from "@/components/dashboard/analytics-components/AnalyticsHeader";
import { Brain, Clock, Sparkles, TrendingUp } from "lucide-react";
import React from "react";

export default function Page() {
  return (
    <div className="">
      <div>
        <AnalyticsHeader />
      </div>
      <div className="w-full py-12 px-4">
        <div className="relative w-full bg-gradient-to-r from-zinc-800/50 via-zinc-700/30 to-zinc-800/50 border-2 border-dashed border-zinc-600 rounded-xl p-8 text-center overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-12 h-12 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="absolute top-8 right-8 w-8 h-8 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="absolute bottom-6 left-12 w-6 h-6 bg-indigo-500 rounded-full animate-ping"></div>
            <div className="absolute bottom-4 right-16 w-10 h-10 bg-blue-400 rounded-full animate-pulse"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI-Powered Features
              </span>
            </h2>

            {/* Description */}
            <p className="text-lg text-zinc-300 mb-6 max-w-2xl mx-auto">
              Get ready for intelligent feedback analysis and comprehensive
              timeline tracking
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-blue-900/40 text-blue-300 rounded-full text-sm font-medium border border-blue-700/50">
                <Brain className="w-4 h-4 mr-2" />
                AI Feedback Analysis
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-purple-900/40 text-purple-300 rounded-full text-sm font-medium border border-purple-700/50">
                <Clock className="w-4 h-4 mr-2" />
                Timeline History
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-indigo-900/40 text-indigo-300 rounded-full text-sm font-medium border border-indigo-700/50">
                <TrendingUp className="w-4 h-4 mr-2" />
                Smart Insights
              </span>
            </div>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white mr-2 animate-pulse" />
              <span className="text-white font-semibold">Coming Soon</span>
            </div>

            {/* Subtle Animation Indicator */}
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
