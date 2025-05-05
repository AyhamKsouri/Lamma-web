// src/components/SignupForm.tsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, User, Phone, Facebook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SignupFormProps {
  onToggleForm: () => void;
}

export default function SignupForm({ onToggleForm }: SignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📩 Form submitted");

    if (!name || !email || !password || !phone) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (!agreeTerms) {
      toast({
        title: 'Error',
        description: 'Please agree to the terms and conditions',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('http://localhost:3000/api/user-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          role: 'user'
        }),
      });

      const raw = await response.text();

      console.log("📡 Response status:", response.status);
      console.log("📦 Response body:", raw);

      if (!response.ok) {
        throw new Error(raw || 'Signup failed');
      }

      const data = JSON.parse(raw);
      const token = data.token;

      if (token) {
        localStorage.setItem('token', token);
      }

      toast({
        title: 'Success',
        description: 'Account created and logged in',
      });

      navigate('/Dashboard');
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      toast({
        title: 'Signup error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md opacity-0 animate-slide-up shadow-lg border-none bg-white/80 backdrop-blur-md">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse-subtle flex items-center justify-center shadow-lg" />
        </div>
        <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Join our Lamma
        </CardTitle>
        <CardDescription className="text-center">
          Create your account to get started
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                type="text"
                placeholder="Enter your phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
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
                placeholder="Create a password"
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

          <div className="flex items-center space-x-2">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={e => setAgreeTerms(e.target.checked)}
              className="form-checkbox h-5 w-5 text-pink-500"
            />
            <Label htmlFor="terms" className="text-xs">
              I agree to the{' '}
              <span className="text-pink-500 hover:underline cursor-pointer">Terms of Service</span>{' '}
              and{' '}
              <span className="text-pink-500 hover:underline cursor-pointer">Privacy Policy</span>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account…' : 'Sign Up'}
          </Button>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-muted" />
            <span className="px-2 text-xs uppercase text-muted-foreground bg-white/80">
              Or sign up with
            </span>
            <hr className="flex-grow border-t border-muted" />
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
              <Facebook className="w-5 h-5 text-blue-600" />
              <span>Facebook</span>
            </button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm">
          Already have an account?{' '}
          <button
            onClick={onToggleForm}
            className="bg-transparent p-0 text-pink-500 hover:underline focus:outline-none"
          >
            Sign In
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}
