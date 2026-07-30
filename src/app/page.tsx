'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero-section';
import { InspectorPreviewSection } from '@/components/landing/inspector-preview-section';
import { FeaturesTriageSection } from '@/components/landing/features-triage-section';
import { ModelMarqueeSection } from '@/components/landing/model-marquee-section';
import { FeatureMatrixSection } from '@/components/landing/feature-matrix-section';
import { WhoItsForSection } from '@/components/landing/who-its-for-section';
import { BuiltForTomorrowSection } from '@/components/landing/built-for-tomorrow-section';
import { PlaygroundCtaSection } from '@/components/landing/playground-cta-section';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-app text-white">
      {/* Fixed Container Edge Vertical Guide Lines */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+40rem)] w-px bg-white/10 z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+40rem)] w-px bg-white/10 z-[5]" />

      {/* Root Level SVG Noise Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </svg>

      {/* Modular Landing Page Sections */}
      <LandingNavbar />
      <HeroSection />
      <InspectorPreviewSection />
      <FeaturesTriageSection />
      <ModelMarqueeSection />
      <FeatureMatrixSection />
      <WhoItsForSection />
      <BuiltForTomorrowSection />
      <PlaygroundCtaSection />
      <LandingFooter />
    </div>
  );
}
