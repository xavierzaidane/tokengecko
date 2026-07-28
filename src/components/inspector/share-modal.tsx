'use client';

import React, { useState } from 'react';
import { ModelInspectionResult, PromptStats } from '@/lib/analysis/schema';
import { Share2, Copy, Check, Save, FileJson, FileText, ExternalLink } from 'lucide-react';
import { saveAnalysis, createShareToken } from '@/lib/insforge/analyses';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Modal,
  ModalTrigger,
  ModalBody,
  ModalContent,
} from '@/components/ui/animated-modal';

interface ShareModalProps {
  promptText: string;
  results: ModelInspectionResult[];
  stats: PromptStats;
}

export function ShareModal({ promptText, results, stats }: ShareModalProps) {
  const { user } = useAuth();
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
    <Modal>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSave}
          disabled={isSaving || !promptText}
          variant="outline"
          size="sm"
          className="gap-1.5 font-mono text-xs border-zinc-800 bg-card-dark"
        >
          {isSaving ? (
            <span className="w-3.5 h-3.5 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
          ) : savedId ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Save className="w-3.5 h-3.5 text-white" />
          )}
          {savedId ? 'Saved' : 'Save Analysis'}
        </Button>

        <ModalTrigger className="p-0 text-left bg-transparent hover:bg-transparent border-none">
          <div className="inline-flex items-center justify-center gap-1.5 font-mono text-xs px-3 py-1.5 bg-accent-orange hover:bg-accent-orange/90 text-zinc-950 font-bold shadow transition-all cursor-pointer">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share & Export</span>
          </div>
        </ModalTrigger>
      </div>

      <ModalBody className="max-w-lg bg-card-dark border border-zinc-800 shadow-2xl ">
        <ModalContent className="p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 bg-accent-orange/10 flex items-center justify-center text-accent-orange">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-white">Share & Export Analysis</h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Generate a public read-only link or copy markdown/JSON summary.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          <div className="p-4 bg-input-dark border border-zinc-800 space-y-3 font-mono">
            <h4 className="text-xs font-bold text-zinc-200">Public Read-Only Share Link</h4>
            <p className="text-[11px] text-zinc-400 font-sans">
              Anyone with the link can view this inspection result without requiring an account.
            </p>

            {shareUrl ? (
              <div className="flex items-center gap-2">
                <Input readOnly value={shareUrl} className="flex-1 text-accent-orange font-mono text-xs" />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedType('url');
                    setTimeout(() => setCopiedType(null), 2000);
                  }}
                  variant="default"
                  size="sm"
                  className="gap-1.5"
                >
                  {copiedType === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedType === 'url' ? 'Copied' : 'Copy'}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleGenerateShareLink}
                disabled={isSharing}
                variant="default"
                className="w-full gap-2 font-mono text-xs"
              >
                {isSharing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    Generating Link...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Generate Public Share Link
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-2 font-mono">
            <h4 className="text-xs font-bold text-zinc-200">Export Formats</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyMarkdownTable}
                className="p-3 bg-input-dark hover:bg-zinc-800/80 border border-zinc-800 text-left transition flex items-center gap-3 group"
              >
                <FileText className="w-4 h-4 text-accent-orange shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-accent-orange transition-colors">
                    {copiedType === 'md' ? 'Copied Markdown!' : 'Copy Markdown'}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans">GFM Table Format</div>
                </div>
              </button>

              <button
                onClick={copyJSON}
                className="p-3 bg-input-dark hover:bg-zinc-800/80 border border-zinc-800 text-left transition flex items-center gap-3 group"
              >
                <FileJson className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {copiedType === 'json' ? 'Copied JSON!' : 'Copy JSON'}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans">Raw Data Schema</div>
                </div>
              </button>
            </div>
          </div>
        </ModalContent>
      </ModalBody>
    </Modal>
  );
}
