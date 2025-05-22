import React from 'react';

const AuthBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
      <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-300"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-500"></div>
      
      {/* Smaller particles */}
      <div className="absolute top-[20%] left-[15%] w-8 h-8 bg-yellow-400 rounded-full opacity-60 animate-pulse-subtle animation-delay-400"></div>
      <div className="absolute top-[70%] left-[80%] w-12 h-12 bg-green-400 rounded-full opacity-50 animate-float animation-delay-700"></div>
      <div className="absolute top-[50%] left-[10%] w-10 h-10 bg-blue-400 rounded-full opacity-40 animate-bounce-soft animation-delay-200"></div>
      <div className="absolute top-[10%] left-[60%] w-6 h-6 bg-red-400 rounded-full opacity-60 animate-pulse-subtle animation-delay-200"></div>
      <div className="absolute top-[30%] left-[90%] w-8 h-8 bg-purple-300 rounded-full opacity-50 animate-bounce-soft animation-delay-150"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-24 h-24 border-2 border-purple-300 rounded-full opacity-20 animate-spin-slow"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 border-2 border-indigo-300 rounded-full opacity-20 animate-spin-slow"></div>
      <div className="absolute bottom-40 left-40 w-48 h-48 border border-pink-300 rounded-full opacity-10 animate-spin-slow animation-delay-300"></div>
      <div className="absolute top-32 right-48 w-16 h-16 border border-yellow-300 rounded-full opacity-20 animate-spin-slow animation-delay-700"></div>
      
      {/* Moving gradient line */}
      <div className="absolute w-[200%] h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent top-1/3 -left-1/2 opacity-30 animate-slide-right"></div>
      <div className="absolute w-[200%] h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent bottom-1/3 -left-1/2 opacity-30 animate-slide-right animation-delay-300"></div>
      
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30"></div>
    </div>
  );
};

export default AuthBackground;