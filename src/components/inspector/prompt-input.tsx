'use client';

import React from 'react';
import { PromptStats } from '@/lib/analysis/schema';
import { AnalysisStatus } from '@/types/analysis';
import { MonacoPromptEditor } from './monaco-prompt-editor';

interface PromptInputProps {
  promptText: string;
  onChange: (value: string) => void;
  stats: PromptStats;
  height?: string;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
  status?: AnalysisStatus;
  hasSelectedModels?: boolean;
}

export function PromptInput({ height = '710px', ...props }: PromptInputProps) {
  return <MonacoPromptEditor {...props} height={height} />;
}
