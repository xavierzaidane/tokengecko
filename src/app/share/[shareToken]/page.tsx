'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { ComparisonMatrix } from '@/components/inspector/comparison-matrix';
import { ContextChart } from '@/components/inspector/context-chart';
import { InspectionSummaryPanel } from '@/components/inspector/inspection-summary';
import { SavedAnalysis, getPublicAnalysisByShareToken } from '@/lib/insforge/analyses';
import { computePromptStats } from '@/lib/tokenizers/engine';
import { Eye, ArrowRight, FileText, Code2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function PublicSharePage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const resolvedParams = use(params);
  const shareToken = resolvedParams.shareToken;

  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadSharedData() {
      setIsLoading(true);
      const { data, error } = await getPublicAnalysisByShareToken(shareToken);
      setIsLoading(false);

      if (error || !data) {
        setErrorMsg('The requested prompt analysis link is invalid or no longer public.');
      } else {
        setAnalysis(data);
      }
    }
    if (shareToken) {
      loadSharedData();
    }
  }, [shareToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-dark flex flex-col justify-center items-center text-zinc-400 font-mono">
        <div className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs">Loading public prompt inspection report...</p>
      </div>
    );
  }

  if (errorMsg || !analysis) {
    return (
      <div className="min-h-screen bg-app-dark text-zinc-100 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-8 max-w-md bg-card-dark border border-zinc-800 rounded-lg space-y-4 font-mono">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Analysis Not Found</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">{errorMsg}</p>
            <Link href="/inspector">
              <Button variant="storeframe" size="sm" className="mt-2 font-bold text-xs">
                Go to Prompt Inspector
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const results = analysis.results || [];
  const stats = computePromptStats(analysis.prompt_text);

  return (
    <div className="min-h-screen bg-app-dark text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Public Share Read-Only Header */}
        <div className="p-4 bg-card-dark border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent-orange/10 border border-accent-orange/30 flex items-center justify-center text-accent-orange shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white uppercase tracking-wider">
                  Shared Read-Only Inspection Report
                </h1>
                <Badge variant="outline" className="border-accent-orange text-accent-orange bg-accent-orange/10 text-[10px]">
                  Public View
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Created on {new Date(analysis.created_at).toLocaleDateString()} • {results.length} models compared
              </p>
            </div>
          </div>

          <Link href="/inspector">
            <Button variant="storeframe" size="sm" className="font-mono text-xs gap-1.5 whitespace-nowrap">
              <span>Inspect Your Own Prompts</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Prompt View Box */}
        <div className="bg-card-dark border border-zinc-800 p-4 font-mono space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-orange" />
              Shared Prompt Text Payload
            </h2>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span>{stats.characters.toLocaleString()} chars</span>
              <span>{stats.words.toLocaleString()} words</span>
              <span>{stats.bytes.toLocaleString()} B</span>
            </div>
          </div>

          <div className="p-3 bg-input-dark border border-zinc-800/80 text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto font-mono">
            {analysis.prompt_text}
          </div>
        </div>

        {/* Persistent Inspection Summary & Optimization Recommendations */}
        <InspectionSummaryPanel
          promptText={analysis.prompt_text}
          results={results}
        />

        {/* Comparison Matrix Table */}
        <ComparisonMatrix results={results} />

        {/* Context Chart */}
        <ContextChart results={results} />

        {/* Bottom CTA Card */}
        <div className="p-6 bg-card-dark border border-zinc-800 text-center space-y-3 max-w-3xl mx-auto font-mono">
          <div className="w-8 h-8 bg-accent-orange text-zinc-950 flex items-center justify-center mx-auto font-bold">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Analyze Token Limits & Input Costs for LLM Apps
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl mx-auto leading-relaxed">
            TokenGecko provides instant tokenization, model comparison, and context limits for GPT-5, Claude 3.5, Gemini 2.0, DeepSeek, and open-weight models.
          </p>
          <div className="pt-2">
            <Link href="/inspector">
              <Button variant="storeframe" size="default" className="font-mono text-xs font-bold gap-2">
                <span>Start Free Prompt Inspection</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
