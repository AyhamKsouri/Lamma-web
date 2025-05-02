// src/pages/LoginPage.tsx
import React, { useState } from 'react'
import AuthBackground from '@/components/AuthBackground'
import EventInfoCard from '@/components/EventInfoCard'
import LoginForm from '@/components/LoginForm'
import SignupForm from '@/components/SignupForm'

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const toggleForm = () => setIsLogin(prev => !prev)

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background text-foreground">
      {/* 1) Background animations */}
      <AuthBackground />

      {/* 2) Centered content (forms + feature card) */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        {/* Left side on desktop */}
        <div className="hidden md:flex items-center justify-center">
          <EventInfoCard />
        </div>

        {/* Login / Signup form */}
        <div className="flex items-center justify-center">
          {isLogin
            ? <LoginForm  onToggleForm={toggleForm} />
            : <SignupForm onToggleForm={toggleForm} />
          }
        </div>

        {/* On mobile, show feature card below form */}
        <div className="md:hidden flex items-center justify-center mt-8">
          <EventInfoCard />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
