'use client';

import React from 'react';
import { PromptStats } from '@/lib/analysis/schema';
import { FileText, AlignLeft, Hash, Code2, Database, Zap, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PromptInputProps {
  promptText: string;
  onChange: (value: string) => void;
  stats: PromptStats;
}

const SAMPLE_PROMPTS = [
  {
    name: 'System Prompt',
    icon: Zap,
    text: `You are an expert AI software architect and senior full-stack engineer. Your task is to analyze user requests, produce robust system designs, evaluate performance trade-offs across cloud and edge providers, write clean, type-safe TypeScript code, and ensure all security and scalability best practices are met. Always prefer modular, scalable patterns.`,
  },
  {
    name: 'Code Refactor',
    icon: Code2,
    text: `Review the following TypeScript code snippet for potential memory leaks, race conditions, and improper async error handling. Provide a detailed step-by-step diff and suggest performance optimizations.\n\nasync function processBatch(items: any[]) {\n  return Promise.all(items.map(async item => {\n    const res = await fetch('/api/process', { method: 'POST', body: JSON.stringify(item) });\n    return res.json();\n  }));\n}`,
  },
  {
    name: 'RAG Context',
    icon: Database,
    text: `[System]: Use the following context items to answer the user query accurately.\n\nContext Document 1:\nInsForge BaaS platform provides PostgREST API over PostgreSQL, AES-256-GCM encrypted API key storage, and real-time WebSocket pub/sub.\n\nContext Document 2:\nGoogle Gemini 2.0 Flash features a 1,048,576 token context window with $0.10/M input pricing. Claude 3.5 Sonnet supports a 200,000 token context window at $3.00/M input.\n\nUser Question:\nWhich model is more cost-effective for large 500k token documents, and how does InsForge secure BYOK keys?`,
  },
];

export function PromptInput({ promptText, onChange, stats }: PromptInputProps) {
  return (
    <Card className="border-zinc-800 bg-card-dark shadow-xl">
      {/* Header: Title & Live Statistics */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent-orange" />
          <CardTitle>Prompt Payload & Token Inspection</CardTitle>
        </div>

        {/* Real-time Prompt Metrics Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <Badge variant="secondary">
            <Hash className="w-3 h-3 text-accent-orange" />
            {stats.characters.toLocaleString()} chars
          </Badge>
          <Badge variant="secondary">
            <AlignLeft className="w-3 h-3 text-accent-orange" />
            {stats.words.toLocaleString()} words
          </Badge>
          <Badge variant="secondary">
            {stats.lines.toLocaleString()} lines
          </Badge>
          <Badge variant="default">
            {stats.bytes.toLocaleString()} B
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Editor Area */}
        <textarea
          value={promptText}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or type your LLM prompt payload here..."
          rows={6}
          className="w-full p-4 bg-input-dark border border-zinc-800/80 text-zinc-100 placeholder:text-zinc-600 font-mono text-xs md:text-sm focus:outline-none focus:border-accent-orange transition leading-relaxed resize-y"
        />

        {/* Preset Sample Loaders */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 ">
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
            <Layers className="w-3.5 h-3.5 text-accent-orange" />
            <span>Load Preset Sample:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {SAMPLE_PROMPTS.map((sample) => {
              const Icon = sample.icon;
              return (
                <Button
                  key={sample.name}
                  onClick={() => onChange(sample.text)}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-[11px] h-7 px-2.5 bg-input-dark border-zinc-800 hover:border-accent-orange/40 hover:text-white"
                >
                  <Icon className="w-3 h-3 text-accent-orange" />
                  {sample.name}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
