import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Zap,
  BookOpen,
  Newspaper,
  Calendar,
  X,
  ArrowRight,
  Mic,
  MicOff,
} from 'lucide-react';
import type { SearchMode, TimeFilter, AppTheme } from '../types/search';

interface SearchBarProps {
  query: string;
  onChangeQuery: (q: string) => void;
  onSubmit: (customQuery?: string) => void;
  isLoading: boolean;
  mode: SearchMode;
  onChangeMode: (m: SearchMode) => void;
  timeFilter: TimeFilter;
  onChangeTimeFilter: (t: TimeFilter) => void;
  compact?: boolean;
  theme?: AppTheme;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChangeQuery,
  onSubmit,
  isLoading,
  mode,
  onChangeMode,
  timeFilter,
  onChangeTimeFilter,
  compact = false,
  theme = 'dark',
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState<number>(-1);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement !== inputRef.current &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query.trim() }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.suggestions)) {
            setSuggestions(data.suggestions);
          }
        }
      } catch {}
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const toggleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Голосовой ввод не поддерживается вашим браузером.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onChangeQuery(transcript);
          onSubmit(transcript);
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setActiveSuggestionIdx(-1);
        return;
      }
      if (e.key === 'Enter' && activeSuggestionIdx >= 0) {
        e.preventDefault();
        const selected = suggestions[activeSuggestionIdx];
        if (selected) {
          onChangeQuery(selected);
          setShowSuggestions(false);
          onSubmit(selected);
          return;
        }
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestions(false);
      onSubmit();
    }
  };

  const modeOptions: { id: SearchMode; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'AI Обзор', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'fast', label: 'Быстрый', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'deep', label: 'Анализ', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'news', label: 'Новости', icon: <Newspaper className="w-3.5 h-3.5" /> },
  ];

  const timeOptions: { id: TimeFilter; label: string }[] = [
    { id: 'all', label: 'Все время' },
    { id: 'day', label: '24 ч' },
    { id: 'week', label: 'Неделя' },
    { id: 'month', label: 'Месяц' },
  ];

  return (
    <div className={`w-full max-w-3xl mx-auto relative ${compact ? '' : 'transition-all'}`}>
      {/* Outer iOS Liquid Glass Container */}
      <div
        className={`relative rounded-3xl ios-glass-card transition-all ${
          compact ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
        }`}
      >
        {/* Specular top glare line */}
        <div className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent ${
          isLight ? 'via-slate-400/30' : 'via-white/50'
        } to-transparent pointer-events-none`} />

        {/* Search Input Row */}
        <div className="relative flex items-center">
          <div className="pl-3 pr-2 opacity-70">
            <Search className="w-4 h-4 text-current" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              onChangeQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              compact
                ? 'Новый поиск или уточнение вопроса...'
                : 'Введите запрос (например: YouTube, ITER, телескоп Джеймс Уэбб)...'
            }
            className={`w-full bg-transparent text-current ${
              isLight ? 'placeholder-slate-400' : 'placeholder-neutral-400'
            } text-sm sm:text-base px-2 py-2 focus:outline-none tracking-normal font-medium`}
            disabled={isLoading}
          />

          {/* Quick Action Icons: Clear, Voice Search, Submit */}
          <div className="flex items-center gap-1.5 pr-1.5 shrink-0">
            {query && (
              <button
                type="button"
                onClick={() => {
                  onChangeQuery('');
                  inputRef.current?.focus();
                }}
                className={`p-1.5 rounded-full transition-colors ${
                  isLight
                    ? 'text-slate-400 hover:text-slate-800 hover:bg-black/5'
                    : 'text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
                title="Очистить"
                aria-label="Очистить запрос"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={toggleVoiceSearch}
              className={`p-2 rounded-2xl transition-all active:scale-95 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-black/5'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
              title={isListening ? 'Идет запись...' : 'Голосовой поиск'}
              aria-label="Голосовой поиск"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSuggestions(false);
                onSubmit();
              }}
              disabled={isLoading || !query.trim()}
              className={`p-2.5 rounded-2xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md ${
                isLight
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
              title="Искать"
              aria-label="Выполнить поиск"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills Shelf */}
        <div className={`mt-2.5 pt-2.5 border-t ${
          isLight ? 'border-black/10' : 'border-white/10'
        } flex flex-wrap items-center justify-between gap-2`}>
          {/* Mode Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar max-w-full">
            {modeOptions.map((opt) => {
              const isActive = mode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeMode(opt.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-medium transition-all active:scale-95 whitespace-nowrap ${
                    isActive
                      ? 'ios-glass-pill-active font-semibold'
                      : isLight
                      ? 'ios-glass-pill text-slate-600 hover:text-slate-900'
                      : 'ios-glass-pill text-neutral-300 hover:text-white'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Time Filters */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
            <span className={`text-[10px] mr-1 flex items-center gap-1 font-mono ${
              isLight ? 'text-slate-400' : 'text-neutral-400'
            }`}>
              <Calendar className="w-3 h-3" />
            </span>
            {timeOptions.map((opt) => {
              const isActive = timeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeTimeFilter(opt.id)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-mono transition-all active:scale-95 whitespace-nowrap ${
                    isActive
                      ? isLight
                        ? 'bg-slate-900 text-white border border-slate-900 font-bold'
                        : 'bg-white/20 text-white border border-white/30 font-bold'
                      : isLight
                      ? 'text-slate-500 hover:text-slate-900 hover:bg-black/5'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Auto-complete Suggestions Dropdown in iOS Frosted Glass */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 left-0 right-0 mt-2 rounded-2xl ios-glass-card p-1.5 overflow-hidden border ${
            isLight
              ? 'border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.12)]'
              : 'border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.8)]'
          }`}
        >
          {suggestions.map((item, idx) => (
            <button
              key={`sug-${idx}`}
              type="button"
              onClick={() => {
                onChangeQuery(item);
                setShowSuggestions(false);
                onSubmit(item);
              }}
              onMouseEnter={() => setActiveSuggestionIdx(idx)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-between transition-colors ${
                activeSuggestionIdx === idx
                  ? isLight
                    ? 'bg-black/[0.07] text-slate-950 font-semibold'
                    : 'bg-white/20 text-white font-medium'
                  : isLight
                  ? 'text-slate-800 hover:bg-black/[0.04]'
                  : 'text-neutral-200 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Search className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-slate-400' : 'text-neutral-400'}`} />
                <span className="truncate">{item}</span>
              </div>
              <ArrowRight className={`w-3 h-3 opacity-60 ${isLight ? 'text-slate-400' : 'text-neutral-400'}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
