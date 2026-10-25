import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  Search,
  Lock,
  Copy,
  ExternalLink,
  BookOpen,
  Globe,
  Sparkles,
  Loader2,
  AlertCircle,
  Maximize2,
  Minimize2,
  Play,
  Tv,
  Zap,
  Shield,
  Layers,
} from 'lucide-react';
import type { AppTheme } from '../types/search';
import { getFaviconUrl } from '../utils/searchHelpers';

interface InAppWebViewProps {
  url: string;
  title: string;
  theme: AppTheme;
  onNavigateUrl: (newUrl: string) => void;
  onOpenSearch: () => void;
  onOpenWebAI: (contextText: string) => void;
}

interface ReaderData {
  title: string;
  domain: string;
  paragraphs: string[];
  text: string;
}

function extractYouTubeVideoId(urlStr: string): string | null {
  try {
    const u = new URL(urlStr);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      if (u.pathname.startsWith('/embed/')) {
        return u.pathname.split('/embed/')[1]?.split('?')[0] || null;
      }
      if (u.pathname.startsWith('/v/')) {
        return u.pathname.split('/v/')[1]?.split('?')[0] || null;
      }
      if (u.pathname.startsWith('/shorts/')) {
        return u.pathname.split('/shorts/')[1]?.split('?')[0] || null;
      }
    }
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1).split('?')[0] || null;
    }
  } catch {}
  return null;
}

export type VideoSourceKey = 'official' | 'proxy' | 'invidious' | 'direct';

interface VideoSourceOption {
  id: VideoSourceKey;
  label: string;
  badge: string;
  getEmbedUrl: (id: string) => string;
}

