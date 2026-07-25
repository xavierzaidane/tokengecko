'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { LogOut, Sliders, History, Sparkles, Key } from 'lucide-react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Inspector', href: '/inspector', icon: Sparkles },
    { name: 'History', href: '/history', icon: History },
    { name: 'BYOK Keys', href: '/settings', icon: Key },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href={user ? '/inspector' : '/'} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-base shadow-sm group-hover:border-emerald-400/50 transition">
            TG
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold font-mono text-white tracking-tight leading-none group-hover:text-emerald-400 transition">
              TokenGecko
            </span>
            <span className="text-[10px] font-mono text-slate-500 leading-tight">
              Prompt Inspector
            </span>
          </div>
        </Link>

        {/* Nav Links (If Logged In) */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 bg-[#0F172A] border border-slate-800 rounded-xl p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono transition ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}

        {/* User Info / Auth Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-mono text-slate-200">
                  {user.profile?.name || user.email.split('@')[0]}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 text-xs font-mono transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-emerald-500/10"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
