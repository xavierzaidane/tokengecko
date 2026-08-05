'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface PackageTabsProps {
  npm?: string;
  pnpm?: string;
  bun?: string;
  yarn?: string;
  cmd?: string;
}

export function PackageTabs({
  npm = 'npm i @tokengecko/core',
  pnpm = 'pnpm add @tokengecko/core',
  bun = 'bun add @tokengecko/core',
  yarn = 'yarn add @tokengecko/core',
  cmd,
}: PackageTabsProps) {
  const [activeTab, setActiveTab] = useState<'npm' | 'pnpm' | 'bun'>('npm');
  const [copied, setCopied] = useState(false);

  const commands = {
    npm: cmd ? `npm i ${cmd}` : npm,
    pnpm: cmd ? `pnpm add ${cmd}` : pnpm,
    bun: cmd ? `bun add ${cmd}` : bun,
  };

  const activeCommand = commands[activeTab];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-6 rounded-xl border border-zinc-800 bg-[#1a1a1c] overflow-hidden shadow-sm">
      {/* Top Tab Selector */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-4 border-b border-zinc-800/40 bg-[#18181a]">
        {(['npm', 'pnpm', 'bun'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-mono text-xs font-medium relative pb-1 transition-colors ${
              activeTab === tab
                ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sub Header (Terminal Label + Copy) */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-zinc-800/80 bg-[#1a1a1c] font-mono text-xs text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 font-bold">&gt;_</span>
          <span>Terminal</span>
        </div>

        <button
          onClick={handleCopy}
          className="p-1 text-zinc-400 hover:text-white rounded transition hover:bg-zinc-800/60"
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

      {/* Terminal Command Output */}
      <div className="p-4 font-mono text-xs sm:text-sm text-accent-orange leading-relaxed overflow-x-auto bg-[#18181a]">
        {activeCommand}
      </div>
    </div>
  );
}
