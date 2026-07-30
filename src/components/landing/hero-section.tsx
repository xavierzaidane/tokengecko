'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ActionButton } from './shared-primitives';

export function HeroSection() {
  return (
    <section className="pt-16 md:pt-24 pb-16 text-center flex flex-col items-center relative z-10 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-[0.95]"
      >
        <span className="block text-white">Your LLM Prompts.</span>
        <span className="block animate-shiny mt-1">Optimized</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-8 text-white/70 max-w-xl text-base leading-[1.6] font-sans"
      >
        TokenGecko is the developer workbench to inspect, tokenize, benchmark, and optimize LLM prompt payloads across OpenAI, Anthropic, Gemini, and DeepSeek in real time.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <ActionButton label="Launch Inspector" href="/login" />
        <ActionButton label="Sign In" href="/login" primary={false} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-4 text-xs font-mono text-white/40"
      >
        Instant browser access · BYOK API key storage · Real-time tiktoken parsing
      </motion.p>
    </section>
  );
}
