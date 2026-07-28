import { ModelInfo } from '@/lib/models/registry';

export async function syncModelsToInsForge(models: ModelInfo[]): Promise<boolean> {
  if (!models || models.length === 0) return false;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
    const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

    if (!baseUrl || !anonKey) {
      return false;
    }

    const payload = models.map((m) => ({
      id: m.model_id,
      provider: m.provider,
      name: m.name,
      tokenizer_type: m.tokenizer_type,
      context_window: m.context_window,
      max_output_tokens: m.max_output_tokens,
      pricing_input: m.pricing_input,
      pricing_output: m.pricing_output,
      pricing_cached_input: m.pricing_cached_input,
      status: m.status,
      description: m.description || '',
      tags: JSON.stringify(m.tags || []),
      quality_scores: m.qualityScores ? JSON.stringify(m.qualityScores) : null,
      source: m.source || 'openrouter',
      last_synced_at: m.lastSyncedAt || new Date().toISOString(),
    }));

    const res = await fetch(`${baseUrl}/rest/v1/model_registry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.warn('InsForge model_registry sync warning:', err);
    return false;
  }
}

export async function fetchModelsFromInsForge(): Promise<ModelInfo[] | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
    const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

    if (!baseUrl || !anonKey) return null;

    const res = await fetch(`${baseUrl}/rest/v1/model_registry?select=*`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return data.map((row: any) => ({
      model_id: row.id,
      provider: row.provider,
      name: row.name,
      tokenizer_type: row.tokenizer_type,
      context_window: row.context_window,
      max_output_tokens: row.max_output_tokens,
      pricing_input: parseFloat(row.pricing_input),
      pricing_output: parseFloat(row.pricing_output),
      pricing_cached_input: parseFloat(row.pricing_cached_input || '0'),
      status: row.status,
      description: row.description,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [],
      qualityScores:
        typeof row.quality_scores === 'string'
          ? JSON.parse(row.quality_scores)
          : row.quality_scores,
      source: row.source,
      lastSyncedAt: row.last_synced_at,
    }));
  } catch {
    return null;
  }
}
