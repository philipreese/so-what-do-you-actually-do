import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { parseChapter, renderChapterHtml, preprocessAlerts } from './parseChapter';

const ROMAN_NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const PART_EMOJIS: Record<string, string> = {
  '01': '🧭',
  '02': '🏗️',
  '03': '🔌',
  '04': '📦',
  '05': '🧪',
  '06': '🔄',
  '07': '🚀',
  '08': '📝',
  '09': '📊',
  '10': '🧵',
  '11': '🛡️',
  '12': '⚡',
};

export interface ChapterInfo {
  slug: string; // e.g. "ch01"
  number: string; // e.g. "01"
  title: string; // e.g. "What Engineering Actually Optimizes"
  subtitle: string; // e.g. "Managing complexity by hiding unnecessary detail."
  partSlug: string; // e.g. "part01"
  partNumber: string; // e.g. "I"
  filePath: string;
  kidsTitle?: string; // e.g. "The Fort Nobody Agreed On" — first ### heading in "## For My Kids"
}

export interface PartInfo {
  slug: string; // e.g. "part01"
  number: string; // e.g. "01"
  romanNumber: string; // e.g. "I"
  title: string; // e.g. "Systems Thinking"
  emoji: string;
  filePath: string;
  chapters: ChapterInfo[];
}

export interface AppendixInfo {
  slug: string; // e.g. "appendix-b"
  letter: string; // e.g. "B"
  title: string; // e.g. "Common Engineering Smells"
  filePath: string;
}

function getRepoRoot(): string {
  return path.join(process.cwd(), 'content');
}

function assetPathIfExists(fileName: string): string | undefined {
  const exists = fs.existsSync(path.join(getRepoRoot(), 'assets', fileName));
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  return exists ? `${cleanBase}assets/${fileName}` : undefined;
}

export function getChapterImage(chapterNumber: string): string | undefined {
  return assetPathIfExists(`Ch${chapterNumber}.jpg`);
}

export function getPartImage(partNumber: string): string | undefined {
  return assetPathIfExists(`part${partNumber}.jpg`);
}

export function getAppendixImage(letter: string): string | undefined {
  return assetPathIfExists(`Ap${letter.toUpperCase()}.jpg`);
}

export function toRoman(num: number): string {
  return ROMAN_NUMERALS[num] || String(num);
}

export function cleanChapterTitle(fullTitle: string): string {
  // Cleans "Chapter 1 — ...", "Ch 1 — ...", or bare "1 — ..." -> just the title after the dash
  const match = /^(?:Ch(?:apter)?\s+)?\d+\s*[-—–:]\s*(.+)$/i.exec(fullTitle);
  return match ? match[1].trim() : fullTitle;
}

export function cleanPartTitle(fullTitle: string): string {
  // Cleans "Part I — Systems Thinking" -> "Systems Thinking"
  const match = /^Part\s+[IVXLCDM]+\s+[\s\S]*?[-—–:]\s*(.+)$/i.exec(fullTitle);
  return match ? match[1].trim() : fullTitle;
}

export function cleanAppendixTitle(fullTitle: string): string {
  // Cleans "Appendix B — Common Engineering Smells" -> "Common Engineering Smells"
  const match = /^Appendix\s+[A-Z]\s+[\s\S]*?[-—–:]\s*(.+)$/i.exec(fullTitle);
  return match ? match[1].trim() : fullTitle;
}

export function resolveRelativeLinks(markdown: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  
  return markdown
    // Replace relative links to chapters in other directories: ../partXX-.../chYY-....md -> /chapters/chYY
    .replace(/\.\.\/part\d+-[a-zA-Z0-9-]+\/(ch\d+)-[a-zA-Z0-9-]+\.md/g, `${cleanBase}chapters/$1`)
    // Replace same-directory chapter links: chYY-....md -> /chapters/chYY
    .replace(/\b(ch\d+)-[a-zA-Z0-9-]+\.md/g, `${cleanBase}chapters/$1`)
    // Replace links to parts: ../partXX-.../index.md -> /parts/partXX
    .replace(/\.\.\/(part\d+)-[a-zA-Z0-9-]+\/index\.md/g, `${cleanBase}parts/$1`)
    // Replace links to appendices: ../appendices/appendix-b-...md -> /appendices/appendix-b
    .replace(/\.\.\/appendices\/(appendix-[a-z])-[a-zA-Z0-9-]+\.md/g, `${cleanBase}appendices/$1`);
}

