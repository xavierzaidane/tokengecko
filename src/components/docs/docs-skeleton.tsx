import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function DocsSkeleton() {
  return (
    <div className="flex gap-8 items-start w-full">
      {/* Primary Article Skeleton Container */}
      <article className="flex-1 min-w-0 max-w-4xl">
        {/* Breadcrumb Trail Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-3.5 w-12 bg-zinc-800/80" />
          <span className="text-zinc-700 font-mono text-xs">/</span>
          <Skeleton className="h-3.5 w-16 bg-zinc-800/80" />
          <span className="text-zinc-700 font-mono text-xs">/</span>
          <Skeleton className="h-3.5 w-24 bg-accent-orange/20" />
        </div>

        {/* Page Header Skeleton */}
        <header className="mb-8 pb-6 border-b border-zinc-800/80 space-y-3">
          <Skeleton className="h-9 w-3/4 sm:w-1/2 bg-zinc-800/90" />
          <Skeleton className="h-5 w-full max-w-xl bg-zinc-800/60" />
          <Skeleton className="h-5 w-2/3 max-w-md bg-zinc-800/60" />
        </header>

        {/* Page Content Body Skeleton */}
        <div className="space-y-8">
          {/* Paragraph 1 */}
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full bg-zinc-800/50" />
            <Skeleton className="h-4 w-[94%] bg-zinc-800/50" />
            <Skeleton className="h-4 w-[98%] bg-zinc-800/50" />
            <Skeleton className="h-4 w-[85%] bg-zinc-800/50" />
          </div>

          {/* Simulated Code Block / Tabs Box */}
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16 bg-zinc-800/80" />
                <Skeleton className="h-4 w-16 bg-zinc-800/40" />
              </div>
              <Skeleton className="h-4 w-12 bg-zinc-800/50" />
            </div>
            <Skeleton className="h-4 w-[65%] bg-zinc-800/70" />
            <Skeleton className="h-4 w-[80%] bg-zinc-800/70" />
            <Skeleton className="h-4 w-[45%] bg-zinc-800/70" />
          </div>

          {/* Subheading H2 Skeleton */}
          <div className="pt-2">
            <Skeleton className="h-7 w-48 bg-zinc-800/80 mb-4" />
            <div className="space-y-2.5">
              <Skeleton className="h-4 w-full bg-zinc-800/50" />
              <Skeleton className="h-4 w-[91%] bg-zinc-800/50" />
              <Skeleton className="h-4 w-[96%] bg-zinc-800/50" />
            </div>
          </div>

          {/* 2-Column Cards Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg border border-zinc-800/80 bg-zinc-900/40 space-y-2.5">
              <Skeleton className="h-5 w-32 bg-zinc-800/80" />
              <Skeleton className="h-3.5 w-full bg-zinc-800/40" />
              <Skeleton className="h-3.5 w-4/5 bg-zinc-800/40" />
            </div>
            <div className="p-4 rounded-lg border border-zinc-800/80 bg-zinc-900/40 space-y-2.5">
              <Skeleton className="h-5 w-28 bg-zinc-800/80" />
              <Skeleton className="h-3.5 w-full bg-zinc-800/40" />
              <Skeleton className="h-3.5 w-3/4 bg-zinc-800/40" />
            </div>
          </div>
        </div>

        {/* Prev / Next Bottom Navigation Skeleton */}
        <nav className="mt-14 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <Skeleton className="h-16 flex-1 rounded-lg bg-zinc-800/40 border border-zinc-800/80" />
          <Skeleton className="h-16 flex-1 rounded-lg bg-zinc-800/40 border border-zinc-800/80" />
        </nav>
      </article>

      {/* Right Column: Table of Contents Skeleton (Desktop) */}
      <div className="hidden xl:block w-56 shrink-0 sticky top-24 space-y-3">
        <Skeleton className="h-4 w-28 bg-zinc-800/80 mb-4" />
        <Skeleton className="h-3.5 w-36 bg-zinc-800/50" />
        <Skeleton className="h-3.5 w-44 bg-zinc-800/40 ml-2" />
        <Skeleton className="h-3.5 w-40 bg-zinc-800/40 ml-2" />
        <Skeleton className="h-3.5 w-32 bg-zinc-800/50" />
        <Skeleton className="h-3.5 w-48 bg-zinc-800/40 ml-2" />
      </div>
    </div>
  );
}
