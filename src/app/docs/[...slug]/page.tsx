import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import { getDocData } from '@/lib/docs-content';
import { getAllDocsSlugs, getAdjacentPages, flattenNav } from '@/lib/docs-nav';
import { mdxComponents } from '@/components/docs/mdx-components';
import { PackageTabs } from '@/components/docs/package-tabs';
import { DocsToc } from '@/components/docs/docs-toc';
import { ChangelogTimeline } from '@/components/changelog/changelog-timeline';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';

interface DocsPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllDocsSlugs();
  return slugs.map((slug) => ({
    slug: slug.split('/'),
  }));
}

export async function generateMetadata({ params }: DocsPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join('/');
  const docData = getDocData(slug);

  if (!docData) {
    return {
      title: 'Page Not Found – TokenGecko Docs',
    };
  }

  return {
    title: `${docData.metadata.title} – TokenGecko Docs`,
    description: docData.metadata.description || 'TokenGecko Documentation',
  };
}

export default async function DocsPage({ params }: DocsPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join('/');
  const docData = getDocData(slug);

  if (!docData) {
    notFound();
  }

  const { content } = await compileMDX({
    source: docData.rawContent,
    components: {
      ...mdxComponents,
      PackageTabs,
      CodeTabs: PackageTabs,
    },
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [
            rehypePrettyCode,
            {
              theme: 'github-dark-dimmed',
              keepBackground: false,
            },
          ],
        ],
      },
    },
  });

  const { prev, next } = getAdjacentPages(slug);
  const flat = flattenNav();
  const currentNav = flat.find((item) => item.slug === slug);

  return (
    <div className="flex gap-8 items-start w-full">
      {/* Primary Article Container */}
      <article className="flex-1 min-w-0 max-w-4xl">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-500 mb-4">
          <Link href="/docs" className="hover:text-zinc-300 transition-colors">
            Docs
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <span>{currentNav?.sectionTitle || 'Guide'}</span>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <span className="text-accent-orange font-medium">{docData.metadata.title}</span>
        </div>

        {/* Page Header */}
        <header className="mb-8 pb-6 border-b border-zinc-800/80">
          <h1 className="text-3xl sm:text-4xl font-normal text-white tracking-tight mb-3">
            {docData.metadata.title}
          </h1>
          {docData.metadata.description && (
            <p className="text-base sm:text-lg text-zinc-400 font-sans leading-relaxed">
              {docData.metadata.description}
            </p>
          )}
        </header>

        {/* Page Content Body */}
        {slug === 'changelog' ? (
          <div className="mt-4">
            <ChangelogTimeline />
          </div>
        ) : (
          <div className="prose prose-invert max-w-none prose-headings:font-normal prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-zinc-800/60 prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-4 prose-ul:my-4 prose-ul:list-disc prose-ol:my-4 prose-ol:list-decimal prose-li:my-1 prose-table:my-6">
            {content}
          </div>
        )}

        {/* Prev / Next Bottom Navigation */}
        <nav className="mt-14 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/docs/${prev.slug}`}
              className="flex-1 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-card-dark/60 hover:bg-zinc-800/40 group transition flex items-center gap-3"
            >
              <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-accent-orange transition shrink-0" />
              <div className="overflow-hidden text-left">
                <div className="font-mono text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">
                  Previous
                </div>
                <div className="font-mono text-xs font-bold text-zinc-200 group-hover:text-white truncate">
                  {prev.title}
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {next ? (
            <Link
              href={`/docs/${next.slug}`}
              className="flex-1 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-card-dark/60 hover:bg-zinc-800/40 group transition flex items-center justify-end gap-3 text-right"
            >
              <div className="overflow-hidden text-right">
                <div className="font-mono text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">
                  Next
                </div>
                <div className="font-mono text-xs font-bold text-zinc-200 group-hover:text-white truncate">
                  {next.title}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-accent-orange transition shrink-0" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>
      </article>

      {/* Right Column: Table of Contents (On this page) */}
      <DocsToc headings={docData.headings} />
    </div>
  );
}
