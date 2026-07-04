import { marked } from 'marked';

/**
 * Pre-process GitHub-style alert blockquotes (> [!NOTE] ...) into callout divs
 * before marked sees them, since marked v13 changed the renderer API in a way
 * that makes recursive token parsing inside a blockquote renderer unreliable.
 *
 * Transforms:
 *   > [!NOTE]
 *   > Some text here.
 *
 * Into:
 *   <div class="callout callout--note" role="note">
 *   <span class="callout__label">Note</span>
 *   <p>Some text here.</p>
 *   </div>
 */
const ALERT_LABELS: Record<string, string> = {
  NOTE: 'Note',
  TIP: 'Tip',
  IMPORTANT: 'Important',
  WARNING: 'Warning',
  CAUTION: 'Caution',
};

export function preprocessAlerts(markdown: string): string {
  // Normalize line endings so the regex works on Windows-checkout files (\r\n).
  const md = markdown.replace(/\r\n/g, '\n');
  // Match a blockquote that starts with [!TYPE] on the first line.
  // The blockquote may span multiple consecutive "> " lines.
  return md.replace(
    /^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n((?:> ?[^\n]*\n?)*)/gim,
    (_match, type: string, body: string) => {
      const label = ALERT_LABELS[type.toUpperCase()] ?? type;
      // Strip leading "> " from each continuation line and trim.
      const text = body
        .split('\n')
        .map((line) => line.replace(/^> ?/, ''))
        .join('\n')
        .trim();
      return `<div class="callout callout--${type.toLowerCase()}" role="note">\n<span class="callout__label">${label}</span>\n\n${text}\n\n</div>\n\n`;
    }
  );
}



const FIELD_LABELS = [
  'What it is',
  'Why it exists',
  'Options',
  'Trade-offs',
  'When to choose each',
  'Common failure modes',
  'Example',
] as const;

type FieldLabel = (typeof FIELD_LABELS)[number];

type RecommendationKind = 'Consensus' | 'Strong Recommendation' | 'Legitimate Trade-off';

interface Badge {
  kind: RecommendationKind;
  detail: string;
}

interface PlainSection {
  kind: 'plain';
  heading: string;
  html: string;
}

interface DecisionSection {
  kind: 'decision';
  heading: string;
  fieldsHtml: Partial<Record<FieldLabel, string>>;
  badges: Badge[];
  disagree: { heading: string; html: string } | null;
}

interface DisagreeSection {
  kind: 'disagree';
  heading: string;
  html: string;
}

type Section = PlainSection | DecisionSection | DisagreeSection;

export interface ParsedChapter {
  title: string;
  subtitle: string;
  thesis: string;
  prerequisitesHtml: string;
  vocabulary: string[];
  keyTakeaways: string[];
  sections: Section[];
}

const BADGE_PATTERN =
  /\*\*\[(Consensus|Strong Recommendation|Legitimate Trade-off)(?::\s*([^\]]*))?\]\*\*/g;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractBadges(raw: string): { text: string; badges: Badge[] } {
  const badges: Badge[] = [];
  const text = raw.replace(BADGE_PATTERN, (_match, kind: RecommendationKind, detail?: string) => {
    badges.push({ kind, detail: (detail ?? '').trim() });
    return '';
  });
  return { text: text.trim(), badges };
}

function splitFields(body: string): Partial<Record<FieldLabel, string>> | null {
  const pattern = new RegExp(`\\*\\*(${FIELD_LABELS.join('|')}):\\*\\*`, 'g');
  const matches = [...body.matchAll(pattern)];
  if (matches.length === 0) return null;

  const fields: Partial<Record<FieldLabel, string>> = {};
  for (let i = 0; i < matches.length; i++) {
    const label = matches[i][1] as FieldLabel;
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : body.length;
    fields[label] = body.slice(start, end).trim();
  }
  return fields;
}

function stripTrailingRule(text: string): string {
  return text.replace(/\n?-{3,}\s*$/, '').trim();
}

function splitTopLevelSections(body: string, level: 2 | 3 = 2): { heading: string; content: string }[] {
  const prefix = '#'.repeat(level);
  const headingPattern = new RegExp(`^${prefix}\\s+(.+)$`, 'gm');
  const matches = [...body.matchAll(headingPattern)];
  const sections: { heading: string; content: string }[] = [];

  for (let i = 0; i < matches.length; i++) {
    const heading = matches[i][1].trim();
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : body.length;
    sections.push({ heading, content: stripTrailingRule(body.slice(start, end)) });
  }

  return sections;
}

