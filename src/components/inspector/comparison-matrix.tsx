'use client';

import React, { useState } from 'react';
import { ModelInspectionResult } from '@/lib/analysis/schema';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Table, ShieldCheck, ArrowUpDown, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProviderIcon } from '@/components/icons/provider-icons';

interface ComparisonMatrixProps {
  results: ModelInspectionResult[];
}

export function ComparisonMatrix({ results }: ComparisonMatrixProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'estimatedCost', desc: false },
  ]);

  const columns: ColumnDef<ModelInspectionResult>[] = [
    {
      accessorKey: 'model',
      header: 'Model',
      cell: ({ row }) => (
        <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
          <ProviderIcon provider={row.original.provider} size={15} className="text-accent-orange shrink-0" />
          <span>{row.original.model}</span>
        </div>
      ),
    },
    {
      accessorKey: 'provider',
      header: 'Provider',
      cell: ({ row }) => (
        <div className="font-mono text-xs text-zinc-400 flex items-center gap-1.5">
          <ProviderIcon provider={row.original.provider} size={13} className="text-zinc-500 shrink-0" />
          <span>{row.original.provider}</span>
        </div>
      ),
    },
    {
      accessorKey: 'inputTokens',
      header: 'Input Tokens',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-zinc-200">
          {row.original.inputTokens.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'estimatedOutputTokens',
      header: 'Est. Output',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-zinc-400">
          {row.original.estimatedOutputTokens.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'estimatedCost',
      accessorFn: (row) => row.estimatedCost.total,
      header: 'Est. Total Cost',
      cell: ({ row }) => {
        const cost = row.original.estimatedCost.total;
        return (
          <div className="font-mono text-xs font-bold text-accent-orange flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-accent-orange" />
            <span>${cost.toFixed(5)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'contextUsagePercent',
      header: 'Context Used',
      cell: ({ row }) => {
        const percent = row.original.contextUsagePercent;
        const windowK = (row.original.contextWindow / 1000).toFixed(0);
        return (
          <div className="space-y-1 font-mono text-xs min-w-[120px]">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>{percent}%</span>
              <span>{windowK}k limit</span>
            </div>
            {/* Storeframe Orange Progress Bar */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-orange rounded-full transition-all duration-300"
                style={{ width: `${Math.max(2, Math.min(100, percent))}%` }}
              />
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
          <Badge variant={isExact ? 'success' : 'secondary'} className="gap-1">
            <ShieldCheck className={`w-3 h-3 ${isExact ? 'text-emerald-400' : 'text-zinc-500'}`} />
            {row.original.estimationMethod}
          </Badge>
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
    <Card className="border-zinc-800 bg-card-dark shadow-xl overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-accent-orange" />
          <CardTitle>Multi-Model Token & Cost Comparison Matrix</CardTitle>
        </div>
        <Badge variant="outline" className="text-zinc-400">
          {results.length} Models Compared
        </Badge>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left font-mono border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-input-dark border-b border-zinc-800/80 text-[11px] text-zinc-400 uppercase tracking-wider">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="p-3.5 font-bold cursor-pointer select-none hover:text-white transition"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <ArrowUpDown className="w-3 h-3 opacity-50" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-800/30 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
