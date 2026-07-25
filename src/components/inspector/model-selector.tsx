'use client';

import React, { useState } from 'react';
import { ModelInfo, DEFAULT_MODELS, PRESET_GROUPS } from '@/lib/models/registry';
import { Cpu, Search, Check, Layers, Sparkles, Filter, X } from 'lucide-react';

interface ModelSelectorProps {
  selectedModelIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function ModelSelector({ selectedModelIds, onSelectionChange }: ModelSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);

  const providers = ['all', 'OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Meta', 'Qwen', 'Mistral'];

  const filteredModels = DEFAULT_MODELS.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (model.description && model.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProvider = providerFilter === 'all' || model.provider.toLowerCase() === providerFilter.toLowerCase();
    return matchesSearch && matchesProvider;
  });

  const toggleModel = (modelId: string) => {
    if (selectedModelIds.includes(modelId)) {
      if (selectedModelIds.length === 1) return; // keep at least 1 model selected
      onSelectionChange(selectedModelIds.filter((id) => id !== modelId));
    } else {
      onSelectionChange([...selectedModelIds, modelId]);
    }
  };

  const applyPreset = (modelIds: string[]) => {
    // filter valid IDs from defaults
    const validIds = modelIds.filter((id) => DEFAULT_MODELS.some((m) => m.model_id === id));
    if (validIds.length > 0) {
      onSelectionChange(validIds);
    }
  };

  const selectedModelsList = DEFAULT_MODELS.filter((m) => selectedModelIds.includes(m.model_id));

  return (
    <div className="bg-[#0F172A]/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold font-mono text-white">Target LLM Models</h2>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
            {selectedModelIds.length} Selected
          </span>
        </div>

        {/* Toggle Expand Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono transition flex items-center gap-1.5"
        >
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          {isOpen ? 'Close Catalog' : 'Manage Catalog'}
        </button>
      </div>

      {/* Selected Models Pill Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono text-slate-500">Active Comparison:</span>
        {selectedModelsList.map((model) => (
          <div
            key={model.model_id}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-mono shadow-sm"
          >
            <span>{model.name}</span>
            {selectedModelIds.length > 1 && (
              <button
                onClick={() => toggleModel(model.model_id)}
                className="text-emerald-400/60 hover:text-emerald-300 transition"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Comparison Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
          <Layers className="w-3 h-3 text-cyan-400" /> Presets:
        </span>
        {PRESET_GROUPS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset.modelIds)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 text-slate-400 text-xs font-mono transition"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Collapsible Model Catalog Selector */}
      {isOpen && (
        <div className="mt-2 pt-4 border-t border-slate-800/80 flex flex-col gap-3">
          {/* Search & Provider Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models by provider or name (e.g., GPT-5, Sonnet, Gemini)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0B0F17] border border-slate-800 text-slate-100 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-emerald-500/60 transition"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {providers.map((p) => (
                <button
                  key={p}
                  onClick={() => setProviderFilter(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition capitalize whitespace-nowrap ${
                    providerFilter === p
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Model Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1">
            {filteredModels.map((model) => {
              const isSelected = selectedModelIds.includes(model.model_id);
              return (
                <div
                  key={model.model_id}
                  onClick={() => toggleModel(model.model_id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-100 shadow-md shadow-emerald-500/5'
                      : 'bg-[#0B0F17]/80 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                        {model.name}
                        <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {model.provider}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                        isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-2 font-sans">
                    {model.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 font-mono text-[10px]">
                    <span className="text-slate-400">
                      Ctx: <strong className="text-slate-200">{(model.context_window / 1000).toFixed(0)}k</strong>
                    </span>
                    <span className="text-emerald-400">
                      ${model.pricing_input}/1M in · ${model.pricing_output}/1M out
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
