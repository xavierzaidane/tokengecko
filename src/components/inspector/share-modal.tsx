'use client';

import React, { useState } from 'react';
import { ModelInspectionResult, PromptStats } from '@/lib/analysis/schema';
import { Share2, Copy, Check, Save, FileJson, FileText, X, ExternalLink } from 'lucide-react';
import { saveAnalysis, createShareToken } from '@/lib/insforge/analyses';
import { useAuth } from '@/components/providers/auth-provider';

interface ShareModalProps {
  promptText: string;
  results: ModelInspectionResult[];
  stats: PromptStats;
}

export function ShareModal({ promptText, results, stats }: ShareModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setErrorMsg(null);
    const { data, error } = await saveAnalysis(user.id, promptText, results);
    setIsSaving(false);

    if (error) {
      setErrorMsg('Failed to save analysis to history.');
    } else if (data) {
      setSavedId(data.id);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!user) return;
    setIsSharing(true);
    setErrorMsg(null);

    let currentAnalysisId = savedId;
    if (!currentAnalysisId) {
      const { data, error: saveErr } = await saveAnalysis(user.id, promptText, results);
      if (saveErr || !data) {
        setErrorMsg('Failed to save analysis prior to sharing.');
        setIsSharing(false);
        return;
      }
      currentAnalysisId = data.id;
      setSavedId(data.id);
    }

    const { shareToken, error: shareErr } = await createShareToken(currentAnalysisId, user.id);
    setIsSharing(false);

    if (shareErr || !shareToken) {
      setErrorMsg('Failed to generate share link.');
    } else {
      const url = `${window.location.origin}/share/${shareToken}`;
      setShareUrl(url);
      navigator.clipboard.writeText(url);
      setCopiedType('url');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const copyMarkdownTable = () => {
    let md = `### Prompt Inspection Summary (TokenGecko)\n\n`;
    md += `**Prompt Characters:** ${stats.characters} | **Words:** ${stats.words} | **Bytes:** ${stats.bytes}\n\n`;
    md += `| Model | Provider | Input Tokens | Est. Output Tokens | Est. Total Cost | Context Used |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    results.forEach((r) => {
      md += `| ${r.model} | ${r.provider} | ${r.inputTokens.toLocaleString()} | ${r.estimatedOutputTokens} | $${r.estimatedCost.total.toFixed(5)} | ${r.contextUsagePercent}% |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedType('md');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyJSON = () => {
    const jsonStr = JSON.stringify({ promptStats: stats, results }, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <>
      {/* Trigger Button Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving || !promptText}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-200 font-mono text-xs font-semibold transition flex items-center gap-1.5"
        >
          {isSaving ? (
            <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : savedId ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Save className="w-3.5 h-3.5 text-emerald-400" />
          )}
          {savedId ? 'Saved to History' : 'Save Analysis'}
        </button>

        <button
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition shadow-lg shadow-emerald-500/10 flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share & Export
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono text-white">Share & Export Analysis</h3>
                <p className="text-xs text-slate-400 font-sans">
                  Generate a public read-only link or copy markdown/JSON summary.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            {/* Public Share Link Section */}
            <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold font-mono text-slate-200">Public Read-Only Share Link</h4>
              <p className="text-[11px] text-slate-400">
                Anyone with the link can view this inspection result without requiring a TokenGecko account.
              </p>

              {shareUrl ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#0F172A] border border-slate-700 text-emerald-300 font-mono text-xs focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      setCopiedType('url');
                      setTimeout(() => setCopiedType(null), 2000);
                    }}
                    className="px-3 py-2 rounded-lg bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 transition flex items-center gap-1"
                  >
                    {copiedType === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedType === 'url' ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerateShareLink}
                  disabled={isSharing}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  {isSharing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Generating Link...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Generate Public Share Link
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Export Format Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold font-mono text-slate-200">Export Formats</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={copyMarkdownTable}
                  className="p-3 rounded-xl bg-[#0B0F17] hover:bg-slate-800/80 border border-slate-800 text-slate-200 text-left font-mono transition flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {copiedType === 'md' ? 'Copied Markdown!' : 'Copy Markdown'}
                    </div>
                    <div className="text-[10px] text-slate-500">Gfm Table Format</div>
                  </div>
                </button>

                <button
                  onClick={copyJSON}
                  className="p-3 rounded-xl bg-[#0B0F17] hover:bg-slate-800/80 border border-slate-800 text-slate-200 text-left font-mono transition flex items-center gap-2"
                >
                  <FileJson className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {copiedType === 'json' ? 'Copied JSON!' : 'Copy JSON'}
                    </div>
                    <div className="text-[10px] text-slate-500">Raw Data Schema</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
