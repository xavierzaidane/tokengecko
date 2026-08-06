'use client';

import React from 'react';
import { motion } from 'motion/react';

export function InspectorPreviewSection() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="w-full h-10 border-b border-white/10 relative z-10"
      />

      <section id="inspector" className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 relative z-10 -top-2">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e1014]/95 backdrop-blur-2xl shadow-2xl"
        >
          {/* macOS Title Bar Header */}
          <div className="h-10 border-b border-white/10 bg-sidebar px-4 flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-2 text-xs text-white/50">tokengecko / prompt-inspector.ts</span>
            </div>
          </div>

          {/* Dashboard Image below Header */}
          <img
            src="/dashboard.png"
            alt="TokenGecko Prompt Inspector Dashboard"
            className="w-full h-auto object-cover"
          />
        </motion.div>
      </section>

      {/* Border line in the space below */}
      <div className="w-full border-b border-white/10 relative z-10" />
    </>
  );
}
