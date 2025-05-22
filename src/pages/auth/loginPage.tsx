import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/common/LoginForm';
import SignupForm from '@/components/common/SignupForm';
import EventInfoCard from '@/components/user/EventInfoCard';
import AuthBackground from '@/components/user/AuthBackground';
import DarkModeToggle from '@/components/user/DarkModeToggle';
import '@/styles/auth.css';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedForm, setDisplayedForm] = useState<'login' | 'signup'>('login');

  const toggleForm = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // First animate out the current form
    setTimeout(() => {
      setDisplayedForm(isLogin ? 'signup' : 'login');
      setIsLogin(!isLogin);
      
      // Then allow animations again after the transition
      setTimeout(() => {
        setIsAnimating(false);
      }, 600); // Match animation duration
    }, 300); // Half the animation duration for the exit
  };

  return (
    <div className="min-h-screen relative w-full flex items-center justify-center p-4 transition-colors duration-300">
      <AuthBackground />
      <DarkModeToggle />
      
      {/* Main Content */}
      <div className="w-full max-w-6xl z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Event Info - Hidden on small screens */}
        <div className="hidden md:flex justify-center">
          <EventInfoCard />
        </div>
        
        {/* Auth Form */}
        <div className="flex justify-center relative h-[600px]">
          <div className={`absolute w-full transition-all duration-300 ${isAnimating ? (isLogin ? 'animate-slide-out-right opacity-0' : 'animate-slide-in-right') : ''}`} 
               style={{ display: displayedForm === 'login' ? 'block' : 'none' }}>
            <LoginForm onToggleForm={toggleForm} />
          </div>
          
          <div className={`absolute w-full transition-all duration-300 ${isAnimating ? (isLogin ? 'animate-slide-in-right' : 'animate-slide-out-right opacity-0') : ''}`} 
               style={{ display: displayedForm === 'signup' ? 'block' : 'none' }}>
            <SignupForm onToggleForm={toggleForm} />
          </div>
        </div>
        
        {/* Event Info - Shown on small screens */}
        <div className="md:hidden flex justify-center mt-8">
          <EventInfoCard />
        </div>
      </div>
      
      {/* Floating Decorative Elements */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400 opacity-70">
        &copy; 2025 Lamma. All rights reserved.
      </div>
      
      {/* Animated Elements */}
      <div className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-400 dark:from-purple-600 dark:to-indigo-600 rounded-full opacity-30 animate-float"></div>
      <div className="absolute bottom-12 left-12 w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 dark:from-pink-600 dark:to-purple-600 rounded-full opacity-30 animate-float animation-delay-300"></div>
    </div>
  );
};

export default Auth;
