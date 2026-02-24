import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

import { Box, Divider, Typography } from '@mui/material';

import { htmlToPlainText, looksLikeHtml, looksLikeRichHtml } from 'src/utils/mou-template';

type Props = {
  content: string;
  variables?: Record<string, string>;
  showPlaceholders?: boolean;
  compact?: boolean;
  sx?: SxProps<Theme>;
};

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'divider' };

const TOKEN_REGEX = /\{\{\s*([^}]+?)\s*\}\}/g;

const parseBlocks = (input: string) => {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let quoteLines: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: paragraph.join('\n').trim() });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: 'list', items: listItems });
      listItems = [];
    }
  };

  const flushQuote = () => {
    if (quoteLines.length) {
      blocks.push({ type: 'quote', text: quoteLines.join('\n').trim() });
      quoteLines = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] });
      return;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push({ type: 'divider' });
      return;
    }

    const listMatch = line.match(/^\s*([-*\u2022])\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      flushQuote();
      listItems.push(listMatch[2]);
      return;
    }

    const quoteMatch = line.match(/^\s*>\s+(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(quoteMatch[1]);
      return;
    }

    paragraph.push(line);
  });

  flushParagraph();
  flushList();
  flushQuote();

  return blocks;
};

const renderInline = (
  text: string,
  variables?: Record<string, string>,
  showPlaceholders?: boolean
) => {
  TOKEN_REGEX.lastIndex = 0;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_REGEX.exec(text))) {
    const start = match.index;
    const end = TOKEN_REGEX.lastIndex;
    const key = match[1].trim();

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    const replacement = variables?.[key];

    if (replacement) {
      nodes.push(
        <Box
          component="span"
          key={`${key}-${start}`}
          sx={{
            px: 0.5,
            py: 0.1,
            borderRadius: 0.75,
            bgcolor: 'rgba(25, 118, 210, 0.08)',
            color: 'primary.main',
            fontWeight: 600,
            fontSize: '0.85em',
            whiteSpace: 'nowrap',
          }}
        >
          {replacement}
        </Box>
      );
    } else if (showPlaceholders) {
      nodes.push(
        <Box
          component="span"
          key={`${key}-${start}`}
          sx={{
            px: 0.5,
            py: 0.1,
            borderRadius: 0.75,
            border: '1px dashed',
            borderColor: 'primary.main',
            color: 'primary.main',
            fontWeight: 600,
            fontSize: '0.75em',
            whiteSpace: 'nowrap',
          }}
        >
          {key}
        </Box>
      );
    } else {
      nodes.push(match[0]);
    }

    lastIndex = end;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};

export default function MouTemplateRenderer({
  content,
  variables,
  showPlaceholders = false,
  compact = false,
  sx,
}: Props) {
  const safeContent = content || '';

  if (looksLikeRichHtml(safeContent)) {
    return (
      <Box
        sx={{ lineHeight: 1.7, fontSize: compact ? 13 : 14, ...sx }}
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    );
  }

  const normalized = looksLikeHtml(safeContent) ? htmlToPlainText(safeContent) : safeContent;
  const blocks = parseBlocks(normalized);

  return (
    <Box sx={{ lineHeight: 1.7, fontSize: compact ? 13 : 14, ...sx }}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const variant =
              block.level === 1 ? 'h6' : block.level === 2 ? 'subtitle1' : 'subtitle2';

            return (
              <Typography
                key={`heading-${index}`}
                variant={variant}
                sx={{ mt: index === 0 ? 0 : 2, fontWeight: 700 }}
              >
                {renderInline(block.text, variables, showPlaceholders)}
              </Typography>
            );
          }
          case 'list':
            return (
              <Box
                key={`list-${index}`}
                component="ul"
                sx={{
                  pl: 3,
                  my: 1.5,
                  '& li': { mb: 0.75 },
                }}
              >
                {block.items.map((item, itemIndex) => (
                  <Box component="li" key={`list-${index}-${itemIndex}`}>
                    <Typography variant={compact ? 'body2' : 'body1'}>
                      {renderInline(item, variables, showPlaceholders)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          case 'quote':
            return (
              <Box
                key={`quote-${index}`}
                sx={{
                  borderLeft: '3px solid',
                  borderColor: 'divider',
                  pl: 2,
                  my: 1.5,
                  color: 'text.secondary',
                }}
              >
                <Typography variant={compact ? 'body2' : 'body1'} sx={{ whiteSpace: 'pre-line' }}>
                  {renderInline(block.text, variables, showPlaceholders)}
                </Typography>
              </Box>
            );
          case 'divider':
            return <Divider key={`divider-${index}`} sx={{ my: 2 }} />;
          case 'paragraph':
          default:
            return (
              <Typography
                key={`paragraph-${index}`}
                variant={compact ? 'body2' : 'body1'}
                sx={{ mt: index === 0 ? 0 : 1.5, whiteSpace: 'pre-line' }}
              >
                {renderInline(block.text, variables, showPlaceholders)}
              </Typography>
            );
        }
      })}
    </Box>
  );
}
