'use client';

import React, { useState, useEffect } from 'react';
import {
  DEFAULT_MODELS,
  ModelInfo,
  fetchLiveRegistry,
} from '@/lib/models/registry';
import { Search, Check, RefreshCw, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProviderIcon } from '@/components/icons/provider-icons';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
  useModal,
} from '@/components/ui/animated-modal';

interface ModelSelectorProps {
  selectedModelIds: string[];
  onSelectionChange: (ids: string[]) => void;
  height?: string;
}

const PROVIDERS = ['All', 'OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Meta', 'Mistral', 'Qwen', 'Cohere'];

type SortOption =
  | 'default'
  | 'price_input_desc'
  | 'price_input_asc'
  | 'price_output_desc'
  | 'price_output_asc'
  | 'context_desc'
  | 'context_asc';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'default', label: 'Default Order' },
  { id: 'price_input_desc', label: 'Highest Input Price' },
  { id: 'price_input_asc', label: 'Lowest Input Price' },
  { id: 'price_output_desc', label: 'Highest Output Price' },
  { id: 'price_output_asc', label: 'Lowest Output Price' },
  { id: 'context_desc', label: 'Highest Context Window' },
  { id: 'context_asc', label: 'Lowest Context Window' },
];

function ModalDoneButton() {
  const { setOpen } = useModal();
  return (
    <Button
      onClick={() => setOpen(false)}
      className="bg-accent-orange hover:bg-accent-orange/90 text-zinc-950 font-bold font-mono text-xs px-4 py-2"
    >
      Apply & Close
    </Button>
  );
}