export function getAllPartsAndChapters(): { parts: PartInfo[]; chapters: ChapterInfo[] } {
  const repoRoot = getRepoRoot();
  const dirItems = fs.readdirSync(repoRoot);
  
  const partDirs = dirItems
    .filter((item) => {
      const fullPath = path.join(repoRoot, item);
      return fs.statSync(fullPath).isDirectory() && /^part\d+/.test(item);
    })
    .sort();

  const parts: PartInfo[] = [];
  const chapters: ChapterInfo[] = [];

  for (const partDir of partDirs) {
    const partNumStr = partDir.match(/^part(\d+)/)?.[1] || '';
    const partIndex = parseInt(partNumStr, 10);
    const roman = toRoman(partIndex);
    const partSlug = `part${partNumStr}`;
    const emoji = PART_EMOJIS[partNumStr] || '🗺️';

    const partPath = path.join(repoRoot, partDir);
    const introPath = path.join(partPath, 'index.md');

    let partTitle = partDir.replace(/^part\d+-/, '').replace(/-/g, ' ');
    if (fs.existsSync(introPath)) {
      const introContent = fs.readFileSync(introPath, 'utf-8');
      const firstLine = (introContent.split('\n')[0] || '').trim();
      const parsedTitle = cleanPartTitle(firstLine.replace(/^#\s*/, ''));
      if (parsedTitle) {
        partTitle = parsedTitle;
      }
    }

    const partChapters: ChapterInfo[] = [];
    const chapterFiles = fs.readdirSync(partPath)
      .filter((file) => /^ch\d+.*\.md$/.test(file))
      .sort();

    for (const chFile of chapterFiles) {
      const chNumStr = chFile.match(/^ch(\d+)/)?.[1] || '';
      const chSlug = `ch${chNumStr}`;
      const chPath = path.join(partPath, chFile);
      
      let chTitle = chFile.replace(/^ch\d+-/, '').replace(/\.md$/, '').replace(/-/g, ' ');
      const chContent = fs.readFileSync(chPath, 'utf-8');
      const firstLine = (chContent.split('\n')[0] || '').trim();
      const parsedTitle = cleanChapterTitle(firstLine.replace(/^#\s*/, ''));
      if (parsedTitle) {
        chTitle = parsedTitle;
      }
      const chSubtitle = parseChapter(chContent).subtitle;
      const chKidsTitle = extractKidsTitle(chContent);

      const chapterInfo: ChapterInfo = {
        slug: chSlug,
        number: chNumStr,
        title: chTitle,
        subtitle: chSubtitle,
        partSlug,
        partNumber: roman,
        filePath: chPath,
        kidsTitle: chKidsTitle,
      };

      partChapters.push(chapterInfo);
      chapters.push(chapterInfo);
    }

    parts.push({
      slug: partSlug,
      number: partNumStr,
      romanNumber: roman,
      title: partTitle,
      emoji,
      filePath: introPath,
      chapters: partChapters,
    });
  }

  return { parts, chapters };
}

export function getAllAppendices(): AppendixInfo[] {
  const repoRoot = getRepoRoot();
  const appendicesPath = path.join(repoRoot, 'appendices');
  if (!fs.existsSync(appendicesPath)) return [];

  const files = fs.readdirSync(appendicesPath);
  const appendices: AppendixInfo[] = [];

  for (const file of files) {
    if (file === 'README.md' || !file.endsWith('.md')) continue;
    const match = /^appendix-([a-z])\b/i.exec(file);
    if (!match) continue;

    const letter = match[1].toUpperCase();
    const slug = `appendix-${match[1].toLowerCase()}`;
    const filePath = path.join(appendicesPath, file);
    
    let title = file.replace(/^appendix-[a-z]-/i, '').replace(/\.md$/, '').replace(/-/g, ' ');
    const content = fs.readFileSync(filePath, 'utf-8');
    const firstLine = (content.split('\n')[0] || '').trim();
    const parsedTitle = cleanAppendixTitle(firstLine.replace(/^#\s*/, ''));
    if (parsedTitle) {
      title = parsedTitle;
    }

    appendices.push({
      slug,
      letter,
      title,
      filePath,
    });
  }

  return appendices;
}

// Matches the "## For My Kids" section body (used both to render the pane and,
// separately, to pull out the kid-facing chapter title — see extractKidsTitle).
const KIDS_SECTION_REGEX = /## For My Kids\b([\s\S]*?)(?=(?:## For My Wife|## |---|$))/i;

/**
 * Chapters being migrated to the kid-story format open their "For My Kids"
 * section with a "### <Kid Story Title>" heading. Returns undefined when the
 * chapter has no kids section yet, or the section hasn't been migrated to
 * include that heading — callers must degrade gracefully in either case.
 */
export function extractKidsTitle(rawMarkdown: string): string | undefined {
  const md = rawMarkdown.replace(/\r\n/g, '\n');
  const match = KIDS_SECTION_REGEX.exec(md);
  if (!match) return undefined;
  const titleMatch = /^\s*###\s+(.+?)\s*$/m.exec(match[1]);
  return titleMatch ? titleMatch[1].trim() : undefined;
}

function extractWifeKidsSections(rawMarkdown: string): { wifeHtml: string; kidsHtml: string; cleanMarkdown: string } {
  let wifeHtml = '';
  let kidsHtml = '';

  // Regex to match "## For My Wife" section
  const wifeRegex = /## For My Wife\b([\s\S]*?)(?=(?:## For My Kids|## |---|$))/i;
  const kidsRegex = KIDS_SECTION_REGEX;

  const wifeMatch = wifeRegex.exec(rawMarkdown);
  const kidsMatch = kidsRegex.exec(rawMarkdown);

  let cleanMarkdown = rawMarkdown;

  if (wifeMatch) {
    const resolvedWife = resolveRelativeLinks(wifeMatch[1].trim());
    wifeHtml = marked.parse(preprocessAlerts(resolvedWife)) as string;
    cleanMarkdown = cleanMarkdown.replace(wifeRegex, '');
  }

  if (kidsMatch) {
    const resolvedKids = resolveRelativeLinks(kidsMatch[1].trim());
    kidsHtml = marked.parse(preprocessAlerts(resolvedKids)) as string;
    cleanMarkdown = cleanMarkdown.replace(kidsRegex, '');
  }

  return { wifeHtml, kidsHtml, cleanMarkdown };
}

/**
 * Part introductions are plain prose (no Decision Template sections), so they
 * skip parseChapter/renderChapterHtml entirely — the caller renders the
 * remaining "engineer" markdown with a plain marked.parse().
 */
export function splitPartTracks(rawMarkdown: string): { wifeHtml: string; kidsHtml: string; cleanMarkdown: string } {
  return extractWifeKidsSections(rawMarkdown);
}

export function splitChapterTracks(rawMarkdown: string) {
  const { wifeHtml, kidsHtml, cleanMarkdown } = extractWifeKidsSections(rawMarkdown);

  const cleanMarkdownResolved = resolveRelativeLinks(cleanMarkdown);
  const parsed = parseChapter(cleanMarkdownResolved);
  const engineerHtml = renderChapterHtml(parsed);

  // Extract headings for the right sidebar TOC — match ## or ### since chapters
  // 27+ shifted to ### for content sections.
  const headingPattern = /^#{2,3}\s+(.+)$/gm;
  const headings = [...cleanMarkdown.matchAll(headingPattern)]
    .map((match) => match[1].trim())
    .filter((h) => !/For My Wife|For My Kids/i.test(h))
    .map((h) => ({
      title: h,
      slug: h.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));

  return {
    engineerHtml,
    wifeHtml,
    kidsHtml,
    headings,
    subtitle: parsed.subtitle,
    thesis: parsed.thesis,
  };
}

export interface ReadingNode {
  type: 'part' | 'chapter';
  slug: string;
  number: string;
  title: string;
  kidsTitle?: string;
}

export function getReadingSequence(): ReadingNode[] {
  const { parts } = getAllPartsAndChapters();
  const sequence: ReadingNode[] = [];

  for (const part of parts) {
    sequence.push({
      type: 'part',
      slug: part.slug,
      number: part.romanNumber,
      title: part.title,
    });
    for (const ch of part.chapters) {
      sequence.push({
        type: 'chapter',
        slug: ch.slug,
        number: ch.number,
        title: ch.title,
        kidsTitle: ch.kidsTitle,
      });
    }
  }
  return sequence;
}
