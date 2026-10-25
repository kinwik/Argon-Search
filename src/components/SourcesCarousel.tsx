import React, { useState } from 'react';
import { ExternalLink, Globe, CheckCircle2, Layers } from 'lucide-react';
import type { SearchSource } from '../types/search';
import { getFaviconUrl } from '../utils/searchHelpers';

interface SourcesCarouselProps {
  sources: SearchSource[];
  activeCitationId: number | null;
  onSelectCitation: (id: number) => void;
  onOpenUrl?: (url: string, title?: string) => void;
}

export const SourcesCarousel: React.FC<SourcesCarouselProps> = ({
  sources,
  activeCitationId,
  onSelectCitation,
  onOpenUrl,
}) => {
  const [filter, setFilter] = useState<'all' | 'official' | 'articles'>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const officialSources = sources.filter((s) => s.isOfficial || s.category === 'official');
  const articleSources = sources.filter((s) => s.category === 'article' || s.domain.includes('wiki'));

  let filteredSources = sources;
  if (filter === 'official' && officialSources.length > 0) {
    filteredSources = officialSources;
  } else if (filter === 'articles' && articleSources.length > 0) {
    filteredSources = articleSources;
  }

  const initialLimit = 8;
  const visibleSources = isExpanded ? filteredSources : filteredSources.slice(0, initialLimit);
  const hasMore = filteredSources.length > initialLimit;

  return (
    <div className="w-full">
      {/* Header Bar with Filter Tabs and Source Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 backdrop-blur-md">
            <Globe className="w-3.5 h-3.5 text-current" />
          </div>
          <span className="text-xs font-bold text-current tracking-wide font-['Plus_Jakarta_Sans']">
            Веб-источники
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-current font-bold">
            {sources.length}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
              filter === 'all'
                ? 'ios-glass-pill-active font-semibold'
                : 'ios-glass-pill text-current opacity-70 hover:opacity-100'
            }`}
          >
            Все ({sources.length})
          </button>

          {officialSources.length > 0 && (
            <button
              type="button"
              onClick={() => setFilter('official')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1 ${
                filter === 'official'
                  ? 'ios-glass-pill-active font-semibold'
                  : 'ios-glass-pill text-current opacity-70 hover:opacity-100'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Официальные ({officialSources.length})</span>
            </button>
          )}

          {articleSources.length > 0 && (
            <button
              type="button"
              onClick={() => setFilter('articles')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                filter === 'articles'
                  ? 'ios-glass-pill-active font-semibold'
                  : 'ios-glass-pill text-current opacity-70 hover:opacity-100'
              }`}
            >
              Статьи ({articleSources.length})
            </button>
          )}
        </div>
      </div>

      {/* Sources Grid with iPhone Frosted Glass aesthetic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {visibleSources.map((source) => {
          const isActive = activeCitationId === source.id;
          const faviconUrl = getFaviconUrl(source.uri);
          const isOfficial = source.isOfficial || source.category === 'official';

          return (
            <a
              key={`src-${source.id}-${source.uri}`}
              href={source.uri}
              onClick={(e) => {
                onSelectCitation(source.id);
                if (onOpenUrl) {
                  e.preventDefault();
                  onOpenUrl(source.uri, source.title);
                }
              }}
              className={`group relative flex flex-col justify-between p-3.5 rounded-2xl transition-all text-left active:scale-[0.98] cursor-pointer ${
                isActive
                  ? 'bg-black/5 dark:bg-white/20 border-2 border-slate-900 dark:border-white ring-2 ring-slate-400/30 dark:ring-white/40 shadow-lg'
                  : 'ios-glass-card hover:border-black/20 dark:hover:border-white/30'
              }`}
            >
              <div>
                {/* Domain & Favicon header */}
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img
                      src={faviconUrl}
                      alt=""
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      className="w-4 h-4 rounded-md shrink-0 bg-black/5 dark:bg-white/10 p-0.5"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-300 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {source.domain}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isOfficial && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Официальный источник" />
                    )}
                    <span className="text-[10px] font-mono font-bold text-current bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 px-1.5 py-0.2 rounded-md backdrop-blur-md">
                      [{source.id}]
                    </span>
                  </div>
                </div>

                {/* Source Title */}
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-slate-950 dark:group-hover:text-neutral-100 transition-colors">
                  {source.title}
                </h4>

                {/* Snippet preview */}
                {source.snippet && (
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300/80 line-clamp-2 mt-1.5 leading-normal">
                    {source.snippet}
                  </p>
                )}
              </div>

              {/* Bottom footer */}
              <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-500 dark:text-neutral-400 group-hover:text-slate-800 dark:group-hover:text-neutral-200">
                <span className="truncate">
                  {isOfficial ? 'Официальный ресурс' : 'Перейти к источнику'}
                </span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </div>
            </a>
          );
        })}
      </div>

      {/* Expand / Collapse Button if more sources exist */}
      {hasMore && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold text-current ios-glass-button active:scale-95 transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-current" />
            <span>
              {isExpanded ? 'Свернуть источники' : `Показать все ${filteredSources.length} источников`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