export const VIDEO_SOURCES: VideoSourceOption[] = [
  {
    id: 'official',
    label: 'YouTube',
    badge: 'Рекомендуется',
    getEmbedUrl: (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&enablejsapi=1&rel=0`,
  },
  {
    id: 'proxy',
    label: 'Прокси Argon',
    badge: 'Без замедления',
    getEmbedUrl: (id) => `/api/proxy-web?url=${encodeURIComponent(`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`)}`,
  },
  {
    id: 'invidious',
    label: 'Invidious EU',
    badge: 'Зеркало',
    getEmbedUrl: (id) => `https://invidious.slipfox.xyz/embed/${id}?autoplay=1`,
  },
  {
    id: 'direct',
    label: 'Прямой',
    badge: 'Оригинал',
    getEmbedUrl: (id) => `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
  },
];

export const InAppWebView: React.FC<InAppWebViewProps> = ({
  url,
  title,
  theme,
  onNavigateUrl,
  onOpenSearch,
  onOpenWebAI,
}) => {
  const [currentUrlInput, setCurrentUrlInput] = useState(url);
  const [reloadKey, setReloadKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [forceIframeLoad, setForceIframeLoad] = useState(false);

  // YouTube specific state
  const isYouTubeDomain = url.includes('youtube.com') || url.includes('youtu.be');
  const initialVideoId = extractYouTubeVideoId(url);
  const [activeYouTubeVideoId, setActiveYouTubeVideoId] = useState<string | null>(initialVideoId);
  const [playerSource, setPlayerSource] = useState<VideoSourceKey>('official');
  const [ytSearchInput, setYtSearchInput] = useState('');
  const [ytSearchResults, setYtSearchResults] = useState<Array<{ id: string; title: string; thumbnail: string; channel?: string }>>([]);
  const [isYtSearching, setIsYtSearching] = useState(false);

  const handleCycleSource = () => {
    setPlayerSource((prev) => {
      const keys: VideoSourceKey[] = ['official', 'proxy', 'invidious', 'direct'];
      const idx = keys.indexOf(prev);
      return keys[(idx + 1) % keys.length];
    });
  };

  // View modes: 'web' (direct), 'proxy' (reverse proxy without X-Frame-Options), 'reader' (clean text), 'youtube' (player)
  const [viewMode, setViewMode] = useState<'web' | 'proxy' | 'reader' | 'youtube'>(() => {
    if (isYouTubeDomain) return 'youtube';
    return 'web';
  });

  // Reader mode state
  const [readerData, setReaderData] = useState<ReaderData | null>(null);
  const [isReaderLoading, setIsReaderLoading] = useState(false);
  const [readerError, setReaderError] = useState<string | null>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const handlePerformYtSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsYtSearching(true);
    try {
      const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(queryText.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.videos) && data.videos.length > 0) {
          setYtSearchResults(data.videos);
          setActiveYouTubeVideoId(data.videos[0].id);
        }
      }
    } catch {} finally {
      setIsYtSearching(false);
    }
  };

  useEffect(() => {
    setCurrentUrlInput(url);
    setIsIframeLoading(true);
    setForceIframeLoad(false);
    const ytId = extractYouTubeVideoId(url);
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      if (ytId) {
        setActiveYouTubeVideoId(ytId);
      }
      setViewMode('youtube');

      // Check if it's a search URL
      try {
        const u = new URL(url);
        const sq = u.searchParams.get('search_query');
        if (sq) {
          setYtSearchInput(sq);
          handlePerformYtSearch(sq);
        }
      } catch {}
    }
    loadReaderData(url);
  }, [url, reloadKey]);

  const loadReaderData = async (targetUrl: string) => {
    setIsReaderLoading(true);
    setReaderError(null);
    try {
      const res = await fetch(`/api/reader?url=${encodeURIComponent(targetUrl)}`);
      if (res.ok) {
        const data = await res.json();
        setReaderData(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setReaderError(err.error || 'Не удалось загрузить версию для чтения');
      }
    } catch {
      setReaderError('Ошибка соединения при извлечении статьи');
    } finally {
      setIsReaderLoading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let clean = currentUrlInput.trim();
    if (!clean) return;

    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      if (clean.includes('.') && !clean.includes(' ')) {
        clean = `https://${clean}`;
      } else {
        onOpenSearch();
        return;
      }
    }
    onNavigateUrl(clean);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
    setIsIframeLoading(true);
  };

  let domain = '';
  try {
    domain = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    domain = url;
  }

  const faviconUrl = getFaviconUrl(domain);

  // Detection for major AI services (Claude, Gemini, ChatGPT) that enforce strict CORS and Same-Origin protections
  const isClaude = domain.includes('claude.ai') || domain.includes('anthropic.com');
  const isGemini = domain.includes('gemini.google.com') || (domain.includes('google.com') && url.includes('gemini'));
  const isChatGPT = domain.includes('chatgpt.com') || domain.includes('chat.openai.com') || domain.includes('openai.com');
  const isAIService = isClaude || isGemini || isChatGPT;
  const aiServiceName = isClaude ? 'Claude (Anthropic)' : isGemini ? 'Google Gemini' : isChatGPT ? 'ChatGPT' : 'AI-сервис';

  const isLikelyXFrameBlocked =
    domain.includes('youtube.com') ||
    domain.includes('google.com') ||
    domain.includes('claude.ai') ||
    domain.includes('anthropic.com') ||
    domain.includes('chatgpt.com') ||
    domain.includes('openai.com') ||
    domain.includes('twitter.com') ||
    domain.includes('x.com') ||
    domain.includes('vk.com') ||
    domain.includes('github.com');

  // Compute final iframe source according to view mode
  let iframeSrc = url;
  if (viewMode === 'proxy') {
    iframeSrc = `/api/proxy-web?url=${encodeURIComponent(url)}`;
  } else if (viewMode === 'youtube') {
    const videoId = activeYouTubeVideoId || 'jfKfPfyJRdk';
    const sourceObj = VIDEO_SOURCES.find((s) => s.id === playerSource) || VIDEO_SOURCES[0];
    iframeSrc = sourceObj.getEmbedUrl(videoId);
  }

  const sampleYouTubeVideos = [
    {
      id: 'jfKfPfyJRdk',
      title: 'Lofi Girl — Музыка для учёбы и отдыха',
      channel: 'Lofi Girl',
      thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg',
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Luis Fonsi — Despacito ft. Daddy Yankee',
      channel: 'Luis Fonsi',
      thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
    },
    {
      id: 'fJ9rUzIMcZQ',
      title: 'Queen — Bohemian Rhapsody (Official Video)',
      channel: 'Queen Official',
      thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
    },
    {
      id: '3JZ_D3ELwOQ',
      title: 'Космос: Сверхмассивные чёрные дыры Джеймс Уэбб',
      channel: 'Наука 2.0',
      thumbnail: 'https://i.ytimg.com/vi/3JZ_D3ELwOQ/mqdefault.jpg',
    },
  ];

  const displayVideos = ytSearchResults.length > 0 ? ytSearchResults : sampleYouTubeVideos;

  return (
    <div
      className={`w-full flex flex-col transition-all duration-300 ${
        isExpanded
          ? `fixed inset-0 z-50 p-2 sm:p-4 h-screen ${
              isLight ? 'bg-[#f5f6f9]/98 text-slate-900' : 'bg-[#060608]/98 text-white'
            } backdrop-blur-2xl`
          : 'flex-1 h-[calc(100vh-4rem)] min-h-0'
      }`}
    >
      {/* 1. Browser Navigation & URL Bar (Authentic Liquid Glass) */}
      <div className="shrink-0 mb-3 px-1 sm:px-2">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 p-2 rounded-2xl ios-glass-card shadow-lg">
          {/* Controls: Back / Forward / Reload / Search */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ios-glass-button active:scale-95 transition-all text-current"
              title="Вернуться к поиску Argon"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Поиск</span>
            </button>

            <button
              type="button"
              onClick={handleReload}
              className="p-2 rounded-xl ios-glass-button active:scale-95 transition-all text-current"
              title="Перезагрузить страницу"
              aria-label="Перезагрузить"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isIframeLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15">
              {isYouTubeDomain && (
                <button
                  type="button"
                  onClick={() => setViewMode('youtube')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'youtube'
                      ? 'bg-red-600 text-white shadow-sm font-semibold'
                      : 'text-current opacity-70 hover:opacity-100'
                  }`}
                  title="YouTube Плеер (HD)"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Плеер</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setViewMode('proxy')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'proxy'
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'bg-white/25 text-white shadow-sm font-semibold'
                    : 'text-current opacity-70 hover:opacity-100'
                }`}
                title="Режим Прокси (Обход блокировок X-Frame-Options)"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Прокси</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('web')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'web'
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'bg-white/25 text-white shadow-sm font-semibold'
                    : 'text-current opacity-70 hover:opacity-100'
                }`}
                title="Прямой веб-просмотр"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Прямой</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('reader')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'reader'
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'bg-white/25 text-white shadow-sm font-semibold'
                    : 'text-current opacity-70 hover:opacity-100'
                }`}
                title="Режим чтения без рекламы (Apple Reader)"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Чтение</span>
              </button>
            </div>
          </div>

          {/* URL Address Input Bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center min-w-0">
            <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl ios-glass-input text-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <input
                type="text"
                value={currentUrlInput}
                onChange={(e) => setCurrentUrlInput(e.target.value)}
                placeholder="Введите адрес веб-сайта или запрос..."
                className="w-full bg-transparent font-mono text-xs text-current focus:outline-none truncate"
              />
              {copied ? (
                <span className="text-[10px] font-mono text-emerald-500 shrink-0 font-bold">
                  Скопировано!
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 shrink-0 text-current opacity-70 hover:opacity-100"
                  title="Копировать адрес ссылки"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Action triggers: Web AI, Expand/Maximize & External fallback */}
          <div className="flex items-center gap-1.5 shrink-0 justify-end">
            {/* Expand / Maximize Window Button */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ios-glass-button active:scale-95 transition-all text-current shadow-sm ${
                isExpanded
                  ? isLight
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : ''
              }`}
              title={isExpanded ? 'Свернуть окно обратно (Esc)' : 'Расширить окно на весь экран'}
              aria-label={isExpanded ? 'Свернуть окно' : 'Расширить окно'}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Свернуть</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span>Развернуть</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const textForAI = readerData?.text
                  ? `Вкладка: ${title} (${url})\nСодержимое статьи:\n${readerData.text.slice(0, 3000)}`
                  : `Вкладка: ${title} (${url})`;
                onOpenWebAI(textForAI);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ios-glass-button active:scale-95 transition-all text-current shadow-sm"
              title="Анализировать страницу с помощью Web AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Web AI</span>
            </button>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl ios-glass-button active:scale-95 transition-all text-current opacity-70 hover:opacity-100 shrink-0"
              title="Открыть во внешнем окне при необходимости"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Content Area (Web View vs Proxy vs YouTube Player vs Reader View) */}
      <div className="flex-1 w-full min-h-0 rounded-2xl sm:rounded-3xl overflow-hidden ios-glass-card relative flex flex-col shadow-2xl border border-black/10 dark:border-white/20">
        {/* YouTube Hub View */}
        {viewMode === 'youtube' && isYouTubeDomain ? (
          <div className="w-full h-full flex flex-col bg-slate-950 text-white relative">
            {/* Top YouTube Hub Control Strip */}
            <div className="px-4 py-2.5 border-b border-white/10 bg-black/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-red-600 text-white flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-xs font-bold font-['Plus_Jakarta_Sans']">
                  Argon YouTube Hub
                </span>
              </div>

              {/* Player stream source switch: YouTube NoCookie vs Argon Proxy vs Invidious EU vs Direct */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center p-0.5 rounded-xl bg-white/10 border border-white/15">
                  {VIDEO_SOURCES.map((source) => {
                    const isActive = playerSource === source.id;
                    return (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() => setPlayerSource(source.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                          isActive
                            ? source.id === 'official'
                              ? 'bg-red-600 text-white font-semibold shadow-sm'
                              : source.id === 'proxy'
                              ? 'bg-blue-600 text-white font-semibold shadow-sm'
                              : 'bg-emerald-600 text-white font-semibold shadow-sm'
                            : 'text-neutral-300 hover:text-white hover:bg-white/5'
                        }`}
                        title={`${source.label} (${source.badge})`}
                      >
                        {source.id === 'official' ? (
                          <Zap className="w-3 h-3 text-amber-300" />
                        ) : source.id === 'proxy' ? (
                          <Globe className="w-3 h-3 text-blue-200" />
                        ) : (
                          <Shield className="w-3 h-3 text-emerald-300" />
                        )}
                        <span>{source.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleCycleSource}
                  className="px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium text-neutral-200 flex items-center gap-1 transition-all active:scale-95"
                  title="Быстро переключить на следующий сервер, если видео не запускается"
                >
                  <RotateCw className="w-3 h-3 text-neutral-400" />
                  <span className="hidden sm:inline">Сменить сервер</span>
                </button>
              </div>

              {/* YouTube search input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (ytSearchInput.trim()) {
                    handlePerformYtSearch(ytSearchInput.trim());
                  }
                }}
                className="flex items-center gap-1.5 flex-1 max-w-sm"
              >
                <input
                  type="text"
                  value={ytSearchInput}
                  onChange={(e) => setYtSearchInput(e.target.value)}
                  placeholder="Поиск видео на YouTube..."
                  className="w-full bg-white/10 px-3 py-1.5 text-xs rounded-xl border border-white/15 focus:outline-none placeholder-white/40 text-white"
                />
                <button
                  type="submit"
                  disabled={isYtSearching || !ytSearchInput.trim()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1"
                >
                  {isYtSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Найти'}
                </button>
              </form>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('proxy')}
                  className="px-2.5 py-1 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  title="Открыть сайт через Прокси"
                >
                  Прокси
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors"
                >
                  <span>Оригинал</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Notification / Advice strip explaining player status and PyPot/Piped deprecation */}
            <div className="px-4 py-1.5 bg-black/70 border-b border-white/5 text-[11px] text-neutral-300 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>
                  <strong>Статус плеера:</strong> Видео открываются через чистый YouTube NoCookie. Старые серверы Piped («PyPot») заблокированы самим YouTube. Если видео тормозит — нажмите <strong>«Сменить сервер»</strong> или выберите <strong>«Прокси Argon»</strong>.
                </span>
              </span>

              {/* Quick Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => handlePerformYtSearch('тренды')}
                  className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] text-neutral-200"
                >
                  🔥 Тренды
                </button>
                <button
                  type="button"
                  onClick={() => handlePerformYtSearch('музыка клипы')}
                  className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] text-neutral-200"
                >
                  🎵 Музыка
                </button>
                <button
                  type="button"
                  onClick={() => handlePerformYtSearch('наука и космос')}
                  className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] text-neutral-200"
                >
                  🌍 Наука
                </button>
              </div>
            </div>

            {/* Main Video Player Container */}
            <div className="flex-1 w-full min-h-0 relative flex flex-col md:flex-row">
              {/* Primary Video Embed */}
              <div className="flex-1 h-full min-h-[320px] relative bg-black">
                <iframe
                  key={`${reloadKey}-${activeYouTubeVideoId}-${playerSource}`}
                  src={iframeSrc}
                  title="YouTube video player"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* YouTube Quick Shelf */}
              <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-white/10 p-3 overflow-y-auto shrink-0 bg-black/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    {ytSearchResults.length > 0 ? 'Результаты поиска:' : 'Популярные видео:'}
                  </span>
                  {isYtSearching && <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />}
                </div>

                <div className="space-y-2">
                  {displayVideos.map((vid) => (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => setActiveYouTubeVideoId(vid.id)}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-start gap-2.5 border ${
                        activeYouTubeVideoId === vid.id
                          ? 'bg-red-600/25 border-red-500/50 text-white font-semibold ring-1 ring-red-500/30'
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-black/50 relative">
                        {vid.thumbnail ? (
                          <img src={vid.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-red-500" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 p-0.5 rounded bg-black/80 text-[9px] font-mono">
                          HD
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="line-clamp-2 leading-tight font-medium">
                          {vid.title}
                        </span>
                        {vid.channel && (
                          <span className="text-[10px] text-neutral-400 truncate block mt-1">
                            {vid.channel}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : isAIService && !forceIframeLoad && viewMode !== 'reader' ? (
          /* Dedicated AI Service Portal (Resolves Claude / Gemini "Application error" and Same-Origin CORS lock) */
          <div className="flex-1 w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
            <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl ios-glass-card shadow-2xl border border-black/10 dark:border-white/15 text-center flex flex-col items-center">
              {/* Service Icon with Glow */}
              <div className="relative mb-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${
                  isClaude
                    ? 'bg-gradient-to-tr from-amber-600 to-orange-400 text-white shadow-amber-500/20'
                    : isGemini
                    ? 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 text-white shadow-blue-500/20'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-emerald-500/20'
                }`}>
                  {isClaude ? '✨' : isGemini ? '✦' : '🤖'}
                </div>
                <img
                  src={faviconUrl}
                  alt=""
                  className="w-5 h-5 rounded-full absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-black shadow"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2 font-['Plus_Jakarta_Sans'] text-current">
                {aiServiceName}
              </h2>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 mb-4">
                <Shield className="w-3.5 h-3.5" />
                <span>Защита от встраивания во фреймы (Same-Origin & CORS)</span>
              </div>

              {/* Clear explanation of why "Application error" happens */}
              <div className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-300 leading-relaxed mb-6 text-left p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 space-y-2">
                <p>
                  💡 <strong>Почему возникает «Application error»:</strong> Веб-приложения {aiServiceName} (на базе Next.js и Google SSO) намеренно блокируют работу внутри iframe для защиты ваших паролей, cookie и истории переписки.
                </p>
                <p className="text-[11px] opacity-80">
                  При попытке встроить сайт браузер блокирует внутренние API-запросы (CORS), из-за чего React выдаёт сбой <em>«Application error: a client-side exception has occurred»</em>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-2.5">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                    isClaude
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : isGemini
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <span>🚀 Открыть {aiServiceName} в отдельной вкладке</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => onOpenWebAI(`Помоги мне с запросом в стиле ${aiServiceName}`)}
                  className="w-full py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-semibold ios-glass-button flex items-center justify-center gap-2 transition-all active:scale-98 text-current"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Использовать встроенный Web AI (Argon AI)</span>
                </button>

                <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-neutral-400">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('proxy');
                      setForceIframeLoad(true);
                    }}
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>Загрузить через Прокси</span>
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setForceIframeLoad(true)}
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>Открыть во фрейме всё равно</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === 'web' || viewMode === 'proxy' ? (
          <div className="w-full h-full flex flex-col relative">
            {/* Banner for sites that might block direct iframes or are AI services */}
            {(isLikelyXFrameBlocked || isAIService) && (
              <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">
                    {isAIService
                      ? `Сервис ${aiServiceName} может выдавать «Application error» во фрейме из-за защиты CORS.`
                      : `Сайт ${domain} блокирует прямое встраивание (X-Frame-Options).`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
                  >
                    <span>Открыть напрямую</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {viewMode !== 'proxy' && (
                    <button
                      type="button"
                      onClick={() => setViewMode('proxy')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-black/10 dark:bg-white/10 hover:bg-black/20 text-current transition-colors"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Прокси</span>
                    </button>
                  )}
                  {isAIService && (
                    <button
                      type="button"
                      onClick={() => onOpenWebAI(`Задай вопрос для ${aiServiceName}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 dark:text-amber-100 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Web AI</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setViewMode('reader')}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 dark:text-amber-100 transition-colors"
                  >
                    Режим чтения
                  </button>
                </div>
              </div>
            )}

            {/* Embedded Web View Frame */}
            <div className="flex-1 w-full h-full relative bg-white">
              {isIframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/5 dark:bg-black/60 backdrop-blur-md">
                  <Loader2 className="w-6 h-6 animate-spin text-current mb-2" />
                  <span className="text-xs font-mono text-current opacity-80">
                    Загрузка {domain}...
                  </span>
                </div>
              )}

              <iframe
                key={`${reloadKey}-${viewMode}`}
                src={iframeSrc}
                title={title || domain}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                referrerPolicy="no-referrer"
                onLoad={() => setIsIframeLoading(false)}
              />
            </div>
          </div>
        ) : (
          /* Reader Mode (Apple Safari / Arc Reader aesthetic) */
          <div className="flex-1 w-full h-full overflow-y-auto p-6 sm:p-10 max-w-3xl mx-auto font-['Manrope']">
            {isReaderLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-current mb-3" />
                <h3 className="text-sm font-semibold text-current">
                  Форматирование чистого режима чтения...
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Удаление баннеров, скриптов и форматирование текста статьи
                </p>
              </div>
            ) : readerError ? (
              <div className="py-12 text-center max-w-md mx-auto">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-current mb-1">
                  Не удалось извлечь текст статьи
                </h3>
                <p className="text-xs text-neutral-400 mb-4">{readerError}</p>
                <button
                  type="button"
                  onClick={() => setViewMode('proxy')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold ios-glass-button"
                >
                  Попробовать через Прокси Argon
                </button>
              </div>
            ) : readerData ? (
              <article className="space-y-6">
                {/* Article Header Lockup */}
                <div className="pb-5 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={faviconUrl}
                      alt=""
                      className="w-4 h-4 rounded object-contain shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs font-mono font-medium text-neutral-400">
                      {readerData.domain}
                    </span>
                    <span className="text-neutral-400 text-xs">·</span>
                    <span className="text-xs font-mono text-emerald-500 font-semibold flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Argon Reader Mode</span>
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] text-current leading-tight">
                    {readerData.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenWebAI(
                          `Вкладка: ${readerData.title}\nДомен: ${readerData.domain}\nТекст статьи:\n${readerData.text.slice(0, 3000)}`
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ios-glass-button active:scale-95 text-current shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Сделать выжимку с Web AI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('proxy')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium ios-glass-pill hover:opacity-100 text-current"
                    >
                      <Shield className="w-3 h-3 text-emerald-400" />
                      <span>Открыть веб-версию (Прокси)</span>
                    </button>

                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium ios-glass-pill hover:opacity-100 text-current"
                    >
                      <span>Оригинал страницы</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Article Paragraphs */}
                <div className="space-y-4 text-base leading-relaxed text-current opacity-95">
                  {readerData.paragraphs && readerData.paragraphs.length > 0 ? (
                    readerData.paragraphs.map((p, idx) => (
                      <p key={`p-${idx}`} className="leading-relaxed">
                        {p}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-400 italic">
                      Основной текст статьи не обнаружен. Переключитесь в режим «Прокси» или «Веб» для просмотра полной версии.
                    </p>
                  )}
                </div>
              </article>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
