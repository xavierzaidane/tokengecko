import { getEncoding } from 'js-tiktoken';
import { ModelInfo } from '@/lib/models/registry';
import { ModelInspectionResult, PromptStats } from '@/lib/analysis/schema';

// Lazy-loaded tiktoken encodings
let cl100kEncoder: ReturnType<typeof getEncoding> | null = null;
let o200kEncoder: ReturnType<typeof getEncoding> | null = null;

function getOpenAIEncoder(encodingName: string) {
  try {
    if (encodingName === 'o200k_base') {
      if (!o200kEncoder) {
        o200kEncoder = getEncoding('o200k_base');
      }
      return o200kEncoder;
    }
    if (!cl100kEncoder) {
      cl100kEncoder = getEncoding('cl100k_base');
    }
    return cl100kEncoder;
  } catch (err) {
    console.warn(`Failed to initialize tiktoken encoding ${encodingName}, falling back:`, err);
    return null;
  }
}

export function computePromptStats(text: string): PromptStats {
  if (!text) {
    return { characters: 0, words: 0, sentences: 0, lines: 0, bytes: 0 };
  }

  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text.split('\n').length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const bytes = new TextEncoder().encode(text).length;

  return { characters, words, sentences, lines, bytes };
}

export function estimateTokenCount(text: string, tokenizerType: string): number {
  if (!text || text.length === 0) return 0;

  // 1. OpenAI Tiktoken (exact local tokenization)
  if (tokenizerType === 'cl100k_base' || tokenizerType === 'o200k_base') {
    const encoder = getOpenAIEncoder(tokenizerType);
    if (encoder) {
      try {
        return encoder.encode(text).length;
      } catch (e) {
        // fallback
      }
    }
  }

  // 2. Claude (Anthropic BPE) tokenizer approximation
  if (tokenizerType === 'claude') {
    // Claude tokenization averages ~3.5 to 3.8 characters per token in English/code
    const words = text.trim().split(/\s+/).length;
    const charCount = text.length;
    return Math.ceil(Math.max(words * 1.25, charCount / 3.7));
  }

  // 3. Gemini (Google SentencePiece) tokenizer approximation
  if (tokenizerType === 'gemini') {
    // Gemini tokenization averages ~4.0 characters per token
    const words = text.trim().split(/\s+/).length;
    const charCount = text.length;
    return Math.ceil(Math.max(words * 1.2, charCount / 4.0));
  }

  // 4. Llama 3 / DeepSeek / Qwen / Mistral BPE tokenizers
  if (['llama3', 'deepseek', 'qwen2', 'mistral'].includes(tokenizerType)) {
    const charCount = text.length;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(Math.max(words * 1.28, charCount / 3.8));
  }

  // Default fallback estimation
  return Math.ceil(text.length / 4);
}

export function inspectPromptForModel(
  text: string,
  model: ModelInfo,
  estimatedOutputTokens: number = 512
): ModelInspectionResult {
  const inputTokens = estimateTokenCount(text, model.tokenizer_type);

  // Pricing calculations per 1 Million tokens
  const inputCost = (inputTokens / 1_000_000) * model.pricing_input;
  const outputCost = (estimatedOutputTokens / 1_000_000) * model.pricing_output;
  const totalCost = inputCost + outputCost;

  const contextWindow = model.context_window;
  const remainingContext = Math.max(0, contextWindow - inputTokens);
  const contextUsagePercent = Math.min(100, Number(((inputTokens / contextWindow) * 100).toFixed(2)));

  return {
    model_id: model.model_id,
    model: model.name,
    provider: model.provider,
    inputTokens,
    estimatedOutputTokens,
    estimatedCost: {
      input: Number(inputCost.toFixed(6)),
      output: Number(outputCost.toFixed(6)),
      total: Number(totalCost.toFixed(6)),
    },
    contextWindow,
    remainingContext,
    contextUsagePercent,
    tokenizer: model.tokenizer_type,
    estimationMethod: 'Local Tokenizer',
    status: model.status,
  };
}

export function inspectPromptForAllModels(
  text: string,
  selectedModels: ModelInfo[],
  estimatedOutputTokens: number = 512
): ModelInspectionResult[] {
  return selectedModels.map((model) =>
    inspectPromptForModel(text, model, estimatedOutputTokens)
  );
}
