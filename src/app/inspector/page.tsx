'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react';
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
import { MacbookAir3D } from '@/components/ui/macbook-air-3d';
import { DEFAULT_MODELS, ModelInfo, fetchLiveRegistry } from '@/lib/models/registry';
import {
  computePromptStats,
  inspectPromptForAllModels,
} from '@/lib/tokenizers/engine';
import { analyzePromptOptimization } from '@/lib/optimization/engine';
import { insforge } from '@/lib/insforge/client';
import { AnalysisState, RegistrySnapshot } from '@/types/analysis';
import { ModelInspectionResult, Recommendation } from '@/lib/analysis/schema';
import {
  BarChart2,
  Table as TableIcon,
  FileCode,
  Sparkles,
  Activity,
  Play,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  LucideCircleArrowOutUpRight,
} from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/ui/animated-tabs';

const INITIAL_PROMPT = `You are an expert AI software architect and senior full-stack engineer. Your task is to analyze user requests, produce robust system designs, evaluate performance trade-offs across cloud and edge providers, write clean, type-safe TypeScript code, and ensure all security and scalability best practices are met. Always prefer modular, scalable patterns.`;

const DEFAULT_SELECTION = ['gpt-5', 'claude-3-5-sonnet', 'gemini-2.0-flash', 'deepseek-v3'];

function StaleWarningBanner({ onReAnalyze }: { onReAnalyze: () => void }) {
  return (
    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-200 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 rounded-md shadow-lg">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="text-amber-300">Inputs Changed:</strong> Current prompt or model selection has modified since the last analysis run.
        </span>
      </div>
      <Button
        onClick={onReAnalyze}
        size="sm"
        className="bg-white hover:bg-zinc-200 text-zinc-950 font-mono font-bold text-xs gap-1.5 px-3 py-1 shrink-0 cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Re-Analyze Prompt</span>
      </Button>
    </div>
  );
}

