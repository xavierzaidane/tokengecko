'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { useAuth } from '@/components/providers/auth-provider';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Zap, Share2 } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center items-center p-6 text-center bg-gradient-to-b from-[#0B0F17] via-[#0F172A]/50 to-[#0B0F17]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          JWT.io for LLM Prompts
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl">
          Analyze & Compare LLM Prompts{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Before Making API Calls
          </span>
        </h1>

        <p className="max-w-2xl text-slate-400 text-base sm:text-lg mb-10 leading-relaxed">
          Estimate token counts, calculate input/output pricing, monitor context window usage, and compare performance across GPT-5, Claude 3.5, Gemini 2.0, DeepSeek V3/R1, and open-weight models.
        </p>

        <div className="flex flex-wrap gap-4 justify-center items-center mb-16">
          {user ? (
            <Link
              href="/inspector"
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-xl shadow-emerald-500/20 flex items-center gap-2"
            >
              Open Inspector Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-xl shadow-emerald-500/20 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm transition"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          <div className="p-6 rounded-2xl bg-[#0F172A]/50 border border-slate-800/80 hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-mono text-white mb-2">Offline Local Tokenizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sub-300ms token counts powered by WASM tokenizers (`tiktoken` & HuggingFace encoders) without sending prompt text over live APIs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F172A]/50 border border-slate-800/80 hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-mono text-white mb-2">Side-by-Side LLM Compare</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simultaneously inspect input/output pricing, total estimated costs, and context utilization percentages across 15+ models.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F172A]/50 border border-slate-800/80 hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-mono text-white mb-2">Encrypted BYOK Vault</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optionally connect Gemini and Anthropic API keys for exact server-side token counting. Keys are encrypted at rest with AES-256-GCM.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
