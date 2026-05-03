'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { useUser } from '../lib/hooks/useUser';

interface Props {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const { refreshUser } = useUser();
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = isSignup
        ? { email: form.email, username: form.username, password: form.password }
        : { email: form.email, password: form.password };

      const res = await api.post<{ token: string }>(`/api/auth/${mode}`, payload);
      localStorage.setItem('token', res.data.token);

      // Also store as cookie for middleware
      document.cookie = `token=${res.data.token}; path=/; max-age=${7 * 24 * 3600}`;

      await refreshUser();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-6 py-4 rounded-2xl animate-shake">
          {error}
        </div>
      )}

      {isSignup && (
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">
            Username
          </label>
          <input
            name="username"
            type="text"
            required
            value={form.username}
            onChange={handleChange}
            placeholder="artmaster"
            className="w-full glass-input px-6 py-4 rounded-2xl text-white placeholder:text-zinc-600"
          />
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="w-full glass-input px-6 py-4 rounded-2xl text-white placeholder:text-zinc-600"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="w-full glass-input px-6 py-4 rounded-2xl text-white placeholder:text-zinc-600"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-60 font-bold py-5 rounded-[20px] transition-all shadow-2xl shadow-white/5 active:scale-[0.98] mt-4"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          isSignup ? 'Create Account' : 'Sign In'
        )}
      </button>
    </form>
  );
}
