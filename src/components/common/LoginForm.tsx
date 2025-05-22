import React, { useState, useContext } from 'react';

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Facebook as FacebookIcon,
} from 'lucide-react';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';

interface LoginFormProps {
  onToggleForm: () => void;
}

export default function LoginForm({ onToggleForm }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // ⬅️ loading state

  const navigate = useNavigate();
  const { signIn } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      console.log('✅ Logged in and user context set.');
      
      setTimeout(() => {
        navigate('/');
      }, 1500); // smooth delay for loading effect
    } catch (err) {
      console.error('❌ Login failed:', err);
      alert('Invalid credentials');
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingOverlay />} {/* 👈 Loader overlay */}

      <Card className="w-full max-w-md opacity-0 animate-slide-up shadow-lg border-none bg-white/80 backdrop-blur-md">
        <div className="p-8 space-y-6 relative z-10">
          <div className="flex justify-center">
            <div className="bg-purple-600 rounded-full p-4">
              <EyeOff className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-purple-600">Welcome Back</h2>
            <p className="text-gray-500">Sign in to your Lamma account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground bg-transparent"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="w-4 h-4 text-purple-600 border-gray-300 rounded" />
                <span>Remember me</span>
              </label>
              <button type="button" className="text-purple-600 hover:underline bg-transparent p-0 focus:outline-none">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition-opacity hover:opacity-90"
            >
              Sign In
            </button>
          </form>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="px-3 text-xs uppercase text-gray-500 bg-white">
              Or continue with
            </span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

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

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <button
              onClick={onToggleForm}
              className="text-purple-600 hover:underline bg-transparent p-0 focus:outline-none"
            >
              Sign Up
            </button>
          </p>
        </div>
      </Card>
    </>
  );
}
