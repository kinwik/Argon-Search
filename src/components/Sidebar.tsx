import React from 'react';
import {
  Sparkles,
  Zap,
  BookOpen,
  Newspaper,
  Plus,
  X,
  Globe,
  Search as SearchIcon,
  Bookmark,
  Trash2,
  Settings,
  Moon,
  Sun,
  LayoutGrid,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { ArgonLogo } from './ArgonLogo';
import type { SearchMode, SearchHistoryItem, BrowserTab, AppTheme } from '../types/search';
import { getFaviconUrl } from '../utils/searchHelpers';

interface SidebarProps {
  currentMode: SearchMode;
  onSelectMode: (mode: SearchMode) => void;
  searchHistory: SearchHistoryItem[];
  onSelectQuery: (query: string) => void;
  onRemoveHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  // Real browser tabs props
  browserTabs: BrowserTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onNewTab: () => void;
  onCloseTab: (tabId: string) => void;
  // Settings & Theme
  theme: AppTheme;
  onOpenSettings: () => void;
  // Mobile drawer controls
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const searchModes: { id: SearchMode; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'AI Обзор', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'fast', label: 'Быстрый ответ', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'deep', label: 'Глубокий анализ', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'news', label: 'Новости', icon: <Newspaper className="w-3.5 h-3.5" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onSelectMode,
  searchHistory,
  onSelectQuery,
  onRemoveHistoryItem,
  browserTabs,
  activeTabId,
  onSelectTab,
  onNewTab,
  onCloseTab,
  theme,
  onOpenSettings,
  isOpenMobile,
  onCloseMobile,
}) => {
  const bookmarks = searchHistory.filter((h) => h.bookmarked);
  const isLight = theme === 'light';

  const content = (
    <div className="flex flex-col h-full justify-between select-none p-3.5 sm:p-4 overflow-y-auto">
      <div className="space-y-5">
        {/* Brand Lockup: Clean Minimalist iOS wordmark with ArgonLogo */}
        <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-black/10' : 'border-white/10'}`}>
          <button
            onClick={() => {
              onNewTab();
              onCloseMobile();
            }}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
            title="Открыть новую вкладку поиска"
          >
            <ArgonLogo size={26} theme={theme} className="transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className={`font-semibold text-sm tracking-tight font-['Plus_Jakarta_Sans'] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Argon Search
              </span>
              <span className={`text-[10px] font-mono -mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                Браузер с AI
              </span>
            </div>
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-xl ios-glass-button"
            aria-label="Закрыть меню"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. REAL BROWSER TABS (Вкладки слева как в браузерах) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className={`text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              <LayoutGrid className="w-3.5 h-3.5 text-current" />
              <span>Вкладки</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                isLight ? 'bg-black/10 text-slate-800' : 'bg-white/10 text-white'
              }`}>
                {browserTabs.length}
              </span>
            </span>

            <button
              onClick={() => {
                onNewTab();
                onCloseMobile();
              }}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-xl ios-glass-button active:scale-95 transition-all"
              title="Открыть новую вкладку"
            >
              <Plus className="w-3 h-3" />
              <span>Вкладка</span>
            </button>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
            {browserTabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              let tabDomain = tab.result?.directWebsite?.domain || tab.result?.sources?.[0]?.domain;
              if (!tabDomain && tab.url) {
                try {
                  tabDomain = new URL(tab.url).hostname.replace(/^www\./, '');
                } catch {
                  tabDomain = tab.url;
                }
              }
              const favicon = tabDomain ? getFaviconUrl(tabDomain) : null;

              return (
                <div
                  key={tab.id}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer border ${
                    isActive
                      ? isLight
                        ? 'bg-black/[0.08] border-black/15 text-slate-900 font-semibold shadow-sm'
                        : 'bg-white/20 border-white/30 text-white font-semibold shadow-md backdrop-blur-xl'
                      : isLight
                      ? 'border-transparent text-slate-600 hover:text-slate-950 hover:bg-black/[0.04]'
                      : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                  onClick={() => {
                    onSelectTab(tab.id);
                    onCloseMobile();
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                    {favicon ? (
                      <img
                        src={favicon}
                        alt=""
                        className="w-3.5 h-3.5 rounded object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : tab.viewType === 'web' ? (
                      <Globe className="w-3.5 h-3.5 shrink-0 opacity-70 text-blue-400" />
                    ) : tab.query ? (
                      <Globe className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    ) : (
                      <SearchIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    )}

                    <span className="truncate text-xs font-medium">
                      {tab.title || (tab.viewType === 'web' ? 'Веб-страница' : 'Новая вкладка')}
                    </span>
                  </div>

                  {/* Close Tab Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className={`p-1 rounded-md transition-all shrink-0 ${
                      isActive
                        ? isLight
                          ? 'opacity-70 hover:opacity-100 hover:bg-black/10'
                          : 'opacity-80 hover:opacity-100 hover:bg-black/20'
                        : isLight
                        ? 'opacity-0 group-hover:opacity-100 hover:bg-black/10'
                        : 'opacity-0 group-hover:opacity-100 hover:bg-white/20'
                    }`}
                    title="Закрыть вкладку"
                    aria-label={`Закрыть вкладку ${tab.title}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. SEARCH MODES (Режимы поиска) */}
        <div>
          <span className={`block text-[10px] font-mono font-semibold uppercase tracking-wider mb-2 px-1 ${
            isLight ? 'text-slate-500' : 'text-neutral-400'
          }`}>
            Режим анализа
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {searchModes.map((sm) => {
              const isActive = currentMode === sm.id;
              return (
                <button
                  key={sm.id}
                  onClick={() => {
                    onSelectMode(sm.id);
                    onCloseMobile();
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-medium transition-all text-left active:scale-[0.98] border ${
                    isActive
                      ? isLight
                        ? 'bg-black/[0.08] border-black/15 text-slate-900 font-semibold shadow-sm'
                        : 'bg-white/20 border-white/30 text-white font-semibold shadow-sm backdrop-blur-xl'
                      : isLight
                      ? 'border-transparent text-slate-600 hover:text-slate-950 hover:bg-black/[0.04]'
                      : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <span className={isActive ? (isLight ? 'text-slate-900' : 'text-white') : (isLight ? 'text-slate-500' : 'text-neutral-400')}>
                    {sm.icon}
                  </span>
                  <span className="truncate">{sm.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. BOOKMARKS */}
        {bookmarks.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-slate-500' : 'text-neutral-400'
              }`}>
                <Bookmark className="w-3 h-3 text-current" />
                <span>Закладки</span>
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                isLight ? 'bg-black/10 text-slate-800' : 'bg-white/10 text-white'
              }`}>
                {bookmarks.length}
              </span>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto pr-0.5">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs ios-glass-card transition-all ${
                    isLight ? 'hover:bg-black/[0.04] text-slate-800' : 'hover:bg-white/[0.12] text-neutral-200'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectQuery(bm.query);
                      onCloseMobile();
                    }}
                    className="truncate text-left flex-1 pr-2 font-medium"
                    title={bm.query}
                  >
                    {bm.query}
                  </button>
                  <button
                    onClick={() => onRemoveHistoryItem(bm.id)}
                    className={`opacity-0 group-hover:opacity-100 p-1 transition-opacity shrink-0 ${
                      isLight ? 'text-slate-400 hover:text-slate-900' : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Удалить из закладок"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. SETTINGS & FOOTER CONTROLS */}
      <div className={`pt-3 border-t space-y-2 ${isLight ? 'border-black/10' : 'border-white/10'}`}>
        <button
          onClick={() => {
            onOpenSettings();
            onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold ios-glass-button active:scale-95 transition-all shadow-sm ${
            isLight ? 'hover:bg-black/[0.06] text-slate-800' : 'hover:bg-white/20 text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-current" />
            <span>Настройки</span>
          </span>
          <span className={`flex items-center gap-1.5 text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
            {theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-neutral-300" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>{theme === 'dark' ? 'Тёмная' : 'Светлая'}</span>
          </span>
        </button>

        <div className={`px-1 text-[10px] font-mono flex items-center justify-between ${
          isLight ? 'text-slate-400' : 'text-neutral-500'
        }`}>
          <span>Argon Browser</span>
          <span>Liquid Glass</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar with pure iOS glass */}
      <aside className="hidden md:flex w-64 lg:w-72 h-screen sticky top-0 shrink-0 z-20 ios-glass-sidebar">
        {content}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full ios-glass-sidebar z-10 shadow-2xl flex flex-col">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
