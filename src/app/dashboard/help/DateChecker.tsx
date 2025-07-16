"use client"
import React, { useState } from 'react';

export default function DateChecker() {
  const [currentDateTime, setCurrentDateTime] = useState<string | null>(null);

  const handleShowDate = () => {
    const now = new Date();
    setCurrentDateTime(now.toLocaleString());
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-8">
      <button
        className="px-6 py-3 bg-indigo-600 text-white dark:bg-indigo-500 dark:text-gray-100 rounded-lg shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-300 transition-colors duration-200 font-semibold text-lg"
        onClick={handleShowDate}
        aria-label="Show current date and time"
        type="button"
      >
        Show Date & Time
      </button>
      {currentDateTime && (
        <div className="w-full max-w-xs bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 flex items-center justify-center mt-2 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-900 dark:text-gray-100 text-center text-base font-medium" aria-live="polite">
            {currentDateTime}
          </p>
        </div>
      )}
    </div>
  );
}
