import React, { FC, useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useUser } from '../contexts/UserContext';

// Temporary user data until UserContext is implemented
const mockUser = {
  name: 'John Doe',
  avatarUrl: '/images/profle-pic.png',
};

const Layout: FC = () => {
  const {user} = useUser() || mockUser; // Use UserContext or fallback to mock user
  <img src={user.avatarUrl} alt={`${user.name}'s avatar`}
  className="w-[60px] h-[60px] rounded-full object-cover border-2 border-indigo-500"

  />  
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply theme to <html>
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Lamma
          </Link>
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle dark mode"
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring transition-transform hover:scale-110"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Profile avatar */}
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={`${user.name}'s avatar`}
                className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500"
              />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;