export interface ExactCountResult {
  tokenCount: number;
  provider: 'gemini' | 'anthropic';
  modelId: string;
}

export async function countGeminiTokens(
  apiKey: string,
  promptText: string,
  modelId: string = 'gemini-1.5-flash'
): Promise<number> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout fallback

  try {
    const apiModel = modelId.includes('2.0') ? 'gemini-2.0-flash' : 'gemini-1.5-pro';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:countTokens?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini countTokens API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (typeof data.totalTokens === 'number') {
      return data.totalTokens;
    }
    throw new Error('Invalid Gemini countTokens response structure');
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function countAnthropicTokens(
  apiKey: string,
  promptText: string,
  modelId: string = 'claude-3-5-sonnet-20241022'
): Promise<number> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout fallback

  try {
    const apiModel = modelId.includes('haiku')
      ? 'claude-3-5-haiku-20241022'
      : modelId.includes('opus')
      ? 'claude-3-opus-20240229'
      : 'claude-3-5-sonnet-20241022';

    const response = await fetch('https://api.anthropic.com/v1/messages/count_tokens', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: apiModel,
        messages: [{ role: 'user', content: promptText }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic count_tokens API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (typeof data.input_tokens === 'number') {
      return data.input_tokens;
    }
    throw new Error('Invalid Anthropic count_tokens response structure');
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
