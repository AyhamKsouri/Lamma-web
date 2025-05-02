import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Facebook as FacebookIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input'; // Add this import
import { Label } from '@/components/ui/label'

interface LoginFormProps {
  onToggleForm: () => void;
}

export default function LoginForm({ onToggleForm }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6 relative z-10">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="bg-purple-600 rounded-full p-4">
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
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="pl-10"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground bg-transparent hover:bg-transparent focus:bg-transparent"
                aria-label="Toggle password visibility"
              >
                {showPassword
                  ? <EyeOff className="h-5 w-5" />
                  : <Eye    className="h-5 w-5" />}
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
            className="text-purple-600 hover:underline bg-transparent hover:bg-transparent focus:bg-transparent p-0 focus:outline-none"
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
      <div className="flex items-center my-4">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="px-3 text-xs uppercase text-gray-500 bg-white">
          Or continue with
        </span>
        <hr className="flex-grow border-t border-gray-300" />
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
        Don't have an account?{' '}
        <button
          onClick={onToggleForm}
          className="text-purple-600 hover:underline bg-transparent hover:bg-transparent focus:bg-transparent p-0 focus:outline-none"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}