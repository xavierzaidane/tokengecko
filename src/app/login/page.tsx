'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { signInWithPassword, signInWithOAuth, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    router.push('/inspector');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signInWithPassword(email, password);
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to sign in. Please check your credentials.');
    } else {
      router.push('/inspector');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0F172A]/80 border border-slate-800 backdrop-blur-md rounded-2xl p-8 shadow-2xl shadow-emerald-500/5">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg shadow-inner">
            TG
          </div>
          <span className="text-xl font-bold font-mono text-white tracking-tight">
            TokenGecko
          </span>
        </div>

        <h2 className="text-2xl font-bold text-center text-white mb-2">Welcome back</h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          Log in to inspect prompts, compare LLMs, and track history.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-[#0B0F17] border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-[#0B0F17] border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-500 font-mono">OR</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => signInWithOAuth('github')}
            className="py-2.5 px-4 rounded-lg bg-[#0B0F17] hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs transition flex items-center justify-center gap-2"
          >
            GitHub
          </button>
          <button
            onClick={() => signInWithOAuth('google')}
            className="py-2.5 px-4 rounded-lg bg-[#0B0F17] hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs transition flex items-center justify-center gap-2"
          >
            Google
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-emerald-400 hover:underline font-mono">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
