'use client';

import React, { useEffect, useState } from 'react';
import { DocHeading } from '@/lib/docs-content';

interface DocsTocProps {
  headings: DocHeading[];
}

export function DocsToc({ headings }: DocsTocProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!headings || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -75% 0px',
        threshold: 0.1,
      }
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [headings]);

  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <div className="hidden xl:block w-56 shrink-0 pl-6 border-l border-zinc-800/60 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto py-2 text-xs font-mono">
      <div className="font-semibold text-zinc-400 uppercase tracking-wider mb-3 text-[11px]">
        On this page
      </div>
      <ul className="space-y-2.5">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li
              key={heading.id}
              className={heading.level === 3 ? 'pl-3' : ''}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(heading.id);
                  if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 90;
                    window.scrollTo({ top, behavior: 'smooth' });
                    setActiveId(heading.id);
                  }
                }}
                className={`block transition-colors duration-150 leading-normal ${
                  isActive
                    ? 'text-accent-orange font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
