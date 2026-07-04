import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { parseChapter, renderChapterHtml } from './parseChapter';

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
  return path.resolve(process.cwd(), '..');
}

function assetPathIfExists(fileName: string): string | undefined {
  const exists = fs.existsSync(path.join(getRepoRoot(), 'assets', fileName));
  return exists ? `/assets/${fileName}` : undefined;
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
  // Cleans "Chapter 1 — What Engineering Actually Optimizes" or "1 — What Engineering Actually Optimizes" -> "What Engineering Actually Optimizes"
  const match = /^(?:Chapter\s+)?\d+\s+[\s\S]*?[-—–:]\s*(.+)$/i.exec(fullTitle);
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
  return markdown
    // Replace relative links to chapters in other directories: ../partXX-.../chYY-....md -> /chapters/chYY
    .replace(/\.\.\/part\d+-[a-zA-Z0-9-]+\/(ch\d+)-[a-zA-Z0-9-]+\.md/g, '/chapters/$1')
    // Replace same-directory chapter links: chYY-....md -> /chapters/chYY
    .replace(/\b(ch\d+)-[a-zA-Z0-9-]+\.md/g, '/chapters/$1')
    // Replace links to parts: ../partXX-.../index.md -> /parts/partXX
    .replace(/\.\.\/(part\d+)-[a-zA-Z0-9-]+\/index\.md/g, '/parts/$1')
    // Replace links to appendices: ../appendices/appendix-b-...md -> /appendices/appendix-b
    .replace(/\.\.\/appendices\/(appendix-[a-z])-[a-zA-Z0-9-]+\.md/g, '/appendices/$1');
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

      const chapterInfo: ChapterInfo = {
        slug: chSlug,
        number: chNumStr,
        title: chTitle,
        subtitle: chSubtitle,
        partSlug,
        partNumber: roman,
        filePath: chPath,
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

export function splitChapterTracks(rawMarkdown: string) {
  let wifeHtml = '';
  let kidsHtml = '';

  // Regex to match "## For My Wife" section
  const wifeRegex = /## For My Wife\b([\s\S]*?)(?=(?:## For My Kids|## |---|$))/i;
  const kidsRegex = /## For My Kids\b([\s\S]*?)(?=(?:## For My Wife|## |---|$))/i;

  const wifeMatch = wifeRegex.exec(rawMarkdown);
  const kidsMatch = kidsRegex.exec(rawMarkdown);

  let cleanMarkdown = rawMarkdown;

  if (wifeMatch) {
    const resolvedWife = resolveRelativeLinks(wifeMatch[1].trim());
    wifeHtml = marked.parse(resolvedWife) as string;
    cleanMarkdown = cleanMarkdown.replace(wifeRegex, '');
  }

  if (kidsMatch) {
    const resolvedKids = resolveRelativeLinks(kidsMatch[1].trim());
    kidsHtml = marked.parse(resolvedKids) as string;
    cleanMarkdown = cleanMarkdown.replace(kidsRegex, '');
  }

  const cleanMarkdownResolved = resolveRelativeLinks(cleanMarkdown);
  const parsed = parseChapter(cleanMarkdownResolved);
  const engineerHtml = renderChapterHtml(parsed);

  // Extract headings for the right sidebar TOC
  const headingPattern = /^##\s+(.+)$/gm;
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
      });
    }
  }
  return sequence;
}
