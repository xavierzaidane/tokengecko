'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { UserKeyStatus, getUserApiKeys, saveUserApiKey, deleteUserApiKey } from '@/lib/insforge/keys';
import { Key, ShieldCheck, Lock, Trash2, RefreshCw, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const { user } = useAuth();

  const [keys, setKeys] = useState<UserKeyStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [geminiInput, setGeminiInput] = useState('');
  const [anthropicInput, setAnthropicInput] = useState('');

  const [showGemini, setShowGemini] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);

  const [isSavingGemini, setIsSavingGemini] = useState(false);
  const [isSavingAnthropic, setIsSavingAnthropic] = useState(false);

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

  const handleSaveKey = async (provider: 'gemini' | 'anthropic') => {
    if (!user) return;
    const value = provider === 'gemini' ? geminiInput : anthropicInput;
    if (!value || value.trim().length < 8) {
      setFeedbackMsg({ type: 'error', text: `Please enter a valid ${provider} API key.` });
      return;
    }

    if (provider === 'gemini') setIsSavingGemini(true);
    else setIsSavingAnthropic(true);

    setFeedbackMsg(null);

    const { success, error } = await saveUserApiKey(user.id, provider, value.trim());

    if (provider === 'gemini') {
      setIsSavingGemini(false);
      setGeminiInput('');
    } else {
      setIsSavingAnthropic(false);
      setAnthropicInput('');
    }

    if (error || !success) {
      setFeedbackMsg({ type: 'error', text: `Failed to save ${provider} key.` });
    } else {
      setFeedbackMsg({ type: 'success', text: `${provider.toUpperCase()} API key saved & encrypted!` });
      fetchKeys();
    }
  };

  const handleDeleteKey = async (provider: 'gemini' | 'anthropic') => {
    if (!user) return;
    setFeedbackMsg(null);
    const { success, error } = await deleteUserApiKey(user.id, provider);
    if (!success || error) {
      setFeedbackMsg({ type: 'error', text: `Failed to delete ${provider} key.` });
    } else {
      setFeedbackMsg({ type: 'success', text: `${provider.toUpperCase()} API key removed.` });
      fetchKeys();
    }
  };

  const geminiStatus = keys.find((k) => k.provider === 'gemini');
  const anthropicStatus = keys.find((k) => k.provider === 'anthropic');

  return (
    <AuthGuard>
      <SidebarLayout>
        <div className="space-y-6 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-mono text-white tracking-tight">
                API Keys & Provider Settings
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Bring Your Own Keys for Google Gemini and Anthropic to enable exact countTokens API calculations.
              </p>
            </div>
          </div>

          {/* Encryption Info Alert */}
          <div className="p-4  flex items-start gap-3 shadow-lg">
            <Lock className="w-5 h-5 text-accent-orange shrink-0 mt-0.5" />
            <div className="text-xs font-mono space-y-1">
              <h3 className="font-bold text-white">AES-256-GCM Server-Side Encryption</h3>
              <p className="text-zinc-400 leading-relaxed font-sans text-xs">
                Your API keys are encrypted at rest using AES-256-GCM before storage. Plaintext keys are never returned to the browser client or logged after save. Keys are used strictly for provider token counting calls.
              </p>
            </div>
          </div>

          {feedbackMsg && (
            <div
              className={`p-4 font-mono text-xs flex items-center gap-2 border ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {feedbackMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {feedbackMsg.text}
            </div>
          )}

          {/* Key Management Form Cards */}
          <div className="space-y-6 font-mono">
            {/* 1. Google Gemini Key Card */}
            <Card className="border-zinc-800 bg-card-dark shadow-xl">
              <CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-accent-orange/10 border border-zinc-800 flex items-center justify-center text-accent-orange font-bold text-sm">
                    G
                  </div>
                  <div>
                    <CardTitle>Google Gemini API Key</CardTitle>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Enables exact Gemini `countTokens()` API calculation
                    </p>
                  </div>
                </div>

                {geminiStatus?.isConfigured ? (
                  <Badge variant="success">Configured ({geminiStatus.maskedKey})</Badge>
                ) : (
                  <Badge variant="secondary">Not Configured</Badge>
                )}
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                <label className="block text-xs text-zinc-400">
                  {geminiStatus?.isConfigured ? 'Rotate Gemini API Key' : 'Enter Gemini API Key (AIzaSy...)'}
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showGemini ? 'text' : 'password'}
                      value={geminiInput}
                      onChange={(e) => setGeminiInput(e.target.value)}
                      placeholder={geminiStatus?.isConfigured ? 'Paste new key to rotate...' : 'AIzaSy...'}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGemini(!showGemini)}
                      className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition"
                    >
                      {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <Button
                    onClick={() => handleSaveKey('gemini')}
                    disabled={isSavingGemini || !geminiInput}
                    variant="default"
                    size="sm"
                    className="gap-1.5"
                  >
                    {isSavingGemini ? (
                      <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    ) : geminiStatus?.isConfigured ? (
                      <RefreshCw className="w-3.5 h-3.5" />
                    ) : (
                      <Key className="w-3.5 h-3.5" />
                    )}
                    {geminiStatus?.isConfigured ? 'Rotate Key' : 'Save Key'}
                  </Button>

                  {geminiStatus?.isConfigured && (
                    <Button
                      onClick={() => handleDeleteKey('gemini')}
                      variant="destructive"
                      size="sm"
                      className="h-9 w-9 p-0"
                      title="Delete key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 2. Anthropic Key Card */}
            <Card className="border-zinc-800 bg-card-dark shadow-xl">
              <CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-accent-orange/10 border border-zinc-800  flex items-center justify-center text-accent-orange font-bold text-sm">
                    A
                  </div>
                  <div>
                    <CardTitle>Anthropic API Key</CardTitle>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Enables exact Claude `messages/count_tokens` API calculation
                    </p>
                  </div>
                </div>

                {anthropicStatus?.isConfigured ? (
                  <Badge variant="success">Configured ({anthropicStatus.maskedKey})</Badge>
                ) : (
                  <Badge variant="secondary">Not Configured</Badge>
                )}
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                <label className="block text-xs text-zinc-400">
                  {anthropicStatus?.isConfigured ? 'Rotate Anthropic API Key' : 'Enter Anthropic API Key (sk-ant-...)'}
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showAnthropic ? 'text' : 'password'}
                      value={anthropicInput}
                      onChange={(e) => setAnthropicInput(e.target.value)}
                      placeholder={anthropicStatus?.isConfigured ? 'Paste new key to rotate...' : 'sk-ant-api03-...'}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnthropic(!showAnthropic)}
                      className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition"
                    >
                      {showAnthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <Button
                    onClick={() => handleSaveKey('anthropic')}
                    disabled={isSavingAnthropic || !anthropicInput}
                    variant="default"
                    size="sm"
                    className="gap-1.5"
                  >
                    {isSavingAnthropic ? (
                      <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    ) : anthropicStatus?.isConfigured ? (
                      <RefreshCw className="w-3.5 h-3.5" />
                    ) : (
                      <Key className="w-3.5 h-3.5" />
                    )}
                    {anthropicStatus?.isConfigured ? 'Rotate Key' : 'Save Key'}
                  </Button>

                  {anthropicStatus?.isConfigured && (
                    <Button
                      onClick={() => handleDeleteKey('anthropic')}
                      variant="destructive"
                      size="sm"
                      className="h-9 w-9 p-0"
                      title="Delete key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarLayout>
    </AuthGuard>
  );
}
