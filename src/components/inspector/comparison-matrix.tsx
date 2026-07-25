'use client';

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { ModelInspectionResult } from '@/lib/analysis/schema';
import { ArrowUpDown, ArrowUp, ArrowDown, Cpu, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ComparisonMatrixProps {
  results: ModelInspectionResult[];
}

export function ComparisonMatrix({ results }: ComparisonMatrixProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'totalCost', desc: false }, // default sort cheapest total cost first
  ]);

  const columns: ColumnDef<ModelInspectionResult>[] = [
    {
      accessorKey: 'model',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 hover:text-white font-mono text-xs"
        >
          Model & Provider
          <ArrowUpDown className="w-3 h-3 text-slate-500" />
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-mono font-bold text-sm text-white flex items-center gap-2">
              {item.model}
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300">
                {item.provider}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              Tokenizer: <span className="text-slate-400">{item.tokenizer}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'inputTokens',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 hover:text-white font-mono text-xs"
        >
          Input Tokens
          <ArrowUpDown className="w-3 h-3 text-slate-500" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm font-semibold text-emerald-400">
          {row.original.inputTokens.toLocaleString()}{' '}
          <span className="text-[10px] text-slate-500 font-normal">tok</span>
        </div>
      ),
    },
    {
      accessorKey: 'estimatedOutputTokens',
      header: 'Est. Output',
      cell: ({ row }) => (
        <div className="font-mono text-xs text-slate-300">
          {row.original.estimatedOutputTokens.toLocaleString()}{' '}
          <span className="text-[10px] text-slate-500">tok</span>
        </div>
      ),
    },
    {
      id: 'totalCost',
      accessorFn: (row) => row.estimatedCost.total,
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 hover:text-white font-mono text-xs"
        >
          Est. Cost Breakdown
          <ArrowUpDown className="w-3 h-3 text-slate-500" />
        </button>
      ),
      cell: ({ row }) => {
        const cost = row.original.estimatedCost;
        return (
          <div className="flex flex-col gap-0.5 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-bold text-xs">
                ${cost.total < 0.0001 ? cost.total.toFixed(6) : cost.total.toFixed(5)}
              </span>
              <span className="text-[10px] text-slate-500">total</span>
            </div>
            <div className="text-[10px] text-slate-500 flex gap-2">
              <span>In: ${cost.input.toFixed(5)}</span>
              <span>Out: ${cost.output.toFixed(5)}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'contextUsagePercent',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 hover:text-white font-mono text-xs"
        >
          Context Window Fit
          <ArrowUpDown className="w-3 h-3 text-slate-500" />
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const percent = item.contextUsagePercent;
        return (
          <div className="flex flex-col gap-1 w-44 font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-semibold">{percent}% used</span>
              <span className="text-slate-500">{(item.contextWindow / 1000).toFixed(0)}k max</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percent > 90 ? 'bg-red-500' : percent > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.max(2, percent)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500">
              Rem: <span className="text-slate-400">{item.remainingContext.toLocaleString()} tok</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'estimationMethod',
      header: 'Method',
      cell: ({ row }) => {
        const isExact = row.original.estimationMethod === 'Exact (API)';
        return (
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg font-mono text-[11px] font-semibold border ${
              isExact
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isExact ? 'text-emerald-400' : 'text-slate-500'}`} />
            {row.original.estimationMethod}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: results,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-[#0F172A]/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold font-mono text-white">Multi-Model Comparison Matrix</h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Showing {results.length} models • Sorted by price
        </span>
      </div>

      {/* TanStack Table View */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#0B0F17]/80">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-800 bg-[#0F172A]/90">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3 text-xs font-mono text-slate-400 font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-800/40 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 text-xs">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
