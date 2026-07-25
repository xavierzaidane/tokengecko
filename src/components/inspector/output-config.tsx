'use client';

import React from 'react';
import { Sliders, Sparkles } from 'lucide-react';

interface OutputConfigProps {
  estimatedOutputTokens: number;
  onChange: (tokens: number) => void;
}

const TOKEN_PRESETS = [256, 512, 1024, 2048, 4096];

export function OutputConfig({ estimatedOutputTokens, onChange }: OutputConfigProps) {
  return (
    <div className="bg-[#0F172A]/70 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
            Estimated Output Target
            <span className="text-emerald-400 font-mono text-xs">({estimatedOutputTokens} tokens)</span>
          </h3>
          <p className="text-[11px] text-slate-400 font-sans">
            Used to calculate completion output pricing.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        {/* Slider */}
        <input
          type="range"
          min={128}
          max={8192}
          step={128}
          value={estimatedOutputTokens}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />

        {/* Quick Presets */}
        <div className="flex items-center gap-1">
          {TOKEN_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                estimatedOutputTokens === preset
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
