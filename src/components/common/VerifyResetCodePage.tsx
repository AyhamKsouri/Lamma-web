import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function VerifyResetCodePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user-account/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Invalid or expired code');

      // ✅ success — redirect to set new password
      navigate('/reset-password', { state: { email, code } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-20 p-8 shadow-lg bg-white/80 backdrop-blur-md">
      <h2 className="text-xl font-bold mb-4 text-purple-600 text-center">Enter Verification Code</h2>
      <p className="text-sm text-center mb-6 text-gray-600">We sent a code to <strong>{email}</strong></p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={e => setCode(e.target.value)}
          maxLength={6}
          required
        />

        {error && <p className="text-red-500 text-sm text-center">❌ {error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition hover:opacity-90"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>
    </Card>
  );
}
