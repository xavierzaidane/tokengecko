import React from 'react';
import type { Metadata } from 'next';
import { LandingNavbar } from '@/components/landing/navbar';
import { LandingFooter } from '@/components/landing/landing-footer';
import { ChangelogTimeline } from '@/components/changelog/changelog-timeline';

export const metadata: Metadata = {
  title: 'Changelog – TokenGecko',
  description: 'Version history for the tokengecko npm package. Newest releases first.',
};

export default function ChangelogPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-app text-white flex flex-col font-sans">
      {/* Fixed Container Edge Vertical Guide Lines matching landing page */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+40rem)] w-px bg-white/10 z-50" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+40rem)] w-px bg-white/10 z-50" />

      {/* Root Level SVG Noise Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </svg>

      {/* Landing Navbar */}
      <header className="w-full bg-app/90 backdrop-blur sticky top-0 z-40">
        <LandingNavbar />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-12 md:py-20 z-10 mb-10">
        <ChangelogTimeline />
      </main>

      {/* Landing Footer */}
      <LandingFooter />
    </div>
  );
}
