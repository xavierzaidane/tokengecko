import { ModelInfo, DEFAULT_MODELS } from '@/lib/models/registry';

export interface OpenRouterPricing {
  prompt: string;
  completion: string;
  image?: string;
  request?: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  description?: string;
  context_length: number;
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
  pricing: OpenRouterPricing;
  top_provider?: {
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  per_request_limits?: {
    prompt_tokens?: string;
    completion_tokens?: string;
  };
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

function parseProvider(id: string, name: string): string {
  const lowerId = id.toLowerCase();
  const lowerName = name.toLowerCase();
  if (lowerId.includes('openai') || lowerName.includes('openai') || lowerName.includes('gpt')) return 'OpenAI';
  if (lowerId.includes('anthropic') || lowerName.includes('claude')) return 'Anthropic';
  if (lowerId.includes('google') || lowerName.includes('gemini')) return 'Google';
  if (lowerId.includes('deepseek')) return 'DeepSeek';
  if (lowerId.includes('meta') || lowerId.includes('llama')) return 'Meta';
  if (lowerId.includes('mistral')) return 'Mistral';
  if (lowerId.includes('cohere')) return 'Cohere';
  if (lowerId.includes('qwen') || lowerId.includes('alibaba')) return 'Qwen';
  if (lowerId.includes('perplexity')) return 'Perplexity';
  if (lowerId.includes('amazon') || lowerId.includes('bedrock') || lowerId.includes('nova')) return 'Amazon';
  if (lowerId.includes('microsoft') || lowerId.includes('phi')) return 'Microsoft';
  if (lowerId.includes('nvidia') || lowerName.includes('nemotron')) return 'Nvidia';
  if (lowerId.includes('xai') || lowerId.includes('x-ai') || lowerName.includes('grok')) return 'xAI';

  const firstPart = id.split('/')[0];
  if (firstPart) {
    return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  }
  return 'Other';
}

function mapOpenRouterToModelInfo(item: OpenRouterModel, syncedAt: string): ModelInfo {
  const inputPricePerToken = parseFloat(item.pricing?.prompt || '0');
  const outputPricePerToken = parseFloat(item.pricing?.completion || '0');

  const pricing_input = Number((inputPricePerToken * 1000000).toFixed(4));
  const pricing_output = Number((outputPricePerToken * 1000000).toFixed(4));
  const pricing_cached_input = Number((pricing_input * 0.5).toFixed(4));

  const provider = parseProvider(item.id, item.name);

  return {
    model_id: item.id,
    name: item.name || item.id,
    provider,
    tokenizer_type: item.architecture?.tokenizer || 'cl100k_base',
    status: 'stable',
    description: item.description || `${provider} model via OpenRouter`,
    context_window: item.context_length || 128000,
    max_output_tokens: item.top_provider?.max_completion_tokens || 4096,
    pricing_input,
    pricing_output,
    pricing_cached_input,
    source: 'openrouter',
    lastSyncedAt: syncedAt,
  };
}

export async function fetchOpenRouterModels(): Promise<{
  models: ModelInfo[];
  source: 'openrouter' | 'default_fallback';
  syncedAt: string;
}> {
  const syncedAt = new Date().toISOString();

  try {
    let res: Response | null = null;

    // 1. In browser, try local proxy route first to bypass CORS / adblock
    if (typeof window !== 'undefined') {
      try {
        res = await fetch('/api/models/openrouter', { cache: 'no-store' });
      } catch {
        res = null;
      }
    }

    // 2. Direct fetch fallback if proxy route wasn't used or failed
    if (!res || !res.ok) {
      res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'HTTP-Referer': 'https://tokengecko.app',
          'X-Title': 'TokenGecko',
        },
        next: { revalidate: 3600 },
      });
    }

    if (!res.ok) {
      throw new Error(`OpenRouter API responded with status ${res.status}`);
    }

    const data: OpenRouterModelsResponse = await res.json();
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid OpenRouter models payload format');
    }

    const openRouterMap = new Map<string, OpenRouterModel>();
    data.data.forEach((item) => {
      openRouterMap.set(item.id.toLowerCase(), item);
      const parts = item.id.split('/');
      if (parts[1]) {
        const shortId = parts[1].toLowerCase();
        if (!openRouterMap.has(shortId)) {
          openRouterMap.set(shortId, item);
        }
      }
    });

    // 1. Update DEFAULT_MODELS with live OpenRouter pricing & context limits
    const updatedSeedModels: ModelInfo[] = DEFAULT_MODELS.map((seed) => {
      const seedLower = seed.model_id.toLowerCase().replace(/[^a-z0-9]/g, '');
      let match: OpenRouterModel | undefined = openRouterMap.get(seed.model_id.toLowerCase());

      if (!match) {
        // Fuzzy lookup across all items
        match = data.data.find((item) => {
          const itemClean = item.id.toLowerCase().replace(/[^a-z0-9]/g, '');
          return itemClean.includes(seedLower) || seedLower.includes(itemClean);
        });
      }

      if (!match) {
        return {
          ...seed,
          source: 'openrouter',
          lastSyncedAt: syncedAt,
        };
      }

      const inputPricePerToken = parseFloat(match.pricing?.prompt || '0');
      const outputPricePerToken = parseFloat(match.pricing?.completion || '0');

      const pricing_input = inputPricePerToken > 0
        ? Number((inputPricePerToken * 1000000).toFixed(4))
        : seed.pricing_input;

      const pricing_output = outputPricePerToken > 0
        ? Number((outputPricePerToken * 1000000).toFixed(4))
        : seed.pricing_output;

      return {
        ...seed,
        context_window: match.context_length || seed.context_window,
        max_output_tokens: match.top_provider?.max_completion_tokens || seed.max_output_tokens,
        pricing_input,
        pricing_output,
        pricing_cached_input: Number((pricing_input * 0.5).toFixed(4)),
        source: 'openrouter',
        lastSyncedAt: syncedAt,
      };
    });

    // 2. Map all live OpenRouter models into ModelInfo objects
    const seedIds = new Set(updatedSeedModels.map((m) => m.model_id.toLowerCase()));
    const additionalOpenRouterModels: ModelInfo[] = [];

    data.data.forEach((item) => {
      if (!seedIds.has(item.id.toLowerCase())) {
        additionalOpenRouterModels.push(mapOpenRouterToModelInfo(item, syncedAt));
        seedIds.add(item.id.toLowerCase());
      }
    });

    const allModels = [...updatedSeedModels, ...additionalOpenRouterModels];

    return {
      models: allModels,
      source: 'openrouter',
      syncedAt,
    };
  } catch (error) {
    console.warn(
      'TokenGecko Dynamic Registry: Falling back to seed DEFAULT_MODELS.',
      error
    );

    const fallbackModels: ModelInfo[] = DEFAULT_MODELS.map((m) => ({
      ...m,
      source: 'default_fallback',
      lastSyncedAt: syncedAt,
    }));

    return {
      models: fallbackModels,
      source: 'default_fallback',
      syncedAt,
    };
  }
}
