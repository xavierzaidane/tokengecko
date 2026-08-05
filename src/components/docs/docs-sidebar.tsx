'use client';

import React from 'react';
import Link from 'next/link';
import { docsNav, DocsNavSection } from '@/lib/docs-nav';
import { SidebarLight, type NavItem } from '@/components/ui/sidebar-light';
import { X, BookOpen, Terminal } from 'lucide-react';

interface DocsSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function DocsSidebar({ mobileOpen = false, onCloseMobile }: DocsSidebarProps) {
  // Convert docsNav into NavItem[] format for SidebarLight
  const sidebarItems: NavItem[] = docsNav.map((section: DocsNavSection) => ({
    title: section.title,
    href: '#',
    items: section.items.map((item) => ({
      title: item.title,
      href: `/docs/${item.slug}`,
    })),
  }));

  return (
    <>
      {/* Desktop Fixed Left Sidebar Rail */}
      <aside className="hidden md:block w-64 shrink-0 sticky top-24 self-start p-4 overflow-y-auto max-h-[calc(100vh-7rem)]">
        <SidebarLight items={sidebarItems} />
      </aside>

      {/* Mobile Drawer / Overlay Sheet */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Container */}
          <div className="relative w-72 max-w-[80vw] bg-sidebar border-r border-zinc-800 h-full p-5 overflow-y-auto flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent-orange" />
                  <span className="font-normal text-xs font-bold text-white tracking-wider">
                    Documentation
                  </span>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <SidebarLight items={sidebarItems} onItemClick={onCloseMobile} />
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-800">
              <Link
                href="/inspector"
                onClick={onCloseMobile}
                className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-normal text-xs font-bold rounded transition"
              >
                <Terminal className="w-4 h-4 text-accent-orange" />
                <span>Launch Inspector</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
