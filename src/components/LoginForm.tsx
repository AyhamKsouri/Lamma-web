// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, Facebook as FacebookIcon } from 'lucide-react';

interface LoginFormProps {
  onToggleForm: () => void;
}

export default function LoginForm({ onToggleForm }: LoginFormProps) {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6 relative z-10">
      {/* Logo/Icon */}
      <div className="flex justify-center">
        <div className="bg-purple-600 rounded-full p-4">
          {/* static logo/icon */}
          <EyeOff className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Heading */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-purple-600">Welcome Back</h2>
        <p className="text-gray-500">Sign in to your Lamma account</p>
      </div>

      {/* Form */}
      <form className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-purple-600 focus:ring-0"
          />
        </div>

        {/* Password with inline toggle */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:border-purple-600 focus:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label="Toggle password visibility"
              className="absolute inset-y-0 right-0 flex items-center pr-3 bg-transparent focus:outline-none cursor-pointer text-gray-400 hover:text-gray-600"
            >
              {showPassword
                ? <EyeOff className="w-5 h-5" />
                : <Eye    className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="w-4 h-4 text-purple-600 border-gray-300 rounded" />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => {/* handle forgot */}}
            className="text-purple-600 hover:underline bg-transparent p-0 focus:outline-none"
          >
            Forgot password?
          </button>
        </div>

        {/* Sign In */}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition-opacity hover:opacity-90"
        >
          Sign In
        </button>
      </form>

      {/* Divider */}
      <div className="relative text-xs text-gray-500 uppercase text-center my-4">
        <span className="bg-white px-2">Or continue with</span>
        <div className="absolute inset-y-0 w-full top-1/2    border-t border-gray-200" />
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center border border-gray-300 rounded-lg py-2 space-x-2 hover:bg-gray-50 transition"
        >
          <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
          <span>Google</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center border border-gray-300 rounded-lg py-2 space-x-2 hover:bg-gray-50 transition"
        >
          <FacebookIcon className="w-5 h-5 text-blue-600" />
          <span>Facebook</span>
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Don’t have an account?{' '}
        <button
          onClick={onToggleForm}
          className="text-purple-600 hover:underline bg-transparent focus:outline-none"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}
