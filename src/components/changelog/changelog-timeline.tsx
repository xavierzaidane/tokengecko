'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export interface ChangelogRelease {
  version: string;
  isLatest?: boolean;
  date: string;
  title: string;
  changes: string[];
}

export const defaultReleases: ChangelogRelease[] = [
  {
    version: 'v0.4.0',
    isLatest: true,
    date: 'Aug 6, 2026',
    title: 'InsForge BaaS Platform & Interactive UI Micro-Animations',
    changes: [
      'Full integration with InsForge BaaS (Postgres DB, Edge Functions, Realtime & Auth)',
      'Deployed live production frontend to InsForge hosting (4p7bs82r.insforge.site)',
      'Added smooth Framer Motion (motion/react) scroll-triggered entry & hover animations on feature matrix grids',
      'Refactored full landing page modular architecture (Feature Matrix, Who It\'s For, Triage, Playground CTA, and Technical Grid Footer)',
      'Enhanced responsive Laptop Dashboard mockup with 160% desktop overflow framing and macOS traffic light window header',
    ],
  },
  {
    version: 'v0.3.0',
    date: 'Jul 30, 2026',
    title: 'Monaco Prompt Inspector & Remote Control Shell',
    changes: [
      'Embedded browser-based Monaco Code Editor with real-time prompt syntax highlighting and JSON payload validation',
      'Launched /remote-control session pairing to inspect context window telemetry from mobile devices',
      'Added Tiktoken token bloat scanner with automated system prompt optimization recommendations yielding up to 80% cost savings',
      'Integrated live provider routing engine comparing OpenAI GPT-4o, Claude 3.5 Sonnet, and DeepSeek V3 pricing per 1M tokens',
    ],
  },
  {
    version: 'v0.2.0',
    date: 'Jul 20, 2026',
    title: 'AI Telemetry Engine & Model Registry API',
    changes: [
      'Built /api/models/openrouter dynamic pricing endpoint with 1-hour caching and ISR revalidation',
      'Integrated Wazuh SCA security compliance checks and CIS score gauge visualizers for prompt API endpoints',
      'Added request history inspector with prompt payload diff comparisons and shareable snapshot links (/share/[shareToken])',
      'Added real-time latency distribution curves, CPU/RAM resource gauges, and token throughput charts',
    ],
  },
  {
    version: 'v0.1.0',
    date: 'Jul 10, 2026',
    title: 'Initial TokenGecko Release',
    changes: [
      'First public launch of TokenGecko prompt telemetry & cost optimization platform',
      'Support for client-side BYOK (Bring Your Own Key) security for OpenAI, Anthropic, and OpenRouter APIs',
      'Built dark-themed developer workspace UI with blueprint grid borders and accent-orange brand visual identity',
      'Interactive BPE tokenizer previewer with system instruction and user payload token isolation',
    ],
  },
];

interface ChangelogTimelineProps {
  releases?: ChangelogRelease[];
  className?: string;
}

export function ChangelogTimeline({
  releases = defaultReleases,
  className,
}: ChangelogTimelineProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  return (
    <div className={cn('w-full max-w-3xl mx-auto', className)}>
      {/* Header section based on design */}
      <div className="mb-10 text-left">
        <p className="text-xs text-zinc-400 font-sans mb-3">Changelog</p>
        <h1 className="text-3xl sm:text-4xl md:text-4xl font-normal tracking-tight text-white mb-4">
          What shipped in tokengecko
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-zinc-400 font-sans">
          <p>
            Version history for the{' '}
            <code className="font-mono text-zinc-100 font-medium underline underline-offset-4 decoration-zinc-500">
              tokengecko
            </code>{' '}
            npm package. Newest releases first.
          </p>
        </div>
      </div>

      {/* Timeline container */}
      <div className="relative pl-10">
        {/* Continuous vertical timeline line - centered at 16px (left-4) */}
        <div className="absolute left-4 top-3 bottom-6 w-[2px] -translate-x-1/2 bg-zinc-800" />

        <Accordion
          type="multiple"
          value={openItems}
          onValueChange={setOpenItems}
          className="space-y-6"
        >
          {releases.map((release) => (
            <AccordionItem
              key={release.version}
              value={release.version}
              className="relative border-none"
            >
              {/* Timeline Node Bullet - centered at 16px (-left-[24px] relative to 40px container padding) */}
              <div className="absolute -left-[24px] top-3.5 z-10 -translate-x-1/2">
                <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-zinc-100 ring-4 ring-[#141414]" />
              </div>

              {/* Accordion Trigger / Release Card Header */}
              <AccordionTrigger className="group py-2 px-3 ">
                <div className="flex items-center gap-2.5 font-sans">
                  <span className=" font-normal text-sm md:text-sm text-white tracking-tight">
                    {release.version}
                  </span>
                  {release.isLatest && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-zinc-800 text-white tracking-wider uppercase">
                      LATEST
                    </span>
                  )}
                  <span className="text-xs text-zinc-400 font-sans ml-1">
                    {release.date}
                  </span>
                </div>

                <div className="mt-1 text-sm md:text-sm font-normal text-zinc-200 group-hover:text-white transition-colors">
                  {release.title}
                </div>
              </AccordionTrigger>

              {/* Release details list */}
              <AccordionContent className="pt-2 pb-4 pl-3 pr-2">
                <ul className="space-y-2 text-sm text-zinc-400 font-sans leading-relaxed">
                  {release.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-300 mt-2 shrink-0" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
