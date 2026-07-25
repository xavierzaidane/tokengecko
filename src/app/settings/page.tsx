'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Navbar } from '@/components/layout/navbar';
import { useAuth } from '@/components/providers/auth-provider';
import { UserKeyStatus, getUserApiKeys, saveUserApiKey, deleteUserApiKey } from '@/lib/insforge/keys';
import { Key, ShieldCheck, Lock, Trash2, RefreshCw, Check, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  const [keys, setKeys] = useState<UserKeyStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
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
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
                <ShieldCheck className="w-3 h-3" />
                BYOK Encrypted Storage
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-mono text-white tracking-tight">
                API Keys & Provider Settings
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Bring Your Own Keys for Google Gemini and Anthropic to enable exact countTokens API calculations.
              </p>
            </div>
          </div>

          {/* Encryption & Security Infobox */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono space-y-1">
              <h3 className="font-bold text-white">AES-256-GCM Server-Side Encryption</h3>
              <p className="text-slate-400 leading-relaxed font-sans text-xs">
                Your API keys are encrypted at rest using AES-256-GCM before storage. Plaintext keys are never returned to the browser client or logged after save. Keys are used strictly for provider token counting calls.
              </p>
            </div>
          </div>

          {feedbackMsg && (
            <div
              className={`p-4 rounded-xl font-mono text-xs flex items-center gap-2 border ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {feedbackMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {feedbackMsg.text}
            </div>
          )}

          {/* Key Management Form Grid */}
          <div className="space-y-6">
            {/* 1. Google Gemini Key Card */}
            <div className="p-6 rounded-2xl bg-[#0F172A]/70 border border-slate-800 backdrop-blur-md space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-mono font-bold text-sm">
                    G
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-white">Google Gemini API Key</h3>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Enables exact Gemini `countTokens()` API calculation
                    </p>
                  </div>
                </div>

                {geminiStatus?.isConfigured ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Configured ({geminiStatus.maskedKey})
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-500 font-mono text-xs">
                    Not Configured
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-mono text-slate-400">
                  {geminiStatus?.isConfigured ? 'Rotate Gemini API Key' : 'Enter Gemini API Key (AIzaSy...)'}
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showGemini ? 'text' : 'password'}
                      value={geminiInput}
                      onChange={(e) => setGeminiInput(e.target.value)}
                      placeholder={geminiStatus?.isConfigured ? 'Paste new key to rotate...' : 'AIzaSy...'}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-700 text-slate-100 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGemini(!showGemini)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={() => handleSaveKey('gemini')}
                    disabled={isSavingGemini || !geminiInput}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold font-mono text-xs transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    {isSavingGemini ? (
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : geminiStatus?.isConfigured ? (
                      <RefreshCw className="w-3.5 h-3.5" />
                    ) : (
                      <Key className="w-3.5 h-3.5" />
                    )}
                    {geminiStatus?.isConfigured ? 'Rotate Key' : 'Save Key'}
                  </button>

                  {geminiStatus?.isConfigured && (
                    <button
                      onClick={() => handleDeleteKey('gemini')}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition"
                      title="Delete key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Anthropic Key Card */}
            <div className="p-6 rounded-2xl bg-[#0F172A]/70 border border-slate-800 backdrop-blur-md space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-mono font-bold text-sm">
                    A
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-white">Anthropic API Key</h3>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Enables exact Claude `messages/count_tokens` API calculation
                    </p>
                  </div>
                </div>

                {anthropicStatus?.isConfigured ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Configured ({anthropicStatus.maskedKey})
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-500 font-mono text-xs">
                    Not Configured
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-mono text-slate-400">
                  {anthropicStatus?.isConfigured ? 'Rotate Anthropic API Key' : 'Enter Anthropic API Key (sk-ant-...)'}
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showAnthropic ? 'text' : 'password'}
                      value={anthropicInput}
                      onChange={(e) => setAnthropicInput(e.target.value)}
                      placeholder={anthropicStatus?.isConfigured ? 'Paste new key to rotate...' : 'sk-ant-api03-...'}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-700 text-slate-100 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnthropic(!showAnthropic)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showAnthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={() => handleSaveKey('anthropic')}
                    disabled={isSavingAnthropic || !anthropicInput}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold font-mono text-xs transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    {isSavingAnthropic ? (
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : anthropicStatus?.isConfigured ? (
                      <RefreshCw className="w-3.5 h-3.5" />
                    ) : (
                      <Key className="w-3.5 h-3.5" />
                    )}
                    {anthropicStatus?.isConfigured ? 'Rotate Key' : 'Save Key'}
                  </button>

                  {anthropicStatus?.isConfigured && (
                    <button
                      onClick={() => handleDeleteKey('anthropic')}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition"
                      title="Delete key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
