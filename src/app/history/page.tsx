'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { SavedAnalysis, getUserAnalyses, deleteAnalysis, createShareToken } from '@/lib/insforge/analyses';
import { analyzePromptOptimization } from '@/lib/optimization/engine';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Trash2,
  ArrowUpRight,
  Share2,
  Check,
  FileText,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      <SidebarLayout>
        <div className="space-y-6 font-mono">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                History
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                View prompt health scores, optimization suggestions, reload into inspector, or share past inspections.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="p-16 border border-dashed border-zinc-800 text-center text-zinc-500 text-sm bg-card-dark/40 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
              Loading prompt history logs & optimization reports...
            </div>
          ) : analyses.length === 0 ? (
            <div className="p-16 border border-dashed border-zinc-800 text-center text-zinc-400 text-sm bg-card-dark/40 flex flex-col items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-zinc-600" />
              <p>No saved prompt inspections yet.</p>
              <Button onClick={() => router.push('/inspector')} variant="storeframe" size="sm">
                Go to Inspector Workspace
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((item) => {
                const results = item.results || [];
                const analysisOpt = analyzePromptOptimization(item.prompt_text, results);
                const { health, recommendations, cheapestModel } = analysisOpt;
                const topRec = recommendations[0];

                return (
                  <Card key={item.id} className="border-zinc-800 bg-card-dark shadow-xl hover:border-zinc-700 transition">
                    <CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">

                          <span>
                            {new Date(item.created_at).toLocaleDateString()} at{' '}
                            {new Date(item.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Health Status Badge */}
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 font-bold uppercase ${health.status === 'good'
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                              : health.status === 'warning'
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                                : 'bg-red-500/10 border-red-500/40 text-red-400'
                            }`}
                        >
                          {health.status === 'good' ? (
                            <ShieldCheck className="w-3 h-3 text-emerald-400 mr-1" />
                          ) : health.status === 'warning' ? (
                            <AlertTriangle className="w-3 h-3 text-amber-400 mr-1" />
                          ) : (
                            <AlertOctagon className="w-3 h-3 text-red-400 mr-1" />
                          )}
                          {health.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {cheapestModel && (
                          <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-[10px]">
                            Cheapest: {cheapestModel.model} (${cheapestModel.estimatedCost.total.toFixed(5)})
                          </Badge>
                        )}

                        <Button
                          onClick={() => handleShare(item)}
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] gap-1 bg-input-dark border-zinc-800 hover:border-accent-orange/40"
                        >
                          {copiedToken === item.share_token ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Share2 className="w-3 h-3" />
                          )}
                          {copiedToken === item.share_token ? 'Copied Link' : 'Share'}
                        </Button>

                        <Button
                          onClick={() => handleDelete(item.id)}
                          variant="destructive"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-3">
                      <div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          Prompt Snippet Payload
                        </div>
                        <p className="text-xs text-zinc-200 bg-input-dark border border-zinc-800/80 p-3 line-clamp-3 leading-relaxed">
                          {item.prompt_text}
                        </p>
                      </div>

                      {/* Top Recommendation Highlight Callout */}
                      {topRec && (
                        <div className="p-2.5 bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs gap-2">
                          <div className="flex items-center gap-2 text-zinc-300 truncate">
                            <Sparkles className="w-3.5 h-3.5 text-accent-orange shrink-0" />
                            <span className="font-bold text-white shrink-0">{topRec.title}:</span>
                            <span className="text-zinc-400 truncate">{topRec.message}</span>
                          </div>
                          {topRec.details?.costDeltaPercent && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] shrink-0">
                              -{topRec.details.costDeltaPercent}% Cost
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs border-t border-zinc-800/60">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-zinc-500 text-[11px]">Models Evaluated:</span>
                          {results.map((r) => (
                            <Badge key={r.model_id} variant="secondary" className="text-[10px] bg-zinc-900 border-zinc-800 text-zinc-300">
                              {r.model} ({r.inputTokens} tok)
                            </Badge>
                          ))}
                        </div>

                        <Button
                          onClick={() => router.push(`/inspector?reload=${item.id}`)}
                          variant="storeframe"
                          size="sm"
                          className="h-8 gap-1 ml-auto text-xs font-bold"
                        >
                          Reload into Inspector
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </SidebarLayout>
    </AuthGuard>
  );
}
