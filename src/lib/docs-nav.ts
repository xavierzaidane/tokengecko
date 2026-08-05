export interface DocsNavItem {
  title: string;
  slug: string;
  description?: string;
  sectionTitle?: string;
}

export interface DocsNavSection {
  title: string;
  items: DocsNavItem[];
}

export const docsNav: DocsNavSection[] = [
  {
    title: 'Introduction',
    items: [
      {
        title: 'Overview',
        slug: 'overview',
        description: 'What TokenGecko is, core capabilities, and high-level architecture.',
      },
      {
        title: 'Quickstart',
        slug: 'quickstart',
        description: 'Get started analyzing LLM prompts and token payloads in 5 minutes.',
      },
    ],
  },
  {
    title: 'Using TokenGecko',
    items: [
      {
        title: 'The Inspector',
        slug: 'inspector',
        description: 'Deep dive into prompt payload inspection, token breakdown, and visualizer tools.',
      },
      {
        title: 'Comparing Models',
        slug: 'comparing-models',
        description: 'Side-by-side cost and latency comparison across OpenAI, Anthropic, Gemini, and open models.',
      },
      {
        title: 'History & Sharing',
        slug: 'history-sharing',
        description: 'Persisting analysis runs, generating shareable report snapshots, and search history.',
      },
      {
        title: 'Bringing Your Own Key (BYOK)',
        slug: 'byok',
        description: 'Store client-side API keys securely for direct model execution and live benchmarks.',
      },
      {
        title: 'Settings',
        slug: 'settings',
        description: 'Configuring default model targets, tokenizer rules, and local storage preferences.',
      },
    ],
  },
  {
    title: 'Package / API',
    items: [
      {
        title: 'Installation',
        slug: 'api/installation',
        description: 'Installing TokenGecko core packages and CLI integration tools.',
      },
      {
        title: 'Configuration',
        slug: 'api/configuration',
        description: 'Configuring SDK parameters, custom tokenizers, and cost table overrides.',
      },
      {
        title: 'Model Registry',
        slug: 'api/model-registry',
        description: 'Querying and extending the dynamic model registry and pricing metadata.',
      },
      {
        title: 'Cost & Routing API',
        slug: 'api/cost-routing',
        description: 'Programmatic API for optimal LLM routing and token calculation.',
      },
    ],
  },
  {
    title: 'Reference',
    items: [
      {
        title: 'Glossary',
        slug: 'glossary',
        description: 'Key definitions: tokens, context windows, BPE, BYOK, TTFT, and pricing metrics.',
      },
      {
        title: 'Supported Models',
        slug: 'supported-models',
        description: 'Comprehensive list of supported LLM provider models, context windows, and tokenizers.',
      },
      {
        title: 'Changelog',
        slug: 'changelog',
        description: 'Recent updates, feature additions, and breaking changes in TokenGecko.',
      },
    ],
  },
];

/**
 * Returns all doc slugs for dynamic route parameters generation.
 */
export function getAllDocsSlugs(): string[] {
  const slugs: string[] = [];
  for (const section of docsNav) {
    for (const item of section.items) {
      slugs.push(item.slug);
    }
  }
  return slugs;
}

/**
 * Flattens all nav items into a single ordered list with section titles attached.
 * Useful for client-side search and finding prev/next pages.
 */
export function flattenNav(): DocsNavItem[] {
  const items: DocsNavItem[] = [];
  for (const section of docsNav) {
    for (const item of section.items) {
      items.push({
        ...item,
        sectionTitle: section.title,
      });
    }
  }
  return items;
}

/**
 * Returns previous and next documentation items relative to the current slug.
 */
export function getAdjacentPages(slug: string): {
  prev: DocsNavItem | null;
  next: DocsNavItem | null;
} {
  const flat = flattenNav();
  const currentIndex = flat.findIndex((item) => item.slug === slug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? flat[currentIndex - 1] : null;
  const next = currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null;

  return { prev, next };
}
