'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Navbar } from '@/components/layout/navbar';
import { useAuth } from '@/components/providers/auth-provider';
import { SavedAnalysis, getUserAnalyses, deleteAnalysis, createShareToken } from '@/lib/insforge/analyses';
import { useRouter } from 'next/navigation';
import { History as HistoryIcon, Clock, Trash2, ArrowUpRight, Share2, Copy, Check, FileText } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await getUserAnalyses(user.id);
    setIsLoading(false);

    if (error) {
      setErrorMsg('Failed to load analysis history.');
    } else {
      setAnalyses(data || []);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    const { error } = await deleteAnalysis(id, user.id);
    if (!error) {
      setAnalyses(analyses.filter((a) => a.id !== id));
    }
  };

  const handleShare = async (analysis: SavedAnalysis) => {
    if (!user) return;
    let token = analysis.share_token;
    if (!token) {
      const { shareToken } = await createShareToken(analysis.id, user.id);
      token = shareToken;
    }

    if (token) {
      const url = `${window.location.origin}/share/${token}`;
      navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
      fetchHistory();
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
                <HistoryIcon className="w-3 h-3" />
                Prompt History Vault
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-mono text-white tracking-tight">
                Analysis History
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                View, reload, or generate public share links for your previous prompt inspections.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="p-16 border border-dashed border-slate-800 rounded-2xl text-center text-slate-400 font-mono text-sm bg-[#0F172A]/40 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              Loading your prompt history...
            </div>
          ) : analyses.length === 0 ? (
            <div className="p-16 border border-dashed border-slate-800 rounded-2xl text-center text-slate-400 font-mono text-sm bg-[#0F172A]/40 flex flex-col items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-slate-600" />
              <p>No saved prompt inspections yet.</p>
              <button
                onClick={() => router.push('/inspector')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                Go to Inspector Workspace
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((item) => {
                const results = item.results || [];
                const cheapest = [...results].sort(
                  (a, b) => a.estimatedCost.total - b.estimatedCost.total
                )[0];

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#0F172A]/70 border border-slate-800 hover:border-slate-700 backdrop-blur-md transition space-y-4 shadow-lg"
                  >
                    {/* Date and Metadata Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {new Date(item.created_at).toLocaleDateString()} at{' '}
                          {new Date(item.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {cheapest && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-mono">
                            Lowest: {cheapest.model} (${cheapest.estimatedCost.total.toFixed(5)})
                          </span>
                        )}

                        <button
                          onClick={() => handleShare(item)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 text-xs font-mono transition flex items-center gap-1"
                        >
                          {copiedToken === item.share_token ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                          {copiedToken === item.share_token ? 'Link Copied!' : 'Share Link'}
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-500/30 transition"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Prompt Preview */}
                    <div>
                      <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                        Prompt Snippet
                      </div>
                      <p className="text-xs font-mono text-slate-200 bg-[#0B0F17] border border-slate-800/80 p-3 rounded-xl line-clamp-3 leading-relaxed">
                        {item.prompt_text}
                      </p>
                    </div>

                    {/* Models Compared List */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 font-mono text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-slate-500 text-[11px]">Models:</span>
                        {results.map((r) => (
                          <span
                            key={r.model_id}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]"
                          >
                            {r.model} ({r.inputTokens} tok)
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => router.push(`/inspector?reload=${item.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-mono font-semibold transition flex items-center gap-1 ml-auto"
                      >
                        Reload into Inspector
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
