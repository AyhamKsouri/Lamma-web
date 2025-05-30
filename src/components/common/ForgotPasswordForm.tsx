import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ navigate only when submitted becomes true
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        navigate('/verify-reset-code', { state: { email } });
      }, 100); // add delay to ensure smooth transition
      return () => clearTimeout(timer);
    }
  }, [submitted, email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user-account/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset code');
      }

      setSubmitted(true); // ✅ triggers useEffect
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md opacity-0 animate-slide-up shadow-lg border-none bg-white/80 backdrop-blur-md">
      <div className="p-8 space-y-6 relative z-10">
        <h2 className="text-2xl font-bold text-center text-purple-600">Reset Password</h2>
        <p className="text-sm text-center text-gray-500">
          Enter your email address and we'll send you a reset code.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition-opacity hover:opacity-90"
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>

        {error && (
          <p className="text-center text-red-500 text-sm mt-2">❌ {error}</p>
        )}

        <p className="text-center text-sm mt-6">
          <button onClick={onBackToLogin} className="text-purple-600 hover:underline">
            ← Back to Login
          </button>
        </p>
      </div>
    </Card>
  );
}
