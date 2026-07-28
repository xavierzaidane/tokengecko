'use client';

import React from 'react';
import { RecommendationSegment } from '@/lib/analysis/schema';
import { Layers } from 'lucide-react';

interface TokenDistributionBarProps {
  segments: RecommendationSegment[];
  className?: string;
}

export function TokenDistributionBar({
  segments,
  className = '',
}: TokenDistributionBarProps) {
  if (!segments || segments.length === 0) return null;

  return (
    <div className={`p-5  space-y-3 font-mono ${className}`}>
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-zinc-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-orange shrink-0" />
          <span>Token Distribution Breakdown</span>
        </span>
        <span className="text-zinc-400 font-sans text-[11px]">
          {segments.length} segment(s) analyzed
        </span>
      </div>

      {/* Stacked Horizontal Bar */}
      <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden flex">
        {segments.map((seg, idx) => {
          const bgClass =
            seg.label === 'JSON Data'
              ? 'bg-amber-500'
              : seg.label === 'Code Snippets'
              ? 'bg-blue-500'
              : 'bg-accent-orange';
          return (
            <div
              key={idx}
              style={{ width: `${seg.percentage}%` }}
              className={`h-full ${bgClass} transition-all duration-300`}
              title={`${seg.label}: ${seg.tokens.toLocaleString()} tokens (${seg.percentage}%)`}
            />
          );
        })}
      </div>

      {/* Legend & Details */}
      <div className="flex flex-wrap gap-4 text-xs pt-1">
        {segments.map((seg, idx) => {
          const dotBgClass =
            seg.label === 'JSON Data'
              ? 'bg-amber-500'
              : seg.label === 'Code Snippets'
              ? 'bg-blue-500'
              : 'bg-accent-orange';
          return (
            <div key={idx} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dotBgClass}`} />
              <span className="text-zinc-300 font-sans">
                {seg.label}:{' '}
                <strong className="text-white">{seg.percentage}%</strong> ({seg.tokens.toLocaleString()} tok)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
