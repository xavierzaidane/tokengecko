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
  Lightbulb,
  Hash,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProviderIcon } from '@/components/icons/provider-icons';

interface InspectionSummaryPanelProps {
  promptText: string;
  results: ModelInspectionResult[];
  onSelectModel?: (modelId: string) => void;
}

export function InspectionSummaryPanel({
  promptText,
  results,
  onSelectModel,
}: InspectionSummaryPanelProps) {
  const analysis = analyzePromptOptimization(promptText, results);
  const { health, recommendations, segments, cheapestModel, largestContextModel } = analysis;

  const primaryResult = results[0];

  return (
    <div className="w-full space-y-6 font-mono">
      {/* 1. Health Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Prompt Optimization & Health Summary</h2>
            <p className="text-xs text-zinc-400">Real-time health evaluation, token share distribution, and model cost savings.</p>
          </div>
        </div>

        {/* Prompt Health Badge */}
        <Badge
          variant="outline"
          className={`font-mono text-xs px-3 py-1.5 flex items-center gap-2 font-bold shrink-0 ${
            health.status === 'good'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              : health.status === 'warning'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
              : 'bg-red-500/10 border-red-500/40 text-red-400'
          }`}
        >
          {health.status === 'good' ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : health.status === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          ) : (
            <AlertOctagon className="w-4 h-4 text-red-400" />
          )}
          <span>{health.label}</span>
        </Badge>
      </div>

      {/* 2. Prominent Key Metric Cards (Bigger Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Primary Model Tokens */}
        <div className="p-5 bg-card-dark border border-zinc-800  shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>Primary Tokens</span>
            <Hash className="w-4 h-4 text-accent-orange" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-normal text-white tracking-tight">
              {primaryResult ? primaryResult.inputTokens.toLocaleString() : 0}
            </div>
            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
              {primaryResult && <ProviderIcon provider={primaryResult.provider} size={13} className="text-accent-orange" />}
              <span>{primaryResult?.model || 'No model'}</span>
            </div>
          </div>
        </div>

        {/* Primary Est Total Cost */}
        <div className="p-5 bg-card-dark border border-zinc-800  shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>Estimated Cost</span>
            <Zap className="w-4 h-4 text-accent-orange" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-normal text-accent-orange tracking-tight">
              ${primaryResult ? primaryResult.estimatedCost.total.toFixed(5) : '0.00000'}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Input + Output payload
            </div>
          </div>
        </div>

        {/* Cheapest Model Leader */}
        <div className="p-5 bg-card-dark border border-zinc-800  shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>Cheapest Model</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-normal text-emerald-400 tracking-tight truncate flex items-center gap-2">
              {cheapestModel && <ProviderIcon provider={cheapestModel.provider} size={20} className="text-emerald-400 shrink-0" />}
              <span className="truncate">{cheapestModel ? cheapestModel.model : 'N/A'}</span>
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-bold">
              ${cheapestModel ? cheapestModel.estimatedCost.total.toFixed(5) : '0.00000'} / run
            </div>
          </div>
        </div>

        {/* Max Context Model Leader */}
        <div className="p-5 bg-card-dark border border-zinc-800  shadow-xl relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>Max Context Leader</span>
            <Maximize2 className="w-4 h-4 text-accent-orange" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-normal text-white tracking-tight truncate flex items-center gap-2">
              {largestContextModel && <ProviderIcon provider={largestContextModel.provider} size={20} className="text-accent-orange shrink-0" />}
              <span className="truncate">{largestContextModel ? largestContextModel.model : 'N/A'}</span>
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-bold">
              {largestContextModel ? (largestContextModel.contextWindow / 1000).toFixed(0) : 0}k token window
            </div>
          </div>
        </div>
      </div>

      {/* 3. Token Distribution Breakdown Segment Panel */}
      {segments.length > 0 && (
        <div className="p-5 bg-card-dark border border-zinc-800  shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-orange" />
              Token Distribution Breakdown
            </span>
            <span className="text-zinc-400 font-normal">
              {segments.length} section(s) analyzed
            </span>
          </div>

          {/* Stacked Progress Bar */}
          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden flex">
            {segments.map((seg, idx) => {
              const colors = ['bg-accent-orange', 'bg-blue-500', 'bg-purple-500'];
              return (
                <div
                  key={seg.label}
                  style={{ width: `${seg.percentage}%` }}
                  className={`h-full ${colors[idx % colors.length]}`}
                  title={`${seg.label}: ${seg.percentage}% (${seg.tokens} tokens)`}
                />
              );
            })}
          </div>

          {/* Legend Tags */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            {segments.map((seg, idx) => {
              const dotColors = ['bg-accent-orange', 'bg-blue-500', 'bg-purple-500'];
              return (
                <div key={seg.label} className="flex items-center gap-1.5 text-zinc-400">
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % dotColors.length]}`} />
                  <span>
                    {seg.label}: <strong className="text-white">{seg.percentage}%</strong> ({seg.tokens} tok)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Actionable Recommendations Engine Panel */}
      <div className="p-5 bg-card-dark border border-zinc-800  shadow-xl space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
          <span className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-accent-orange" />
            Optimization Engine Recommendations ({recommendations.length})
          </span>
        </div>

        <div className="space-y-3">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 border  transition ${
                  rec.severity === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-200'
                    : rec.severity === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {rec.severity === 'error' ? (
                      <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    ) : rec.severity === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <Lightbulb className="w-5 h-5 text-accent-orange shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{rec.title}</span>
                        {rec.details?.costDeltaPercent && (
                          <Badge className="bg-emerald-500/20 border-emerald-500/40 text-emerald-400 text-[10px] px-1.5 py-0">
                            -{rec.details.costDeltaPercent}% Cost
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                        {rec.message}
                      </p>
                    </div>
                  </div>

                  {rec.details?.toModel && onSelectModel && (
                    <Button
                      onClick={() => {
                        const target = results.find(
                          (r) => r.model === rec.details?.toModel
                        );
                        if (target) onSelectModel(target.model_id);
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-7 px-3 border-zinc-700 hover:border-accent-orange text-accent-orange shrink-0"
                    >
                      <span>Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 bg-input-dark border border-zinc-800 text-zinc-500 text-xs text-center ">
              No active recommendations. Run prompt analysis to view optimization suggestions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
