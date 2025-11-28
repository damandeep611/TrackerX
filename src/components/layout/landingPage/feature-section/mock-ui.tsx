"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Folder,  MoreHorizontal, Check, FileText, Image as ImageIcon, Video, } from 'lucide-react';

/* --- Quick Search Mock UI --- */
export const SearchMock: React.FC = () => {
  return (
    <div className="w-full max-w-[280px] flex flex-col gap-4 translate-y-4">
      {/* Search Input */}
      <motion.div 
        className="bg-gray-100 rounded-2xl p-4 flex items-center shadow-lg"
        whileHover={{ scale: 1.02 }}
      >
        <Search className="w-5 h-5 text-gray-400 mr-3" />
        <div className="flex-1 flex items-center">
          <span className="text-gray-500 font-medium">Search</span>
          <motion.div 
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-0.5 h-5 bg-gray-900 ml-1"
          />
        </div>
      </motion.div>

      {/* Result Card 1 */}
      <motion.div 
        className="bg-white rounded-2xl p-4 shadow-xl flex flex-col gap-2 relative overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-gray-900 text-sm">How i replaced my 9-5</h4>
          <Star className="w-4 h-4 text-gray-300" />
        </div>
        <div className="flex items-center text-xs text-gray-400 gap-2 mb-1">
          <Video className="w-3 h-3" />
          <span>Aug 5 · 25min, 35 sec</span>
        </div>
         <div className="flex justify-between items-end mt-2">
            <Folder className="w-3 h-3 text-gray-400" />
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
         </div>
      </motion.div>

      {/* Result Card 2 */}
      <motion.div 
        className="bg-white rounded-2xl p-4 shadow-xl flex flex-col gap-2 relative overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
         <div className="flex justify-between items-start">
          <h4 className="font-bold text-gray-900 text-sm">Profitability Evaluation</h4>
          <Star className="w-4 h-4 text-gray-300" />
        </div>
        <div className="flex items-center text-xs text-gray-400 gap-2">
          <FileText className="w-3 h-3" />
          <span>Aug 5 · 75min, 35 sec</span>
        </div>
      </motion.div>
    </div>
  );
};

/* --- Easy Bookmarks Mock UI --- */
export const BookmarkMock: React.FC = () => {
  return (
    <div className="w-full flex justify-center items-center pt-8 relative">
        {/* Main Card */}
        <motion.div 
            className="bg-white rounded-2xl p-5 shadow-2xl w-[260px] relative z-10"
            whileHover={{ y: -5, rotate: -1 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Nike Revenue Decline</h4>
                    <div className="flex items-center text-xs text-gray-400 gap-1">
                        <Video className="w-3 h-3" />
                        <span>Nov 5 · 14min, 21 sec</span>
                    </div>
                </div>
                {/* Large Star Icon */}
                <motion.div
                    className="bg-yellow-100 p-2 rounded-full"
                    whileHover={{ scale: 1.1, rotate: 180 }}
                >
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </motion.div>
            </div>
            
            <div className="mt-6 flex justify-between items-center text-gray-400">
                <Folder className="w-4 h-4" />
                <MoreHorizontal className="w-4 h-4" />
            </div>
        </motion.div>

        {/* Stacked Cards Effect */}
        <div className="absolute top-[3.5rem] w-[240px] h-[100px] bg-white/50 rounded-2xl z-0 scale-95" />
        <div className="absolute top-[4rem] w-[220px] h-[100px] bg-white/20 rounded-2xl z-[-1] scale-90" />
    </div>
  );
};

/* --- Folders & Tags Mock UI --- */
export const FolderMock: React.FC = () => {
  return (
    <div className="w-full relative h-full">
        {/* Folder Modal */}
        <motion.div 
            className="absolute top-4 left-[-20px] bg-white rounded-2xl p-4 shadow-xl w-[240px] z-10 rotate-[-4deg]"
            whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }}
        >
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assign a Folder</span>
                <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">+ New</span>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center group cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <div className="flex items-center gap-2">
                         <div className="w-1 h-3 bg-blue-400 rounded-full" />
                         <span className="text-sm font-semibold text-gray-700">Lectures</span>
                    </div>
                    <span className="text-gray-400 text-lg">+</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-1 rounded cursor-pointer">
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-blue-500" />
                         <span className="text-sm font-semibold text-gray-900">Interviews</span>
                    </div>
                    <Check className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex justify-between items-center group cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-red-500" />
                         <span className="text-sm font-semibold text-gray-700">Discussions</span>
                    </div>
                     <span className="text-gray-400 text-xs hidden group-hover:block">Edit</span>
                </div>
            </div>
        </motion.div>

        {/* Tags Modal */}
        <motion.div 
            className="absolute top-[160px] right-[-10px] bg-white rounded-2xl p-4 shadow-xl w-[220px] z-20 rotate-[2deg]"
            whileHover={{ rotate: 0, scale: 1.05 }}
        >
             <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Manage Tags</span>
                <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">+ New</span>
            </div>
             <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-md"># meetings</span>
                </div>
                 <div className="flex items-center justify-between">
                    <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-md"># actionitems</span>
                    <Check className="w-3 h-3 text-orange-500" />
                </div>
             </div>
        </motion.div>
    </div>
  );
};

/* --- Filters & Sorting Mock UI --- */
export const FilterMock: React.FC = () => {
  return (
    <div className="w-full flex justify-center pt-8">
      <div className="bg-white rounded-t-3xl shadow-2xl w-[260px] overflow-hidden min-h-[300px] relative">
         {/* Header */}
         <div className="p-4 border-b border-gray-100 text-center">
            <h4 className="text-sm font-bold text-gray-900">Sort By</h4>
         </div>

         {/* Sort Options */}
         <div className="p-2 space-y-1">
            <div className="px-4 py-2 text-xs text-gray-400 font-medium">Sort by Date</div>
            <motion.div 
                className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl cursor-pointer"
                whileHover={{ scale: 0.98 }}
            >
                <span className="text-sm font-bold text-gray-900">Newest First</span>
                <Check className="w-4 h-4 text-orange-500" />
            </motion.div>
             <div className="px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-600">Oldest First</span>
            </div>
         </div>

         <div className="w-full h-px bg-gray-100 my-1" />

         {/* Filter Options */}
          <div className="p-2 space-y-1 pb-8">
            <div className="px-4 py-2 text-xs text-gray-400 font-medium">Filter by Note type</div>
             <div className="px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-xl">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">Text Note</span>
            </div>
             <div className="px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-xl">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">Image Upload</span>
            </div>
         </div>
      </div>
    </div>
  );
};