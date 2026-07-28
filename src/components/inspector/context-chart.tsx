'use client';

import React, { useState, useMemo } from 'react';
import { ModelInspectionResult } from '@/lib/analysis/schema';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceLine,
  Tooltip,
} from 'recharts';
import { Cpu, Sparkles, Hash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  type ChartConfig,
} from '@/components/ui/chart';
import { RegistrySnapshot } from '@/types/analysis';
import { CostVsContextScatter, getBrandColor } from '@/components/inspector/cost-context-scatter';
import { LLMLeaderboard } from '@/components/inspector/llm-leaderboard';
import { TokenDistributionBar } from '@/components/inspector/token-distribution-bar';
import { analyzePromptOptimization } from '@/lib/optimization/engine';

interface ContextChartProps {
  results: ModelInspectionResult[];
  promptText?: string;
  registrySnapshot?: RegistrySnapshot;
}

const chartConfig = {
  usedVal: {
    label: 'Used Context',
    color: '#f97316',
  },
  remainingVal: {
    label: 'Remaining Headroom',
    color: '#38bdf8',
  },
} satisfies ChartConfig;

export function ContextChart({
  results,
  promptText = '',
  registrySnapshot,
}: ContextChartProps) {
  // Toggle between % display scale vs absolute token count display scale
  const [metricMode, setMetricMode] = useState<'percent' | 'tokens'>('percent');

  // Compute optimization segments for token distribution breakdown
  const segments = useMemo(() => {
    const analysis = analyzePromptOptimization(promptText, results);
    return analysis.segments || [];
  }, [promptText, results]);

  const maxTokens = Math.max(...results.map((r) => r.contextWindow), 1000);

  const { chartData, activeProviders } = useMemo(() => {
    const providerMap = new Map<string, { fill: string; name: string }>();

    const data = results.map((r) => {
      const usedPct = Math.min(100, Number(r.contextUsagePercent));
      const remainingPct = Math.max(0, 100 - usedPct);
      const usedTok = r.inputTokens;
      const remainingTok = Math.max(0, r.contextWindow - r.inputTokens);
      const brand = getBrandColor(r.provider, r.model);

      if (!providerMap.has(r.provider.toLowerCase())) {
        providerMap.set(r.provider.toLowerCase(), {
          fill: brand.fill,
          name: r.provider,
        });
      }

      // Format display model name: truncate brand prefix if length > 8 models
      let shortName = r.model;
      if (results.length > 8) {
        shortName = r.model.replace(/^(Anthropic|OpenAI|Google|Cohere|Meta|xAI|Mistral):?\s*/i, '');
      }

      return {
        name: shortName,
        fullName: r.model,
        provider: r.provider,
        usagePercent: usedPct,
        inputTokens: usedTok,
        remainingTokens: remainingTok,
        contextWindow: r.contextWindow,
        totalCost: r.estimatedCost.total,
        fill: brand.fill,
        stroke: brand.stroke,

        // Values for Recharts stacked bar
        usedVal: metricMode === 'percent' ? usedPct : usedTok,
        remainingVal: metricMode === 'percent' ? remainingPct : remainingTok,
      };
    });

    return {
      chartData: data,
      activeProviders: Array.from(providerMap.values()),
    };
  }, [results, metricMode]);

  const rotateTicks = results.length > 8;

  return (
    <div className="space-y-6 w-full font-mono">
      {/* 1. Two-Column Grid: Scatter Chart (left) + LLM Leaderboard (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <CostVsContextScatter results={results} />
        </div>
        <div className="lg:col-span-5">
          <LLMLeaderboard results={results} />
        </div>
      </div>

      {/* 2. Context Headroom Stacked Bar Chart */}
      <div className="space-y-3 font-mono">
        {/* Header separated outside the card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">
                Context Headroom & Capacity Utilization
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                Each model color-coded by brand (OpenAI White, Claude Orange, Gemini Blue). Stacked segments show consumed vs remaining headroom.
              </p>
            </div>
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex items-center gap-1 font-mono text-xs bg-zinc-950 p-1 border border-zinc-800">
            <button
              onClick={() => setMetricMode('percent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition  font-semibold ${
                metricMode === 'percent'
                  ? 'bg-accent-orange text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>% Display</span>
            </button>
            <button
              onClick={() => setMetricMode('tokens')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition  font-semibold ${
                metricMode === 'tokens'
                  ? 'bg-accent-orange text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Hash className="w-3 h-3" />
              <span>Tokens Display</span>
            </button>
          </div>
        </div>

        <Card className="border-zinc-800 bg-card-dark shadow-2xl w-full relative overflow-hidden">
          {/* Background SVG Grid Pattern Accent */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px]" />

          <CardContent className="p-4 sm:p-6 relative z-10">
            <ChartContainer config={chartConfig} className="h-[340px] w-full">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 15,
                  bottom: rotateTicks ? 60 : 25,
                }}
              >
                {/* Duotone Grid */}
                <CartesianGrid strokeDasharray="2 2" stroke="#27272A" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#A1A1AA"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#3F3F46' }}
                  interval={0}
                  angle={rotateTicks ? -35 : 0}
                  textAnchor={rotateTicks ? 'end' : 'middle'}
                />
                <YAxis
                  stroke="#A1A1AA"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#3F3F46' }}
                  domain={[0, metricMode === 'percent' ? 100 : Math.ceil(maxTokens * 1.05)]}
                  tickFormatter={(val) =>
                    metricMode === 'percent'
                      ? `${val}%`
                      : val >= 1000
                      ? `${(val / 1000).toFixed(0)}k`
                      : `${val}`
                  }
                />

                {/* 80% Warning Limit Reference Line */}
                {metricMode === 'percent' && (
                  <ReferenceLine
                    y={80}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: '80% Warning Threshold',
                      fill: '#f43f5e',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />
                )}

                {/* Tooltip Card */}
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isHigh = data.usagePercent >= 80;
                      return (
                        <div className="bg-zinc-950 border border-zinc-800 p-3.5 shadow-2xl font-mono text-xs space-y-2.5 z-50 min-w-[230px]">
                          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                            <div className="flex items-center gap-2 font-bold text-white text-sm">
                              <span
                                className="w-3 h-3 rounded-full shrink-0 border border-zinc-700"
                                style={{ backgroundColor: data.fill }}
                              />
                              <span className="truncate">{data.fullName}</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 px-2 py-0.5 bg-zinc-900 border border-zinc-800 ">
                              {data.provider}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Context Consumed:</span>
                              <span
                                className={`font-bold ${
                                  isHigh ? 'text-rose-400' : 'text-orange-400'
                                }`}
                              >
                                {data.usagePercent}%
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Used Tokens:</span>
                              <span className="text-zinc-200">
                                {data.inputTokens.toLocaleString()} tok
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Remaining Headroom:</span>
                              <span className="text-sky-400 font-semibold">
                                {data.remainingTokens.toLocaleString()} tok
                              </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-zinc-800/60 pt-1.5 mt-1">
                              <span className="text-zinc-400">Context Limit:</span>
                              <span className="text-zinc-300">
                                {(data.contextWindow / 1000).toFixed(0)}k max
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Stacked Bar Segment 1: Used Tokens (Model Brand Colors) */}
                <Bar dataKey="usedVal" name="Used Context" stackId="context" minPointSize={2}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`used-cell-${index}`}
                      fill={entry.usagePercent >= 80 ? '#f43f5e' : entry.fill}
                      stroke={entry.stroke}
                      strokeWidth={1}
                      className="transition-opacity duration-200 hover:opacity-90 cursor-pointer"
                    />
                  ))}
                </Bar>

                {/* Stacked Bar Segment 2: Remaining Capacity (Dimmed Model Brand Colors) */}
                <Bar
                  dataKey="remainingVal"
                  name="Remaining Headroom"
                  stackId="context"
                  radius={[6, 6, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`remaining-cell-${index}`}
                      fill={entry.fill}
                      fillOpacity={0.25}
                      stroke={entry.stroke}
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      className="transition-opacity duration-200 hover:opacity-90 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            {/* Model Brand Legend Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-4 border-t border-zinc-800/80 text-zinc-400">
              <div className="flex flex-wrap items-center gap-2">
                {activeProviders.map((prov) => (
                  <div
                    key={`bar-prov-pill-${prov.name}`}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/80 border border-zinc-800 "
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-zinc-700 shrink-0"
                      style={{ backgroundColor: prov.fill }}
                    />
                    <span className="text-zinc-300 font-medium capitalize text-[11px]">
                      {prov.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 px-2.5 py-1 bg-rose-500/10 border border-rose-500/30  shrink-0">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                <span className="text-rose-300 font-medium text-[11px]">&gt;= 80% High Capacity Alert</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Data Source & Registry Snapshot Attribution Footer */}
      {registrySnapshot && (
        <div className="p-3 text-[11px] font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <span>
            Data Source:{' '}
            <strong className="text-white">
              {registrySnapshot.source === 'openrouter'
                ? 'Live OpenRouter Registry'
                : 'Seed Registry Fallback'}
            </strong>
          </span>
          <span>
            Snapshot:{' '}
            <strong className="text-accent-orange">
              {new Date(registrySnapshot.lastSyncedAt).toLocaleTimeString()}
            </strong>{' '}
            ({registrySnapshot.totalModels} models active)
          </span>
        </div>
      )}
    </div>
  );
}
