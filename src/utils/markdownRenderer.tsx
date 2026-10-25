import React from 'react';
import type { SearchSource } from '../types/search';

interface MarkdownRendererProps {
  content: string;
  sources?: SearchSource[];
  onCitationClick?: (citationId: number) => void;
  activeCitationId?: number | null;
  onOpenUrl?: (url: string, title?: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  sources = [],
  onCitationClick,
  activeCitationId,
  onOpenUrl,
}) => {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';

  const renderBoldItalicCode = (rawText: string, baseKey: string | number = ''): React.ReactNode => {
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const pieces = rawText.split(regex);

    return pieces.map((piece, idx) => {
      const key = `${baseKey}-tok-${idx}`;
      if (piece.startsWith('**') && piece.endsWith('**')) {
        return (
          <strong key={key} className="font-bold text-current">
            {piece.slice(2, -2)}
          </strong>
        );
      }
      if (piece.startsWith('*') && piece.endsWith('*') && piece.length > 2) {
        return (
          <em key={key} className="italic text-current opacity-80">
            {piece.slice(1, -1)}
          </em>
        );
      }
      if (piece.startsWith('`') && piece.endsWith('`') && piece.length > 2) {
        return (
          <code
            key={key}
            className="px-1.5 py-0.5 text-xs font-mono bg-black/5 dark:bg-neutral-900 text-current rounded border border-black/10 dark:border-neutral-800"
          >
            {piece.slice(1, -1)}
          </code>
        );
      }
      return <React.Fragment key={key}>{piece}</React.Fragment>;
    });
  };

  const renderInlineFormatted = (text: string, baseKey: string | number = ''): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    // Matches markdown images ![alt](url), links [title](url), or citations [1], [2], [1, 2]
    const tokenRegex = /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)|\[([^\]]+)\]\((https?:\/\/[^\)]+)\)|\[(\d+(?:\s*,\s*\d+)*)\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const preceding = text.substring(lastIndex, match.index);
        parts.push(
          <React.Fragment key={`${baseKey}-pre-${lastIndex}`}>
            {renderBoldItalicCode(preceding, `${baseKey}-pre-${lastIndex}`)}
          </React.Fragment>
        );
      }

      // Check if it's an image ![alt](url)
      if (match[1] !== undefined && match[2]) {
        const imgAlt = match[1] || 'Изображение';
        const imgSrc = match[2];
        parts.push(
          <span key={`${baseKey}-img-${match.index}`} className="block my-3 max-w-lg">
            <span className="block rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-lg bg-black/5 dark:bg-white/5">
              <img
                src={imgSrc}
                alt={imgAlt}
                loading="lazy"
                className="w-full max-h-[460px] object-cover rounded-t-xl"
              />
              <span className="p-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 border-t border-black/5 dark:border-white/5 flex items-center justify-between px-3">
                <span className="truncate">🎨 {imgAlt}</span>
                <a
                  href={imgSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline shrink-0 ml-2"
                >
                  В полном размере ↗
                </a>
              </span>
            </span>
          </span>
        );
      } else if (match[3] && match[4]) {
        // Markdown link [text](url)
        const linkText = match[3];
        const linkUrl = match[4];
        parts.push(
          <a
            key={`${baseKey}-link-${match.index}`}
            href={linkUrl}
            onClick={(e) => {
              if (onOpenUrl) {
                e.preventDefault();
                onOpenUrl(linkUrl, linkText);
              }
            }}
            className="text-blue-600 dark:text-blue-400 font-medium underline underline-offset-2 hover:opacity-85 transition-opacity cursor-pointer"
          >
            {renderBoldItalicCode(linkText, `${baseKey}-lt-${match.index}`)}
          </a>
        );
      } else if (match[5]) {
        // Citation bracket e.g. [1] or [1, 2]
        const citationNums = match[5].split(',').map((n) => parseInt(n.trim(), 10));
        parts.push(
          <span key={`${baseKey}-cite-${match.index}`} className="inline-flex items-center gap-0.5 mx-0.5">
            {citationNums.map((num) => {
              const source = sources.find((s) => s.id === num);
              const isActive = activeCitationId === num;
              return (
                <button
                  key={`${baseKey}-cite-num-${match!.index}-${num}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCitationClick?.(num);
                  }}
                  title={source ? `${source.title} (${source.domain})` : `Источник [${num}]`}
                  className={`inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-md transition-all active:scale-95 ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black ring-2 ring-slate-400 dark:ring-white/50 shadow-md'
                      : 'backdrop-blur-md bg-black/5 dark:bg-white/[0.12] hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black text-slate-700 dark:text-neutral-200 border border-black/10 dark:border-white/20'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </span>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <React.Fragment key={`${baseKey}-post-${lastIndex}`}>
          {renderBoldItalicCode(text.substring(lastIndex), `${baseKey}-post-${lastIndex}`)}
        </React.Fragment>
      );
    }

    return <React.Fragment key={baseKey}>{parts}</React.Fragment>;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        renderedElements.push(
          <div key={`codeblock-${i}`} className="my-3 rounded-xl overflow-hidden border border-black/10 dark:border-neutral-800 bg-slate-950 text-slate-100 shadow-md">
            {codeLanguage && (
              <div className="px-3 py-1 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                {codeLanguage}
              </div>
            )}
            <pre className="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLanguage = '';
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="text-base font-bold text-current mt-5 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {renderInlineFormatted(line.slice(4), `h3-${i}`)}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2 key={`h2-${i}`} className="text-lg font-bold text-current mt-6 mb-2.5 pb-1 border-b border-black/10 dark:border-neutral-800">
          {renderInlineFormatted(line.slice(3), `h2-${i}`)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      renderedElements.push(
        <h1 key={`h1-${i}`} className="text-xl font-extrabold text-current mt-6 mb-3">
          {renderInlineFormatted(line.slice(2), `h1-${i}`)}
        </h1>
      );
      continue;
    }

    // Unordered list
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const trimmed = line.trim();
      const contentText = trimmed.startsWith('* ') ? trimmed.slice(2) : trimmed.slice(2);
      renderedElements.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-current opacity-90 text-sm leading-relaxed my-1">
          {renderInlineFormatted(contentText, `li-${i}`)}
        </li>
      );
      continue;
    }

    // Numbered list
    const numberedMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      renderedElements.push(
        <div key={`numli-${i}`} className="flex items-start gap-2 text-current opacity-90 text-sm leading-relaxed my-1.5">
          <span className="text-xs font-mono font-bold text-current px-1.5 py-0.5 rounded bg-black/5 dark:bg-neutral-900 border border-black/10 dark:border-neutral-750 shrink-0 mt-0.5">
            {numberedMatch[1]}.
          </span>
          <div className="flex-1">{renderInlineFormatted(numberedMatch[2], `numli-${i}`)}</div>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      renderedElements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Regular paragraph
    renderedElements.push(
      <p key={`p-${i}`} className="text-sm text-current opacity-95 leading-relaxed my-2">
        {renderInlineFormatted(line, `p-${i}`)}
      </p>
    );
  }

  return <div className="space-y-1">{renderedElements}</div>;
};
