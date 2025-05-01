import React from 'react';
import AuthBackground from '@/components/AuthBackground';
import EventInfoCard from '@/components/EventInfoCard';
import LoginForm from '@/components/LoginForm';

const LoginPage: React.FC = () => {
  const noop = () => {};

  return (
    <div className="min-h-screen relative w-full flex items-center justify-center p-4">
      <AuthBackground />

      <div className="z-10 w-full max-w-6xl mx-auto layout-split items-center gap-8">
        {/* Left panel (desktop) */}
        <div className="hidden md:flex justify-center animate-slide-in-right">
          <EventInfoCard />
        </div>

        {/* Login form */}
        <div className="flex justify-center animate-slide-in-right animation-delay-200">
          <LoginForm onToggleForm={noop} />
        </div>

        {/* Left panel (mobile) */}
        <div className="md:hidden flex justify-center mt-8 animate-slide-in-right animation-delay-400">
          <EventInfoCard />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
