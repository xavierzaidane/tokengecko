'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { ComparisonMatrix } from '@/components/inspector/comparison-matrix';
import { ContextChart } from '@/components/inspector/context-chart';
import { SavedAnalysis, getPublicAnalysisByShareToken } from '@/lib/insforge/analyses';
import { computePromptStats } from '@/lib/tokenizers/engine';
import { Sparkles, Eye, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

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
      <div className="min-h-screen bg-[#0B0F17] flex flex-col justify-center items-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono text-sm">Loading public analysis report...</p>
      </div>
    );
  }

  if (errorMsg || !analysis) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-8 max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-mono text-white">Analysis Not Found</h2>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">{errorMsg}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
            >
              Go to Home Page
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const results = analysis.results || [];
  const stats = computePromptStats(analysis.prompt_text);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Public Share Read-Only Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold font-mono text-white">
                  Shared Read-Only Inspection Report
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase tracking-wider">
                  Public Link
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Created on {new Date(analysis.created_at).toLocaleDateString()} • {results.length} models compared
              </p>
            </div>
          </div>

          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 whitespace-nowrap"
          >
            Inspect Your Own Prompts
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Prompt View Block */}
        <div className="bg-[#0F172A]/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Shared Prompt Text
            </h2>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>{stats.characters.toLocaleString()} chars</span>
              <span>{stats.words.toLocaleString()} words</span>
              <span>{stats.bytes.toLocaleString()} B</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 font-mono text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
            {analysis.prompt_text}
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <ComparisonMatrix results={results} />

        {/* Context Chart */}
        <ContextChart results={results} />

        {/* Bottom CTA Card */}
        <div className="p-8 rounded-2xl bg-[#0F172A]/80 border border-slate-800 text-center space-y-4 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold font-mono text-white">
            Analyze token limits & input costs for your AI apps
          </h3>
          <p className="text-xs text-slate-400 font-sans max-w-xl mx-auto leading-relaxed">
            TokenGecko provides instant tokenization, model comparison, and context limits for GPT-5, Claude, Gemini, DeepSeek, and open-weight models.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm font-mono transition shadow-xl shadow-emerald-500/20"
            >
              Start Free Prompt Inspection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
