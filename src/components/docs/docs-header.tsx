'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Menu, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocsHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
}

export function DocsHeader({ onOpenMobileMenu, onOpenSearch }: DocsHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-sidebar/95 backdrop-blur border-b border-zinc-800/80">


      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-md border border-zinc-800 bg-zinc-900/50"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          <Link href="/docs" className="flex items-center gap-2.5">
            <img src="/imagelogo.png" alt="TokenGecko Logo" className="w-8 h-8 object-contain" />
            <span className="font-mono text-sm font-bold text-white tracking-tight hidden sm:inline">
              TokenGecko
            </span>
            <span className="bg-zinc-800 text-zinc-400 font-mono text-[10px] px-1.5 py-0.5 rounded border border-zinc-700">
              v1.1.0
            </span>
          </Link>
        </div>

        {/* Middle: Search Trigger Button */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-mono bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-300 rounded-md transition"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <span>Search documentation...</span>
            </div>
            <kbd className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-md border border-zinc-800 bg-zinc-900/50"
            aria-label="Search docs"
          >
            <Search className="w-4 h-4" />
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-400 hover:text-white transition rounded-md border border-zinc-800/80 hover:bg-zinc-800/50 hidden sm:flex items-center gap-1.5 text-xs font-mono"
            title="GitHub Repository"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="hidden md:inline">GitHub</span>
          </a>

          <Link href="/inspector">
            <Button variant="storeframe" size="sm" className="font-mono text-xs gap-1.5">
              <span>Launch Inspector</span>
              <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
