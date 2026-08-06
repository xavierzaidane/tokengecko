'use client';

import React from 'react';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="relative z-10 text-center font-mono text-xs text-white/40 py-6 border-t border-zinc-800 -top-14 -mb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 mb-12 text-left">
          {/* Column 1: Brand & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img src="/imagelogo.png" alt="TokenGecko" className="w-6 h-6 object-contain" />
              <span className="font-bold text-white text-lg tracking-tight font-mono">TokenGecko</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs font-sans">
              Token intelligence and cost estimation for LLM APIs. Multi-provider analysis, zero extra overhead.
            </p>
          </div>

          {/* Column 2: PRODUCT */}
          <div>
            <h3 className="text-xs font-mono font-semibold tracking-wider text-zinc-400 uppercase mb-4">
              PRODUCT
            </h3>
            <ul className="space-y-2.5 text-sm font-sans">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-white transition-colors">
                  Changelog
                </Link>
              </li>
              <li>
                <Link href="/inspector" className="hover:text-white transition-colors">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: DOCS */}
          <div>
            <h3 className="text-xs font-mono font-semibold tracking-wider text-zinc-400 uppercase mb-4">
              DOCS
            </h3>
            <ul className="space-y-2.5 text-sm font-sans">
              <li>
                <Link href="/docs/overview" className="hover:text-white transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/docs/quickstart" className="hover:text-white transition-colors">
                  Installation
                </Link>
              </li>
              <li>
                <Link href="/docs/api/configuration" className="hover:text-white transition-colors">
                  Configuration
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-white transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: RESOURCES */}
          <div>
            <h3 className="text-xs font-mono font-semibold tracking-wider text-zinc-400 uppercase mb-4">
              RESOURCES
            </h3>
            <ul className="space-y-2.5 text-sm font-sans">
              <li>
                <a
                  href="https://www.npmjs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  npm
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & tagline */}
        <div className="pt-8  flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-sans">
          <div>© {new Date().getFullYear()} TokenGecko. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
