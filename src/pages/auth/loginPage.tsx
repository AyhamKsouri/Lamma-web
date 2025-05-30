import React, { useState } from 'react';
import LoginForm from '@/components/common/LoginForm';
import SignupForm from '@/components/common/SignupForm';
import ForgotPasswordForm from '@/components/common/ForgotPasswordForm';
import EventInfoCard from '@/components/user/EventInfoCard';
import AuthBackground from '@/components/user/AuthBackground';
import DarkModeToggle from '@/components/user/DarkModeToggle';
import '@/styles/auth.css';

const Auth: React.FC = () => {
  const [displayedForm, setDisplayedForm] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTransition = (nextForm: 'login' | 'signup' | 'forgot') => {
    if (isAnimating || displayedForm === nextForm) return;
    setIsAnimating(true);
    setTimeout(() => {
      setDisplayedForm(nextForm);
      setTimeout(() => setIsAnimating(false), 600); // match animation time
    }, 300); // transition delay
  };

  return (
    <div className="min-h-screen relative w-full flex items-center justify-center p-4 transition-colors duration-300">
      <AuthBackground />
      <DarkModeToggle />

      <div className="w-full max-w-6xl z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Event Info - Left Panel */}
        <div className="hidden md:flex justify-center">
          <EventInfoCard />
        </div>

        {/* Animated Auth Forms */}
        <div className="flex justify-center relative h-[600px] w-full">
          {/* Login Form */}
          <div
            className={`absolute w-full transition-all duration-300 ${
              isAnimating && displayedForm !== 'login'
                ? 'animate-slide-out-right opacity-0'
                : displayedForm === 'login'
                ? 'animate-slide-in-right'
                : 'hidden'
            }`}
          >
            <LoginForm
              onToggleForm={() => handleTransition('signup')}
              onForgotPassword={() => handleTransition('forgot')}
            />
          </div>

          {/* Signup Form */}
          <div
            className={`absolute w-full transition-all duration-300 ${
              isAnimating && displayedForm !== 'signup'
                ? 'animate-slide-out-right opacity-0'
                : displayedForm === 'signup'
                ? 'animate-slide-in-right'
                : 'hidden'
            }`}
          >
            <SignupForm onToggleForm={() => handleTransition('login')} />
          </div>

          {/* Forgot Password Form */}
          <div
            className={`absolute w-full transition-all duration-300 ${
              isAnimating && displayedForm !== 'forgot'
                ? 'animate-slide-out-right opacity-0'
                : displayedForm === 'forgot'
                ? 'animate-slide-in-right'
                : 'hidden'
            }`}
          >
            <ForgotPasswordForm onBackToLogin={() => handleTransition('login')} />
          </div>
        </div>

        {/* Event Info - Mobile */}
        <div className="md:hidden flex justify-center mt-8">
          <EventInfoCard />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400 opacity-70">
        &copy; 2025 Lamma. All rights reserved.
      </div>
      <div className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-400 dark:from-purple-600 dark:to-indigo-600 rounded-full opacity-30 animate-float"></div>
      <div className="absolute bottom-12 left-12 w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 dark:from-pink-600 dark:to-purple-600 rounded-full opacity-30 animate-float animation-delay-300"></div>
    </div>
  );
};

export default Auth;
