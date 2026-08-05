'use client';

import React from 'react';

export function LandingFooter() {
  return (
    <footer className="relative z-10 text-center font-mono text-xs text-white/40 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/imagelogo.png" alt="TokenGecko" className="w-5 h-5 object-contain" />
            <img src="/textlogo.png" alt="TokenGecko" className="w-20 h-20 object-contain" />
            <span>— Created by <span className="underline text-white/70">Xavier Zaidane</span></span>
          </div>
          <div>© {new Date().getFullYear()} TokenGecko. All rights reserved.</div>
        </div>
      </footer>
  );
}
