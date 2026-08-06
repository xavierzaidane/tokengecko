'use client';

import React from 'react';
import Link from 'next/link';

export function ActionButton({
  label = 'Launch Inspector',
  href = '/login',
  full = false,
  primary = true,
}: {
  label?: string;
  href?: string;
  full?: boolean;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 font-medium text-sm px-6 py-3 transition-all active:scale-[0.98] cursor-pointer ${
        primary
          ? 'bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10'
          : 'bg-app text-white border border-zinc-800 hover:bg-white/20 backdrop-blur-md'
      } ${full ? 'w-full' : ''}`}
    >
      <span>{label}</span>
    </Link>
  );
}

export function SectionEyebrow({ label, tag }: { label: string; tag?: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-white/60 font-medium tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-white" />
      <span>{label}</span>
      {tag && (
        <span className="px-2 py-0.5 rounded-full border border-white/10 text-white/50 text-[10px] font-mono">
          {tag}
        </span>
      )}
    </div>
  );
}
