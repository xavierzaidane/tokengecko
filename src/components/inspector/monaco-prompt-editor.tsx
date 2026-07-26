'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PromptStats } from '@/lib/analysis/schema';
import { FileText, AlignLeft, Hash, Code2, Database, Zap, Layers, FileCode, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Dynamically import Monaco Editor to prevent SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-180 bg-input-dark border border-zinc-800 flex items-center justify-center font-mono text-xs text-zinc-500 gap-2">
      <div className="w-4 h-4 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
      <span>Loading IDE Monaco Prompt Editor...</span>
    </div>
  ),
});

interface MonacoPromptEditorProps {
  promptText: string;
  onChange: (value: string) => void;
  stats: PromptStats;
  height?: string;
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
    text: `Review the following TypeScript code snippet for potential memory leaks, race conditions, and improper async error handling. Provide a detailed step-by-step diff and suggest performance optimizations.\n\nasync function processBatch(items: any[]): Promise<any[]> {\n  const results: any[] = [];\n  for (const item of items) {\n    try {\n      const res = await fetch('/api/process', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify(item),\n      });\n      results.push(await res.json());\n    } catch (err: unknown) {\n      console.error('Batch error:', err);\n    }\n  }\n  return results;\n}`,
  },
  {
    name: 'RAG Context',
    icon: Database,
    text: `[System]: Use the following context items to answer the user query accurately.\n\nContext Document 1:\nInsForge BaaS platform provides PostgREST API over PostgreSQL, AES-256-GCM encrypted API key storage, and real-time WebSocket pub/sub.\n\nContext Document 2:\nGoogle Gemini 2.0 Flash features a 1,048,576 token context window with $0.10/M input pricing. Claude 3.5 Sonnet supports a 200,000 token context window at $3.00/M input.\n\nUser Question:\nWhich model is more cost-effective for large 500k token documents, and how does InsForge secure BYOK keys?`,
  },
  {
    name: 'JSON Payload',
    icon: FileCode,
    text: `{\n  "analysisTarget": "tokengecko_prompt_inspector",\n  "environment": "production",\n  "authMethod": "OAuth2_Google",\n  "systemMetrics": {\n    "cpuUsagePercent": 14.2,\n    "memoryAllocatedMb": 512,\n    "activeWorkers": 4\n  },\n  "sessionLogs": [\n    {\n      "timestamp": "2026-07-26T14:20:11Z",\n      "ipAddress": "192.168.1.104",\n      "action": "byok_key_rotate",\n      "provider": "anthropic",\n      "success": true\n    },\n    {\n      "timestamp": "2026-07-26T14:22:45Z",\n      "ipAddress": "10.0.0.52",\n      "action": "execute_analysis",\n      "models": ["gpt-5", "claude-3-5-sonnet", "gemini-2.0-flash"],\n      "totalTokens": 1420,\n      "estimatedCostUsd": 0.0042\n    }\n  ]\n}`,
  },
];

