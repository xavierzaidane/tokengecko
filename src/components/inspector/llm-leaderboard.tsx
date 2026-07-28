'use client';

import React, { useState, useMemo } from 'react';
import { ModelInspectionResult } from '@/lib/analysis/schema';
import { ProviderIcon } from '@/components/icons/provider-icons';
import { Trophy, Award, Zap, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LLMLeaderboardProps {
  results?: ModelInspectionResult[];
  className?: string;
}

export function LLMLeaderboard({ results = [], className = '' }: LLMLeaderboardProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'optimal' | 'recommended'>('all');
  const [sortBy, setSortBy] = useState<'tradeoff' | 'cost' | 'context'>('tradeoff');

  // Compute live ranking strictly synced with the inspection analysis results
  const rankedModels = useMemo(() => {
    if (!results || results.length === 0) return [];

    // Map each model to real inspection metrics
    const items = results.map((r) => {
      const qScore = r.qualityScores
        ? Object.values(r.qualityScores).find((val) => typeof val === 'number') || 80
        : 80;
      const cost = r.estimatedCost.total;
      const contextK = Math.round(r.contextWindow / 1000);
      const usagePct = Math.round(Number(r.contextUsagePercent) || 0);
      const score = r.tradeoffScore || Math.round((qScore / Math.max(cost * 1000, 0.001)) * 10) / 10;

      // Clean display name
      const shortName = r.model.replace(/^(Anthropic|OpenAI|Google|Cohere|Meta|xAI|Mistral):?\s*/i, '');

      return {
        id: r.model_id || r.model,
        name: shortName,
        fullName: r.model,
        provider: r.provider || 'openai',
        cost,
        contextK,
        usagePct,
        qualityScore: qScore,
        tradeoffScore: score,
        isOptimal: false,
      };
    });

    // Sort based on selected criteria
    const sorted = [...items].sort((a, b) => {
      if (sortBy === 'cost') return a.cost - b.cost;
      if (sortBy === 'context') return b.contextK - a.contextK;
      return b.tradeoffScore - a.tradeoffScore; // Default: highest tradeoff score
    });

    // Mark rank 1 as optimal
    if (sorted.length > 0 && sortBy === 'tradeoff') {
      sorted[0].isOptimal = true;
    }

    return sorted;
  }, [results, sortBy]);

  // Filter models based on selection
  const filteredModels = useMemo(() => {
    if (filterMode === 'optimal') {
      return rankedModels.filter((m) => m.isOptimal || m.tradeoffScore > 80);
    }
    if (filterMode === 'recommended') {
      return rankedModels.filter((m) => m.usagePct < 80);
    }
    return rankedModels;
  }, [rankedModels, filterMode]);

  if (!results || results.length === 0) {
    return (
      <div className="p-6 rounded-xl text-center text-zinc-400 font-mono text-sm">
        No inspection models available. Run an analysis to view model rankings.
      </div>
    );
  }

  return (
    <div className={`space-y-4 font-mono ${className}`}>
      {/* Header synced with analysis */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-white shrink-0" />
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              LLM Leaderboard
            </h3>
          </div>
        </div>

        {/* Sort & Filter controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5  appearance-none pr-7 focus:outline-none focus:border-zinc-700 cursor-pointer font-sans"
            >
              <option value="tradeoff">Sort: Value Score</option>
              <option value="cost">Sort: Lowest Cost</option>
              <option value="context">Sort: Max Context</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5  appearance-none pr-7 focus:outline-none focus:border-zinc-700 cursor-pointer font-sans"
            >
              <option value="all">All ({rankedModels.length})</option>
              <option value="optimal">Best Value</option>
              <option value="recommended">&lt; 80% Capacity</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Leaderboard List (Card removed, clean direct list) */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
        {filteredModels.map((item, index) => (
          <div
            key={`analysis-leaderboard-${item.id}-${index}`}
            className={`flex items-center justify-between p-3  transition-all  ${
              item.isOptimal
                ? 'border-b border-zinc-700 bg-gray-500/10'
                : 'border-b border-zinc-700/40'
            }`}
          >
            {/* Left: Rank + Provider Icon + Model Name */}
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`text-sm font-bold w-6 text-right shrink-0 ${
                  item.isOptimal ? 'text-amber-400' : 'text-zinc-500'
                }`}
              >
                {index + 1}.
              </span>

              <div className="w-7 h-7  flex items-center justify-center p-1 shrink-0">
                <ProviderIcon provider={item.provider} size={20} />
              </div>

              <div className="min-w-0 truncate">
                <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                  <span className="truncate">{item.name}</span>
                  {item.isOptimal && (
                    <Badge className=" text-accent-orange border-accent-orange text-[10px] px-2 py-0.5">
                      <Award className="w-3 h-3 mr-1" /> Optimal Value
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5 font-sans">
                  <span>by {item.provider}</span>
                  <span className="text-zinc-600">•</span>
                  <span>{item.contextK}k context</span>
                </div>
              </div>
            </div>

            {/* Right: Actual Inspection Cost & Tradeoff Score */}
            <div className="text-right shrink-0 ml-3 font-mono">
              <div className="text-sm text-accent-orange font-bold">
                ${item.cost < 0.001 ? item.cost.toFixed(5) : item.cost.toFixed(4)}
              </div>
              <div className="text-xs text-zinc-400 flex items-center justify-end gap-1 mt-0.5">
                <span>Score: <strong className="text-zinc-200">{item.tradeoffScore}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
