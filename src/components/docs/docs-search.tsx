'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { flattenNav, DocsNavItem } from '@/lib/docs-nav';
import { Search, FileText, ArrowRight, CornerDownLeft } from 'lucide-react';

export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const items = flattenNav();

  // Listen for Cmd+K or Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (slug: string) => {
    setOpen(false);
    router.push(`/docs/${slug}`);
  };

  if (!open) return null;

  // Group items by sectionTitle
  const groupedItems = items.reduce<Record<string, DocsNavItem[]>>((acc, item) => {
    const section = item.sectionTitle || 'General';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Dark backdrop blur */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setOpen(false)}
      />

      {/* Command Palette Modal */}
      <div className="relative w-full max-w-2xl bg-card-dark border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        <Command label="Search documentation">
          {/* Input field */}
          <div className="flex items-center px-4 border-b border-zinc-800 bg-zinc-900/60">
            <Search className="w-4 h-4 text-zinc-400 shrink-0 mr-3" />
            <Command.Input
              autoFocus
              placeholder="Search documentation pages, guides, API..."
              className="w-full h-12 bg-transparent text-white placeholder-zinc-500 font-mono text-sm focus:outline-none"
            />
            <kbd className="hidden sm:inline-block text-[10px] font-mono text-zinc-500 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <Command.List className="max-h-96 overflow-y-auto p-2 space-y-4">
            <Command.Empty className="py-8 text-center text-zinc-500 font-mono text-xs">
              No doc pages found matching your search.
            </Command.Empty>

            {Object.entries(groupedItems).map(([sectionTitle, sectionItems]) => (
              <Command.Group
                key={sectionTitle}
                heading={
                  <div className="px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {sectionTitle}
                  </div>
                }
              >
                {sectionItems.map((item) => (
                  <Command.Item
                    key={item.slug}
                    value={`${item.title} ${item.description || ''} ${sectionTitle}`}
                    onSelect={() => handleSelect(item.slug)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg font-sans text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 data-[selected=true]:bg-zinc-800 data-[selected=true]:text-white cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-4 h-4 text-zinc-500 group-hover:text-accent-orange shrink-0" />
                      <div className="truncate">
                        <div className="font-mono text-xs font-semibold text-white truncate">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-zinc-400 truncate mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                      <span className="font-mono text-[10px] text-zinc-400">Open</span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-accent-orange" />
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>

          {/* Palette Footer Shortcuts */}
          <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between font-mono text-[11px] text-zinc-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="bg-zinc-900 border border-zinc-800 px-1 rounded text-zinc-400">↑</kbd>
                <kbd className="bg-zinc-900 border border-zinc-800 px-1 rounded text-zinc-400">↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-zinc-900 border border-zinc-800 px-1 rounded text-zinc-400">↵</kbd>
                <span>Open</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="bg-zinc-900 border border-zinc-800 px-1 rounded text-zinc-400">esc</kbd>
              <span>Close</span>
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
