'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Menu } from 'lucide-react';
import { ActionButton } from './shared-primitives';

export function LandingNavbar() {
  const navItems = [
    { label: 'Inspector', href: '/inspector', isRoute: true },
    { label: 'Features', href: '#features', isRoute: false },
    { label: 'Pricing', href: '#pricing', isRoute: false },
    { label: 'Models', href: '#models', isRoute: false },
    { label: 'Documentation', href: '/docs', isRoute: true },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between relative z-10"
    >
      <Link href="/" className="flex items-center gap-2.5">
        <img src="/imagelogo.png" alt="TokenGecko Mark" className="w-9 h-9 object-contain" />
        <img src="/textlogo.png" alt="TokenGecko" className="h-6 w-auto object-contain hidden sm:block" />
      </Link>

      <div className="hidden md:flex items-center gap-8 font-mono text-xs">
        {navItems.map((item, i) =>
          item.isRoute ? (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
            >
              <Link
                href={item.href}
                className="text-white/70 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            </motion.div>
          ) : (
            <motion.a
              key={item.label}
              href={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              className="text-white/70 hover:text-white transition-colors"
            >
              {item.label}
            </motion.a>
          )
        )}
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
