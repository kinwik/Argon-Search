import React, { useState, useEffect } from 'react';
import {
  Send,
  Loader2,
  AlertCircle,
  Menu,
  Settings,
  Plus,
  Moon,
  Sun,
  Sparkles,
} from 'lucide-react';
import type {
  SearchMode,
  TimeFilter,
  SearchResponse,
  SearchHistoryItem,
  ThreadMessage,
  BrowserTab,
  AppTheme,
} from './types/search';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { AnswerCard } from './components/AnswerCard';
import { SettingsModal } from './components/SettingsModal';
import { ArgonLogo } from './components/ArgonLogo';
import { WebAIPanel } from './components/WebAIPanel';
import { InAppWebView } from './components/InAppWebView';
import { sanitizeSearchQuery } from './utils/searchHelpers';

const HISTORY_KEY = 'argon_search_history_v1';
const TABS_KEY = 'argon_browser_tabs_v1';
const ACTIVE_TAB_KEY = 'argon_active_tab_id_v1';
const THEME_KEY = 'argon_theme_v1';

export default function App() {
  // Theme state: dark (iPhone Obsidian) vs light (iPhone Ceramic White)
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Web AI panel open state
  const [isWebAIOpen, setIsWebAIOpen] = useState(false);

  // Search history state
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Real Browser Vertical Tabs state
  const [browserTabs, setBrowserTabs] = useState<BrowserTab[]>(() => {
    try {
      const saved = localStorage.getItem(TABS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'tab-1',
        title: 'Новая вкладка',
        query: '',
        result: null,
        mode: 'overview',
        timeFilter: 'all',
        timestamp: Date.now(),
      },
    ];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_TAB_KEY);
      if (saved) return saved;
    } catch {}
    return browserTabs[0]?.id || 'tab-1';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followUpText, setFollowUpText] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync theme with body & document classes and storage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
      if (theme === 'light') {
        document.body.classList.add('theme-light');
        document.documentElement.classList.add('theme-light');
        document.documentElement.classList.remove('dark');
      } else {
        document.body.classList.remove('theme-light');
        document.documentElement.classList.remove('theme-light');
        document.documentElement.classList.add('dark');
      }
    } catch {}
  }, [theme]);

  // Sync history to storage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
    } catch {}
  }, [searchHistory]);

  // Sync tabs to storage
  useEffect(() => {
    try {
      localStorage.setItem(TABS_KEY, JSON.stringify(browserTabs));
      localStorage.setItem(ACTIVE_TAB_KEY, activeTabId);
    } catch {}
  }, [browserTabs, activeTabId]);

  // Active tab reference
  const currentTab = browserTabs.find((t) => t.id === activeTabId) || browserTabs[0] || {
    id: 'tab-1',
    title: 'Новая вкладка',
    query: '',
    result: null,
    mode: 'overview' as SearchMode,
    timeFilter: 'all' as TimeFilter,
    timestamp: Date.now(),
  };

  const query = currentTab.query;
  const mode = currentTab.mode;
  const timeFilter = currentTab.timeFilter;
  const currentResult = currentTab.result;

  // Tab Helpers
  const updateCurrentTab = (updates: Partial<BrowserTab>) => {
    setBrowserTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t))
    );
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      title: 'Новая вкладка',
      query: '',
      result: null,
      mode: 'overview',
      timeFilter: 'all',
      timestamp: Date.now(),
      viewType: 'search',
    };
    setBrowserTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setError(null);
  };

  const handleOpenUrlInTab = (url: string, title?: string) => {
    let domain = '';
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      domain = url;
    }
    const tabTitle = title || domain;

    // If current tab is an empty search tab, navigate it directly
    if (!currentTab.query && !currentTab.result && currentTab.viewType !== 'web') {
      updateCurrentTab({
        viewType: 'web',
        url,
        title: tabTitle,
        favicon: domain,
      });
      return;
    }

    // Otherwise open a new in-app tab
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      title: tabTitle,
      query: '',
      result: null,
      mode: currentTab.mode,
      timeFilter: currentTab.timeFilter,
      timestamp: Date.now(),
      viewType: 'web',
      url,
      favicon: domain,
    };
    setBrowserTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setError(null);
  };

  const handleCloseTab = (tabIdToClose: string) => {
    if (browserTabs.length <= 1) {
      // If last tab is closed, reset it to empty new tab
      const resetId = `tab-${Date.now()}`;
      setBrowserTabs([
        {
          id: resetId,
          title: 'Новая вкладка',
          query: '',
          result: null,
          mode: 'overview',
          timeFilter: 'all',
          timestamp: Date.now(),
          viewType: 'search',
        },
      ]);
      setActiveTabId(resetId);
      setError(null);
      return;
    }

    const remaining = browserTabs.filter((t) => t.id !== tabIdToClose);
    setBrowserTabs(remaining);

    if (activeTabId === tabIdToClose) {
      const idx = browserTabs.findIndex((t) => t.id === tabIdToClose);
      const nextTab = remaining[Math.max(0, idx - 1)] || remaining[0];
      setActiveTabId(nextTab.id);
    }
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
    setError(null);
  };

  const resetCurrentTab = () => {
    updateCurrentTab({
      query: '',
      title: 'Новая вкладка',
      result: null,
      viewType: 'search',
      url: undefined,
    });
    setError(null);
  };

  // Perform search
  const performSearch = async (searchQueryText?: string, isFollowUp = false) => {
    const rawQuery = searchQueryText !== undefined ? searchQueryText : (isFollowUp ? followUpText : query);
    const clean = sanitizeSearchQuery(rawQuery);
    if (!clean) return;

    setError(null);
    setIsLoading(true);

    if (isFollowUp) {
      setFollowUpText('');
    } else {
      updateCurrentTab({
        query: clean,
        title: clean.length > 20 ? clean.slice(0, 20) + '…' : clean,
      });
    }

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: clean,
          mode,
          timeFilter,
          history: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || `Ошибка сервера: ${response.status}`);
      }

      const data: SearchResponse = await response.json();

      // Update current active tab with received data
      updateCurrentTab({
        result: data,
        title: data.directWebsite?.name || (clean.length > 20 ? clean.slice(0, 20) + '…' : clean),
        favicon: data.directWebsite?.domain || data.sources?.[0]?.domain,
      });

      // Update history
      setSearchHistory((prev) => {
        const filtered = prev.filter((item) => item.query.toLowerCase() !== clean.toLowerCase());
        const newItem: SearchHistoryItem = {
          id: `hist-${Date.now()}`,
          query: clean,
          timestamp: Date.now(),
          mode,
        };
        return [newItem, ...filtered].slice(0, 40);
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err?.message || 'Не удалось выполнить поиск. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = (historyId?: string) => {
    if (historyId) {
      setSearchHistory((prev) =>
        prev.map((item) => (item.id === historyId ? { ...item, bookmarked: !item.bookmarked } : item))
      );
      return;
    }

    if (!currentResult) return;
    const currentQ = currentResult.query;

    setSearchHistory((prev) => {
      const exists = prev.find((i) => i.query.toLowerCase() === currentQ.toLowerCase());
      if (exists) {
        return prev.map((i) =>
          i.id === exists.id ? { ...i, bookmarked: !i.bookmarked } : i
        );
      }
      return [
        {
          id: `bm-${Date.now()}`,
          query: currentQ,
          timestamp: Date.now(),
          mode,
          bookmarked: true,
        },
        ...prev,
      ];
    });
  };

  const isCurrentBookmarked = Boolean(
    currentResult &&
      searchHistory.some(
        (i) => i.query.toLowerCase() === currentResult.query.toLowerCase() && i.bookmarked
      )
  );

  return (
    <div
      className={`relative min-h-screen flex font-['Manrope'] selection:bg-white selection:text-black overflow-x-hidden ${
        theme === 'light' ? 'bg-[#f5f6f9] text-neutral-900' : 'bg-[#060608] text-neutral-100'
      }`}
    >
      {/* Authentic iOS Refraction Light Backdrops (Visible through Liquid Frosted Glass) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        {theme === 'dark' ? (
          <>
            <div className="absolute -top-32 left-1/4 w-[540px] h-[540px] bg-white/[0.04] rounded-full blur-[140px] animate-pulse-subtle" />
            <div className="absolute top-1/3 -right-24 w-[480px] h-[480px] bg-slate-400/[0.04] rounded-full blur-[130px]" />
            <div className="absolute -bottom-24 left-1/3 w-[560px] h-[560px] bg-white/[0.03] rounded-full blur-[150px]" />
          </>
        ) : (
          <>
            <div className="absolute -top-32 left-1/4 w-[540px] h-[540px] bg-sky-200/35 rounded-full blur-[140px] animate-pulse-subtle" />
            <div className="absolute top-1/3 -right-24 w-[480px] h-[480px] bg-indigo-100/40 rounded-full blur-[130px]" />
            <div className="absolute -bottom-24 left-1/3 w-[560px] h-[560px] bg-slate-200/50 rounded-full blur-[150px]" />
          </>
        )}
      </div>

      {/* Left Sidebar with Real Browser Tabs, Search Modes, Bookmarks, and Settings */}
      <Sidebar
        currentMode={mode}
        onSelectMode={(m) => {
          updateCurrentTab({ mode: m });
          if (currentResult) {
            performSearch(currentResult.query);
          }
        }}
        browserTabs={browserTabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onNewTab={handleNewTab}
        onCloseTab={handleCloseTab}
        searchHistory={searchHistory}
        onSelectQuery={(savedQ) => {
          updateCurrentTab({ query: savedQ });
          performSearch(savedQ);
        }}
        onRemoveHistoryItem={(id) => {
          setSearchHistory((prev) => prev.filter((i) => i.id !== id));
        }}
        onClearHistory={() => {
          setSearchHistory((prev) => prev.filter((i) => i.bookmarked));
        }}
        theme={theme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* iOS Frosted Glass Top Navigation Bar */}
        <header className="sticky top-0 z-30 w-full ios-glass-bar px-3.5 sm:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-xl ios-glass-button"
              aria-label="Открыть вкладки"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <ArgonLogo size={20} theme={theme} />
              <span className="text-xs font-mono font-bold tracking-wide truncate">
                {currentTab.title}
              </span>
              <span className="text-neutral-400 text-xs hidden sm:inline">/</span>
              <span className="text-xs text-neutral-400 font-medium hidden sm:inline">
                {currentTab.viewType === 'web'
                  ? 'Веб-просмотр'
                  : mode === 'overview'
                  ? 'AI Обзор'
                  : mode === 'fast'
                  ? 'Быстрый ответ'
                  : mode === 'deep'
                  ? 'Глубокий анализ'
                  : 'Новости'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick New Tab Button in header */}
            <button
              onClick={handleNewTab}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl ios-glass-button active:scale-95"
              title="Открыть новую вкладку"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Вкладка</span>
            </button>

            {/* Clear / Reset Tab */}
            <button
              onClick={resetCurrentTab}
              className="px-2.5 py-1 text-xs font-medium rounded-xl ios-glass-button active:scale-95"
              title="Сбросить поиск на домашний экран"
            >
              Очистить
            </button>

            {/* Settings Trigger Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-xl ios-glass-button active:scale-95"
              title="Настройки браузера и темы"
              aria-label="Настройки браузера"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className={`flex-1 w-full flex flex-col ${
          currentTab.viewType === 'web'
            ? 'p-2 sm:p-3 max-w-none'
            : 'max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8'
        }`}>
          {currentTab.viewType === 'web' && currentTab.url ? (
            /* In-App Browser Tab Viewport */
            <InAppWebView
              url={currentTab.url}
              title={currentTab.title}
              theme={theme}
              onNavigateUrl={(newUrl) => {
                let d = '';
                try {
                  d = new URL(newUrl).hostname.replace(/^www\./, '');
                } catch {
                  d = newUrl;
                }
                updateCurrentTab({
                  url: newUrl,
                  title: d,
                  favicon: d,
                });
              }}
              onOpenSearch={() => {
                updateCurrentTab({
                  viewType: 'search',
                  url: undefined,
                });
              }}
              onOpenWebAI={(_ctx) => {
                setIsWebAIOpen(true);
              }}
            />
          ) : !currentResult ? (
            /* Apple Spotlight Minimalist Home Search */
            <div className="flex flex-col items-center justify-center min-h-[68vh] text-center px-4 max-w-2xl mx-auto">
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-3 p-3.5 rounded-3xl ios-glass-card shadow-sm backdrop-blur-2xl">
                  <ArgonLogo size={46} theme={theme} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5 font-['Plus_Jakarta_Sans']">
                  Argon Search
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Мгновенный веб-поиск и проверенные источники
                </p>
              </div>

              {/* Central Search Bar */}
              <div className="w-full mb-4">
                <SearchBar
                  query={query}
                  onChangeQuery={(q) => updateCurrentTab({ query: q })}
                  onSubmit={(customQ) => performSearch(customQ)}
                  isLoading={isLoading}
                  mode={mode}
                  onChangeMode={(m) => updateCurrentTab({ mode: m })}
                  timeFilter={timeFilter}
                  onChangeTimeFilter={(t) => updateCurrentTab({ timeFilter: t })}
                  theme={theme}
                />
              </div>

              {/* Loading Indicator in iOS Glass */}
              {isLoading && (
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl ios-glass-card text-xs sm:text-sm my-4 shadow-lg animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-current" />
                  <span>Поиск по веб-источникам и структурирование ответа...</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl ios-glass-card bg-red-950/40 border-red-500/30 text-red-200 text-xs sm:text-sm max-w-lg mx-auto text-left mb-6 shadow-lg">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          ) : (
            /* Results & Conversation Viewport */
            <div className="space-y-6">
              {/* Top Compact Search Bar with Liquid Glass */}
              <div className="sticky top-12 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 ios-glass-bar shadow-xl">
                <SearchBar
                  query={query}
                  onChangeQuery={(q) => updateCurrentTab({ query: q })}
                  onSubmit={(customQ) => performSearch(customQ)}
                  isLoading={isLoading}
                  mode={mode}
                  onChangeMode={(m) => {
                    updateCurrentTab({ mode: m });
                    performSearch(currentResult.query);
                  }}
                  timeFilter={timeFilter}
                  onChangeTimeFilter={(t) => {
                    updateCurrentTab({ timeFilter: t });
                    performSearch(currentResult.query);
                  }}
                  compact
                  theme={theme}
                />
              </div>

              {/* Loading State Banner */}
              {isLoading && (
                <div className="max-w-4xl mx-auto p-3.5 rounded-2xl ios-glass-card flex items-center gap-3 text-xs sm:text-sm shadow-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
                  <span>Обновление поисковых источников и структурирование ответа...</span>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="max-w-4xl mx-auto flex items-center gap-2.5 p-3.5 rounded-2xl ios-glass-card bg-red-950/40 border-red-500/30 text-red-200 text-xs sm:text-sm shadow-lg">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Main Answer View */}
              <AnswerCard
                result={currentResult}
                onFollowUp={(followUp) => performSearch(followUp, true)}
                isBookmarked={isCurrentBookmarked}
                onToggleBookmark={() => handleToggleBookmark()}
                onOpenUrl={handleOpenUrlInTab}
              />

              {/* Conversational Follow-up Box with iOS Frosted Glass */}
              <div className="max-w-4xl mx-auto pt-2">
                <div className="relative overflow-hidden ios-glass-card rounded-2xl p-2 shadow-2xl transition-all">
                  <div className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent ${
                    theme === 'light' ? 'via-slate-400/30' : 'via-white/40'
                  } to-transparent pointer-events-none`} />
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={followUpText}
                      onChange={(e) => setFollowUpText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && followUpText.trim() && !isLoading) {
                          e.preventDefault();
                          performSearch(followUpText, true);
                        }
                      }}
                      placeholder={`Задайте уточняющий вопрос к теме «${currentResult.query}»...`}
                      className={`w-full bg-transparent px-3 text-xs sm:text-sm text-current ${
                        theme === 'light' ? 'placeholder-slate-400' : 'placeholder-neutral-400'
                      } focus:outline-none`}
                      disabled={isLoading}
                      aria-label="Уточняющий вопрос"
                    />
                    <button
                      type="button"
                      onClick={() => performSearch(followUpText, true)}
                      disabled={isLoading || !followUpText.trim()}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold active:scale-95 disabled:opacity-30 transition-all shadow-md whitespace-nowrap shrink-0 ${
                        theme === 'light'
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-white text-black hover:bg-neutral-200'
                      }`}
                    >
                      <span>Спросить</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Minimal iOS Footer (hidden in web viewing mode for maximum screen space) */}
        {currentTab.viewType !== 'web' && (
          <footer className="w-full border-t border-white/10 ios-glass-bar py-3.5 mt-12 text-center text-[11px] text-neutral-400 font-mono">
            <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
              <span>Argon Search</span>
              <span className="text-neutral-500">Apple Liquid Glass Material</span>
            </div>
          </footer>
        )}
      </div>

      {/* Web AI Assistant Panel & Floating Island */}
      <WebAIPanel
        theme={theme}
        isOpen={isWebAIOpen}
        onToggle={() => setIsWebAIOpen(!isWebAIOpen)}
        onClose={() => setIsWebAIOpen(false)}
        currentTabTitle={currentTab.title}
        currentTabQuery={currentTab.query || currentTab.url || ''}
        currentTabContent={currentResult?.text}
        onOpenInNewTab={(q) => {
          handleNewTab();
          updateCurrentTab({ query: q });
          performSearch(q);
        }}
        onOpenUrl={handleOpenUrlInTab}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onSelectTheme={setTheme}
        onClearHistory={() => setSearchHistory([])}
        historyCount={searchHistory.length}
      />
    </div>
  );
}