function extractNestedDisagree(content: string): { main: string; disagree: { heading: string; html: string } | null } {
  const h3Pattern = /^###\s+(.+)$/m;
  const match = h3Pattern.exec(content);
  if (!match || !/disagree/i.test(match[1])) {
    return { main: content, disagree: null };
  }

  const main = content.slice(0, match.index).trim();
  const rest = content.slice(match.index! + match[0].length).trim();
  return {
    main,
    disagree: { heading: match[1].trim(), html: marked.parse(rest) as string },
  };
}

/**
 * Chapters open with "# Title", then optionally a one-line italic subtitle and a
 * short thesis paragraph, before the "**Prerequisites:**" metadata block begins.
 */
function extractSubtitleAndThesis(header: string): { subtitle: string; thesis: string } {
  const match = /^\s*\*([^\n*]+)\*\s*\n\n([\s\S]*?)\n\n\*\*Prerequisites:\*\*/.exec(header);
  if (!match) return { subtitle: '', thesis: '' };
  return { subtitle: match[1].trim(), thesis: match[2].trim() };
}

export function parseChapter(rawMarkdown: string): ParsedChapter {
  // Windows checkouts convert the repo's LF line endings to CRLF; the blank-line
  // ("\n\n") delimiters below assume LF, so normalize before parsing.
  const rawMarkdownLf = rawMarkdown.replace(/\r\n/g, '\n');

  const titleMatch = /^#\s+(.+)$/m.exec(rawMarkdownLf);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled Chapter';

  // Detect which heading level is used for content sections in this chapter.
  // Chapters 1-26 use ## (level 2); chapters 27+ shifted to ### (level 3).
  // After splitChapterTracks() strips "## For My Wife" / "## For My Kids", the
  // first remaining ^#{2,3} heading marks where the header block ends and the
  // content body begins.
  const firstSectionMatch = /^(#{2,3})\s+/m.exec(rawMarkdownLf);
  const sectionLevel = firstSectionMatch ? (firstSectionMatch[1].length as 2 | 3) : 2;
  const firstSectionIndex = firstSectionMatch ? firstSectionMatch.index! : -1;

  const header = firstSectionIndex === -1 ? rawMarkdownLf : rawMarkdownLf.slice(0, firstSectionIndex);
  const body = firstSectionIndex === -1 ? '' : rawMarkdownLf.slice(firstSectionIndex);

  const headerAfterTitle = titleMatch ? header.slice(titleMatch.index! + titleMatch[0].length) : header;
  const { subtitle, thesis } = extractSubtitleAndThesis(headerAfterTitle);

  const prereqMatch = /\*\*Prerequisites:\*\*\s*([\s\S]*?)\n\n/.exec(header);
  const vocabMatch = /\*\*New vocabulary introduced:\*\*\s*([\s\S]*?)\n\n/.exec(header);
  const takeawaysMatch = /\*\*Key takeaways:\*\*\s*\n([\s\S]*?)\n\n-{3,}/.exec(header);

  const prereqRaw = (prereqMatch?.[1] ?? '').trim();
  // "None" (the entry-point chapter's convention for "no prerequisites") means the
  // card should be omitted entirely rather than rendered with that literal text.
  const prerequisitesHtml = prereqRaw && !/^none\b/i.test(prereqRaw) ? (marked.parseInline(prereqRaw) as string) : '';
  const vocabulary = (vocabMatch?.[1] ?? '')
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean);
  const keyTakeaways = (takeawaysMatch?.[1] ?? '')
    .split('\n')
    .map((line) => line.replace(/^-\s*/, '').trim())
    .filter(Boolean);

  const sections: Section[] = splitTopLevelSections(body, sectionLevel).map(({ heading, content }) => {
    if (/why smart engineers disagree/i.test(heading)) {
      return { kind: 'disagree', heading, html: marked.parse(preprocessAlerts(content)) as string };
    }

    // For level-3 chapters, nested disagree would be ####; no current content uses
    // that convention so extractNestedDisagree (hardcoded to ###) is effectively a
    // no-op for those chapters — correct behavior.
    const { main, disagree } = extractNestedDisagree(content);
    const rawFields = splitFields(main);

    if (!rawFields) {
      return { kind: 'plain', heading, html: marked.parse(preprocessAlerts(main)) as string };
    }

    const fieldsHtml: Partial<Record<FieldLabel, string>> = {};
    const badges: Badge[] = [];
    for (const label of FIELD_LABELS) {
      const raw = rawFields[label];
      if (!raw) continue;
      const { text, badges: found } = extractBadges(raw);
      badges.push(...found);
      fieldsHtml[label] = marked.parse(preprocessAlerts(text)) as string;
    }

    return { kind: 'decision', heading, fieldsHtml, badges, disagree };
  });

  return { title, subtitle, thesis, prerequisitesHtml, vocabulary, keyTakeaways, sections };
}

