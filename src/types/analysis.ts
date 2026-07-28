import { ModelInspectionResult, Recommendation } from '@/lib/analysis/schema';

export type AnalysisStatus = 'idle' | 'analyzing' | 'ready' | 'stale' | 'error';

export interface RegistrySnapshot {
  source: 'openrouter' | 'litellm' | 'default_fallback';
  lastSyncedAt: string;
  totalModels: number;
}

export interface AnalysisResult {
  perModel: ModelInspectionResult[];
  recommendations: Recommendation[];
  computedAt: string;
  registrySnapshot: RegistrySnapshot;
}

export interface AnalysisState {
  status: AnalysisStatus;
  input: {
    promptText: string;
    selectedModelIds: string[];
    targetOutputTokens: number;
  };
  result: AnalysisResult | null;
  error?: string;
}
