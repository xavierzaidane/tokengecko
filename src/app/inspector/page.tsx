'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Navbar } from '@/components/layout/navbar';
import { PromptInput } from '@/components/inspector/prompt-input';
import { ModelSelector } from '@/components/inspector/model-selector';
import { OutputConfig } from '@/components/inspector/output-config';
import { ComparisonMatrix } from '@/components/inspector/comparison-matrix';
import { ContextChart } from '@/components/inspector/context-chart';
import { ShareModal } from '@/components/inspector/share-modal';
import { DEFAULT_MODELS } from '@/lib/models/registry';
import {
  computePromptStats,
  inspectPromptForAllModels,
} from '@/lib/tokenizers/engine';
import { insforge } from '@/lib/insforge/client';
import { Sparkles, BarChart2, Table } from 'lucide-react';

const INITIAL_PROMPT = `You are an expert AI software architect and senior full-stack engineer. Your task is to analyze user requests, produce robust system designs, evaluate performance trade-offs across cloud and edge providers, write clean, type-safe TypeScript code, and ensure all security and scalability best practices are met. Always prefer modular, scalable patterns.`;

const DEFAULT_SELECTION = ['gpt-5', 'claude-3-5-sonnet', 'gemini-2.0-flash', 'deepseek-v3'];

function InspectorContent() {
  const searchParams = useSearchParams();
  const reloadId = searchParams.get('reload');

  const [promptText, setPromptText] = useState(INITIAL_PROMPT);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(DEFAULT_SELECTION);
  const [estimatedOutputTokens, setEstimatedOutputTokens] = useState<number>(512);
  const [activeTab, setActiveTab] = useState<'matrix' | 'chart'>('matrix');

  useEffect(() => {
    async function loadReloadData() {
      if (!reloadId) return;
      try {
        const { data: analysisData } = await insforge.database
          .from('analyses')
          .select('*')
          .eq('id', reloadId);

        if (analysisData && analysisData.length > 0) {
          const item = analysisData[0];
          setPromptText(item.prompt_text);

          const { data: resultsData } = await insforge.database
            .from('analysis_results')
            .select('model_id')
            .eq('analysis_id', item.id);

          if (resultsData && resultsData.length > 0) {
            const reloadedIds = resultsData.map((r: any) => r.model_id);
            setSelectedModelIds(reloadedIds);
          }
        }
      } catch (err) {
        console.error('Error reloading analysis into inspector:', err);
      }
    }
    loadReloadData();
  }, [reloadId]);

  // Compute live statistics and multi-model results
  const stats = useMemo(() => computePromptStats(promptText), [promptText]);

  const selectedModels = useMemo(() => {
    return DEFAULT_MODELS.filter((m) => selectedModelIds.includes(m.model_id));
  }, [selectedModelIds]);

  const inspectionResults = useMemo(() => {
    return inspectPromptForAllModels(promptText, selectedModels, estimatedOutputTokens);
  }, [promptText, selectedModels, estimatedOutputTokens]);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
      {/* Workspace Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <Sparkles className="w-3 h-3" />
            Live Analysis Mode
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-mono text-white tracking-tight">
            Prompt Inspector Workspace
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Share & Save Actions */}
          <ShareModal promptText={promptText} results={inspectionResults} stats={stats} />

          {/* View Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#0F172A] border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                activeTab === 'matrix'
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Comparison Matrix
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                activeTab === 'chart'
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Context Chart
            </button>
          </div>
        </div>
      </div>

      {/* Top Section: Prompt Input */}
      <PromptInput promptText={promptText} onChange={setPromptText} stats={stats} />

      {/* Middle Section: Target Model Selector & Output Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ModelSelector
            selectedModelIds={selectedModelIds}
            onSelectionChange={setSelectedModelIds}
          />
        </div>
        <div className="lg:col-span-1">
          <OutputConfig
            estimatedOutputTokens={estimatedOutputTokens}
            onChange={setEstimatedOutputTokens}
          />
        </div>
      </div>

      {/* Results Section: Matrix or Visualization */}
      {activeTab === 'matrix' ? (
        <ComparisonMatrix results={inspectionResults} />
      ) : (
        <ContextChart results={inspectionResults} />
      )}
    </main>
  );
}

export default function InspectorPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
        <Navbar />
        <Suspense fallback={<div className="p-8 text-center text-slate-500 font-mono text-sm">Loading workspace...</div>}>
          <InspectorContent />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
