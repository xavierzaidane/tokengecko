import { NextResponse } from 'next/server';
import { saveAnalysis, getUserAnalyses } from '@/lib/insforge/analyses';
import { DEFAULT_MODELS } from '@/lib/models/registry';
import { inspectPromptForAllModels, inspectPromptForModel } from '@/lib/tokenizers/engine';
import { getDecryptedUserApiKey } from '@/lib/insforge/keys';
import { countGeminiTokens, countAnthropicTokens } from '@/lib/tokenizers/exact-api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, promptText, selectedModelIds, outputTokens } = body;

    if (!promptText) {
      return NextResponse.json({ error: 'Prompt text is required' }, { status: 400 });
    }

    const modelIds = selectedModelIds || ['gpt-5', 'claude-3-5-sonnet', 'gemini-2.0-flash', 'deepseek-v3'];
    const models = DEFAULT_MODELS.filter((m) => modelIds.includes(m.model_id));
    const targetOutput = outputTokens || 512;

    // 1. Initial local estimation for all selected models
    const inspectionResults = inspectPromptForAllModels(promptText, models, targetOutput);

    // 2. If user is logged in, check for BYOK keys for exact API counting
    if (userId) {
      const [geminiKey, anthropicKey] = await Promise.all([
        getDecryptedUserApiKey(userId, 'gemini'),
        getDecryptedUserApiKey(userId, 'anthropic'),
      ]);

      // Process exact counts in parallel with timeout fallback
      await Promise.all(
        inspectionResults.map(async (r, index) => {
          const model = models.find((m) => m.model_id === r.model_id);
          if (!model) return;

          if (model.provider === 'Google' && geminiKey) {
            try {
              const exactCount = await countGeminiTokens(geminiKey, promptText, model.model_id);
              // Recalculate result with exact count
              const updated = inspectPromptForModel(promptText, model, targetOutput);
              updated.inputTokens = exactCount;
              updated.estimationMethod = 'Exact (API)';
              // Recalculate costs
              const inputCost = (exactCount / 1_000_000) * model.pricing_input;
              const outputCost = (targetOutput / 1_000_000) * model.pricing_output;
              updated.estimatedCost = {
                input: Number(inputCost.toFixed(6)),
                output: Number(outputCost.toFixed(6)),
                total: Number((inputCost + outputCost).toFixed(6)),
              };
              updated.remainingContext = Math.max(0, model.context_window - exactCount);
              updated.contextUsagePercent = Math.min(100, Number(((exactCount / model.context_window) * 100).toFixed(2)));

              inspectionResults[index] = updated;
            } catch (err) {
              console.warn(`Exact Gemini count API failed, using local estimation:`, err);
            }
          }

          if (model.provider === 'Anthropic' && anthropicKey) {
            try {
              const exactCount = await countAnthropicTokens(anthropicKey, promptText, model.model_id);
              const updated = inspectPromptForModel(promptText, model, targetOutput);
              updated.inputTokens = exactCount;
              updated.estimationMethod = 'Exact (API)';
              const inputCost = (exactCount / 1_000_000) * model.pricing_input;
              const outputCost = (targetOutput / 1_000_000) * model.pricing_output;
              updated.estimatedCost = {
                input: Number(inputCost.toFixed(6)),
                output: Number(outputCost.toFixed(6)),
                total: Number((inputCost + outputCost).toFixed(6)),
              };
              updated.remainingContext = Math.max(0, model.context_window - exactCount);
              updated.contextUsagePercent = Math.min(100, Number(((exactCount / model.context_window) * 100).toFixed(2)));

              inspectionResults[index] = updated;
            } catch (err) {
              console.warn(`Exact Anthropic count API failed, using local estimation:`, err);
            }
          }
        })
      );

      // Persist analysis to database
      const { data, error } = await saveAnalysis(userId, promptText, inspectionResults);
      if (!error && data) {
        return NextResponse.json({ success: true, analysis: data, results: inspectionResults });
      }
    }

    return NextResponse.json({ success: true, results: inspectionResults });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
    }

    const { data, error } = await getUserAnalyses(userId);
    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to fetch history' }, { status: 500 });
    }

    return NextResponse.json({ analyses: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
