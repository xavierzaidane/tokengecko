import { insforge } from './client';
import { ModelInspectionResult } from '@/lib/analysis/schema';

export interface SavedAnalysis {
  id: string;
  user_id: string;
  prompt_text: string;
  share_token: string | null;
  is_public: boolean;
  created_at: string;
  results?: ModelInspectionResult[];
}

export async function saveAnalysis(
  userId: string,
  promptText: string,
  results: ModelInspectionResult[]
): Promise<{ data: SavedAnalysis | null; error: any }> {
  try {
    // 1. Insert master analysis record
    const { data: analysisData, error: analysisError } = await insforge.database
      .from('analyses')
      .insert([
        {
          user_id: userId,
          prompt_text: promptText,
          is_public: false,
        },
      ])
      .select('*');

    if (analysisError || !analysisData || analysisData.length === 0) {
      return { data: null, error: analysisError || new Error('Failed to insert analysis') };
    }

    const createdAnalysis = analysisData[0] as SavedAnalysis;

    // 2. Insert detail result records
    const resultRows = results.map((r) => ({
      analysis_id: createdAnalysis.id,
      model_id: r.model_id,
      normalized_output: r,
    }));

    const { error: resultsError } = await insforge.database
      .from('analysis_results')
      .insert(resultRows);

    if (resultsError) {
      console.error('Failed to insert analysis_results rows:', resultsError);
    }

    return {
      data: {
        ...createdAnalysis,
        results,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function getUserAnalyses(userId: string): Promise<{ data: SavedAnalysis[]; error: any }> {
  try {
    // Fetch analyses for user
    const { data: analysesData, error: analysesError } = await insforge.database
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (analysesError) {
      return { data: [], error: analysesError };
    }

    if (!analysesData || analysesData.length === 0) {
      return { data: [], error: null };
    }

    // Fetch all related results
    const analysisIds = analysesData.map((a: any) => a.id);
    const { data: resultsData, error: resultsError } = await insforge.database
      .from('analysis_results')
      .select('*')
      .in('analysis_id', analysisIds);

    if (resultsError) {
      console.warn('Error fetching analysis results:', resultsError);
    }

    // Map results to analyses
    const fullAnalyses: SavedAnalysis[] = analysesData.map((a: any) => {
      const relatedResults = (resultsData || [])
        .filter((r: any) => r.analysis_id === a.id)
        .map((r: any) => r.normalized_output as ModelInspectionResult);

      return {
        ...a,
        results: relatedResults,
      };
    });

    return { data: fullAnalyses, error: null };
  } catch (err: any) {
    return { data: [], error: err };
  }
}

export async function deleteAnalysis(
  analysisId: string,
  userId: string
): Promise<{ error: any }> {
  try {
    const { error } = await insforge.database
      .from('analyses')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', userId);

    return { error };
  } catch (err: any) {
    return { error: err };
  }
}

export async function createShareToken(
  analysisId: string,
  userId: string
): Promise<{ shareToken: string | null; error: any }> {
  try {
    // Check if share token already exists
    const { data: existing } = await insforge.database
      .from('analyses')
      .select('share_token, is_public')
      .eq('id', analysisId)
      .single();

    if (existing && existing.share_token) {
      return { shareToken: existing.share_token, error: null };
    }

    // Generate random share token string
    const shareToken = 'tg_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

    const { error } = await insforge.database
      .from('analyses')
      .update({
        share_token: shareToken,
        is_public: true,
      })
      .eq('id', analysisId);

    if (error) {
      return { shareToken: null, error };
    }

    return { shareToken, error: null };
  } catch (err: any) {
    return { shareToken: null, error: err };
  }
}

export async function getPublicAnalysisByShareToken(
  shareToken: string
): Promise<{ data: SavedAnalysis | null; error: any }> {
  try {
    const { data: analysesData, error: analysisError } = await insforge.database
      .from('analyses')
      .select('*')
      .eq('share_token', shareToken);

    if (analysisError || !analysesData || analysesData.length === 0) {
      return { data: null, error: analysisError || new Error('Shared analysis not found') };
    }

    const analysisItem = analysesData[0] as SavedAnalysis;

    const { data: resultsData } = await insforge.database
      .from('analysis_results')
      .select('*')
      .eq('analysis_id', analysisItem.id);

    const results = (resultsData || []).map((r: any) => r.normalized_output as ModelInspectionResult);

    return {
      data: {
        ...analysisItem,
        results,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err };
  }
}
