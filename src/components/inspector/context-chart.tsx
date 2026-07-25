'use client';

import React, { useState } from 'react';
import { ModelInspectionResult } from '@/lib/analysis/schema';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { BarChart2, Cpu, Sparkles, Hash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';

interface ContextChartProps {
  results: ModelInspectionResult[];
}

const chartConfig = {
  value: {
    label: 'Metric Value',
    color: '#ba7545',
  },
} satisfies ChartConfig;

export function ContextChart({ results }: ContextChartProps) {
  const [metricMode, setMetricMode] = useState<'percent' | 'tokens'>('percent');

  const rawPercents = results.map((r) => Number(r.contextUsagePercent));
  const maxPercent = Math.max(...rawPercents, 0.01);
  const yMaxPercent = Math.min(100, Math.max(0.1, Number((maxPercent * 1.25).toFixed(2))));

  const rawTokens = results.map((r) => r.inputTokens);
  const maxTokens = Math.max(...rawTokens, 100);
  const yMaxTokens = Math.ceil(maxTokens * 1.2);

  const chartData = results.map((r) => {
    const percent = Number(r.contextUsagePercent);
    return {
      name: r.model,
      provider: r.provider,
      usagePercent: percent,
      inputTokens: r.inputTokens,
      contextWindow: r.contextWindow,
      totalCost: r.estimatedCost.total,
      estimationMethod: r.estimationMethod,
      value: metricMode === 'percent' ? percent : r.inputTokens,
    };
  });

  return (
    <Card className="border-zinc-800 bg-card-dark shadow-xl w-full">
      <CardHeader className="p-4 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-accent-orange" />
          <div>
            <CardTitle>Context Utilization & Relative Consumption</CardTitle>
            <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
              {metricMode === 'percent'
                ? `Dynamic auto-scaled relative percentage (Max scale: ${yMaxPercent}%)`
                : 'Direct input token comparison across selected models'}
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 font-mono text-xs bg-input-dark p-1 border border-zinc-800">
          <button
            onClick={() => setMetricMode('percent')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs transition ${
              metricMode === 'percent'
                ? 'bg-accent-orange text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Dynamic % Scale</span>
          </button>
          <button
            onClick={() => setMetricMode('tokens')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs transition ${
              metricMode === 'tokens'
                ? 'bg-accent-orange text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Hash className="w-3 h-3" />
            <span>Tokens Count</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 font-mono">
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 15, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#A1A1AA"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#3F3F46' }}
            />
            <YAxis
              stroke="#A1A1AA"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#3F3F46' }}
              domain={[0, metricMode === 'percent' ? yMaxPercent : yMaxTokens]}
              tickFormatter={(val) =>
                metricMode === 'percent'
                  ? `${val < 1 ? val.toFixed(2) : val.toFixed(0)}%`
                  : val >= 1000
                  ? `${(val / 1000).toFixed(1)}k`
                  : `${val}`
              }
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card-dark border border-zinc-800 p-3.5 shadow-2xl rounded-md font-mono text-xs space-y-2 z-50 min-w-[210px]">
                      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                          <Cpu className="w-3.5 h-3.5 text-accent-orange" />
                          {data.name}
                        </div>
                        <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 bg-zinc-800 rounded">
                          {data.provider}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Context Used:</span>
                          <span className="text-accent-orange font-bold">{data.usagePercent}%</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Tokens Payload:</span>
                          <span className="text-zinc-200">{data.inputTokens.toLocaleString()} tok</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Context Limit:</span>
                          <span className="text-zinc-300">{(data.contextWindow / 1000).toFixed(0)}k max</span>
                        </div>

                        <div className="flex items-center justify-between border-t border-zinc-800/60 pt-1.5 mt-1">
                          <span className="text-zinc-400">Est. Total Cost:</span>
                          <span className="text-accent-orange font-bold">${data.totalCost.toFixed(5)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" minPointSize={6} radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.usagePercent > 50 ? '#EF4444' : '#ba7545'}
                  className="transition-opacity duration-200 hover:opacity-85 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
