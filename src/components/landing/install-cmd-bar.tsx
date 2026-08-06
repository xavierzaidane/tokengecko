'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function InstallCmdBar() {
  const [activeTab, setActiveTab] = useState<'npm' | 'pnpm' | 'bun'>('npm');
  const [copied, setCopied] = useState(false);

  const commands = {
    npm: 'npm i tokengecko',
    pnpm: 'pnpm add tokengecko',
    bun: 'bun add tokengecko',
  };

  const activeCommand = commands[activeTab];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {

    }
  };

  return (
    <div className="mt-4 inline-flex items-center  border border-zinc-800 bg-white/5 p-1.5 font-mono text-xs text-zinc-300 shadow-xl max-w-full overflow-x-auto">
      <div className="flex items-center gap-1 pr-3 border-r border-zinc-800/80">
        {/* NPM Tab */}
        <button
          onClick={() => setActiveTab('npm')}
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
            activeTab === 'npm' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="npm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 7.334v8h6.666v-5.333h2.668v5.333h14.666v-8H0zm12 5.333h-2.667V9.999H12v2.668zm4 0h-2.667V9.999H16v2.668zm4 0h-2.667V9.999H20v2.668z" />
          </svg>
        </button>

        {/* PNPM Tab */}
        <button
          onClick={() => setActiveTab('pnpm')}
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
            activeTab === 'pnpm' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="pnpm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0v7.5h7.5V0H0zm8.25 0v7.5h7.5V0h-7.5zm8.25 0v7.5H24V0h-7.5zM8.25 8.25v7.5h7.5v-7.5h-7.5zm8.25 0v7.5H24v-7.5h-7.5zM0 16.5V24h7.5v-7.5H0zm8.25 0V24h7.5v-7.5h-7.5zm8.25 0V24H24v-7.5h-7.5z" />
          </svg>
        </button>

        {/* Bun Tab */}
        <button
          onClick={() => setActiveTab('bun')}
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
            activeTab === 'bun' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="bun"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
          </svg>
        </button>
      </div>

      {/* Terminal Command Output & Copy Button */}
      <div className="flex items-center gap-3 pl-3 pr-2">
        <span className="text-zinc-500">$</span>
        <span className="text-zinc-200 select-all font-mono">{activeCommand}</span>

        <button
          onClick={handleCopy}
          className="ml-4 p-1 text-zinc-400 hover:text-white rounded transition hover:bg-zinc-800/80"
          title="Copy to clipboard"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
