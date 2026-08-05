'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Info, AlertTriangle, Lightbulb, AlertCircle } from 'lucide-react';
import { PackageTabs } from '@/components/docs/package-tabs';
import { cn } from '@/lib/utils';

// Helper to slugify text for heading IDs
function slugify(text: React.ReactNode): string {
  if (typeof text !== 'string') {
    if (Array.isArray(text)) {
      return text.map(slugify).join('');
    }
    if (React.isValidElement<{ children?: React.ReactNode }>(text) && text.props.children) {
      return slugify(text.props.children);
    }
    return '';
  }
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Helper to extract plain text string recursively from React nodes
function getNodeText(node: React.ReactNode): string {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node) && node.props.children) {
    return getNodeText(node.props.children);
  }
  return '';
}

// Terminal Copy Code Button Component
function TerminalCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 text-zinc-400 hover:text-white rounded transition hover:bg-zinc-800/60"
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-400" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

// Callout / Admonition Component
export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: 'note' | 'tip' | 'warning' | 'caution' | 'important';
  title?: string;
  children: React.ReactNode;
}) {
  const config = {
    note: {
      border: 'border-blue-500/40 bg-blue-950/20 text-blue-200',
      icon: Info,
      iconColor: 'text-blue-400',
      defaultTitle: 'Note',
    },
    tip: {
      border: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200',
      icon: Lightbulb,
      iconColor: 'text-emerald-400',
      defaultTitle: 'Tip',
    },
    warning: {
      border: 'border-amber-500/40 bg-amber-950/20 text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      defaultTitle: 'Warning',
    },
    caution: {
      border: 'border-rose-500/40 bg-rose-950/20 text-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-400',
      defaultTitle: 'Caution',
    },
    important: {
      border: 'border-purple-500/40 bg-purple-950/20 text-purple-200',
      icon: Info,
      iconColor: 'text-purple-400',
      defaultTitle: 'Important',
    },
  };

  const style = config[type] || config.note;
  const IconComponent = style.icon;

  return (
    <div className={cn('my-6 p-4 rounded-lg border flex gap-3 text-xs sm:text-sm', style.border)}>
      <IconComponent className={cn('w-5 h-5 shrink-0 mt-0.5', style.iconColor)} />
      <div className="flex-1 min-w-0">
        {(title || style.defaultTitle) && (
          <div className="font-mono text-xs font-normal uppercase tracking-wider mb-1 text-white">
            {title || style.defaultTitle}
          </div>
        )}
        <div className="leading-relaxed font-sans text-zinc-300 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export const mdxComponents = {
  h1: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        'text-3xl sm:text-4xl font-normal text-white tracking-tight mb-4 pb-2 border-b border-zinc-800',
        className
      )}
      {...props}
    >
      {children}
    </h1>
  ),

  h2: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(children);
    return (
      <h2
        id={id}
        className={cn(
          'text-2xl font-semibold text-white tracking-tight mt-10 mb-4 pb-2 border-b border-zinc-800/80 scroll-m-20 group flex items-center gap-2',
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {id && (
          <a
            href={`#${id}`}
            className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-accent-orange text-base transition-opacity"
            aria-label="Link to section"
          >
            #
          </a>
        )}
      </h2>
    );
  },

  h3: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(children);
    return (
      <h3
        id={id}
        className={cn(
          'text-lg font-normal text-white tracking-tight mt-8 mb-3 scroll-m-20 group flex items-center gap-2',
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {id && (
          <a
            href={`#${id}`}
            className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-accent-orange text-sm transition-opacity"
            aria-label="Link to section"
          >
            #
          </a>
        )}
      </h3>
    );
  },

  p: ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('text-zinc-300 leading-relaxed text-sm sm:text-base mb-4', className)} {...props}>
      {children}
    </p>
  ),

  ul: ({ children, className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn('list-disc list-outside ml-6 mb-5 space-y-2 text-zinc-300 text-sm sm:text-base', className)} {...props}>
      {children}
    </ul>
  ),

  ol: ({ children, className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn('list-decimal list-outside ml-6 mb-5 space-y-2 text-zinc-300 text-sm sm:text-base', className)} {...props}>
      {children}
    </ol>
  ),

  li: ({ children, className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li className={cn('leading-relaxed pl-1', className)} {...props}>
      {children}
    </li>
  ),

  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    const isInline = !className && !(props as Record<string, unknown>)['data-theme'];
    if (isInline) {
      return (
        <code
          className={cn(
            'font-mono text-[13px] text-accent-orange bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-normal',
            className
          )}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={cn('font-mono text-xs sm:text-sm', className)} {...props}>
        {children}
      </code>
    );
  },

  figure: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <figure className={cn('my-6 m-0 p-0 border-0 bg-transparent', className)} {...props}>
      {children}
    </figure>
  ),

  figcaption: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <figcaption
      className={cn(
        'px-4 py-1.5 border-b border-zinc-800/60 bg-[#18181a] font-mono text-xs text-zinc-400 m-0',
        className
      )}
      {...props}
    >
      {children}
    </figcaption>
  ),

  pre: ({ children, className, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
    const codeText = getNodeText(children);
    let rawLang = (props as Record<string, unknown>)['data-language'] as string;

    if (!rawLang) {
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as Record<string, unknown>;
          if (childProps && childProps['data-language']) {
            rawLang = String(childProps['data-language']);
          }
        }
      });
    }

    rawLang = rawLang || 'Terminal';
    const lang = rawLang.charAt(0).toUpperCase() + rawLang.slice(1);

    return (
      <div className="my-6 rounded-xl border border-zinc-800 bg-[#1a1a1c] overflow-hidden shadow-sm">
        {/* Terminal Header Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-zinc-800/80 bg-[#1a1a1c] font-mono text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-bold text-sm">&gt;_</span>
            <span className="font-mono text-zinc-300">{lang}</span>
          </div>

          {codeText && <TerminalCopyButton code={codeText} />}
        </div>

        {/* Syntax Highlighted Code Container */}
        <div className="p-4 overflow-x-auto bg-[#18181a]">
          <pre
            className={cn(
              'font-mono text-xs sm:text-sm text-zinc-200 leading-relaxed bg-transparent m-0 p-0 border-0 rounded-none shadow-none',
              className
            )}
            {...props}
          >
            {children}
          </pre>
        </div>
      </div>
    );
  },

  blockquote: ({ children }: { children?: React.ReactNode }) => {
    const rawText = getNodeText(children).trim();
    const alertMatch = rawText.match(/^\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]/i);

    if (alertMatch) {
      const type = alertMatch[1].toLowerCase() as 'note' | 'tip' | 'warning' | 'caution' | 'important';
      // Strip out [!TYPE] marker text
      const cleanText = rawText.replace(/^\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]\s*/i, '');
      return <Callout type={type}>{cleanText}</Callout>;
    }

    return <Callout type="note">{children}</Callout>;
  },

  table: ({ children, className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto border border-zinc-800 rounded-lg shadow-sm">
      <table className={cn('w-full text-left text-xs sm:text-sm font-sans', className)} {...props}>
        {children}
      </table>
    </div>
  ),

  thead: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className={cn('bg-zinc-900/90 border-b border-zinc-800 font-mono text-xs text-zinc-400 uppercase tracking-wider', className)} {...props}>
      {children}
    </thead>
  ),

  tbody: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className={cn('divide-y divide-zinc-800/60 bg-zinc-950/40 text-zinc-300', className)} {...props}>
      {children}
    </tbody>
  ),

  tr: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={cn('hover:bg-zinc-800/30 transition-colors', className)} {...props}>
      {children}
    </tr>
  ),

  th: ({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn('px-4 py-3 font-normal text-white', className)} {...props}>
      {children}
    </th>
  ),

  td: ({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn('px-4 py-3', className)} {...props}>
      {children}
    </td>
  ),

  a: ({ href, children, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
    if (isInternal) {
      return (
        <Link
          href={href}
          className={cn('text-accent-orange hover:underline font-medium transition', className)}
          {...props}
        >
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('text-accent-orange hover:underline font-medium transition', className)}
        {...props}
      >
        {children}
      </a>
    );
  },

  Callout,
  PackageTabs,
  CodeTabs: PackageTabs,
};