export function ModelSelector({
  selectedModelIds,
  onSelectionChange,
  height = '560px',
}: ModelSelectorProps) {
  const [models, setModels] = useState<ModelInfo[]>(DEFAULT_MODELS);
  const [syncSource, setSyncSource] = useState<'openrouter' | 'litellm' | 'default_fallback'>('default_fallback');
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const loadRegistry = async (force = false) => {
    setIsSyncing(true);
    try {
      const res = await fetchLiveRegistry(force);
      if (res.models && res.models.length > 0) {
        setModels(res.models);
        setSyncSource(res.source);
      }
    } catch {
      // Keep existing models on error
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    async function autoSync() {
      // 1. Instant load from local cache first for fast render
      await loadRegistry(false);
      // 2. Automatically sync live from OpenRouter in background and update UI in real-time
      await loadRegistry(true);
    }
    autoSync();
  }, []);

  const toggleModel = (id: string) => {
    if (selectedModelIds.includes(id)) {
      if (selectedModelIds.length > 1) {
        onSelectionChange(selectedModelIds.filter((item) => item !== id));
      }
    } else {
      onSelectionChange([...selectedModelIds, id]);
    }
  };

  const filteredModels = models.filter((model) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      model.name.toLowerCase().includes(q) ||
      model.provider.toLowerCase().includes(q) ||
      model.model_id.toLowerCase().includes(q);
    const matchesProvider =
      selectedProvider === 'All' ||
      model.provider.toLowerCase() === selectedProvider.toLowerCase();
    return matchesSearch && matchesProvider;
  });

  const sortedModels = [...filteredModels].sort((a, b) => {
    if (sortBy === 'price_input_desc') return b.pricing_input - a.pricing_input;
    if (sortBy === 'price_input_asc') return a.pricing_input - b.pricing_input;
    if (sortBy === 'price_output_desc') return b.pricing_output - a.pricing_output;
    if (sortBy === 'price_output_asc') return a.pricing_output - b.pricing_output;
    if (sortBy === 'context_desc') return b.context_window - a.context_window;
    if (sortBy === 'context_asc') return a.context_window - b.context_window;
    return 0;
  });

  const activeSortLabel = SORT_OPTIONS.find((s) => s.id === sortBy)?.label;

  return (
    <Modal>
      <Card className="border-zinc-800 bg-card-dark shadow-xl font-mono">
        <CardHeader className="flex flex-row items-center justify-between gap-3 p-3.5 border-b border-zinc-800/80 space-y-0">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs bg-input-dark border-zinc-800 focus:border-accent-orange h-8"
            />
          </div>

          {/* Single Filter Button opening 21st.dev Animated Modal */}
          <ModalTrigger className="bg-input-dark border border-zinc-800 hover:border-accent-orange/60 text-zinc-300 hover:text-white px-3 py-1.5 text-xs font-mono flex items-center gap-2 transition-colors shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
            <span>Filter Models</span>
            {selectedProvider !== 'All' && (
              <Badge variant="orange" className="ml-1 text-[10px] px-1.5 py-0">
                {selectedProvider}
              </Badge>
            )}
            {sortBy !== 'default' && (
              <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0 bg-accent-orange/10 text-accent-orange border-accent-orange/30">
                {activeSortLabel}
              </Badge>
            )}
          </ModalTrigger>
        </CardHeader>

        <CardContent className="p-4">
          {/* High-Density Fixed-Height Scrollable Model Grid */}
          <div
            style={{ height }}
            className="overflow-y-auto pr-1 space-y-2 no-scrollbar"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sortedModels.map((model) => {
                const isSelected = selectedModelIds.includes(model.model_id);
                return (
                  <div
                    key={model.model_id}
                    onClick={() => toggleModel(model.model_id)}
                    className={`p-3 cursor-pointer border transition-all duration-150 relative ${
                      isSelected
                        ? 'bg-sidebar border-zinc-300 text-white ring-1 ring-accent-orange shadow-md'
                        : 'bg-input-dark border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <ProviderIcon
                          provider={model.provider}
                          size={16}
                          className={isSelected ? 'text-accent-orange' : 'text-zinc-400'}
                        />
                        <span className="font-bold text-xs truncate text-white">
                          {model.name}
                        </span>
                      </div>

                      <div
                        className={`w-4 h-4 shrink-0 flex items-center justify-center border transition ${
                          isSelected
                            ? 'bg-accent-orange border-accent-orange text-zinc-950 font-bold'
                            : 'border-zinc-700 bg-zinc-900'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1 font-sans">
                      {model.description || 'General LLM model'}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/60 text-[10px]">
                      <span className="text-zinc-400">
                        Window: {(model.context_window / 1000).toFixed(0)}k
                      </span>
                      <span className="text-white font-bold">
                        ${model.pricing_input.toFixed(2)} / ${model.pricing_output.toFixed(2)} (1M)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 21st.dev Animated Modal Content */}
      <ModalBody>
        <ModalContent className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <SlidersHorizontal className="w-4 h-4 text-accent-orange" />
              Model Filters & Sorting
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Refine models by provider family, sort by highest/lowest pricing or context window, or sync live specifications.
            </p>
          </div>

          {/* Provider Filter Tabs */}
          <div className="space-y-2 font-mono">
            <label className="text-xs font-semibold text-zinc-300">Provider Family</label>
            <div className="flex flex-wrap gap-1.5">
              {PROVIDERS.map((prov) => (
                <button
                  key={prov}
                  onClick={() => setSelectedProvider(prov)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs transition cursor-pointer ${
                    selectedProvider === prov
                      ? 'bg-accent-orange text-zinc-950 font-bold shadow-sm'
                      : 'bg-input-dark text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {prov !== 'All' && (
                    <ProviderIcon
                      provider={prov}
                      size={14}
                      className={selectedProvider === prov ? 'text-zinc-950' : 'text-zinc-400'}
                    />
                  )}
                  <span>{prov}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Highest / Lowest Category Sort Filter */}
          <div className="space-y-2 font-mono">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-accent-orange" />
              Sort Category (Highest / Lowest)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`flex items-center justify-between px-3 py-2 text-xs border transition cursor-pointer text-left ${
                    sortBy === opt.id
                      ? 'bg-accent-orange text-zinc-950 font-bold border-accent-orange shadow-sm'
                      : 'bg-input-dark text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && <Check className="w-3.5 h-3.5 stroke-[3] shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Live Registry Sync */}
          <div className="pt-2 border-zinc-800/80 space-y-2 font-mono">
            <label className="text-xs font-semibold text-zinc-300">Live Registry Sync</label>
            <div className="flex items-center justify-between bg-input-dark border border-zinc-800 p-3">
              <div className="text-xs">
                <p className="font-bold text-white">OpenRouter API Sync</p>
                <p className="text-[11px] text-zinc-400">Fetch live model pricing & specs</p>
              </div>
              <Badge
                variant="outline"
                onClick={() => loadRegistry(true)}
                className={`text-xs cursor-pointer px-2.5 py-1 transition ${
                  syncSource === 'openrouter'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                <RefreshCw className={`w-3 h-3 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : syncSource === 'openrouter' ? 'Live OpenRouter' : 'Sync Registry'}
              </Badge>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <ModalDoneButton />
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
}
