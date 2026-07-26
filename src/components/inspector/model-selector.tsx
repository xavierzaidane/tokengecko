'use client';

import React, { useState } from 'react';
import { DEFAULT_MODELS, PRESET_GROUPS as MODEL_PRESETS, ModelInfo } from '@/lib/models/registry';
import { Search, Check, SlidersHorizontal, Sliders } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProviderIcon } from '@/components/icons/provider-icons';

interface ModelSelectorProps {
  selectedModelIds: string[];
  onSelectionChange: (ids: string[]) => void;
  height?: string;
}

const PROVIDERS = ['All', 'OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Meta'];

export function ModelSelector({
  selectedModelIds,
  onSelectionChange,
  height = '560px',
}: ModelSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('All');

  const toggleModel = (id: string) => {
    if (selectedModelIds.includes(id)) {
      if (selectedModelIds.length > 1) {
        onSelectionChange(selectedModelIds.filter((item) => item !== id));
      }
    } else {
      onSelectionChange([...selectedModelIds, id]);
    }
  };

  const applyPreset = (presetModelIds: string[]) => {
    const validIds = presetModelIds.filter((id) =>
      DEFAULT_MODELS.some((m) => m.model_id === id)
    );
    if (validIds.length > 0) {
      onSelectionChange(validIds);
    }
  };

  const filteredModels = DEFAULT_MODELS.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider =
      selectedProvider === 'All' || model.provider.toLowerCase() === selectedProvider.toLowerCase();
    return matchesSearch && matchesProvider;
  });

  return (
    <Card className="border-zinc-800 bg-card-dark shadow-xl font-mono">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Badge variant="orange" className="ml-1 text-[10px]">
            {selectedModelIds.length} Selected
          </Badge>
        </div>

        {/* Preset Selector Shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-zinc-500 text-[11px] mr-1">Presets:</span>
          {(MODEL_PRESETS || []).map((preset) => (
            <Button
              key={preset.id}
              onClick={() => applyPreset(preset.modelIds)}
              variant="outline"
              size="sm"
              className="text-[11px] h-7 px-2 bg-input-dark border-zinc-800 hover:border-accent-orange/40 hover:text-white"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Search & Provider Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Provider Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {PROVIDERS.map((prov) => (
              <button
                key={prov}
                onClick={() => setSelectedProvider(prov)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] transition whitespace-nowrap ${
                  selectedProvider === prov
                    ? 'bg-accent-orange text-zinc-950 font-bold shadow-sm'
                    : 'bg-input-dark text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {prov !== 'All' && (
                  <ProviderIcon
                    provider={prov}
                    size={12}
                    className={selectedProvider === prov ? 'text-zinc-950' : 'text-zinc-400'}
                  />
                )}
                <span>{prov}</span>
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-input-dark border-zinc-800"
            />
          </div>
        </div>

        {/* Fixed-Height Model Selection Grid with Accent Orange Outline on Selection */}
        <div
          style={{ height }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start overflow-y-auto pr-1 border-t border-zinc-800/40 pt-3"
        >
          {filteredModels.length > 0 ? (
            filteredModels.map((model) => {
              const isSelected = selectedModelIds.includes(model.model_id);
              return (
                <div
                  key={model.model_id}
                  onClick={() => toggleModel(model.model_id)}
                  className={`p-3 border transition cursor-pointer flex flex-col justify-between space-y-2 font-mono ${
                    isSelected
                      ? 'bg-zinc-940 border-2 border-accent-orange shadow-md shadow-accent-orange/10'
                      : 'bg-input-dark border-zinc-800/80 hover:border-zinc-700 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 shrink-0">
                        <ProviderIcon
                          provider={model.provider}
                          size={16}
                          className={isSelected ? 'text-accent-orange' : 'text-zinc-500'}
                        />
                      </div>
                      <div>
                        <div className={`text-xs font-extrabold leading-tight ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                          {model.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {model.provider}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 flex items-center justify-center text-xs shrink-0 transition ${
                        isSelected
                          ? 'bg-accent-orange text-zinc-950 font-bold shadow-sm'
                          : 'border border-zinc-700 bg-zinc-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div className={`flex items-center justify-between text-[10px] border-t pt-2 ${
                    isSelected ? 'text-zinc-300 border-zinc-800' : 'text-zinc-500 border-zinc-800/60'
                  }`}>
                    <span>{(model.context_window / 1000).toFixed(0)}k context</span>
                    <span className={isSelected ? 'text-accent-orange font-bold' : 'text-zinc-400'}>
                      ${model.pricing_input}/M
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
              <Sliders className="w-6 h-6 text-zinc-600" />
              <span>No models match search filter &quot;{searchQuery}&quot;</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
