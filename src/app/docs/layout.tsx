'use client';

import React, { useState } from 'react';
import { LandingNavbar } from '@/components/landing/navbar';
import { LandingFooter } from '@/components/landing/landing-footer';
import { DocsSidebar } from '@/components/docs/docs-sidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-app text-white font-sans antialiased flex flex-col justify-between">
      {/* Fixed Container Edge Vertical Guide Lines matching Landing */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+40rem)] w-px bg-white/10 z-10" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+40rem)] w-px bg-white/10 z-10" />

      <div>
        {/* Top Landing Navbar */}
        <header className="bg-app/90 ">
          <LandingNavbar />
        </header>

        {/* Main Container with Sidebar + Content */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10 px-4 md:px-8 items-start">
          {/* Sidebar */}
          <DocsSidebar
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          {/* Content Area */}
          <main className="flex-1 min-w-0 py-6 md:py-8 lg:py-10 px-4 md:px-8 w-full">
            {children}
          </main>
        </div>
      </div>

      {/* Footer from Landing */}
      <div className="mt-16 relative z-10">
        <LandingFooter />
      </div>
    </div>
  );
}
