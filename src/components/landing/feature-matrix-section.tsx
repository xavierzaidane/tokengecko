'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, MoreHorizontal, ChevronDown, Clock } from 'lucide-react';

export function FeatureMatrixSection() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="w-full border-b border-white/10 relative z-10"
      />

      <section className="max-w-[1343px] mx-auto px-4 md:px-8 relative z-10">
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="bg-app p-8 sm:p-12 mb-[-1px] rounded-t-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white">
            Talk to Your Prompts<span className="text-accent-orange font-bold">.</span>
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl text-sm leading-[1.6] font-sans">
            We bring <strong className="text-white font-medium">AI-native telemetry & prompt optimization</strong> to your LLM stacks — built for production teams, on purpose. A browser-based Monaco Prompt Inspector sits on every prompt payload, wired into live model pricing APIs, so developers and engineering leaders can just ask their stack and get a straight answer.
          </p>
        </motion.div>

        {/* 2x2 Bordered Feature Grid */}
        <div className="w-full border-t border-white/10 overflow-hidden divide-y divide-white/10">
          {/* Row 1: 01 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 min-h-[395px] md:min-h-[420px]"
          >
            {/* Left Content */}
            <div className="p-10 sm:p-12 md:p-16 flex flex-col justify-between space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                <span className="w-2.5 h-2.5 bg-accent-orange inline-block" />
                <span>01</span>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
                  &ldquo;More savings by uncovering hidden token bloat.&rdquo;
                </h3>
                <p className="mt-4 text-white/60 text-sm leading-[1.6] font-sans">
                  Pair the Inspector Console with your phone browser via TokenGecko&apos;s <code className="text-white/90 bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs">/remote-control</code>. Same shell, same context window telemetry, any device.
                </p>
              </div>
            </div>

            {/* Right Mockup */}
            <div className="p-6 sm:p-10 bg-white/[0.02] flex items-center justify-center relative overflow-hidden min-h-[380px] md:min-h-[420px]">
              <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-full max-w-md bg-card-dark text-white border border-white/10 p-6 shadow-2xl space-y-5 relative font-sans rounded-xl"
              >
                {/* Header Badge & Action Icons */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <span className="inline-block bg-white/10 border border-white/15 text-white/80 font-mono text-[11px] px-2.5 py-1 rounded-md font-medium">
                      openresty:1.25-alpine
                    </span>
                    <div className="text-base font-semibold text-white tracking-tight">openresty</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="p-1.5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-1.5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CPU, RAM, I/O Progress Bars */}
                <div className="grid grid-cols-3 gap-3 items-center pt-1 text-xs">
                  {/* CPU */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-white/70 tracking-wider">CPU</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '9%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-accent-orange rounded-full"
                        />
                      </div>
                      <span className="text-[11px] text-white/50 font-mono">9%</span>
                    </div>
                  </div>
                  {/* RAM */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-white/70 tracking-wider">RAM</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '24%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-accent-orange rounded-full"
                        />
                      </div>
                      <span className="text-[11px] text-white/50 font-mono">24%</span>
                    </div>
                  </div>
                  {/* I/O */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-white/70 tracking-wider">I/O</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '12%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.4 }}
                          className="h-full bg-accent-orange rounded-full"
                        />
                      </div>
                      <span className="text-[11px] text-white/50 font-mono">12%</span>
                    </div>
                  </div>
                </div>

                {/* Current Version Dropdown Select */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-semibold text-white/80">Current Version</div>
                  <div className="w-full bg-white/5 border border-white/10 px-3.5 py-2.5 flex items-center justify-between text-xs font-mono text-white/90 cursor-pointer hover:bg-white/10 transition rounded">
                    <span>1.25-alpine</span>
                    <ChevronDown className="w-4 h-4 text-white/50" />
                  </div>
                </div>

                {/* Ports & Footer */}
                <div className="pt-2 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-white/80">Ports</div>
                    <div className="text-xs text-white/40 font-mono mt-0.5">no port</div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-white/80 font-medium">
                      <Clock className="w-3.5 h-3.5 text-white/60" />
                      <span>Created</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80 font-medium">
                      <span className="w-2.5 h-2.5 bg-accent-orange rounded-sm inline-block" />
                      <span>Uptime</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/50 font-mono">
                    <span>5d ago</span>
                    <span>Up 5 days</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Row 2: 02 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 min-h-[420px] md:min-h-[480px]"
          >
            {/* Left Mockup */}
            <div className="p-6 sm:p-10 bg-white/[0.02] flex items-center justify-center order-2 md:order-1 min-h-[380px] md:min-h-[420px]">
              <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-full max-w-md bg-card-dark text-white border border-white/10 p-6 shadow-2xl space-y-6 relative font-sans rounded-xl"
              >
                {/* Header Badge & Pill Switcher */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/90 font-mono text-xs px-2.5 py-1 font-medium rounded">
                    <span className="w-2 h-2 rounded-sm bg-accent-orange inline-block" />
                    <span>You</span>
                  </span>
                  <div className="flex items-center bg-white/5 border border-white/10 p-0.5 text-xs font-mono rounded">
                    <span className="bg-accent-orange text-black font-normal px-3 py-1 text-[11px] shadow rounded-sm">TODAY</span>
                    <span className="text-white/50 px-3 py-1 text-[11px]">YESTERDAY</span>
                  </div>
                </div>

                {/* Logo & Title Info */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-accent-orange/20 flex items-center justify-center rounded-lg">
                    <img src="/OpenAI.png" alt="OpenAI" className="w-5 h-5 object-contain" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-white tracking-tight">Codex</span>
                      <span className="text-xs font-mono text-white/40">v2.1.141</span>
                    </div>
                    <div className="text-xs font-mono text-white/40 mt-0.5">
                      Luna 5.5 (1M context) · Gpt Pro
                    </div>
                  </div>
                </div>

                {/* Graph Area */}
                <div className="relative pt-2">
                  <div className="flex justify-between items-end h-36 relative">
                    {/* Y Axis Labels */}
                    <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-mono text-white/30 pointer-events-none">
                      <span>€2.4k</span>
                      <span>€1.8k</span>
                      <span>€1.2k</span>
                      <span>€0.6k</span>
                      <span>€0</span>
                    </div>

                    {/* SVG Curves */}
                    <div className="w-full h-full pl-9 pr-2 pb-5">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 320 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#ff6b00" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <motion.path
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 }}
                          d="M 0 90 Q 120 80, 220 30 T 310 10 L 310 95 L 0 95 Z"
                          fill="url(#orangeGradient)"
                        />
                        <path
                          d="M 0 90 Q 120 82, 220 50 T 310 30"
                          fill="none"
                          stroke="rgba(255,255,255,0.25)"
                          strokeWidth="2"
                          strokeDasharray="3 3"
                        />
                        <motion.path
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          d="M 0 90 Q 120 80, 220 30 T 310 10"
                          fill="none"
                          stroke="#ff6b00"
                          strokeWidth="2.5"
                        />
                        <motion.circle
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 1, duration: 0.3 }}
                          cx="310"
                          cy="10"
                          r="4.5"
                          fill="#0d0d0d"
                          stroke="#ff6b00"
                          strokeWidth="2.5"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* X Axis Timestamps */}
                  <div className="flex justify-between text-[10px] text-white/40 font-mono pl-9 pr-2">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>24:00</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Content */}
            <div className="p-10 sm:p-16 md:p-20 flex flex-col justify-between space-y-6 order-1 md:order-2">
              <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                <span className="w-2.5 h-2.5 bg-accent-orange inline-block" />
                <span>02</span>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
                  More savings by uncovering hidden token bloat.
                </h3>
                <p className="mt-4 text-white/60 text-sm leading-[1.6] font-sans">
                  For prompt architects — your next API bill reduction is usually hiding in system instructions you already have. Ask in plain English and get the cost, latency, and model answers, and the routing move that turns bloated prompts into 80% savings. No manual Tiktoken scripting, no admin tabs.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Row 3: 03 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 min-h-[420px] md:min-h-[480px]"
          >
            {/* Left Content */}
            <div className="p-10 sm:p-16 md:p-20 flex flex-col justify-between space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                <span className="w-2.5 h-2.5 bg-accent-orange inline-block" />
                <span>03</span>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
                  Triage across models, metrics, and security.
                </h3>
                <p className="mt-4 text-white/60 text-sm leading-[1.6] font-sans">
                  For developers — triage across prompt logs, context metrics, and API security signals at once, grounded in live provider data instead of guesswork. Find the real token bottleneck and resolve payload issues 10x faster.
                </p>
              </div>
            </div>

            {/* Right Mockup */}
            <div className="p-6 sm:p-10 bg-white/[0.02] flex items-center justify-center min-h-[380px] md:min-h-[420px]">
              <div className="w-full max-w-md grid grid-cols-2 gap-3.5 font-sans">
                {/* Gauge Card 1: CIS Score */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-card-dark border border-white/10 p-4 shadow-2xl flex flex-col justify-between space-y-4 rounded-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">CIS Score</div>
                      <div className="text-[10px] font-mono text-white/40 mt-0.5">Wazuh SCA · Ubuntu 24.04</div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono px-1.5 py-0.5 rounded">
                      Strong
                    </span>
                  </div>

                  {/* Arc Gauge */}
                  <div className="relative flex flex-col items-center justify-center pt-2">
                    <svg className="w-28 h-16 overflow-visible" viewBox="0 0 100 55">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
                      <motion.path
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 0.97 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute top-8 text-center">
                      <div className="text-xl font-normal text-white leading-none">97</div>
                      <div className="text-[9px] text-white/50 mt-0.5">Passed</div>
                    </div>
                  </div>

                  {/* Bottom Stats */}
                  <div className="grid grid-cols-3 gap-1 text-center border-t border-white/10 pt-3 text-[10px] font-mono">
                    <div>
                      <div className="text-emerald-400 font-bold text-xs">172</div>
                      <div className="text-white/40 text-[9px]">Passed</div>
                    </div>
                    <div className="border-x border-white/10">
                      <div className="text-rose-400 font-bold text-xs">5</div>
                      <div className="text-white/40 text-[9px]">Failed</div>
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs">184</div>
                      <div className="text-white/40 text-[9px]">Checks</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-white/40 border-t border-white/5 pt-2">
                    <span>Last checked</span>
                    <span>3H AGO</span>
                  </div>
                </motion.div>

                {/* Gauge Card 2: OS Patches */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-card-dark border border-white/10 p-4 shadow-2xl flex flex-col justify-between space-y-4 rounded-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">OS patches</div>
                      <div className="text-[10px] font-mono text-white/40 mt-0.5">APT package status</div>
                    </div>
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono px-1.5 py-0.5 rounded">
                      Warning
                    </span>
                  </div>

                  {/* Arc Gauge */}
                  <div className="relative flex flex-col items-center justify-center pt-2">
                    <svg className="w-28 h-16 overflow-visible" viewBox="0 0 100 55">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
                      <motion.path
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 0.45 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#ff6b00"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute top-9 text-center">
                      <div className="text-xl font-normal text-accent-orange leading-none">39</div>
                      <div className="text-[9px] text-white/50 mt-0.5">Pending</div>
                    </div>
                  </div>

                  {/* Bottom Stats */}
                  <div className="grid grid-cols-3 gap-1 text-center border-t border-white/10 pt-3 text-[10px] font-mono">
                    <div>
                      <div className="text-white font-bold text-xs">2</div>
                      <div className="text-white/40 text-[9px]">Security</div>
                    </div>
                    <div className="border-x border-white/10">
                      <div className="text-white font-bold text-xs">31</div>
                      <div className="text-white/40 text-[9px]">Other</div>
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs">45s ago</div>
                      <div className="text-white/40 text-[9px]">Last</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-white/40 border-t border-white/5 pt-2">
                    <span>Last upgrade</span>
                    <span>JUN 3, 026</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Row 4: 04 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 min-h-[420px] md:min-h-[480px]"
          >
            {/* Left Mockup */}
            <div className="p-6 sm:p-10 bg-white/[0.02] flex items-center justify-center order-2 md:order-1 min-h-[380px] md:min-h-[420px]">
              <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-full max-w-md bg-card-dark text-white border border-white/10 p-6 shadow-2xl space-y-4 font-mono text-xs rounded-xl"
              >
                {/* Row 1: CPU & RAM */}
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-white/10">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="bg-white/10 text-white/90 px-2 py-0.5 rounded text-[10px] font-bold">CPU</span>
                      <span className="text-white/60 text-[11px]">4 Cores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '39%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-accent-orange rounded-full"
                        />
                      </div>
                      <span className="text-white font-bold text-[11px]">39%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="bg-white/10 text-white/90 px-2 py-0.5 rounded text-[10px] font-bold">RAM</span>
                      <span className="text-white/60 text-[11px]">15.2 GB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '45%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-accent-orange rounded-full"
                        />
                      </div>
                      <span className="text-white font-bold text-[11px]">45%</span>
                    </div>
                  </div>
                </div>

                {/* Row 2: DRIVE & Disk I/O */}
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-white/10">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="bg-white/10 text-white/90 px-2 py-0.5 rounded text-[10px] font-bold">DRIVE</span>
                      <span className="text-white/60 text-[11px]">150 GB</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/40">Used</span>
                      <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden mx-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '38%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.4 }}
                          className="h-full bg-accent-orange rounded-full"
                        />
                      </div>
                      <span className="text-white font-bold">57 GB</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="bg-white/10 text-white/90 px-2 py-0.5 rounded text-[10px] font-bold">Disk I/O</span>
                    </div>
                    <div className="text-[11px] text-white/70 space-x-1.5 pt-0.5">
                      <span>Read: <strong className="text-white">2.50 MB/s</strong></span>
                      <span>Write: <strong className="text-white">1.00 MB/s</strong></span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Network & Latency */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="bg-white/10 text-white/90 px-2 py-0.5 rounded text-[10px] font-bold">Network</span>
                    </div>
                    <div className="text-[11px] text-white/70 space-x-1.5">
                      <span>In: <strong className="text-white">512 KB/s</strong></span>
                      <span>Out: <strong className="text-white">256 KB/s</strong></span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="bg-white/10 text-white/90 px-2 py-0.5 rounded text-[10px] font-bold">Latency</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <strong className="text-white text-xs">42ms</strong>
                      <span className="text-white/40 text-[10px]">Peak: 118ms</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Content */}
            <div className="p-10 sm:p-16 md:p-20 flex flex-col justify-between space-y-6 order-1 md:order-2">
              <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                <span className="w-2.5 h-2.5 bg-accent-orange inline-block" />
                <span>04</span>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
                  Multi session, collaborate in real-time.
                </h3>
                <p className="mt-4 text-white/60 text-sm leading-[1.6] font-sans">
                  For engineering organizations — prompt architects, developers, and remote teams collaborate from the same AI-accessible endpoints. One dashboard, one shared vision, every prompt optimization change on the record.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full-Width Section 10 Bottom Divider */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full border-b border-white/10 relative z-10"
      />
    </>
  );
}
