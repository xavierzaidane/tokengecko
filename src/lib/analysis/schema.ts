import { QualityScores } from '@/lib/models/registry';

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
  qualityScores?: QualityScores;
  tradeoffScore?: number;
}

export interface PromptStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
  bytes: number;
}

export type RecommendationType =
  | 'cheaper_model_swap'
  | 'best_value_model'
  | 'redundancy_detected'
  | 'context_fit_ok'
  | 'context_over_limit'
  | 'context_warning'
  | 'token_share_breakdown';

export type RecommendationSeverity = 'info' | 'warning' | 'error';

export interface RecommendationSegment {
  label: string;
  tokens: number;
  percentage: number;
}

export type TaskType = 'coding' | 'reasoning' | 'longContext' | 'general';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  severity: RecommendationSeverity;
  title: string;
  message: string;
  source: 'local' | 'enhanced';
  details?: {
    fromModel?: string;
    toModel?: string;
    costDelta?: number;
    costDeltaPercent?: number;
    duplicateLines?: string[];
    potentialTokenSavings?: number;
    segments?: RecommendationSegment[];
    taskType?: TaskType;
    recommendedModel?: string;
    cheapestModel?: string;
    tradeoffScore?: number;
  };
}

export type PromptHealthStatus = 'good' | 'warning' | 'over_limit';

export interface PromptHealth {
  status: PromptHealthStatus;
  label: string;
  description: string;
}

export interface StoredAnalysisData {
  id?: string;
  prompt_text: string;
  stats: PromptStats;
  results: ModelInspectionResult[];
  recommendations?: Recommendation[];
  health?: PromptHealth;
  share_token?: string;
  created_at?: string;
}
