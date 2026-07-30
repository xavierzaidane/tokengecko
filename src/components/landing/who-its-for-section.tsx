'use client';

import React from 'react';
import { motion } from 'motion/react';

export function WhoItsForSection() {
  const cards = [
    {
      number: '01',
      title: 'Developers',
      description:
        'Control over what you ship — full root context telemetry, exact token counts, and no drift between local tests and production.',
      linkText: 'See developers',
      isOrange: false,
    },
    {
      number: '02',
      title: 'Prompt Architects',
      description:
        'Do more yourself — 80% cost savings, plain-language answers, and live provider routing a message away.',
      linkText: 'See prompt architects',
      isOrange: true,
    },
    {
      number: '03',
      title: 'Agencies',
      description:
        'Remote work that\'s safe — review, validate, and ship without client prompt payload drift on personal laptops.',
      linkText: 'See agencies',
      isOrange: false,
    },
    {
      number: '04',
      title: 'Consultants',
      description:
        'Bill for insight, not busywork — automate prompt triage, eliminate model latency bottlenecks, and prove ROI with real data.',
      linkText: 'See consultants',
      isOrange: false,
    },
  ];

  return (
    <section className="max-w-[1343px] mx-auto px-4 md:px-8 pb-20 relative z-10 pt-16">
      {/* Header Block */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className="bg-app p-8 sm:p-12 mb-8"
      >
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white">
          Who It&apos;s For<span className="text-accent-orange font-bold">.</span>
        </h2>
        <p className="mt-4 text-white/60 max-w-2xl text-sm leading-[1.6] font-sans">
          We built TokenGecko for the way prompt architects work — and for four kinds of people who&apos;d rather build than wait.{' '}
          <a href="#inspector" className="underline hover:text-white transition">
            See who it&apos;s for
          </a>
          .
        </p>
      </motion.div>

      {/* 4 Cards Grid */}
      <div className="w-full border-t border-b border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 overflow-hidden">
        {cards.map((card, index) => (
          <motion.div
            key={card.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className={`p-8 flex flex-col justify-between min-h-[280px] space-y-6 transition-colors duration-300 ${
              card.isOrange
                ? 'bg-accent-orange text-black shadow-xl'
                : 'bg-card-dark text-white hover:bg-[#14171e]'
            }`}
          >
            <div className="space-y-4">
              <div
                className={`flex items-center gap-2 text-xs font-mono ${
                  card.isOrange ? 'text-black/70' : 'text-white/50'
                }`}
              >
                <span
                  className={`w-2 h-2 inline-block ${
                    card.isOrange ? 'bg-black' : 'bg-accent-orange'
                  }`}
                />
                <span>{card.number}</span>
              </div>
              <h3
                className={`text-xl font-bold tracking-tight ${
                  card.isOrange ? 'text-black' : 'text-white'
                }`}
              >
                {card.title}
              </h3>
              <p
                className={`text-xs leading-relaxed font-sans ${
                  card.isOrange ? 'text-black/80 font-medium' : 'text-white/60'
                }`}
              >
                {card.description}
              </p>
            </div>
            <a
              href="#inspector"
              className={`text-xs font-mono inline-flex items-center gap-1.5 group font-medium ${
                card.isOrange
                  ? 'text-black font-bold hover:underline'
                  : 'text-white/80 hover:text-white transition'
              }`}
            >
              <span>{card.linkText}</span>
              <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                ↗
              </span>
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
