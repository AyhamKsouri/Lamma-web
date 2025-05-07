import React, { useState, useContext } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import LoadingOverlay from '@/components/LoadingOverlay'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock, User, Phone, Facebook } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '@/context/AuthContext'

interface SignupFormProps {
  onToggleForm: () => void
}

export default function SignupForm({ onToggleForm }: SignupFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showTermsError, setShowTermsError] = useState(false)

  const { toast } = useToast()
  const navigate = useNavigate()
  const { signIn } = useContext(AuthContext)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !password || !phone) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }

    if (!agreeTerms) {
      setShowTermsError(true)
      toast({
        title: 'Terms Required',
        description: 'You must accept the terms and conditions.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:3000/api/user-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, role: 'user' }),
      })

      const raw = await response.text()
      if (!response.ok) throw new Error(raw || 'Signup failed')

      await signIn(email, password)

      toast({
        title: 'Success',
        description: 'Account created and logged in',
      })

      navigate('/')
    } catch (error: any) {
      toast({
        title: 'Signup error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <LoadingOverlay />}
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
            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground bg-transparent"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center space-x-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked)
                  if (e.target.checked) setShowTermsError(false)
                }}
                className="form-checkbox h-5 w-5 text-pink-500"
              />
              <Label htmlFor="terms" className="text-xs">
                I agree to the{' '}
                <span className="text-pink-500 hover:underline cursor-pointer">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="text-pink-500 hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </Label>
            </div>
            {showTermsError && (
              <p className="text-xs text-red-500 ml-1 -mt-2">Please accept the terms first.</p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account…' : 'Sign Up'}
            </Button>
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
    </>
  )
}
