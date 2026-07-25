'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Terminal, History, Key, LogOut, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-zinc-800/80 bg-header-dark/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/inspector" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-accent-orange flex items-center justify-center text-zinc-950 font-bold font-mono shadow-md shadow-accent-orange/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-mono text-sm font-black tracking-wider text-white uppercase">
              TOKEN<span className="text-accent-orange">GECKO</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 bg-zinc-800 text-zinc-400 font-mono text-[10px]">
              Prompt Inspector
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/inspector"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono transition ${
              pathname === '/inspector'
                ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-accent-orange" />
            <span>Inspector</span>
          </Link>

          <Link
            href="/history"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono transition ${
              pathname === '/history'
                ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            <History className="w-3.5 h-3.5 text-accent-orange" />
            <span>History</span>
          </Link>

          <Link
            href="/settings"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono transition ${
              pathname === '/settings'
                ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-accent-orange" />
            <span>BYOK Keys</span>
          </Link>
        </nav>

        {/* User Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-mono text-zinc-300">
                {user.email?.split('@')[0]}
              </span>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-red-400 text-xs gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
