'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { SavedAnalysis, getUserAnalyses, deleteAnalysis, createShareToken } from '@/lib/insforge/analyses';
import { useRouter } from 'next/navigation';
import { History as HistoryIcon, Clock, Trash2, ArrowUpRight, Share2, Check, FileText } from 'lucide-react';
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div>

              <h1 className="text-2xl md:text-3xl font-extrabold font-mono text-white tracking-tight">
                Analysis Log Vault
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                View, reload into inspector, or generate public share links for past prompt inspections.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="p-16 border border-dashed border-zinc-800 text-center text-zinc-500 font-mono text-sm bg-card-dark/40 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
              Loading your prompt history logs...
            </div>
          ) : analyses.length === 0 ? (
            <div className="p-16 border border-dashed border-zinc-800 text-center text-zinc-400 font-mono text-sm bg-card-dark/40 flex flex-col items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-zinc-600" />
              <p>No saved prompt inspections yet.</p>
              <Button onClick={() => router.push('/inspector')} variant="default" size="sm">
                Go to Inspector Workspace
              </Button>
            </div>
          ) : (
            <div className="space-y-4 font-mono">
              {analyses.map((item) => {
                const results = item.results || [];
                const cheapest = [...results].sort(
                  (a, b) => a.estimatedCost.total - b.estimatedCost.total
                )[0];

                return (
                  <Card key={item.id} className="border-zinc-800 bg-card-dark shadow-xl hover:border-zinc-700 transition">
                    <CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Clock className="w-3.5 h-3.5 text-accent-orange" />
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
                          <Badge variant="success">
                            Lowest: {cheapest.model} (${cheapest.estimatedCost.total.toFixed(5)})
                          </Badge>
                        )}

                        <Button
                          onClick={() => handleShare(item)}
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] gap-1 bg-input-dark border-zinc-800"
                        >
                          {copiedToken === item.share_token ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Share2 className="w-3 h-3" />
                          )}
                          {copiedToken === item.share_token ? 'Copied' : 'Share'}
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

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs border-t border-zinc-800/60">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-zinc-500 text-[11px]">Models:</span>
                          {results.map((r) => (
                            <Badge key={r.model_id} variant="secondary" className="text-[10px]">
                              {r.model} ({r.inputTokens} tok)
                            </Badge>
                          ))}
                        </div>

                        <Button
                          onClick={() => router.push(`/inspector?reload=${item.id}`)}
                          variant="default"
                          size="sm"
                          className="h-8 gap-1 ml-auto text-xs"
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
