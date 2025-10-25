
import React from 'react';

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500 dark:border-blue-400"></div>
      <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
