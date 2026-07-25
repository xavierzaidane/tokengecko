'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { ModelInspectionResult } from '@/lib/analysis/schema';
import { BarChart3 } from 'lucide-react';

interface ContextChartProps {
  results: ModelInspectionResult[];
}

export function ContextChart({ results }: ContextChartProps) {
  const data = results.map((item) => ({
    name: item.model,
    provider: item.provider,
    usagePercent: item.contextUsagePercent,
    inputTokens: item.inputTokens,
    contextWindow: item.contextWindow,
    totalCost: item.estimatedCost.total,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const info = payload[0].payload;
      return (
        <div className="bg-[#0F172A] border border-slate-700 p-3 rounded-xl shadow-xl font-mono text-xs text-slate-100 flex flex-col gap-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            {info.name}
            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
              {info.provider}
            </span>
          </div>
          <div className="text-emerald-400 font-semibold">
            Context Used: {info.usagePercent}%
          </div>
          <div className="text-slate-400 text-[11px]">
            {info.inputTokens.toLocaleString()} / {info.contextWindow.toLocaleString()} tokens
          </div>
          <div className="text-cyan-400 text-[11px] border-t border-slate-800 pt-1 mt-1">
            Est. Total Cost: ${info.totalCost.toFixed(5)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0F172A]/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold font-mono text-white">Context Window Utilization Chart</h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">% of total context consumed</span>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              fontFamily="monospace"
              domain={[0, (dataMax: number) => Math.max(10, Math.ceil(dataMax * 1.2))]}
              unit="%"
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }} />
            <Bar dataKey="usagePercent" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.usagePercent > 80
                      ? '#EF4444'
                      : entry.usagePercent > 40
                      ? '#F59E0B'
                      : '#10B981'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
