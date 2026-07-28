import { fetchOpenRouterModels } from '@/lib/models/fetcher';
import { syncModelsToInsForge, fetchModelsFromInsForge } from '@/lib/models/sync';

export interface QualityScores {
  reasoning: number;
  coding: number;
  general: number;
  longContext: number;
  source: string;
  lastUpdated: string;
}

export interface ModelInfo {
  model_id: string;
  provider: string;
  name: string;
  tokenizer_type: string;
  context_window: number;
  max_output_tokens: number;
  pricing_input: number;
  pricing_output: number;
  pricing_cached_input: number;
  status: string;
  description?: string;
  tags?: string[];
  qualityScores?: QualityScores;
  source?: 'openrouter' | 'litellm' | 'default_fallback';
  lastSyncedAt?: string;
}

export const DEFAULT_MODELS: ModelInfo[] = [
  {
    model_id: 'gpt-5',
    provider: 'OpenAI',
    name: 'GPT-5',
    tokenizer_type: 'o200k_base',
    context_window: 272000,
    max_output_tokens: 16384,
    pricing_input: 1.25,
    pricing_output: 5.00,
    pricing_cached_input: 0.625,
    status: 'stable',
    description: 'Next-gen flagship OpenAI model with 272k context window',
    tags: ['Flagship', 'OpenAI'],
    qualityScores: {
      reasoning: 92,
      coding: 92,
      general: 94,
      longContext: 90,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
  {
    model_id: 'gpt-4o',
    provider: 'OpenAI',
    name: 'GPT-4o',
    tokenizer_type: 'o200k_base',
    context_window: 128000,
    max_output_tokens: 16384,
    pricing_input: 2.50,
    pricing_output: 10.00,
    pricing_cached_input: 1.25,
    status: 'stable',
    description: 'High-intelligence multimodal model for complex tasks',
    tags: ['Flagship', 'OpenAI'],
    qualityScores: {
      reasoning: 85,
      coding: 86,
      general: 88,
      longContext: 82,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
  {
    model_id: 'o1',
    provider: 'OpenAI',
    name: 'o1',
    tokenizer_type: 'o200k_base',
    context_window: 200000,
    max_output_tokens: 100000,
    pricing_input: 15.00,
    pricing_output: 60.00,
    pricing_cached_input: 7.50,
    status: 'stable',
    description: 'Reasoning model designed to spend more time thinking',
    tags: ['Reasoning', 'OpenAI'],
    qualityScores: {
      reasoning: 98,
      coding: 93,
      general: 90,
      longContext: 85,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
  {
    model_id: 'o3-mini',
    provider: 'OpenAI',
    name: 'o3-mini',
    tokenizer_type: 'o200k_base',
    context_window: 200000,
    max_output_tokens: 100000,
    pricing_input: 1.10,
    pricing_output: 4.40,
    pricing_cached_input: 0.55,
    status: 'stable',
    description: 'Fast, cost-effective reasoning model',
    tags: ['Reasoning', 'OpenAI'],
    qualityScores: {
      reasoning: 92,
      coding: 89,
      general: 86,
      longContext: 84,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
  {
    model_id: 'claude-3-5-sonnet',
    provider: 'Anthropic',
    name: 'Claude 3.5 Sonnet',
    tokenizer_type: 'claude',
    context_window: 200000,
    max_output_tokens: 8192,
    pricing_input: 3.00,
    pricing_output: 15.00,
    pricing_cached_input: 0.30,
    status: 'stable',
    description: 'Anthropic flagship model for coding, reasoning, & writing',
    tags: ['Flagship', 'Anthropic'],
    qualityScores: {
      reasoning: 87,
      coding: 95,
      general: 92,
      longContext: 88,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
  {
    model_id: 'claude-3-opus',
    provider: 'Anthropic',
    name: 'Claude 3 Opus',
    tokenizer_type: 'claude',
    context_window: 200000,
    max_output_tokens: 4096,
    pricing_input: 15.00,
    pricing_output: 75.00,
    pricing_cached_input: 1.50,
    status: 'stable',
    description: 'Top-level model for deep analysis and nuanced tasks',
    tags: ['Flagship', 'Anthropic'],
    qualityScores: {
      reasoning: 89,
      coding: 88,
      general: 91,
      longContext: 86,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
  {
    model_id: 'claude-3-5-haiku',
    provider: 'Anthropic',
    name: 'Claude 3.5 Haiku',
    tokenizer_type: 'claude',
    context_window: 200000,
    max_output_tokens: 8192,
    pricing_input: 0.80,
    pricing_output: 4.00,
    pricing_cached_input: 0.08,
    status: 'stable',
    description: 'Ultra-fast lightweight model from Anthropic',
    tags: ['Fast', 'Anthropic'],
    qualityScores: {
      reasoning: 74,
      coding: 79,
      general: 81,
      longContext: 80,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
  {
    model_id: 'gemini-2.0-flash',
    provider: 'Google',
    name: 'Gemini 2.0 Flash',
    tokenizer_type: 'gemini',
    context_window: 1048576,
    max_output_tokens: 8192,
    pricing_input: 0.10,
    pricing_output: 0.40,
    pricing_cached_input: 0.025,
    status: 'stable',
    description: 'Next-gen 1M context window model with low latency',
    tags: ['1M Context', 'Google'],
    qualityScores: {
      reasoning: 82,
      coding: 80,
      general: 83,
      longContext: 94,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
  {
    model_id: 'gemini-1.5-pro',
    provider: 'Google',
    name: 'Gemini 1.5 Pro',
    tokenizer_type: 'gemini',
    context_window: 2097152,
    max_output_tokens: 8192,
    pricing_input: 1.25,
    pricing_output: 5.00,
    pricing_cached_input: 0.3125,
    status: 'stable',
    description: 'Massive 2M context window model for large codebase prompts',
    tags: ['2M Context', 'Google'],
    qualityScores: {
      reasoning: 84,
      coding: 82,
      general: 85,
      longContext: 98,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
  {
    model_id: 'deepseek-v3',
    provider: 'DeepSeek',
    name: 'DeepSeek V3',
    tokenizer_type: 'deepseek',
    context_window: 128000,
    max_output_tokens: 8192,
    pricing_input: 0.27,
    pricing_output: 1.10,
    pricing_cached_input: 0.07,
    status: 'stable',
    description: 'Ultra cost-effective 671B parameter open mixture-of-experts model',
    tags: ['Open Weights', 'Cost Effective'],
    qualityScores: {
      reasoning: 86,
      coding: 90,
      general: 89,
      longContext: 84,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
  {
    model_id: 'deepseek-r1',
    provider: 'DeepSeek',
    name: 'DeepSeek R1',
    tokenizer_type: 'deepseek',
    context_window: 128000,
    max_output_tokens: 8192,
    pricing_input: 0.55,
    pricing_output: 2.19,
    pricing_cached_input: 0.14,
    status: 'stable',
    description: 'State-of-the-art open reasoning model matching o1 performance',
    tags: ['Reasoning', 'Open Weights'],
    qualityScores: {
      reasoning: 96,
      coding: 92,
      general: 91,
      longContext: 85,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
  {
    model_id: 'llama-3.3-70b',
    provider: 'Meta',
    name: 'Llama 3.3 70B',
    tokenizer_type: 'llama3',
    context_window: 128000,
    max_output_tokens: 4096,
    pricing_input: 0.59,
    pricing_output: 0.79,
    pricing_cached_input: 0,
    status: 'stable',
    description: 'Meta 70B open weight flagship LLM',
    tags: ['Open Weights', 'Meta'],
    qualityScores: {
      reasoning: 79,
      coding: 81,
      general: 84,
      longContext: 80,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
  {
    model_id: 'qwen-2.5-72b',
    provider: 'Qwen',
    name: 'Qwen 2.5 72B',
    tokenizer_type: 'qwen2',
    context_window: 128000,
    max_output_tokens: 8192,
    pricing_input: 0.35,
    pricing_output: 0.40,
    pricing_cached_input: 0,
    status: 'stable',
    description: 'Alibaba Qwen flagship model with high multilingual capability',
    tags: ['Open Weights', 'Qwen'],
    qualityScores: {
      reasoning: 83,
      coding: 86,
      general: 85,
      longContext: 81,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
  {
    model_id: 'mistral-large',
    provider: 'Mistral',
    name: 'Mistral Large 2',
    tokenizer_type: 'mistral',
    context_window: 128000,
    max_output_tokens: 4096,
    pricing_input: 2.00,
    pricing_output: 6.00,
    pricing_cached_input: 0,
    status: 'stable',
    description: 'Mistral top-tier reasoning and multilingual model',
    tags: ['European LLM', 'Mistral'],
    qualityScores: {
      reasoning: 81,
      coding: 83,
      general: 84,
      longContext: 82,
      source: 'livebench',
      lastUpdated: '2026-07-20',
    },
    source: 'default_fallback',
  },
];

export const PRESET_GROUPS = [
  {
    id: 'top-flagship',
    name: 'Top Flagships',
    modelIds: ['gpt-5', 'gpt-4o', 'claude-3-5-sonnet', 'gemini-2.0-flash'],
  },
  {
    id: 'open-weights',
    name: 'Open Weights Heavyweights',
    modelIds: ['deepseek-v3', 'deepseek-r1', 'llama-3.3-70b', 'qwen-2.5-72b'],
  },
  {
    id: 'high-context',
    name: 'Massive Context (>500k)',
    modelIds: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gpt-5', 'claude-3-5-sonnet'],
  },
  {
    id: 'reasoning',
    name: 'Reasoning Models',
    modelIds: ['o1', 'o3-mini', 'deepseek-r1'],
  },
];

const LOCAL_STORAGE_KEY = 'tokengecko_dynamic_models';

export async function fetchLiveRegistry(forceRefresh = false): Promise<{
  models: ModelInfo[];
  source: 'openrouter' | 'litellm' | 'default_fallback';
  syncedAt: string;
}> {
  // 1. Check browser LocalStorage cache if not forcing refresh
  if (typeof window !== 'undefined' && !forceRefresh) {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.models) && parsed.models.length > 0) {
          return parsed;
        }
      }
    } catch {
      // LocalStorage read error fallback
    }
  }

  try {
    // 2. Fetch live data from OpenRouter
    const result = await fetchOpenRouterModels();

    if (result.models.length > 0) {
      // 3. Save to InsForge Database in background
      if (result.source === 'openrouter') {
        syncModelsToInsForge(result.models).catch(() => {});
      }

      // 4. Save to LocalStorage cache
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
        } catch {
          // LocalStorage write error fallback
        }
      }

      return result;
    }
  } catch (err) {
    console.warn('Failed to fetch live OpenRouter models, falling back to cache:', err);
  }

  // Fallback: check LocalStorage cache if offline/failed
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.models) && parsed.models.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore cache error
    }
  }

  return {
    models: DEFAULT_MODELS,
    source: 'default_fallback',
    syncedAt: new Date().toISOString(),
  };
}