function EmptyAnalysisState({
  onRunAnalysis,
  onGoToSetup,
}: {
  onRunAnalysis: () => void;
  onGoToSetup: () => void;
}) {
  return (
    <div className="p-8 text-center font-mono space-y-4 max-w-2xl mx-auto my-4 mt-20">
      {/* Animated 3D Macbook Air by EaseMize UI */}
      <MacbookAir3D />

      <div>
        <h3 className="text-lg font-bold text-white tracking-tight">No Analysis Generated Yet</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 font-sans">
          Configure your prompt text and model selection in the Prompt & Model Setup tab, then click Analyze Prompt to generate multi-model token & cost metrics.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          onClick={onGoToSetup}
          variant="outline"
        className="bg-accent-orange hover:bg-accent-orange/90 text-zinc-950 font-mono font-bold text-xs gap-2 px-5 py-2 cursor-pointer"
        >
          <span>Go to Setup Tab</span>
          <LucideCircleArrowOutUpRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function InspectorContent() {
  const searchParams = useSearchParams();
  const reloadId = searchParams.get('reload');

  const [promptText, setPromptText] = useState(INITIAL_PROMPT);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>(DEFAULT_MODELS);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(DEFAULT_SELECTION);
  const [estimatedOutputTokens, setEstimatedOutputTokens] = useState<number>(512);
  const [activeTab, setActiveTab] = useState<string>('editor');

  const [registryMetadata, setRegistryMetadata] = useState<{
    source: 'openrouter' | 'litellm' | 'default_fallback';
    lastSyncedAt: string;
  }>({
    source: 'default_fallback',
    lastSyncedAt: new Date().toISOString(),
  });

  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    input: {
      promptText: INITIAL_PROMPT,
      selectedModelIds: DEFAULT_SELECTION,
      targetOutputTokens: 512,
    },
    result: null,
  });

  // Dynamically load models from live registry (OpenRouter / InsForge / Local cache)
  useEffect(() => {
    async function initModels() {
      try {
        const cachedRes = await fetchLiveRegistry(false);
        if (cachedRes.models && cachedRes.models.length > 0) {
          setAvailableModels(cachedRes.models);
          setRegistryMetadata({
            source: cachedRes.source,
            lastSyncedAt: cachedRes.syncedAt,
          });
        }
        const liveRes = await fetchLiveRegistry(true);
        if (liveRes.models && liveRes.models.length > 0) {
          setAvailableModels(liveRes.models);
          setRegistryMetadata({
            source: liveRes.source,
            lastSyncedAt: liveRes.syncedAt,
          });
        }
      } catch {
        // Fallback to DEFAULT_MODELS on error
      }
    }
    initModels();
  }, []);

  const isReloadingRef = useRef(false);

  // Reload saved analysis from InsForge DB if URL parameter present
  useEffect(() => {
    async function loadReloadData() {
      if (!reloadId) return;
      isReloadingRef.current = true;
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
            .select('*')
            .eq('analysis_id', item.id);

          if (resultsData && resultsData.length > 0) {
            const reloadedIds = resultsData.map((r: any) => r.model_id);
            setSelectedModelIds(reloadedIds);

            let perModel: ModelInspectionResult[] = resultsData
              .map((r: any) => r.normalized_output as ModelInspectionResult)
              .filter(Boolean);

            let recommendations: Recommendation[] = [];

            if (perModel.length > 0) {
              const optimization = analyzePromptOptimization(item.prompt_text, perModel);
              recommendations = optimization.recommendations;
            } else {
              // Fallback: re-calculate model inspection if normalized_output was empty
              const selectedModels = availableModels.filter(
                (m) =>
                  reloadedIds.includes(m.model_id) ||
                  reloadedIds.includes(m.name)
              );
              const modelsToInspect =
                selectedModels.length > 0
                  ? selectedModels
                  : DEFAULT_MODELS.slice(0, 4);

              perModel = inspectPromptForAllModels(
                item.prompt_text,
                modelsToInspect,
                512
              );
              const optimization = analyzePromptOptimization(
                item.prompt_text,
                perModel
              );
              recommendations = optimization.recommendations;
            }

            const snapshot: RegistrySnapshot = {
              source: registryMetadata.source,
              lastSyncedAt: item.created_at || registryMetadata.lastSyncedAt,
              totalModels: availableModels.length || reloadedIds.length,
            };

            setAnalysisState({
              status: 'ready',
              input: {
                promptText: item.prompt_text,
                selectedModelIds: reloadedIds,
                targetOutputTokens: 512,
              },
              result: {
                perModel,
                recommendations,
                computedAt: item.created_at || new Date().toISOString(),
                registrySnapshot: snapshot,
              },
            });

            setActiveTab('analytics');
          }
        }
      } catch (err) {
        console.error('Error reloading analysis into inspector:', err);
      } finally {
        setTimeout(() => {
          isReloadingRef.current = false;
        }, 300);
      }
    }
    loadReloadData();
  }, [reloadId, availableModels, registryMetadata]);

  // Track staleness when inputs change after an analysis run
  useEffect(() => {
    if (isReloadingRef.current) return;
    if (analysisState.status === 'ready') {
      setAnalysisState((prev) => ({
        ...prev,
        status: 'stale',
      }));
    }
  }, [promptText, selectedModelIds, estimatedOutputTokens]);

  // Compute lightweight live editor statistics for Monaco header
  const stats = useMemo(() => computePromptStats(promptText), [promptText]);

  // Core Explicit Analyze Trigger Implementation
  const runAnalysis = useCallback(() => {
    if (!promptText.trim() || selectedModelIds.length === 0) return;

    setAnalysisState((prev) => ({
      ...prev,
      status: 'analyzing',
    }));

    try {
      const selectedModels = availableModels.filter(
        (m) =>
          selectedModelIds.includes(m.model_id) ||
          selectedModelIds.includes(m.name)
      );

      const modelsToInspect =
        selectedModels.length > 0
          ? selectedModels
          : DEFAULT_MODELS.slice(0, 4);

      const perModel = inspectPromptForAllModels(
        promptText,
        modelsToInspect,
        estimatedOutputTokens
      );

      const optimization = analyzePromptOptimization(promptText, perModel);

      const snapshot: RegistrySnapshot = {
        source: registryMetadata.source,
        lastSyncedAt: registryMetadata.lastSyncedAt,
        totalModels: availableModels.length,
      };

      setAnalysisState({
        status: 'ready',
        input: {
          promptText,
          selectedModelIds,
          targetOutputTokens: estimatedOutputTokens,
        },
        result: {
          perModel,
          recommendations: optimization.recommendations,
          computedAt: new Date().toISOString(),
          registrySnapshot: snapshot,
        },
      });

      // Auto-navigate to Optimization & Health tab upon successful analysis
      setActiveTab('analytics');
    } catch (err: any) {
      console.error('Analysis execution failed:', err);
      setAnalysisState((prev) => ({
        ...prev,
        status: 'error',
        error: err?.message || 'Failed to compute prompt analysis',
      }));
    }
  }, [
    promptText,
    selectedModelIds,
    estimatedOutputTokens,
    availableModels,
    registryMetadata,
  ]);

  const handleSelectModel = (modelId: string) => {
    if (!selectedModelIds.includes(modelId)) {
      setSelectedModelIds([...selectedModelIds, modelId]);
    }
  };

  const isAnalyzing = analysisState.status === 'analyzing';
  const isStale = analysisState.status === 'stale';
  const hasResult = !!analysisState.result;

  return (
    <div className="w-full space-y-6 font-mono">
      {/* Header Banner matching Storeframe Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-mono text-white tracking-tight">
            Hi User
          </h1>
          <p className="text-sm font-sans text-zinc-400 mt-1">
            Real-time token estimation, multi-model cost analysis, and context optimization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ShareModal
            promptText={promptText}
            stats={stats}
            results={analysisState.result?.perModel || []}
          />
        </div>
      </div>

      {/* Primary Inspector Layout Tabs using 21st.dev AnimatedBackground */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-card-dark border border-zinc-800 p-1.5 font-mono inline-flex">
          <AnimatedBackground
            defaultValue={activeTab}
            onValueChange={(val) => val && setActiveTab(val)}
            className="bg-white text-zinc-950"
            transition={{
              type: 'spring',
              bounce: 0.15,
              duration: 0.35,
            }}
          >
            <button
              type="button"
              data-id="editor"
              className={`px-3 py-1.5 text-xs font-bold font-mono transition-colors duration-200 cursor-pointer flex items-center gap-1.5 ${activeTab === 'editor' ? 'text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Prompt & Model Setup</span>
            </button>

            <button
              type="button"
              data-id="analytics"
              className={`px-3 py-1.5 text-xs font-bold font-mono transition-colors duration-200 cursor-pointer rounded-md flex items-center gap-1.5 ${activeTab === 'analytics' ? 'text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
            >
              <Activity className="w-4 h-4" />
              <span>Optimization & Health</span>
              <Badge
                variant="outline"
                className={`ml-1 text-[10px] px-1.5 ${activeTab === 'analytics'
                    ? 'bg-zinc-950/20 text-zinc-950 border-zinc-950/30'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
                  }`}
              >
                {analysisState.result?.recommendations.length ?? 0}
              </Badge>
            </button>

            <button
              type="button"
              data-id="matrix"
              className={`px-3 py-1.5 text-xs font-bold font-mono transition-colors duration-200 cursor-pointer rounded-md flex items-center gap-1.5 ${activeTab === 'matrix' ? 'text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Comparison Matrix</span>
            </button>

            <button
              type="button"
              data-id="context"
              className={`px-3 py-1.5 text-xs font-bold font-mono transition-colors duration-200 cursor-pointer rounded-md flex items-center gap-1.5 ${activeTab === 'context' ? 'text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Context Capacity</span>
            </button>
          </AnimatedBackground>
        </div>

        {/* Tab 1: Prompt & Model Setup */}
        <TabsContent value="editor" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Monaco Prompt Editor */}
            <div className="lg:col-span-7">
              <PromptInput
                promptText={promptText}
                onChange={setPromptText}
                stats={stats}
                onAnalyze={runAnalysis}
                isAnalyzing={isAnalyzing}
                status={analysisState.status}
                hasSelectedModels={selectedModelIds.length > 0}
              />
            </div>

            {/* Right 5 Columns: Model Selector Catalog & Output Config */}
            <div className="lg:col-span-5 space-y-6">
              <ModelSelector
                selectedModelIds={selectedModelIds}
                onSelectionChange={setSelectedModelIds}
                height="538px"
              />
              <OutputConfig
                estimatedOutputTokens={estimatedOutputTokens}
                onChange={setEstimatedOutputTokens}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Optimization & Health */}
        <TabsContent value="analytics" className="mt-4">
          {isStale && <StaleWarningBanner onReAnalyze={runAnalysis} />}
          {hasResult && analysisState.result ? (
            <InspectionSummaryPanel
              promptText={analysisState.input.promptText}
              results={analysisState.result.perModel}
              primaryModelId={selectedModelIds[0]}
              onApplySuggestion={(newText) => setPromptText(newText)}
              onSelectModel={handleSelectModel}
              registrySnapshot={analysisState.result.registrySnapshot}
            />
          ) : (
            <EmptyAnalysisState
              onRunAnalysis={runAnalysis}
              onGoToSetup={() => setActiveTab('editor')}
            />
          )}
        </TabsContent>

        {/* Tab 3: Multi-Model Comparison Matrix */}
        <TabsContent value="matrix" className="mt-4">
          {isStale && <StaleWarningBanner onReAnalyze={runAnalysis} />}
          {hasResult && analysisState.result ? (
            <ComparisonMatrix
              results={analysisState.result.perModel}
              registrySnapshot={analysisState.result.registrySnapshot}
            />
          ) : (
            <EmptyAnalysisState
              onRunAnalysis={runAnalysis}
              onGoToSetup={() => setActiveTab('editor')}
            />
          )}
        </TabsContent>

        {/* Tab 4: Context Capacity Visualization */}
        <TabsContent value="context" className="mt-4">
          {isStale && <StaleWarningBanner onReAnalyze={runAnalysis} />}
          {hasResult && analysisState.result ? (
            <ContextChart
              results={analysisState.result.perModel}
              promptText={promptText}
              registrySnapshot={analysisState.result.registrySnapshot}
            />
          ) : (
            <EmptyAnalysisState
              onRunAnalysis={runAnalysis}
              onGoToSetup={() => setActiveTab('editor')}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function InspectorPage() {
  return (
    <AuthGuard>
      <SidebarLayout>
        <Suspense
          fallback={
            <div className="p-8 text-center text-zinc-500 font-mono">
              Loading Prompt Inspector Console...
            </div>
          }
        >
          <InspectorContent />
        </Suspense>
      </SidebarLayout>
    </AuthGuard>
  );
}
