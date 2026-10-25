import React from 'react';
import { Sparkles, Clock } from 'lucide-react';
import type { SearchMode } from '../types/search';

interface HeaderProps {
  currentMode: SearchMode;
  onSelectMode: (mode: SearchMode) => void;
  onNewSearch: () => void;
  onOpenHistory: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onNewSearch,
  onOpenHistory,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-black/90 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={onNewSearch}
          className="flex items-center gap-2.5 text-left group transition-transform focus:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center shadow-sm">
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              Ar
            </span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-['Plus_Jakarta_Sans'] group-hover:text-neutral-300 transition-colors">
            Argon Search
          </span>
        </button>

        {/* Zone 2: 4 single-line clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={() => onSelectMode('overview')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentMode === 'overview' ? 'text-white font-semibold' : ''
            }`}
          >
            AI Обзор
          </button>
          <button
            onClick={() => onSelectMode('fast')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentMode === 'fast' ? 'text-white font-semibold' : ''
            }`}
          >
            Быстрый ответ
          </button>
          <button
            onClick={() => onSelectMode('deep')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentMode === 'deep' ? 'text-white font-semibold' : ''
            }`}
          >
            Глубокий анализ
          </button>
          <button
            onClick={() => onSelectMode('news')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentMode === 'news' ? 'text-white font-semibold' : ''
            }`}
          >
            Свежие новости
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:ring-1 focus-visible:ring-white"
            aria-label="История и закладки"
          >
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">История</span>
            {savedCount > 0 && (
              <span className="text-[11px] font-mono font-bold text-black bg-white px-1.5 py-0.2 rounded">
                {savedCount}
              </span>
            )}
          </button>
          <button
            onClick={onNewSearch}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 focus-visible:ring-1 focus-visible:ring-white"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>Новый поиск</span>
          </button>
        </div>
      </div>
    </header>
  );
};
