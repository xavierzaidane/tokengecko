'use client';

import React, { useMemo } from 'react';
import { ModelInspectionResult } from '@/lib/analysis/schema';
import {
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
  Tooltip,
} from 'recharts';
import { Cpu, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CostVsContextScatterProps {
  results: ModelInspectionResult[];
  className?: string;
}

interface ScatterPoint {
  id: string;
  name: string;
  provider: string;
  cost: number;
  contextK: number;
  quality: number;
  tradeoffScore: number;
  isBestValue: boolean;
  fill: string;
  stroke: string;
}

// Brand color lookup function per provider / model
export function getBrandColor(providerName: string, modelName: string = ''): { fill: string; stroke: string; label: string } {
  const p = (providerName || '').toLowerCase();
  const m = (modelName || '').toLowerCase();

  if (p.includes('anthropic') || m.includes('claude')) {
    return { fill: '#d97706', stroke: '#f59e0b', label: 'Anthropic (Claude Orange)' };
  }
  if (p.includes('openai') || m.includes('gpt')) {
    return { fill: '#ffffff', stroke: '#cbd5e1', label: 'OpenAI (White)' };
  }
  if (p.includes('google') || m.includes('gemini')) {
    return { fill: '#60a5fa', stroke: '#3b82f6', label: 'Google (Gemini Blue)' };
  }
  if (p.includes('deepseek')) {
    return { fill: '#3b82f6', stroke: '#1d4ed8', label: 'DeepSeek (Vivid Blue)' };
  }
  if (p.includes('meta') || m.includes('llama')) {
    return { fill: '#06b6d4', stroke: '#0891b2', label: 'Meta (Cyan)' };
  }
  if (p.includes('mistral')) {
    return { fill: '#ff5e00', stroke: '#ea580c', label: 'Mistral (Orange)' };
  }
  if (p.includes('qwen') || p.includes('alibaba')) {
    return { fill: '#a855f7', stroke: '#9333ea', label: 'Qwen (Purple)' };
  }
  if (p.includes('cohere')) {
    return { fill: '#ec4899', stroke: '#db2777', label: 'Cohere (Pink)' };
  }
  if (p.includes('perplexity')) {
    return { fill: '#14b8a6', stroke: '#0d9488', label: 'Perplexity (Teal)' };
  }
  if (p.includes('amazon') || m.includes('nova')) {
    return { fill: '#f59e0b', stroke: '#d97706', label: 'Amazon (Amber)' };
  }
  if (p.includes('microsoft') || m.includes('phi')) {
    return { fill: '#10b981', stroke: '#059669', label: 'Microsoft (Emerald)' };
  }
  if (p.includes('nvidia') || m.includes('nemotron')) {
    return { fill: '#22c55e', stroke: '#16a34a', label: 'Nvidia (Green)' };
  }
  if (p.includes('xai') || m.includes('grok')) {
    return { fill: '#eab308', stroke: '#ca8a04', label: 'xAI (Yellow)' };
  }
  if (p.includes('xiaomi') || m.includes('mimo')) {
    return { fill: '#ff6900', stroke: '#d95300', label: 'Xiaomi (Bright Orange)' };
  }

  return { fill: '#38bdf8', stroke: '#0284c7', label: providerName || 'Model' };
}

export function CostVsContextScatter({ results, className = '' }: CostVsContextScatterProps) {
  const { dataPoints, frontierLinePoints, activeProviders } = useMemo(() => {
    if (!results || results.length === 0) {
      return { dataPoints: [], frontierLinePoints: [], activeProviders: [] };
    }

    // 1. Map model inspection results to scatter data points with distinct brand colors
    const points: ScatterPoint[] = results.map((r) => {
      const qScore = r.qualityScores
        ? Object.values(r.qualityScores).find((val) => typeof val === 'number') || 80
        : 80;
      const cost = Math.max(r.estimatedCost.total, 0.000001);
      const contextK = Math.round(r.contextWindow / 1000);
      const tScore = r.tradeoffScore || Math.round((qScore / (cost * 1000)) * 10) / 10;

      const brand = getBrandColor(r.provider, r.model);

      return {
        id: r.model_id || r.model,
        name: r.model,
        provider: r.provider,
        cost,
        contextK,
        quality: qScore,
        tradeoffScore: tScore,
        isBestValue: false,
        fill: brand.fill,
        stroke: brand.stroke,
      };
    });

    // 2. Identify Best Value model (highest tradeoff score)
    const sortedByTradeoff = [...points].sort((a, b) => b.tradeoffScore - a.tradeoffScore);
    const bestValue = sortedByTradeoff[0] || null;

    points.forEach((p) => {
      if (bestValue && p.id === bestValue.id) {
        p.isBestValue = true;
      }
    });

    // 3. Compute Pareto Frontier curve points sorted by cost
    const sortedByCost = [...points].sort((a, b) => a.cost - b.cost);
    const frontier: { cost: number; contextK: number }[] = [];
    let maxContextSoFar = -1;

    for (const p of sortedByCost) {
      if (p.contextK > maxContextSoFar) {
        frontier.push({ cost: p.cost, contextK: p.contextK });
        maxContextSoFar = p.contextK;
      }
    }

    // 4. Collect unique active provider colors for the chart legend
    const providerMap = new Map<string, { fill: string; name: string }>();
    points.forEach((p) => {
      if (!providerMap.has(p.provider.toLowerCase())) {
        const brand = getBrandColor(p.provider, p.name);
        providerMap.set(p.provider.toLowerCase(), {
          fill: brand.fill,
          name: p.provider,
        });
      }
    });

    return {
      dataPoints: points,
      frontierLinePoints: frontier,
      activeProviders: Array.from(providerMap.values()),
    };
  }, [results]);

  if (dataPoints.length === 0) return null;

  const minCost = Math.min(...dataPoints.map((d) => d.cost));
  const maxCost = Math.max(...dataPoints.map((d) => d.cost));
  const maxContext = Math.max(...dataPoints.map((d) => d.contextK));

  return (
    <div className={`space-y-3 font-mono ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white">
              Cost vs. Context Capacity Tradeoff
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
              Distinct brand colors per model (e.g. OpenAI White, Claude Orange, Gemini Blue). Bubble size represents quality rating.
            </p>
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <Card className="border-zinc-800 bg-card-dark shadow-2xl w-full ">
        <CardContent className="p-4 sm:p-6">
          <div className="h-80 w-full">
            <ComposedChart
              width={700}
              height={300}
              margin={{ top: 20, right: 30, left: 15, bottom: 25 }}
              className="w-full h-full"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
              <XAxis
                dataKey="cost"
                type="number"
                name="Cost per Run"
                unit="$"
                domain={[Math.max(0, minCost * 0.8), maxCost * 1.15]}
                stroke="#A1A1AA"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#3F3F46' }}
                tickFormatter={(val) => `$${val < 0.001 ? val.toFixed(5) : val.toFixed(4)}`}
              />
              <YAxis
                dataKey="contextK"
                type="number"
                name="Context Window"
                unit="k"
                domain={[0, Math.ceil(maxContext * 1.15)]}
                stroke="#A1A1AA"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#3F3F46' }}
                tickFormatter={(val) => `${val}k`}
              />
              <ZAxis dataKey="quality" type="number" range={[140, 500]} name="Quality Score" />

              {/* Custom Tooltip */}
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: '#71717A' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ScatterPoint;
                    if (!data.name) return null;

                    return (
                      <div className="bg-zinc-950 border border-zinc-800 p-3.5 shadow-2xl  font-mono text-xs space-y-2.5 z-50 min-w-[230px]">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                          <div className="flex items-center gap-2 font-bold text-white text-sm">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 border border-zinc-700"
                              style={{ backgroundColor: data.fill }}
                            />
                            <span className="truncate">{data.name}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 px-2 py-0.5 bg-zinc-900 border border-zinc-800">
                            {data.provider}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Est. Cost / Run:</span>
                            <span className="text-accent-orange font-bold">${data.cost.toFixed(5)}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Context Window:</span>
                            <span className="text-zinc-200">{data.contextK}k max</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Quality Score:</span>
                            <span className="text-emerald-400 font-bold">{data.quality}/100</span>
                          </div>

                          <div className="flex items-center justify-between border-t border-zinc-800/60 pt-1.5 mt-1">
                            <span className="text-zinc-400">Tradeoff Index:</span>
                            <span className="text-amber-300 font-bold">{data.tradeoffScore}</span>
                          </div>

                          {data.isBestValue && (
                            <div className="mt-2 pt-2 border-t border-amber-500/20 text-center">
                              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/30 flex items-center justify-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                Best Cost/Quality Tradeoff
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Pareto Frontier Line */}
              {frontierLinePoints.length > 1 && (
                <Line
                  data={frontierLinePoints}
                  dataKey="contextK"
                  type="monotone"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {/* Scatter Points with distinct model brand colors */}
              <Scatter data={dataPoints} isAnimationActive={false}>
                {dataPoints.map((entry, index) => (
                  <Cell
                    key={`scatter-cell-${index}`}
                    fill={entry.fill}
                    stroke={entry.isBestValue ? '#ffffff' : entry.stroke}
                    strokeWidth={entry.isBestValue ? 2.5 : 1}
                  />
                ))}
              </Scatter>
            </ComposedChart>
          </div>

          {/* Model Brand Color Legend Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-4 border-t border-zinc-800/80 text-zinc-400">
            <div className="flex flex-wrap items-center gap-2">
              {activeProviders.map((prov) => (
                <div
                  key={`prov-pill-${prov.name}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/80 border border-zinc-800 rounded-md"
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
