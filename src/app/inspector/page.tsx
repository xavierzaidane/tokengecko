'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
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
import { Sparkles, BarChart2, Table as TableIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const INITIAL_PROMPT = `You are an expert AI software architect and senior full-stack engineer. Your task is to analyze user requests, produce robust system designs, evaluate performance trade-offs across cloud and edge providers, write clean, type-safe TypeScript code, and ensure all security and scalability best practices are met. Always prefer modular, scalable patterns.`;

const DEFAULT_SELECTION = ['gpt-5', 'claude-3-5-sonnet', 'gemini-2.0-flash', 'deepseek-v3'];

function InspectorContent() {
  const searchParams = useSearchParams();
  const reloadId = searchParams.get('reload');

  const [promptText, setPromptText] = useState(INITIAL_PROMPT);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(DEFAULT_SELECTION);
  const [estimatedOutputTokens, setEstimatedOutputTokens] = useState<number>(512);
  const [activeTab, setActiveTab] = useState<string>('matrix');

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
    <div className="w-full space-y-6">
      {/* Header Banner matching Storeframe Console/Hyva Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-mono text-white tracking-tight">
            Prompt Inspector Workspace
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Compare token counts, pricing, and context limits for GPT-5, Claude, Gemini, and DeepSeek.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ShareModal promptText={promptText} results={inspectionResults} stats={stats} />
        </div>
      </div>

      {/* Top Section: Prompt Input Payload */}
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

      {/* Results View Switcher using Shadcn Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="matrix" icon={<TableIcon className="w-3.5 h-3.5" />}>
              Comparison Matrix
            </TabsTrigger>
            <TabsTrigger value="chart" icon={<BarChart2 className="w-3.5 h-3.5" />}>
              Context Visualization
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="matrix">
          <ComparisonMatrix results={inspectionResults} />
        </TabsContent>

        <TabsContent value="chart">
          <ContextChart results={inspectionResults} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function InspectorPage() {
  return (
    <AuthGuard>
      <SidebarLayout>
        <Suspense fallback={<div className="p-8 text-center text-zinc-500 font-mono text-sm">Loading workspace...</div>}>
          <InspectorContent />
        </Suspense>
      </SidebarLayout>
    </AuthGuard>
  );
}
