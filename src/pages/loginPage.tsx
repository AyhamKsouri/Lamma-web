import React, { useState } from 'react'
import AuthBackground from '@/components/AuthBackground'
import EventInfoCard from '@/components/EventInfoCard'
import LoginForm from '@/components/LoginForm'
import SignupForm from '@/components/SignupForm'
import { motion, AnimatePresence } from 'framer-motion'

const LoginPage: React.FC = () => {
  // ✅ This was missing
  const [isLogin, setIsLogin] = useState(true)

  const toggleForm = () => setIsLogin(prev => !prev)

  return (
    <div className="min-h-screen relative w-full flex items-center justify-center p-4 transition-colors duration-300 text-foreground">
      <AuthBackground />

      {/* Main Content */}
      <div className="w-full max-w-6xl z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Panel - Desktop Only */}
        <div className="hidden md:flex justify-center">
          <EventInfoCard />
        </div>

        {/* Right Panel - Auth Form */}
        <div className="flex justify-center relative min-h-[600px] w-full">
          <AnimatePresence mode="wait" initial={false}>
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute w-full"
              >
                <LoginForm onToggleForm={toggleForm} />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute w-full"
              >
                <SignupForm onToggleForm={toggleForm} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Info Card */}
        <div className="md:hidden flex justify-center mt-8">
          <EventInfoCard />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 dark:text-gray-400 opacity-70">
        &copy; 2025 Lamma. All rights reserved.
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-400 dark:from-purple-600 dark:to-indigo-600 rounded-full opacity-30 animate-float" />
      <div className="absolute bottom-12 left-12 w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 dark:from-pink-600 dark:to-purple-600 rounded-full opacity-30 animate-float animation-delay-300" />
    </div>
  )
}

export default LoginPage
