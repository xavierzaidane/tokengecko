'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SignUpPage() {
  const { signUp, signInWithOAuth, user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    router.push('/inspector');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please provide an email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email, password, name);
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to create account.');
    } else {
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        router.push('/inspector');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-app text-white flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* LEFT PANEL: Split-Screen Hero with login.webp Background */}
      <div className="relative flex-1 bg-card-dark p-8 lg:p-16 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-800/80 min-h-[360px] lg:min-h-screen">
        
        {/* login.webp Background Image */}
        <Image
          src="/login.webp"
          alt="Auth Background"
          fill
          priority
          className="object-cover object-center pointer-events-none opacity-90"
        />

        {/* Subtle Dark Overlay gradient for header & footer readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/imagelogo.png"
            alt="TokenGecko Logo"
            width={44}
            height={44}
            className="object-contain"
          />
          <Image
            src="/textlogo.png"
            alt="TokenGecko"
            width={140}
            height={32}
            className="object-contain"
          />
        </div>

      </div>

      {/* RIGHT PANEL: Authentication Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-app relative">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
              Create an account
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Get started with TokenGecko to analyze prompts and optimize your LLM pipeline.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Social Auth Grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => signInWithOAuth('github')}
              className="py-3 px-4 bg-input-dark hover:bg-zinc-800/90 border border-zinc-800 text-zinc-200 text-xs font-mono font-medium transition flex items-center justify-center gap-2.5 shadow-sm group cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>

            <button
              type="button"
              onClick={() => signInWithOAuth('google')}
              className="py-3 px-4 bg-input-dark hover:bg-zinc-800/90 border border-zinc-800 text-zinc-200 text-xs font-mono font-medium transition flex items-center justify-center gap-2.5 shadow-sm group cursor-pointer"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800/80" />
            </div>
            <span className="relative px-4 bg-app text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              Or sign up with email
            </span>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-400">Display Name (Optional)</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Developer"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-dark border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-400">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-dark border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-400">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-dark border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-accent-orange hover:bg-accent-orange/90 disabled:opacity-50 text-zinc-950 font-bold text-xs transition shadow-lg shadow-accent-orange/10 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="text-center text-xs text-zinc-400 font-sans pt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-orange hover:underline font-mono font-bold ml-1">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
