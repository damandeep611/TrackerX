import React from 'react';


const NumberSkeleton = ({ 
  width = 'w-32', 
  height = 'h-8', 
  className = '', 
  showAccents = true,
  rounded = 'rounded-lg'
}) => {
  return (
    <div className={`inline-block relative ${className}`}>
      {/* Main skeleton with gradient shimmer */}
      <div className={`relative ${height} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 ${rounded} ${width} overflow-hidden`}>
        {/* Animated shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10 animate-shimmer"></div>
        
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent dark:via-gray-500/30 animate-pulse"></div>
      </div>
      
      {/* Optional accent lines */}
      {showAccents && (
        <>
          <div className="absolute top-1 left-2 w-4 h-1 bg-gray-300 dark:bg-gray-600 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute top-4 left-2 w-6 h-1 bg-gray-300 dark:bg-gray-600 rounded-full opacity-30 animate-pulse delay-300"></div>
          <div className="absolute top-1 right-2 w-3 h-1 bg-gray-300 dark:bg-gray-600 rounded-full opacity-30 animate-pulse delay-150"></div>
        </>
      )}
      
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
      {/* usage example incase  */}
      
          {/* <div>{'<NumberSkeleton width="w-24" height="h-6" />'}</div>
          <div>{'<NumberSkeleton showAccents={false} />'} </div>
          <div>{'<NumberSkeleton className="mb-2" />'} </div>
          <div>{'<NumberSkeleton rounded="rounded-full" />'}</div> */}
    </div>
  );
};

export default NumberSkeleton;