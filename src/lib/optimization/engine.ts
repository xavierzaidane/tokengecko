import {
  ModelInspectionResult,
  Recommendation,
  PromptHealth,
  RecommendationSegment,
} from '@/lib/analysis/schema';
import { estimateTokenCount } from '@/lib/tokenizers/engine';

export interface OptimizationAnalysisResult {
  health: PromptHealth;
  recommendations: Recommendation[];
  segments: RecommendationSegment[];
  cheapestModel?: ModelInspectionResult;
  largestContextModel?: ModelInspectionResult;
}

export function analyzePromptOptimization(
  promptText: string,
  results: ModelInspectionResult[]
): OptimizationAnalysisResult {
  const recommendations: Recommendation[] = [];

  if (!promptText || promptText.trim().length === 0 || results.length === 0) {
    return {
      health: {
        status: 'good',
        label: 'Ready for Analysis',
        description: 'Enter a prompt payload to evaluate health and receive optimization suggestions.',
      },
      recommendations: [],
      segments: [],
    };
  }

  // 1. Find Leaders: Cheapest model & Largest context model
  const sortedByCost = [...results].sort(
    (a, b) => a.estimatedCost.total - b.estimatedCost.total
  );
  const cheapestModel = sortedByCost[0];
  const mostExpensiveModel = sortedByCost[sortedByCost.length - 1];

  const sortedByContext = [...results].sort(
    (a, b) => b.contextWindow - a.contextWindow
  );
  const largestContextModel = sortedByContext[0];

  // 2. Evaluate Prompt Health
  let healthStatus: 'good' | 'warning' | 'over_limit' = 'good';
  let healthLabel = 'Optimal Prompt Health';
  let healthDescription = 'Prompt fits comfortably across all selected model context windows.';

  const overLimitModels = results.filter(
    (r) => r.inputTokens > r.contextWindow
  );
  const highUsageModels = results.filter(
    (r) => r.contextUsagePercent >= 80 && r.inputTokens <= r.contextWindow
  );

  if (overLimitModels.length > 0) {
    healthStatus = 'over_limit';
    healthLabel = 'Context Limit Exceeded';
    healthDescription = `Prompt exceeds context limit on ${overLimitModels.length} model(s): ${overLimitModels
      .map((m) => m.model)
      .join(', ')}.`;
  } else if (highUsageModels.length > 0) {
    healthStatus = 'warning';
    healthLabel = 'High Context Utilization';
    healthDescription = `Prompt consumes over 80% of context capacity on ${highUsageModels
      .map((m) => m.model)
      .join(', ')}.`;
  }

  // 3. Rule 1: Cheaper Model Swap Evaluator
  if (
    results.length > 1 &&
    mostExpensiveModel &&
    cheapestModel &&
    mostExpensiveModel.model_id !== cheapestModel.model_id
  ) {
    const costDiff =
      mostExpensiveModel.estimatedCost.total - cheapestModel.estimatedCost.total;
    const costPercentSaved = Math.round(
      (costDiff / Math.max(mostExpensiveModel.estimatedCost.total, 0.000001)) * 100
    );

    if (costPercentSaved >= 20 && costDiff > 0.00001) {
      recommendations.push({
        id: 'rec_cheaper_swap',
        type: 'cheaper_model_swap',
        severity: 'info',
        title: 'Cost Reduction Opportunity',
        message: `Switching from ${mostExpensiveModel.model} to ${cheapestModel.model} reduces estimated cost by ~${costPercentSaved}% ($${costDiff.toFixed(
          5
        )} savings per run).`,
        source: 'local',
        details: {
          fromModel: mostExpensiveModel.model,
          toModel: cheapestModel.model,
          costDelta: Number(costDiff.toFixed(6)),
          costDeltaPercent: costPercentSaved,
        },
      });
    }
  }

  // 4. Rule 2: Context Fit Evaluation
  if (overLimitModels.length > 0) {
    overLimitModels.forEach((m, idx) => {
      recommendations.push({
        id: `rec_over_limit_${idx}`,
        type: 'context_over_limit',
        severity: 'error',
        title: `Over Context Window: ${m.model}`,
        message: `Prompt token count (${m.inputTokens.toLocaleString()}) exceeds ${
          m.model
        }'s context limit (${(m.contextWindow / 1000).toFixed(0)}k).`,
        source: 'local',
      });
    });
  } else if (highUsageModels.length > 0) {
    highUsageModels.forEach((m, idx) => {
      recommendations.push({
        id: `rec_warning_usage_${idx}`,
        type: 'context_warning',
        severity: 'warning',
        title: `High Capacity Warning: ${m.model}`,
        message: `Prompt uses ${m.contextUsagePercent}% of ${
          m.model
        }'s context window. Consider truncating input text or selecting a larger context model.`,
        source: 'local',
      });
    });
  } else {
    recommendations.push({
      id: 'rec_context_fit_ok',
      type: 'context_fit_ok',
      severity: 'info',
      title: 'Context Fit Verified',
      message: `Prompt token payload fits within context limits across all ${results.length} selected models.`,
      source: 'local',
    });
  }

  // 5. Rule 3: Redundancy & Duplication Detector
  const lines = promptText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 15);
  const lineCounts: Record<string, number> = {};
  const duplicateLines: string[] = [];

  lines.forEach((line) => {
    lineCounts[line] = (lineCounts[line] || 0) + 1;
  });

  Object.entries(lineCounts).forEach(([line, count]) => {
    if (count > 1) {
      duplicateLines.push(line);
    }
  });

  if (duplicateLines.length > 0) {
    const redundantText = duplicateLines.join(' ');
    const potentialTokenSavings = estimateTokenCount(redundantText, 'cl100k_base');

    if (potentialTokenSavings > 5) {
      if (healthStatus === 'good') {
        healthStatus = 'warning';
        healthLabel = 'Redundant Text Flagged';
        healthDescription = `Detected ${duplicateLines.length} duplicated sentence block(s) in the prompt payload.`;
      }

      recommendations.push({
        id: 'rec_redundancy',
        type: 'redundancy_detected',
        severity: 'warning',
        title: 'Redundant Instructions Detected',
        message: `Found ${duplicateLines.length} duplicate line/instruction(s). Removing redundant lines could save ~${potentialTokenSavings} tokens.`,
        source: 'local',
        details: {
          duplicateLines: duplicateLines.slice(0, 3),
          potentialTokenSavings,
        },
      });
    }
  }

  // 6. Rule 4: Token-Share Breakdown Segmenter (JSON / Code / Instructions)
  const segments: RecommendationSegment[] = [];
  const totalTokens = Math.max(
    1,
    results[0]?.inputTokens || estimateTokenCount(promptText, 'cl100k_base')
  );

  let jsonTokens = 0;
  let codeTokens = 0;

  // Detect JSON blocks
  const jsonRegex = /({[\s\S]*?}|\[[\s\S]*?\])/g;
  const jsonMatches = promptText.match(jsonRegex);
  if (jsonMatches) {
    jsonMatches.forEach((match) => {
      if (match.length > 20) {
        try {
          JSON.parse(match);
          jsonTokens += estimateTokenCount(match, 'cl100k_base');
        } catch {
          // invalid json match
        }
      }
    });
  }

  // Detect Code blocks (fenced ```)
  const codeRegex = /```[\s\S]*?```/g;
  const codeMatches = promptText.match(codeRegex);
  if (codeMatches) {
    codeMatches.forEach((match) => {
      codeTokens += estimateTokenCount(match, 'cl100k_base');
    });
  }

  const remainingTokens = Math.max(0, totalTokens - jsonTokens - codeTokens);

  if (jsonTokens > 0) {
    const pct = Math.min(100, Math.round((jsonTokens / totalTokens) * 100));
    segments.push({ label: 'JSON Data', tokens: jsonTokens, percentage: pct });
  }

  if (codeTokens > 0) {
    const pct = Math.min(100, Math.round((codeTokens / totalTokens) * 100));
    segments.push({ label: 'Code Snippets', tokens: codeTokens, percentage: pct });
  }

  if (remainingTokens > 0 || segments.length === 0) {
    const pct = Math.max(
      0,
      100 - segments.reduce((sum, s) => sum + s.percentage, 0)
    );
    segments.push({
      label: 'Instructions & Text',
      tokens: remainingTokens,
      percentage: pct,
    });
  }

  // Generate Recommendation for dominant non-text segment
  const jsonSeg = segments.find((s) => s.label === 'JSON Data');
  const codeSeg = segments.find((s) => s.label === 'Code Snippets');

  if (jsonSeg && jsonSeg.percentage >= 25) {
    recommendations.push({
      id: 'rec_token_share_json',
      type: 'token_share_breakdown',
      severity: 'info',
      title: 'High JSON Token Consumption',
      message: `Structured JSON payloads account for ${jsonSeg.percentage}% (${jsonSeg.tokens} tokens) of total prompt overhead.`,
      source: 'local',
      details: { segments },
    });
  } else if (codeSeg && codeSeg.percentage >= 25) {
    recommendations.push({
      id: 'rec_token_share_code',
      type: 'token_share_breakdown',
      severity: 'info',
      title: 'Code Snippet Overhead',
      message: `Fenced code blocks contribute ${codeSeg.percentage}% (${codeSeg.tokens} tokens) of your prompt token budget.`,
      source: 'local',
      details: { segments },
    });
  }

  return {
    health: {
      status: healthStatus,
      label: healthLabel,
      description: healthDescription,
    },
    recommendations,
    segments,
    cheapestModel,
    largestContextModel,
  };
}
