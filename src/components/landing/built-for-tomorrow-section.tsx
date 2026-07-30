'use client';

import { motion } from 'motion/react';
import React from 'react';

export function BuiltForTomorrowSection() {
  return (
    <>
    <section className="max-w-[1343px] mx-auto px-4 md:px-8 relative z-10">
      {/* Header Block */}
      <div className="bg-app p-8 sm:p-12 mb-8">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white">
          Built for<br />Tomorrow&apos;s Standard<span className="text-accent-orange font-bold">.</span>
        </h2>
        <p className="mt-4 text-white/60 max-w-2xl text-sm leading-[1.6] font-sans">
          AI is worth an order of magnitude more in operations than on the storefront. The agentic work — running, supporting, and continually improving LLM pipelines — is where it compounds, and it&apos;s what we built for.
        </p>
      </div>

      {/* 2-Column Split Section */}
      <div className="w-full border-t  border-white/10 grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 overflow-hidden min-h-[380px]">
        {/* Left Feature Column */}
        <div className="p-10 sm:p-14 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-white/50">
              <span className="w-2.5 h-2.5 bg-accent-orange inline-block" />
              <span>01</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
              Agentic Operations, Not Storefront Bots
            </h3>
            <p className="mt-4 text-white/60 text-sm leading-[1.6] font-sans">
              Developers don&apos;t want a bot between them and the product — AI&apos;s real return is in running telemetry operations at scale. That conviction is the whole reason TokenGecko exists.
            </p>
          </div>
          <div>
            <a href="#inspector" className="text-xs font-mono text-accent-orange hover:underline inline-flex items-center gap-1.5 font-semibold group">
              <span>Our vision in AI</span>
              <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
            </a>
          </div>
        </div>

        {/* Right Graphic Column */}
        <div className="p-8 sm:p-12 bg-card-dark flex items-center justify-center relative overflow-hidden min-h-[320px]">
          {/* Subtle Technical Blueprint Grid */}
          <div
            className="absolute inset-0 opacity-[0.25] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Architectural Blueprint Guidelines (Circles & Diagonal Lines) */}
          <svg className="absolute inset-0 w-full h-full text-white/20 pointer-events-none" viewBox="0 0 400 300" fill="none">
            <line x1="0" y1="0" x2="400" y2="300" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="400" y1="0" x2="0" y2="300" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="0" y1="150" x2="400" y2="150" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="200" y1="0" x2="200" y2="300" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx="200" cy="150" r="85" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="200" cy="150" r="125" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
          </svg>

          {/* Centered Brand Logo (Image Logo Mark + Text Logo) */}
          <div className="relative z-10 flex items-center gap-3 sm:gap-4 px-6 py-4">
            <img
              src="/imagelogo.png"
              alt="TokenGecko Mark"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
            <img
              src="/textlogo.png"
              alt="TokenGecko Logotype"
              className="h-7 sm:h-9 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
      {/* Full-Width Section 10 Bottom Divider */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="w-full border-b border-white/10 relative z-10"
      />
    </>
  );
}
