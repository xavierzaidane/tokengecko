'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { UserKeyStatus, ProviderType, getUserApiKeys, saveUserApiKey, deleteUserApiKey } from '@/lib/insforge/keys';
import { Key, Lock, Trash2, RefreshCw, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProviderConfig {
  id: ProviderType;
  name: string;
  logo: string;
  placeholder: string;
  description: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    logo: '/OpenAI.png',
    placeholder: 'sk-proj-...',
    description: 'Enables exact OpenAI GPT-4o & o3-mini token pricing telemetry',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: '/Anthropic.svg',
    placeholder: 'sk-ant-api03-...',
    description: 'Enables exact Claude messages/count_tokens API calculations',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    logo: '/GoogleGemini.svg',
    placeholder: 'AIzaSy...',
    description: 'Enables exact Gemini 2.0 Flash countTokens() API calculations',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: '/DeepSeek.png',
    placeholder: 'sk-ds-...',
    description: 'Enables DeepSeek-V3 & R1 token efficiency & cost benchmarking',
  },
  {
    id: 'meta',
    name: 'Meta Llama / Groq',
    logo: '/Meta.png',
    placeholder: 'gsk_...',
    description: 'Enables Llama 3.3 high-speed inference telemetry & BYOK routing',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    logo: '/Mistral.png',
    placeholder: 'sk-ms-...',
    description: 'Enables Mistral Large & Codestral payload token inspection',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    logo: '/Cohere.png',
    placeholder: 'sk-co-...',
    description: 'Enables Command R+ & Embed token counting API telemetry',
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    logo: '/Perplexity.svg',
    placeholder: 'pplx-...',
    description: 'Enables Sonar web reasoning & online search token triage',
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    logo: '/xAI.svg',
    placeholder: 'xai-...',
    description: 'Enables Grok-2 & Grok-3 real-time token performance monitoring',
  },
];

export default function SettingsPage() {
  const { user } = useAuth();

  const [keys, setKeys] = useState<UserKeyStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Key input states for each provider
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [savingState, setSavingState] = useState<Record<string, boolean>>({});

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchKeys = async () => {
    if (!user) return;
    setIsLoading(true);
    const { keys: userKeys } = await getUserApiKeys(user.id);
    setIsLoading(false);
    setKeys(userKeys || []);
  };

  useEffect(() => {
    if (user) {
      fetchKeys();
    }
  }, [user]);

  const handleSaveKey = async (providerId: ProviderType, providerName: string) => {
    if (!user) return;
    const value = inputValues[providerId] || '';
    if (!value || value.trim().length < 6) {
      setFeedbackMsg({ type: 'error', text: `Please enter a valid ${providerName} API key.` });
      return;
    }

    setSavingState((prev) => ({ ...prev, [providerId]: true }));
    setFeedbackMsg(null);

    const { success, error } = await saveUserApiKey(user.id, providerId, value.trim());

    setSavingState((prev) => ({ ...prev, [providerId]: false }));
    setInputValues((prev) => ({ ...prev, [providerId]: '' }));

    if (error || !success) {
      setFeedbackMsg({ type: 'error', text: `Failed to save ${providerName} key.` });
    } else {
      setFeedbackMsg({ type: 'success', text: `${providerName} API key saved & AES-256 encrypted!` });
      fetchKeys();
    }
  };

  const handleDeleteKey = async (providerId: ProviderType, providerName: string) => {
    if (!user) return;
    setFeedbackMsg(null);
    const { success, error } = await deleteUserApiKey(user.id, providerId);
    if (!success || error) {
      setFeedbackMsg({ type: 'error', text: `Failed to delete ${providerName} key.` });
    } else {
      setFeedbackMsg({ type: 'success', text: `${providerName} API key removed.` });
      fetchKeys();
    }
  };

  return (
    <AuthGuard>
      <SidebarLayout>
        <div className="space-y-6 max-w-4xl pb-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-mono text-white tracking-tight">
                BYOK API Keys & Provider Vault
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Bring Your Own Keys across 9 major AI providers for exact token calculations, pricing telemetry, and live routing.
              </p>
            </div>
          </div>

          {/* Encryption Info Alert */}
          <div className="p-4 bg-card-dark border border-zinc-800 flex items-start gap-3 shadow-lg rounded-xl">
            <Lock className="w-5 h-5 text-accent-orange shrink-0 mt-0.5" />
            <div className="text-xs font-mono space-y-1">
              <h3 className="font-bold text-white">AES-256-GCM Server-Side Vault Encryption</h3>
              <p className="text-zinc-400 leading-relaxed font-sans text-xs">
                Your API keys are encrypted at rest using AES-256-GCM before database storage. Plaintext keys are never logged or exposed back to the client. Keys are decrypted exclusively on server side for real-time provider calls.
              </p>
            </div>
          </div>

          {feedbackMsg && (
            <div
              className={`p-4 font-mono text-xs flex items-center gap-2 border rounded-lg ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {feedbackMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {feedbackMsg.text}
            </div>
          )}

          {/* Key Management Form Grid */}
          <div className="space-y-4 font-mono">
            {PROVIDERS.map((provider) => {
              const status = keys.find((k) => k.provider === provider.id);
              const isConfigured = status?.isConfigured;
              const isSaving = savingState[provider.id] || false;
              const isVisible = visibleKeys[provider.id] || false;
              const currentInput = inputValues[provider.id] || '';

              return (
                <Card key={provider.id} className="border-zinc-800 bg-card-dark shadow-xl overflow-hidden">
                  <CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 bg-white/[0.01]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-white/5 border border-zinc-700/60 rounded-lg flex items-center justify-center p-2 shrink-0">
                        <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                          <span>{provider.name}</span>
                        </CardTitle>
                        <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                          {provider.description}
                        </p>
                      </div>
                    </div>

                    {isConfigured ? (
                      <Badge variant="success" className="shrink-0 font-mono text-[11px]">
                        Configured ({status?.maskedKey})
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="shrink-0 font-mono text-[11px] text-zinc-400">
                        Not Configured
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className="p-4 space-y-3">
                    <label className="block text-xs text-zinc-400 font-sans">
                      {isConfigured ? `Rotate ${provider.name} API Key` : `Enter ${provider.name} API Key (${provider.placeholder})`}
                    </label>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={isVisible ? 'text' : 'password'}
                          value={currentInput}
                          onChange={(e) => setInputValues({ ...inputValues, [provider.id]: e.target.value })}
                          placeholder={isConfigured ? 'Paste new API key to rotate...' : provider.placeholder}
                          className="pr-10 bg-black/40 border-zinc-800 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setVisibleKeys({ ...visibleKeys, [provider.id]: !isVisible })}
                          className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition"
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <Button
                        onClick={() => handleSaveKey(provider.id, provider.name)}
                        disabled={isSaving || !currentInput}
                        variant="default"
                        size="sm"
                        className="gap-1.5 shrink-0 bg-accent-orange text-black font-semibold hover:bg-accent-orange/90"
                      >
                        {isSaving ? (
                          <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        ) : isConfigured ? (
                          <RefreshCw className="w-3.5 h-3.5" />
                        ) : (
                          <Key className="w-3.5 h-3.5" />
                        )}
                        {isConfigured ? 'Rotate Key' : 'Save Key'}
                      </Button>

                      {isConfigured && (
                        <Button
                          onClick={() => handleDeleteKey(provider.id, provider.name)}
                          variant="destructive"
                          size="sm"
                          className="h-9 w-9 p-0 shrink-0"
                          title={`Delete ${provider.name} Key`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </SidebarLayout>
    </AuthGuard>
  );
}
