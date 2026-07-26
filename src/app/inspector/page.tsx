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
import { InspectionSummaryPanel } from '@/components/inspector/inspection-summary';
import { ShareModal } from '@/components/inspector/share-modal';
import { DEFAULT_MODELS } from '@/lib/models/registry';
import {
  computePromptStats,
  inspectPromptForAllModels,
} from '@/lib/tokenizers/engine';
import { analyzePromptOptimization } from '@/lib/optimization/engine';
import { insforge } from '@/lib/insforge/client';
import {
  BarChart2,
  Table as TableIcon,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const INITIAL_PROMPT = `You are an expert AI software architect and senior full-stack engineer. Your task is to analyze user requests, produce robust system designs, evaluate performance trade-offs across cloud and edge providers, write clean, type-safe TypeScript code, and ensure all security and scalability best practices are met. Always prefer modular, scalable patterns.`;

const DEFAULT_SELECTION = ['gpt-5', 'claude-3-5-sonnet', 'gemini-2.0-flash', 'deepseek-v3'];

function InspectorContent() {
  const searchParams = useSearchParams();
  const reloadId = searchParams.get('reload');

  const [promptText, setPromptText] = useState(INITIAL_PROMPT);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(DEFAULT_SELECTION);
  const [estimatedOutputTokens, setEstimatedOutputTokens] = useState<number>(512);
  const [activeTab, setActiveTab] = useState<string>('editor');

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

  const optimization = useMemo(() => {
    return analyzePromptOptimization(promptText, inspectionResults);
  }, [promptText, inspectionResults]);

  const handleSelectModel = (modelId: string) => {
    if (!selectedModelIds.includes(modelId)) {
      setSelectedModelIds([...selectedModelIds, modelId]);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner matching Storeframe Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-mono text-white tracking-tight">
            Welcome User
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            IDE prompt payload editor, model catalog selector, optimization engine recommendations, and context charts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ShareModal promptText={promptText} results={inspectionResults} stats={stats} />
        </div>
      </div>

      {/* Storeframe-style Top Navigation Tabs Bar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger
            value="editor"
            icon={<FileCode className="w-3.5 h-3.5 text-accent-orange" />}
          >
            IDE Prompt & Model Catalog
          </TabsTrigger>

          <TabsTrigger
            value="summary"
            icon={<Sparkles className="w-3.5 h-3.5 text-accent-orange" />}
            badge={
              <Badge
                variant="outline"
                className={`text-[9px] px-1.5 py-0 font-mono font-bold uppercase ml-1 ${
                  optimization.health.status === 'good'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : optimization.health.status === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                {optimization.health.label}
              </Badge>
            }
          >
            Optimization & Health
          </TabsTrigger>

          <TabsTrigger
            value="matrix"
            icon={<TableIcon className="w-3.5 h-3.5 text-accent-orange" />}
          >
            Comparison Matrix
          </TabsTrigger>

          <TabsTrigger
            value="chart"
            icon={<BarChart2 className="w-3.5 h-3.5 text-accent-orange" />}
          >
            Context Visualization
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: 2-Column Layout with Prominent Monaco IDE Prompt Editor Column */}
        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Monaco IDE Prompt Editor (Wider, prominent col-span-7/8) */}
            <div className="lg:col-span-7 xl:col-span-8">
              <PromptInput promptText={promptText} onChange={setPromptText} stats={stats} />
            </div>

            {/* Right Column: Model Selection Catalog & Output Configuration (col-span-5/4) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <ModelSelector
                selectedModelIds={selectedModelIds}
                onSelectionChange={setSelectedModelIds}
                height="600px"
              />
              <OutputConfig
                estimatedOutputTokens={estimatedOutputTokens}
                onChange={setEstimatedOutputTokens}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Inspection Summary Panel & Optimization Engine Recommendations */}
        <TabsContent value="summary" className="space-y-6">
          <InspectionSummaryPanel
            promptText={promptText}
            results={inspectionResults}
            onSelectModel={handleSelectModel}
          />
        </TabsContent>

        {/* Tab 3: Detailed Side-by-Side Comparison Matrix */}
        <TabsContent value="matrix" className="space-y-6">
          <ComparisonMatrix results={inspectionResults} />
        </TabsContent>

        {/* Tab 4: Dynamic Context Window Visualization Chart */}
        <TabsContent value="chart" className="space-y-6">
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