const BADGE_CLASS: Record<RecommendationKind, string> = {
  Consensus: 'rec-badge--consensus',
  'Strong Recommendation': 'rec-badge--strong',
  'Legitimate Trade-off': 'rec-badge--tradeoff',
};

function renderBadge(badge: Badge): string {
  const detail = badge.detail ? `: ${escapeHtml(badge.detail)}` : '';
  return `<span class="rec-badge ${BADGE_CLASS[badge.kind]}">${badge.kind}${detail}</span>`;
}

function renderField(label: FieldLabel, html: string | undefined): string {
  if (!html) return '';
  const slug = label.toLowerCase().replace(/[^a-z]+/g, '-');
  return `
    <div class="decision-field decision-field--${slug}">
      <h4>${label}</h4>
      ${html}
    </div>`;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function renderSection(section: Section): string {
  const slug = slugify(section.heading);
  if (section.kind === 'plain') {
    return `
      <section class="chapter-section" id="${slug}">
        <h2>${escapeHtml(section.heading)}</h2>
        ${section.html}
      </section>`;
  }

  if (section.kind === 'disagree') {
    return `
      <section class="disagree-block" id="${slug}">
        <h2>${escapeHtml(section.heading)}</h2>
        ${section.html}
      </section>`;
  }

  const { heading, fieldsHtml, badges, disagree } = section;
  return `
    <section class="decision-block" id="${slug}">
      <h2 class="decision-heading">${escapeHtml(heading)}</h2>
      <div class="decision-lede">
        ${renderField('What it is', fieldsHtml['What it is'])}
        ${renderField('Why it exists', fieldsHtml['Why it exists'])}
      </div>
      ${renderField('Options', fieldsHtml['Options'])}
      ${renderField('Trade-offs', fieldsHtml['Trade-offs'])}
      ${renderField('When to choose each', fieldsHtml['When to choose each'])}
      ${renderField('Common failure modes', fieldsHtml['Common failure modes'])}
      ${renderField('Example', fieldsHtml['Example'])}
      ${badges.length ? `<div class="rec-badges">${badges.map(renderBadge).join('')}</div>` : ''}
      ${
        disagree
          ? `<div class="disagree-callout">
               <h4>${escapeHtml(disagree.heading)}</h4>
               ${disagree.html}
             </div>`
          : ''
      }
    </section>`;
}

/**
 * Comparison tables (Trade-offs sections especially) have more columns than a
 * ~350px pane can fit without shrinking cells below readability. Give each
 * table its own horizontal scroll instead of letting it blow out the pane.
 */
function wrapTablesForScroll(html: string): string {
  return html.replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, '</table></div>');
}

export function renderChapterHtml(parsed: ParsedChapter): string {
  const hasPrerequisites = parsed.prerequisitesHtml.length > 0;
  const hasVocabulary = parsed.vocabulary.length > 0;
  const hasTakeaways = parsed.keyTakeaways.length > 0;

  const vocabChips = parsed.vocabulary.map((term) => `<span class="vocab-chip">${escapeHtml(term)}</span>`).join('');
  const takeawaysList = parsed.keyTakeaways.map((item) => `<li>${marked.parseInline(item)}</li>`).join('');

  const metaCards = [
    hasPrerequisites &&
      `<div class="meta-card meta-card--prereq">
        <h3>Prerequisites</h3>
        <div>${parsed.prerequisitesHtml}</div>
      </div>`,
    hasVocabulary &&
      `<div class="meta-card meta-card--vocab">
        <h3>New Vocabulary</h3>
        <div class="vocab-chips">${vocabChips}</div>
      </div>`,
    hasTakeaways &&
      `<div class="meta-card meta-card--takeaways">
        <h3>Key Takeaways</h3>
        <ul>${takeawaysList}</ul>
      </div>`,
  ]
    .filter(Boolean)
    .join('');

  const header = metaCards ? `<section class="chapter-meta">${metaCards}</section>` : '';

  return wrapTablesForScroll(header + parsed.sections.map(renderSection).join('\n'));
}
