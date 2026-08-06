'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Menu, Search, GitCompare, History, KeyRound, Settings } from 'lucide-react';
import { ActionButton } from './shared-primitives';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';

const featureItems = [
  {
    title: 'The Inspector',
    href: '/docs/inspector',
    description: 'Deep dive into prompt payload inspection, token breakdown, and visualizer tools.',
    icon: Search,
  },
  {
    title: 'Comparing Models',
    href: '/docs/comparing-models',
    description: 'Side-by-side cost and latency comparison across OpenAI, Anthropic, Gemini & open models.',
    icon: GitCompare,
  },
  {
    title: 'History & Sharing',
    href: '/docs/history-sharing',
    description: 'Persisting analysis runs, generating shareable report snapshots, and search history.',
    icon: History,
  },
  {
    title: 'Bringing Your Own Key (BYOK)',
    href: '/docs/byok',
    description: 'Store client-side API keys securely for direct model execution and live benchmarks.',
    icon: KeyRound,
  },
  {
    title: 'Settings',
    href: '/docs/settings',
    description: 'Configuring default model targets, tokenizer rules, and local storage preferences.',
    icon: Settings,
  },
];

export function LandingNavbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between relative z-[100]"
    >
      <Link href="/" className="flex items-center gap-2.5">
        <img src="/imagelogo.png" alt="TokenGecko Mark" className="w-9 h-9 object-contain" />
        <img src="/textlogo.png" alt="TokenGecko" className="h-6 w-auto object-contain hidden sm:block" />
      </Link>

      <div className="hidden md:flex items-center gap-6 font-mono text-xs">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Link
            href="/inspector"
            className="text-white/70 hover:text-white transition-colors"
          >
            Inspector
          </Link>
        </motion.div>

        {/* ReUI Navigation Menu Dropdown for Features */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-white/70 hover:text-white bg-transparent hover:bg-zinc-800/40 font-mono text-xs px-3 py-1.5 h-auto focus:bg-zinc-800/40 data-[state=open]:bg-zinc-800/80 data-[state=open]:text-white">
                  Features
                </NavigationMenuTrigger>
                <NavigationMenuContent className="w-[520px] sm:w-[600px] p-6 bg-sidebar border border-zinc-800/90  shadow-2xl z-[100]">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {featureItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <NavigationMenuLink key={item.title} asChild>
                          <Link
                            href={item.href}
                            className="group flex items-start gap-3 rounded-xl p-2.5 hover:bg-zinc-800/50 transition-colors"
                          >
                            <div className="w-8 h-8  flex items-center justify-center text-zinc-300 group-hover:text-accent-orange group-hover:border-accent-orange/40 group-hover:bg-accent-orange/10 transition-colors shrink-0 mt-0.5">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <div className="text-xs font-medium font-sans text-white group-hover:text-accent-orange transition-colors">
                                {item.title}
                              </div>
                              <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      );
                    })}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Link
            href="/changelog"
            className="text-white/70 hover:text-white transition-colors"
          >
            Changelog
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Link
            href="/docs"
            className="text-white/70 hover:text-white transition-colors"
          >
            Documentation
          </Link>
        </motion.div>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/login"
          className="text-xs font-mono text-white/70 hover:text-white transition-colors px-3 py-2"
        >
          Sign In
        </Link>
        <ActionButton label="Get Started" href="/signup" />
      </div>

      <button
        className="md:hidden w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/80 hover:text-white"
        aria-label="Toggle Menu"
      >
        <Menu className="w-5 h-5" />
      </button>
    </motion.nav>
  );
}
