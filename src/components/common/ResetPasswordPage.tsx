import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || '';
  const code = location.state?.code || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user-account/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Reset failed');

      setSuccess(true);
      setTimeout(() => {
        navigate('/login'); // Redirect to login
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-20 p-8 shadow-lg bg-white/80 backdrop-blur-md">
      <h2 className="text-xl font-bold mb-4 text-purple-600 text-center">Set New Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm text-center">❌ {error}</p>}
        {success && <p className="text-green-600 text-sm text-center">✅ Password reset successful. Redirecting…</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition hover:opacity-90"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </Card>
  );
}
