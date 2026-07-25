export interface CostBreakdown {
  input: number;
  output: number;
  total: number;
}

export interface ModelInspectionResult {
  model_id: string;
  model: string;
  provider: string;
  inputTokens: number;
  estimatedOutputTokens: number;
  estimatedCost: CostBreakdown;
  contextWindow: number;
  remainingContext: number;
  contextUsagePercent: number;
  tokenizer: string;
  estimationMethod: 'Local Tokenizer' | 'Exact (API)' | 'Exact API';
  status: string;
}

export interface PromptStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
  bytes: number;
}
