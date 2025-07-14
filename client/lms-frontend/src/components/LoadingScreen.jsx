import React from 'react';
import { Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const LoadingScreen = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`fixed inset-0 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'} flex items-center justify-center z-50`}>
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Shield className="w-10 h-10 text-teal-400" />
          </div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto"></div>
        </div>

        {/* Loading Text */}
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          phish <span className="text-teal-400">defense.</span>
        </h2>
        
        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-4`}>Loading your security dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;