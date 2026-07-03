import { marked } from 'marked';

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

function splitTopLevelSections(body: string): { heading: string; content: string }[] {
  const headingPattern = /^##\s+(.+)$/gm;
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

export function parseChapter(rawMarkdown: string): ParsedChapter {
  const titleMatch = /^#\s+(.+)$/m.exec(rawMarkdown);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled Chapter';

  const firstH2Index = rawMarkdown.search(/^##\s+/m);
  const header = firstH2Index === -1 ? rawMarkdown : rawMarkdown.slice(0, firstH2Index);
  const body = firstH2Index === -1 ? '' : rawMarkdown.slice(firstH2Index);

  const prereqMatch = /\*\*Prerequisites:\*\*\s*([\s\S]*?)\n\n/.exec(header);
  const vocabMatch = /\*\*New vocabulary introduced:\*\*\s*([\s\S]*?)\n\n/.exec(header);
  const takeawaysMatch = /\*\*Key takeaways:\*\*\s*\n([\s\S]*?)\n\n-{3,}/.exec(header);

  const prerequisitesHtml = marked.parseInline((prereqMatch?.[1] ?? 'None').trim()) as string;
  const vocabulary = (vocabMatch?.[1] ?? '')
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean);
  const keyTakeaways = (takeawaysMatch?.[1] ?? '')
    .split('\n')
    .map((line) => line.replace(/^-\s*/, '').trim())
    .filter(Boolean);

  const sections: Section[] = splitTopLevelSections(body).map(({ heading, content }) => {
    if (/why smart engineers disagree/i.test(heading)) {
      return { kind: 'disagree', heading, html: marked.parse(content) as string };
    }

    const { main, disagree } = extractNestedDisagree(content);
    const rawFields = splitFields(main);

    if (!rawFields) {
      return { kind: 'plain', heading, html: marked.parse(main) as string };
    }

    const fieldsHtml: Partial<Record<FieldLabel, string>> = {};
    const badges: Badge[] = [];
    for (const label of FIELD_LABELS) {
      const raw = rawFields[label];
      if (!raw) continue;
      const { text, badges: found } = extractBadges(raw);
      badges.push(...found);
      fieldsHtml[label] = marked.parse(text) as string;
    }

    return { kind: 'decision', heading, fieldsHtml, badges, disagree };
  });

  return { title, prerequisitesHtml, vocabulary, keyTakeaways, sections };
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
  const vocabChips = parsed.vocabulary.length
    ? parsed.vocabulary.map((term) => `<span class="vocab-chip">${escapeHtml(term)}</span>`).join('')
    : '<span class="vocab-chip vocab-chip--none">None</span>';

  const takeawaysList = parsed.keyTakeaways.map((item) => `<li>${marked.parseInline(item)}</li>`).join('');

  const header = `
    <section class="chapter-meta">
      <div class="meta-card meta-card--prereq">
        <h3>Prerequisites</h3>
        <div>${parsed.prerequisitesHtml}</div>
      </div>
      <div class="meta-card meta-card--vocab">
        <h3>New Vocabulary</h3>
        <div class="vocab-chips">${vocabChips}</div>
      </div>
      <div class="meta-card meta-card--takeaways">
        <h3>Key Takeaways</h3>
        <ul>${takeawaysList}</ul>
      </div>
    </section>`;

  return wrapTablesForScroll(header + parsed.sections.map(renderSection).join('\n'));
}

export function buildEngineerHtml(rawMarkdown: string): string {
  return renderChapterHtml(parseChapter(rawMarkdown));
}
