
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                StyleFit
            </h1>
            <p className="mt-1 text-md text-gray-500">
                Your Personal AI-Powered Virtual Dressing Room
            </p>
        </div>
      </div>
    </header>
  );
};
