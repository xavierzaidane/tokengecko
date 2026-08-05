import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface DocPageMetadata {
  title: string;
  description?: string;
  slug: string;
  section?: string;
}

export interface DocHeading {
  id: string;
  text: string;
  level: number;
}

export interface DocPageData {
  metadata: DocPageMetadata;
  rawContent: string;
  headings: DocHeading[];
}

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');

/**
 * Normalizes slug string into file system path
 */
function getFilePathForSlug(slug: string): string {
  // e.g. "overview" -> "content/docs/overview.mdx"
  // e.g. "api/installation" -> "content/docs/api/installation.mdx"
  return path.join(DOCS_DIR, `${slug}.mdx`);
}

/**
 * Extracts h2/h3 headings from raw Markdown text for TOC generation
 */
export function extractHeadings(markdown: string): DocHeading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: DocHeading[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim().replace(/`([^`]+)`/g, '$1'); // Strip backticks
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    headings.push({ id, text, level });
  }

  return headings;
}

/**
 * Checks if a doc page exists on disk
 */
export function docExists(slug: string): boolean {
  const filePath = getFilePathForSlug(slug);
  return fs.existsSync(filePath);
}

/**
 * Gets raw doc data (metadata + frontmatter + raw content + headings) for a slug
 */
export function getDocData(slug: string): DocPageData | null {
  const filePath = getFilePathForSlug(slug);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  const headings = extractHeadings(content);

  return {
    metadata: {
      title: data.title || slug,
      description: data.description || '',
      slug,
      section: data.section || '',
    },
    rawContent: content,
    headings,
  };
}
