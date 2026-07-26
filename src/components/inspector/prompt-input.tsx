'use client';

import React from 'react';
import { PromptStats } from '@/lib/analysis/schema';
import { MonacoPromptEditor } from './monaco-prompt-editor';

interface PromptInputProps {
  promptText: string;
  onChange: (value: string) => void;
  stats: PromptStats;
  height?: string;
}

export function PromptInput(props: PromptInputProps) {
  return <MonacoPromptEditor {...props} height="870px" />;
}
