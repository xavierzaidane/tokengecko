'use client';

import React from 'react';
import { Sliders } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OutputConfigProps {
  estimatedOutputTokens: number;
  onChange: (value: number) => void;
}

const PRESET_OUTPUTS = [256, 512, 1024, 2048, 4096];

export function OutputConfig({ estimatedOutputTokens, onChange }: OutputConfigProps) {
  return (
    <Card className="border-zinc-800 bg-card-dark shadow-xl h-full flex flex-col justify-between">
      <CardHeader className="p-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent-orange" />
          <CardTitle>Est. Output Tokens</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 font-mono">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Target Generation Size:</span>
            <span className="text-accent-orange font-bold text-sm">{estimatedOutputTokens.toLocaleString()} tokens</span>
          </div>

          <input
            type="range"
            min={64}
            max={8192}
            step={64}
            value={estimatedOutputTokens}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/60">
          {PRESET_OUTPUTS.map((tokens) => (
            <Button
              key={tokens}
              onClick={() => onChange(tokens)}
              variant={estimatedOutputTokens === tokens ? 'default' : 'outline'}
              size="sm"
              className={`text-[11px] h-7 px-2.5 ${
                estimatedOutputTokens === tokens ? 'bg-accent-orange text-zinc-950 font-bold' : 'bg-input-dark border-zinc-800'
              }`}
            >
              {tokens}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
