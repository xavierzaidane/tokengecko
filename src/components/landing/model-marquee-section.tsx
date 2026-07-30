'use client';

import React from 'react';
import { motion } from 'motion/react';

const MODEL_LOGOS = [
  { name: 'OpenAI', logo: '/OpenAI.png' },
  { name: 'Anthropic', logo: '/Anthropic.svg' },
  { name: 'Gemini', logo: '/GoogleGemini.svg' },
  { name: 'DeepSeek', logo: '/DeepSeek.png' },
  { name: 'Meta', logo: '/Meta.png' },
  { name: 'Mistral', logo: '/Mistral.png' },
  { name: 'Cohere', logo: '/Cohere.png' },
  { name: 'Qwen', logo: '/Qwen.png' },
  { name: 'Nvidia', logo: '/Nvidia.png' },
  // Duplicate set for seamless looping animation
  { name: 'OpenAI', logo: '/OpenAI.png' },
  { name: 'Anthropic', logo: '/Anthropic.svg' },
  { name: 'Gemini', logo: '/GoogleGemini.svg' },
  { name: 'DeepSeek', logo: '/DeepSeek.png' },
  { name: 'Meta', logo: '/Meta.png' },
  { name: 'Mistral', logo: '/Mistral.png' },
  { name: 'Cohere', logo: '/Cohere.png' },
  { name: 'Qwen', logo: '/Qwen.png' },
  { name: 'Nvidia', logo: '/Nvidia.png' },
];

export function ModelMarqueeSection() {
  return (
    <section id="models" className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20 relative z-10 overflow-hidden">
      <div className="text-sm font-normal tracking-widest text-white/40 text-center">
        Benchmarking 50+ models from industry-leading AI providers
      </div>

      {/* Marquee Ticker with Edge Gradient Fade */}
      <div className="mt-10 relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <motion.div
          className="flex items-center w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
            duration: 25,
          }}
        >
          {MODEL_LOGOS.map((item, i) => (
            <div
              key={`${item.name}-${i}`}
              className="flex flex-col items-center gap-2 text-white/50 hover:text-white cursor-default transition-colors shrink-0 pr-12 sm:pr-16"
            >
              <img src={item.logo} alt={item.name} className="w-10 h-10 object-contain opacity-70 hover:opacity-100 transition" />
              <span className="text-[11px] font-mono font-medium">{item.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
