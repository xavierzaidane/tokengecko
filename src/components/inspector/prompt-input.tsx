'use client';

import React from 'react';
import { PromptStats } from '@/lib/analysis/schema';
import { Copy, Trash2, FileText, Sparkles, Code, Database } from 'lucide-react';

interface PromptInputProps {
  promptText: string;
  onChange: (text: string) => void;
  stats: PromptStats;
}

const SAMPLE_PROMPTS = [
  {
    name: 'System Prompt',
    icon: Sparkles,
    text: `You are an expert AI software architect and senior full-stack engineer. Your task is to analyze user requests, produce robust system designs, evaluate performance trade-offs across cloud and edge providers, write clean, type-safe TypeScript code, and ensure all security and scalability best practices are met. Always prefer modular, scalable patterns.`,
  },
  {
    name: 'RAG Document Chunk',
    icon: Database,
    text: `Document Title: Enterprise LLM Deployment Guidelines
Section 4.2: Token Management & Cost Optimization

When deploying large language models at enterprise scale, monitoring token consumption is critical for financial predictability. Token usage is divided into prompt (input) tokens and completion (output) tokens. Input tokens represent the contextual payload sent to the model—including system messages, user query, conversation history, and retrieved document snippets. Output tokens represent the generated completion.

Key Strategies for Token Efficiency:
1. Context Pruning: Trim irrelevant document sections before vector embedding retrieval.
2. System Prompt Compression: Use concise role definitions and instruct the model to output compact JSON structures.
3. Caching & Prefix Sharing: Utilize provider-level prompt caching (e.g. Anthropic Prompt Caching or OpenAI Cached Input Tokens) for fixed context headers.
4. Tokenizer Selection: Evaluate tiktoken (o200k_base), SentencePiece, and BPE tokenizer ratios across models prior to architecture selection.`,
  },
  {
    name: 'Code Refactor',
    icon: Code,
    text: `// Refactor this async task queue worker in TypeScript
async function processBatch(tasks: Array<{ id: string; payload: any }>) {
  const results = [];
  for (const task of tasks) {
    try {
      const res = await fetch('https://api.internal.service/process', {
        method: 'POST',
        body: JSON.stringify(task.payload),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      results.push({ id: task.id, status: 'success', data });
    } catch (err) {
      results.push({ id: task.id, status: 'error', error: String(err) });
    }
  }
  return results;
}
// Task: Rewrite to process in parallel with concurrency limit of 5, retry with exponential backoff, and full error logging.`,
  },
];

export function PromptInput({ promptText, onChange, stats }: PromptInputProps) {
  const handleCopy = () => {
    if (!promptText) return;
    navigator.clipboard.writeText(promptText);
  };

  return (
    <div className="bg-[#0F172A]/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold font-mono text-white">Prompt Input</h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!promptText}
            title="Copy prompt text"
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 text-xs font-mono transition flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy</span>
          </button>
          <button
            onClick={() => onChange('')}
            disabled={!promptText}
            title="Clear text"
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 text-slate-400 disabled:opacity-40 text-xs font-mono transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Sample Loader Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono text-slate-500 mr-1">Sample Prompts:</span>
        {SAMPLE_PROMPTS.map((sample) => {
          const Icon = sample.icon;
          return (
            <button
              key={sample.name}
              onClick={() => onChange(sample.text)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 hover:text-emerald-300 text-slate-400 text-xs font-mono transition flex items-center gap-1.5"
            >
              <Icon className="w-3 h-3 text-emerald-400" />
              {sample.name}
            </button>
          );
        })}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={promptText}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or type your prompt here to calculate token size, context fit, and input/output pricing..."
          rows={8}
          className="w-full p-4 rounded-xl bg-[#0B0F17] border border-slate-800 text-slate-100 placeholder-slate-600 font-mono text-xs md:text-sm leading-relaxed focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition resize-y min-h-[160px]"
        />
      </div>

      {/* Live Text Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/60 font-mono text-xs">
        <div className="bg-[#0B0F17] border border-slate-800/80 rounded-lg p-2 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Characters</div>
          <div className="text-sm font-bold text-emerald-400">{stats.characters.toLocaleString()}</div>
        </div>
        <div className="bg-[#0B0F17] border border-slate-800/80 rounded-lg p-2 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Words</div>
          <div className="text-sm font-bold text-cyan-400">{stats.words.toLocaleString()}</div>
        </div>
        <div className="bg-[#0B0F17] border border-slate-800/80 rounded-lg p-2 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Sentences</div>
          <div className="text-sm font-bold text-teal-400">{stats.sentences.toLocaleString()}</div>
        </div>
        <div className="bg-[#0B0F17] border border-slate-800/80 rounded-lg p-2 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Lines</div>
          <div className="text-sm font-bold text-slate-300">{stats.lines.toLocaleString()}</div>
        </div>
        <div className="bg-[#0B0F17] border border-slate-800/80 rounded-lg p-2 text-center col-span-2 sm:col-span-1">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Bytes</div>
          <div className="text-sm font-bold text-violet-400">{stats.bytes.toLocaleString()} B</div>
        </div>
      </div>
    </div>
  );
}
