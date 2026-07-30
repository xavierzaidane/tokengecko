'use client';

import React from 'react';
import { motion } from 'motion/react';

export function FeaturesTriageSection() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 relative z-10">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="mt-5 text-3xl md:text-5xl font-normal tracking-tight leading-[1.02] text-white">
            Inspect every prompt payload <br />
            before sending to production.
          </h2>
          <p className="mt-6 text-white/60 text-base leading-[1.6] max-w-md">
            TokenGecko analyzes token density, detects bloated instructions, benchmarks input/output costs across 50+ LLM models, and visualizes context window safety limits.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative overflow-hidden border border-white/10"
        >
          <img
            src="/landingasset1.png"
            alt="TokenGecko Prompt Health & Analytics Modules"
            className="w-full h-auto object-cover rounded-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
}