export function MonacoPromptEditor({
  promptText,
  onChange,
  stats,
  height = '520px',
}: MonacoPromptEditorProps) {
  const [selectedLanguageOverride, setSelectedLanguageOverride] = useState<string>('auto');

  // Auto-detect language based on prompt text pattern matching
  const autoDetectedLanguage = useMemo(() => {
    const trimmed = promptText.trim();
    if (!trimmed) return 'plaintext';

    // 1. JSON Detection
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {
        if (
          (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
          (trimmed.startsWith('[') && trimmed.endsWith(']'))
        ) {
          return 'json';
        }
      }
    }

    // 2. TypeScript / Code Detection
    const codeKeywords = ['function ', 'const ', 'import ', 'export ', 'interface ', 'class ', 'async ', 'return ', '=>', 'type '];
    const codeMatchCount = codeKeywords.filter((kw) => trimmed.includes(kw)).length;
    if (codeMatchCount >= 2) {
      return 'typescript';
    }

    // 3. Markdown Detection
    if (trimmed.includes('```') || trimmed.includes('# ') || trimmed.includes('- ') || trimmed.includes('[System]:')) {
      return 'markdown';
    }

    return 'plaintext';
  }, [promptText]);

  const activeLanguage = selectedLanguageOverride === 'auto' ? autoDetectedLanguage : selectedLanguageOverride;

  // Handle Monaco Editor mounting to register rich storeframe dark syntax colors
  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('storeframe-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // JSON syntax tokens
        { token: 'string.key.json', foreground: 'ba7545', fontStyle: 'bold' }, // JSON Key: Accent Orange
        { token: 'string.value.json', foreground: '4ec9b0' },                 // JSON String value: Emerald Teal
        { token: 'number.json', foreground: 'b5cea8' },                       // JSON Number: Light Olive
        { token: 'keyword.json', foreground: '569cd6', fontStyle: 'bold' },    // JSON Boolean/null: Blue

        // Code syntax tokens (TypeScript / JavaScript)
        { token: 'keyword', foreground: 'c586c0', fontStyle: 'bold' },        // keywords: const, function, return
        { token: 'keyword.flow', foreground: 'c586c0' },
        { token: 'type', foreground: '4ec9b0', fontStyle: 'bold' },           // types: Promise, string, number
        { token: 'identifier', foreground: '9cdcfe' },                        // variable identifiers
        { token: 'string', foreground: 'ce9178' },                            // strings: amber
        { token: 'number', foreground: 'b5cea8' },                            // numbers
        { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },      // comments: green italic
        { token: 'delimiter', foreground: 'd4d4d4' },                         // braces, brackets, colons

        // Markdown syntax tokens
        { token: 'keyword.md', foreground: 'ba7545', fontStyle: 'bold' },     // Markdown headers
        { token: 'string.link.md', foreground: '569cd6' },
      ],
      colors: {
        'editor.background': '#0d0d0d',
        'editor.foreground': '#f4f4f5',
        'editorCursor.foreground': '#ba7545',
        'editor.lineHighlightBackground': '#18181b80',
        'editorLineNumber.foreground': '#52525b',
        'editorLineNumber.activeForeground': '#ba7545',
        'editor.selectionBackground': '#ba754533',
        'editor.inactiveSelectionBackground': '#ba75451a',
      },
    });
  };

  return (
    <Card className="border-zinc-800 bg-card-dark shadow-xl w-full font-mono">
      {/* Header: Title, Syntax Selector & Live Statistics */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-accent-orange" />
          <CardTitle className="text-sm font-bold text-white">IDE Prompt Payload Editor</CardTitle>

          {/* Syntax Mode Selector Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedLanguageOverride}
              onChange={(e) => setSelectedLanguageOverride(e.target.value)}
              className="appearance-none bg-accent-orange/10 border border-accent-orange/40 text-accent-orange text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 pr-5 rounded focus:outline-none cursor-pointer hover:bg-accent-orange/20 transition"
            >
              <option value="auto" className="bg-zinc-900 text-zinc-200">
                Auto ({autoDetectedLanguage})
              </option>
              <option value="json" className="bg-zinc-900 text-zinc-200">JSON</option>
              <option value="typescript" className="bg-zinc-900 text-zinc-200">TypeScript / JS</option>
              <option value="markdown" className="bg-zinc-900 text-zinc-200">Markdown</option>
              <option value="plaintext" className="bg-zinc-900 text-zinc-200">Plain Text</option>
            </select>
            <ChevronDown className="w-3 h-3 text-accent-orange absolute right-1 pointer-events-none" />
          </div>
        </div>

        {/* Real-time Prompt Metrics Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary" className="bg-zinc-900 border-zinc-800 text-zinc-300">
            <Hash className="w-3 h-3 text-accent-orange mr-1" />
            {stats.characters.toLocaleString()} chars
          </Badge>
          <Badge variant="secondary" className="bg-zinc-900 border-zinc-800 text-zinc-300">
            <AlignLeft className="w-3 h-3 text-accent-orange mr-1" />
            {stats.words.toLocaleString()} words
          </Badge>
          <Badge variant="secondary" className="bg-zinc-900 border-zinc-800 text-zinc-300">
            {stats.lines.toLocaleString()} lines
          </Badge>
          <Badge variant="default" className="bg-accent-orange text-zinc-950 font-bold">
            {stats.bytes.toLocaleString()} B
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Monaco IDE Code Editor Container with Syntax Highlighting */}
        <div className="border-b border-zinc-800/80">
          <Editor
            height={height}
            language={activeLanguage}
            value={promptText}
            theme="storeframe-dark"
            beforeMount={handleEditorWillMount}
            onChange={(value) => onChange(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace",
              lineNumbers: 'on',
              lineNumbersMinChars: 3,
              glyphMargin: false,
              folding: true,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 },
              renderLineHighlight: 'line',
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            }}
          />
        </div>

        {/* Preset Sample Loaders Footer */}
        <div className="p-3 bg-zinc-950/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
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
                  className="gap-1.5 text-[11px] h-7 px-2.5 bg-input-dark border-zinc-800 hover:border-accent-orange/50 hover:text-white transition"
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
