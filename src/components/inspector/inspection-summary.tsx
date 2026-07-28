'use client';

import React from 'react';
import { ModelInspectionResult } from '@/lib/analysis/schema';
import { analyzePromptOptimization } from '@/lib/optimization/engine';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Zap,
  TrendingDown,
  Maximize2,
  Hash,
  Layers,
  ArrowRight,
  Award,
  Cpu,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProviderIcon } from '@/components/icons/provider-icons';

import { TokenDistributionBar } from '@/components/inspector/token-distribution-bar';
import { RegistrySnapshot } from '@/types/analysis';

interface InspectionSummaryPanelProps {
  promptText: string;
  results: ModelInspectionResult[];
  primaryModelId?: string;
  onApplySuggestion?: (suggestedText: string) => void;
  onSelectModel?: (modelId: string) => void;
  registrySnapshot?: RegistrySnapshot;
}

export function InspectionSummaryPanel({
  promptText,
  results,
  primaryModelId,
  onApplySuggestion,
  registrySnapshot,
}: InspectionSummaryPanelProps) {
  const optimization = analyzePromptOptimization(promptText, results);
  const {
    health,
    recommendations,
    segments,
    cheapestModel,
    largestContextModel,
    bestTradeoffModel,
    taskClassification,
  } = optimization;

  const primaryResult =
    results.find((r) => r.model_id === primaryModelId) || results[0];

  return (
    <div className="w-full space-y-6 font-mono">
      {/* 1. Health Status & Task Type Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Prompt Optimization & Health Summary
              </h2>
              {taskClassification && (
                <Badge
                  variant="outline"
                  className="bg-accent-orange/15 text-accent-orange  text-[10px] font-mono uppercase px-2 py-0.5"
                >
                  <Cpu className="w-3 h-3 mr-1" />
                  Task: {taskClassification.label}
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              {health.description}
            </p>
          </div>
        </div>

      </div>

      {/* 2. Key Metrics Grid (5 Leader Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Metric 1: Primary Tokens */}
        <div className="p-5 bg-card-dark border border-zinc-800 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>Primary Tokens</span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-sans text-white tracking-tight">
              {primaryResult ? primaryResult.inputTokens.toLocaleString() : 0}
            </div>
            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
              {primaryResult && (
                <>
                  <ProviderIcon provider={primaryResult.provider} size={14} />
                  <span className="truncate">{primaryResult.model}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Metric 2: Estimated Cost */}
        <div className="p-5 bg-card-dark border border-zinc-800 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>Estimated Cost</span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-sans text-white tracking-tight">
              ${primaryResult ? primaryResult.estimatedCost.total.toFixed(5) : '0.00000'}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Per execution run
            </div>
          </div>
        </div>

        {/* Metric 3: Cheapest Model Leader */}
        <div className="p-5 bg-card-dark border border-zinc-800 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>Cheapest Model</span>
          </div>
          <div>
            <div className="text-2xl sm:text-xl font-sans text-white tracking-tight truncate flex items-center gap-2">
              {cheapestModel && (
                <ProviderIcon
                  provider={cheapestModel.provider}
                  size={20}
                  className="text-emerald-400 shrink-0"
                />
              )}
              <span className="truncate">{cheapestModel ? cheapestModel.model : 'N/A'}</span>
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              ${cheapestModel ? cheapestModel.estimatedCost.total.toFixed(5) : '0.00'} / run
            </div>
          </div>
        </div>

        {/* Metric 4: Best Value (Cost/Quality Tradeoff) */}
        <div className="p-5 bg-card-dark border border-zinc-800 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>Best Value Model</span>
          </div>
          <div>
            <div className="text-2xl sm:text-xl font-sans text-white tracking-tight truncate flex items-center gap-2">
              {bestTradeoffModel && (
                <ProviderIcon
                  provider={bestTradeoffModel.provider}
                  size={20}
                  className="shrink-0"
                />
              )}
              <span className="truncate">{bestTradeoffModel ? bestTradeoffModel.model : 'N/A'}</span>
            </div>
            <div className="text-xs text-zinc-400 mt-1 flex items-center justify-between">
              <span>
                Quality: {bestTradeoffModel?.qualityScores?.[taskClassification?.taskType || 'general'] || 80}/100
              </span>
              <span className="text-white font-bold">
                Score: {bestTradeoffModel?.tradeoffScore || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 5: Max Context Leader */}
        <div className="p-5 bg-card-dark border border-zinc-800 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>Max Context Leader</span>
          </div>
          <div>
            <div className="text-2xl sm:text-xl font-sans text-white tracking-tight truncate flex items-center gap-2">
              {largestContextModel && (
                <ProviderIcon
                  provider={largestContextModel.provider}
                  size={20}
                  className="text-accent-orange shrink-0"
                />
              )}
              <span className="truncate">
                {largestContextModel ? largestContextModel.model : 'N/A'}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {largestContextModel
                ? `${(largestContextModel.contextWindow / 1000).toFixed(0)}k window`
                : '0k'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Token-Share Breakdown Bar */}
      {segments.length > 0 && <TokenDistributionBar segments={segments} />}

      {/* 4. Actionable Recommendations Engine Panel */}
      <div className="p-5  space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent-orange shrink-0" />
            Optimization Engine Recommendations ({recommendations.length})
          </span>
        </div>

        <div className="space-y-3">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 border transition ${
                  rec.severity === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-200'
                    : rec.severity === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : rec.type === 'best_value_model'
                    ? 'bg-amber-500/5 border-amber-500/40 text-zinc-200'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {rec.severity === 'error' ? (
                      <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    ) : rec.severity === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    ) : rec.type === 'best_value_model' ? (
                      <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-white/20 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {rec.title}
                        {rec.details?.costDeltaPercent && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]"
                          >
                            Save ~{rec.details.costDeltaPercent}%
                          </Badge>
                        )}
                        {rec.type === 'best_value_model' && (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[10px]"
                          >
                            Cost/Quality Winner
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 mt-1 font-sans">
                        {rec.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
              No recommendations generated yet. Enter prompt content above.
            </div>
          )}
        </div>
      </div>

      {registrySnapshot && (
        <div className="p-3  text-[11px] font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-2">
          <span>
            Data Source:{' '}
            <strong className="text-white">
              {registrySnapshot.source === 'openrouter' ? 'Live OpenRouter Registry' : 'Seed Registry Fallback'}
            </strong>
          </span>
          <span>
            Snapshot:{' '}
            <strong className="text-accent-orange">
              {new Date(registrySnapshot.lastSyncedAt).toLocaleTimeString()}
            </strong>{' '}
            ({registrySnapshot.totalModels} models available)
          </span>
        </div>
      )}
    </div>
  );
}
