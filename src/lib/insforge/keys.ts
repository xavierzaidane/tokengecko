import { insforge } from './client';
import { encryptKey, decryptKey, maskApiKey } from '@/lib/security/encryption';

export type ProviderType =
  | 'openai'
  | 'gemini'
  | 'anthropic'
  | 'deepseek'
  | 'meta'
  | 'mistral'
  | 'cohere'
  | 'perplexity'
  | 'xai';

export interface UserKeyStatus {
  id?: string;
  provider: ProviderType;
  isConfigured: boolean;
  maskedKey?: string;
  created_at?: string;
  last_used_at?: string | null;
}

export async function saveUserApiKey(
  userId: string,
  provider: ProviderType,
  apiKey: string
): Promise<{ success: boolean; maskedKey?: string; error?: any }> {
  try {
    const encryptedKey = encryptKey(apiKey);

    // Delete existing key if present for provider
    await insforge.database
      .from('api_keys')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider);

    // Insert newly encrypted key
    const { data, error } = await insforge.database.from('api_keys').insert([
      {
        user_id: userId,
        provider,
        encrypted_key: encryptedKey,
      },
    ]);

    if (error) {
      return { success: false, error };
    }

    return {
      success: true,
      maskedKey: maskApiKey(apiKey),
    };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

export async function getUserApiKeys(userId: string): Promise<{ keys: UserKeyStatus[]; error?: any }> {
  try {
    const { data, error } = await insforge.database
      .from('api_keys')
      .select('id, provider, encrypted_key, created_at, last_used_at')
      .eq('user_id', userId);

    if (error) {
      return { keys: [], error };
    }

    const providers: ProviderType[] = [
      'openai',
      'gemini',
      'anthropic',
      'deepseek',
      'meta',
      'mistral',
      'cohere',
      'perplexity',
      'xai',
    ];
    const result: UserKeyStatus[] = providers.map((prov) => {
      const match = (data || []).find((row: any) => row.provider === prov);
      if (match) {
        let masked = '••••••••';
        try {
          const raw = decryptKey(match.encrypted_key);
          masked = maskApiKey(raw);
        } catch (e) {}

        return {
          id: match.id,
          provider: prov,
          isConfigured: true,
          maskedKey: masked,
          created_at: match.created_at,
          last_used_at: match.last_used_at,
        };
      }
      return {
        provider: prov,
        isConfigured: false,
      };
    });

    return { keys: result };
  } catch (err: any) {
    return { keys: [], error: err };
  }
}

export async function getDecryptedUserApiKey(
  userId: string,
  provider: ProviderType
): Promise<string | null> {
  try {
    const { data } = await insforge.database
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', userId)
      .eq('provider', provider);

    if (!data || data.length === 0) return null;

    const encrypted = data[0].encrypted_key;
    return decryptKey(encrypted);
  } catch (err) {
    console.error(`Failed to fetch decrypted API key for ${provider}:`, err);
    return null;
  }
}

export async function deleteUserApiKey(
  userId: string,
  provider: ProviderType
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await insforge.database
      .from('api_keys')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider);

    if (error) return { success: false, error };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err };
  }
}
