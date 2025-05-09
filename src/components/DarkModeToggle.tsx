import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has a preference stored in localStorage
    const storedPreference = localStorage.getItem('eventglow_theme');
    
    // Check system preference as fallback
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial state based on localStorage or system preference
    setIsDarkMode(storedPreference === 'dark' || (!storedPreference && systemPrefersDark));
    
    // Apply theme to document
    applyTheme(storedPreference === 'dark' || (!storedPreference && systemPrefersDark));
  }, []);

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    applyTheme(newMode);
    localStorage.setItem('eventglow_theme', newMode ? 'dark' : 'light');
  };

  return (
    <Button
      onClick={toggleDarkMode}
      variant="ghost"
      className={`
        fixed right-6 top-6 z-50
        flex items-center justify-center
        w-12 h-12 rounded-full 
        overflow-hidden
        bg-white/10 backdrop-blur-xl
        shadow-lg hover:shadow-xl
        border border-white/20
        transition-all duration-500
        ${isAnimating ? 'scale-110' : ''}
      `}
      aria-label="Toggle dark mode"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun Icon */}
        <div 
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-500
            ${isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}
          `}
        >
          <div className="w-5 h-5 bg-amber-300 rounded-full" />
        </div>
        
        {/* Moon Icon */}
        <div 
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-500
            ${!isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}
          `}
        >
          <div className="w-5 h-5 bg-indigo-100 rounded-full shadow-inner overflow-hidden">
            <div className="w-3 h-3 bg-indigo-900/70 rounded-full translate-x-1 -translate-y-1" />
          </div>
        </div>
        
        {/* Stars - only visible in dark mode */}
        <div 
          className={`
            absolute top-2 right-2 w-1 h-1 bg-white rounded-full
            transition-all duration-500 delay-100
            ${isDarkMode ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
          `}
        />
        <div 
          className={`
            absolute bottom-2 left-2 w-1 h-1 bg-white rounded-full
            transition-all duration-500 delay-200
            ${isDarkMode ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
          `}
        />
        <div 
          className={`
            absolute top-3 left-3 w-0.5 h-0.5 bg-white rounded-full
            transition-all duration-500 delay-150
            ${isDarkMode ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
          `}
        />
      </div>
      <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
    </Button>
  );
};

export default DarkModeToggle;
