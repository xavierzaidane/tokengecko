'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

export function PlaygroundCtaSection() {
  return (
    <>
      {/* Top Pricing / Access Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center relative top-20 z-10 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-3xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-white">
            Start for free with BYOK
          </h2>

          <p className="text-white/60 text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            Per developer workbench. Free tier available, no credit card required. Bring your own keys for OpenAI, Anthropic, Gemini, DeepSeek, and more with zero vendor lock-in.
          </p>

          <div>
            <Link
              href="#pricing"
              className="inline-block bg-card-dark hover:bg-white/10 text-white font-normal text-sm font-bold tracking-wider  px-6 py-3 border border-white/20 transition-all active:scale-95 shadow-lg"
            >
              See Pricing
            </Link>
          </div>
        </motion.div>
      </section>


      {/* Playground Feature Block */}
      <section className="max-w-[1343px] mx-auto px-4 md:px-8 py-16 md:py-24 relative top-12 z-10">
        <div className="w-full  grid md:grid-cols-2 overflow-hidden bg-app relative">
          {/* Grid Corner Cross Markers (+) */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 text-white/30 font-mono text-[11px] pointer-events-none">+</div>
          <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 text-white/30 font-mono text-[11px] pointer-events-none">+</div>

          {/* Left Column: Copy & CTA */}
          <div className="p-10 sm:p-14 md:p-16 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.05]">
                The Perfect Agentic &ldquo;Playground&rdquo; for Prompt Architects<span className="text-accent-orange font-bold">.</span>
              </h3>

              <p className="text-white/60 text-sm sm:text-base leading-relaxed font-sans max-w-lg">
                Bring your own cloud key and provider subscriptions. We ship the containerized prompt inspector platform — you keep the keys, the data, and full context window control.
              </p>
            </div>

            <div>
              <Link
                href="/login"
                className="inline-block bg-accent-orange hover:bg-accent-orange/90 text-black font-normal text-sm font-bold tracking-wider  px-6 py-3.5  transition-all active:scale-95 shadow-lg shadow-accent-orange/20"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          {/* Right Column: Dashboard Laptop Overflow Mockup */}
          <div className="pt-8 sm:pt-12 pl-6 sm:pl-10 pb-0 pr-0 flex items-end justify-start relative overflow-hidden  min-h-[360px] md:min-h-[440px]">
            <div className="relative w-[115%] max-w-none translate-x-3 translate-y-3 rounded-tl-[24px] overflow-hidden border-t border-l border-white/20 shadow-2xl bg-card-dark">
              {/* Window Header */}
              <div className="h-8 bg-sidebar border-b border-white/10 px-4 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-[11px] font-mono text-white/40">TokenGecko Inspector Workbench</span>
              </div>
              <img
                src="/dashboard.png"
                alt="TokenGecko Prompt Inspector Dashboard"
                className="w-full h-auto object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>


    </>
  );
}
