/* eslint-disable no-useless-escape */
import type { MOU } from 'src/types/mou';

import { fDate } from './format-time';

type TemplateVariable = {
  key: string;
  label: string;
  example: string;
};

export const MOU_TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: 'MOU_DATE', label: 'MOU Date', example: fDate(new Date()) },
  { key: 'ORGANISER_NAME', label: 'Organiser Name', example: 'Example College' },
  { key: 'ORGANISER_EMAIL', label: 'Organiser Email', example: 'organiser@example.com' },
  { key: 'MOU_NUMBER', label: 'MOU Number', example: 'MOU-0001' },
  { key: 'SIGNED_AT', label: 'Signed Date', example: fDate(new Date()) },
];

export const looksLikeHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);
export const looksLikeRichHtml = (value: string) => /<\/?(?!br\b)[a-z][\s\S]*>/i.test(value);

export const htmlToPlainText = (value: string) => {
  if (!value) return '';
  if (!looksLikeHtml(value)) return value;

  const normalized = value
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '- ')
    .replace(/<\/li>/gi, '\n');

  if (typeof document === 'undefined') {
    return normalized
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  const container = document.createElement('div');
  container.innerHTML = normalized;

  return (container.textContent || '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const plainTextToHtml = (value: string) => {
  if (!value) return '';

  const escaped = value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped.replace(/\r?\n/g, '<br />');
};

const findTermsStartIndex = (lines: string[]) =>
  lines.findIndex((line) => {
    const normalized = line
      .replace(/^#+\s*/, '')
      .replace(/^\d+[\).]?\s*/, '')
      .trim();

    return /terms\s*(?:&|and)\s*conditions?/i.test(normalized);
  });

const isNumberedHeading = (line: string) => {
  const match = line.match(/^\d+[\).]\s+(.*)$/);
  if (!match) return false;
  const title = match[1].trim();
  const wordCount = title ? title.split(/\s+/).length : 0;

  if (wordCount <= 3) return true;
  if (wordCount <= 5 && !/[.!?]$/.test(title)) return true;
  return false;
};

const isSectionHeading = (line: string) =>
  /^#{1,6}\s+/.test(line) || isNumberedHeading(line);

const cleanClause = (value: string) => value.replace(/\s+/g, ' ').trim();

export const extractClauses = (text: string) => {
  if (!text) return [];

  const markerClauses = (text.match(/\[\[(.*?)\]\]/gs) || []).map((c) =>
    c.replace('[[', '').replace(']]', '').trim()
  );

  if (markerClauses.length) {
    return markerClauses.filter(Boolean);
  }

  const plain = htmlToPlainText(text);
  const lines = plain.replace(/\r\n/g, '\n').split('\n');
  const startIndex = findTermsStartIndex(lines);

  if (startIndex === -1) return [];

  const clauses: string[] = [];
  let lastWasBullet = false;

  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const raw = lines[i];
    const trimmed = raw.trim();
    const hasIndent = raw.length > raw.trimStart().length;

    if (!trimmed) {
      continue;
    }

    if (isSectionHeading(trimmed)) {
      if (clauses.length) break;
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*\u2022]\s+(.*)$/);
    if (bulletMatch) {
      const clause = cleanClause(bulletMatch[1]);
      if (clause) clauses.push(clause);
      lastWasBullet = true;
      continue;
    }

    const numberedMatch = trimmed.match(/^\d+[\).]\s+(.*)$/);
    if (numberedMatch && !isNumberedHeading(trimmed)) {
      const clause = cleanClause(numberedMatch[1]);
      if (clause) clauses.push(clause);
      lastWasBullet = false;
      continue;
    }

    if (hasIndent && lastWasBullet && clauses.length) {
      clauses[clauses.length - 1] = cleanClause(`${clauses[clauses.length - 1]} ${trimmed}`);
      continue;
    }

    clauses.push(cleanClause(trimmed));
    lastWasBullet = false;
  }

  return clauses;
};

export const stripClauseMarkers = (text: string) => text.replace(/\[\[|\]\]/g, '');

export const buildMouVariableMap = (mou?: MOU): Record<string, string> => {
  const defaults = Object.fromEntries(
    MOU_TEMPLATE_VARIABLES.map((variable) => [variable.key, variable.example])
  );

  if (!mou) {
    return defaults;
  }

  return {
    ...defaults,
    MOU_DATE: mou.createdAt ? fDate(mou.createdAt) : defaults.MOU_DATE,
    ORGANISER_NAME: mou.organization?.name || defaults.ORGANISER_NAME,
    ORGANISER_EMAIL: mou.organization?.email || defaults.ORGANISER_EMAIL,
    MOU_NUMBER: mou.mouNumber || defaults.MOU_NUMBER,
    SIGNED_AT: mou.signedAt ? fDate(mou.signedAt) : defaults.SIGNED_AT,
  };
};
