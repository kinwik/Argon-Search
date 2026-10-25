import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  Share2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { SearchResponse } from '../types/search';
import { MarkdownRenderer } from '../utils/markdownRenderer';
import { calculateReadingTime, formatSearchLatency } from '../utils/searchHelpers';
import { SourcesCarousel } from './SourcesCarousel';
import { OfficialSiteCard } from './OfficialSiteCard';

interface AnswerCardProps {
  result: SearchResponse;
  onFollowUp: (followUpQuery: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenUrl?: (url: string, title?: string) => void;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  result,
  onFollowUp,
  isBookmarked,
  onToggleBookmark,
  onOpenUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeCitationId, setActiveCitationId] = useState<number | null>(null);
  const [sharedToast, setSharedToast] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Argon Search: ${result.query}`,
          text: `Ответ на вопрос: ${result.query}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setSharedToast(true);
        setTimeout(() => setSharedToast(false), 2000);
      }
    } catch {}
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Синтез речи не поддерживается в вашем браузере.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanSpeechText = result.text
      .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
      .replace(/[#*`_]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const readingTime = calculateReadingTime(result.text);
  const latencyStr = formatSearchLatency(result.latencyMs);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Official Verified Website Spotlight Card (e.g. YouTube, GitHub, Telegram) */}
      {result.directWebsite && (
        <OfficialSiteCard site={result.directWebsite} onOpenUrl={onOpenUrl} />
      )}

      {/* Grounded Web Sources Shelf with Rich Source Cards */}
      {result.sources.length > 0 && (
        <SourcesCarousel
          sources={result.sources}
          activeCitationId={activeCitationId}
          onSelectCitation={(id) => setActiveCitationId(id)}
          onOpenUrl={onOpenUrl}
        />
      )}

      {/* Main AI Synthesized Answer: iPhone Frosted Liquid Glass Container */}
      <article className="relative overflow-hidden ios-glass-card rounded-3xl p-5 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
        {/* Specular top glare line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-slate-400/30 dark:via-white/50 to-transparent pointer-events-none" />

        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/25 backdrop-blur-xl text-current shadow-sm">
              <Sparkles className="w-4 h-4 text-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-current tracking-tight font-['Plus_Jakarta_Sans']">
                AI Синтез Argon
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                <span>Проверено {result.sources.length} источников</span>
                <span>·</span>
                <span className="tabular-nums">{latencyStr}</span>
                <span>·</span>
                <span>{readingTime} чтения</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar with iOS Glass Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-2 text-current opacity-70 hover:opacity-100 ios-glass-button rounded-xl relative transition-all"
              title="Копировать ответ"
              aria-label="Копировать ответ"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 ios-glass-pill text-[10px] rounded-full whitespace-nowrap shadow-md">
                  Скопировано
                </span>
              )}
            </button>

            <button
              onClick={toggleSpeech}
              className={`p-2 rounded-xl transition-all active:scale-95 ${
                isSpeaking
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                  : 'text-current opacity-70 hover:opacity-100 ios-glass-button'
              }`}
              title={isSpeaking ? 'Остановить чтение' : 'Прочитать вслух'}
              aria-label="Озвучить ответ"
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4 animate-pulse" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleShare}
              className="p-2 text-current opacity-70 hover:opacity-100 ios-glass-button rounded-xl relative transition-all"
              title="Поделиться"
              aria-label="Поделиться"
            >
              <Share2 className="w-4 h-4" />
              {sharedToast && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 ios-glass-pill text-[10px] rounded-full whitespace-nowrap shadow-md">
                  Ссылка скопирована
                </span>
              )}
            </button>

            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded-xl transition-all active:scale-95 ${
                isBookmarked
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                  : 'text-current opacity-70 hover:opacity-100 ios-glass-button'
              }`}
              title={isBookmarked ? 'Удалить из закладок' : 'Сохранить в закладки'}
              aria-label="Закладка"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-current" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Synthesized Answer Text Body */}
        <div className="relative text-current opacity-95 text-sm sm:text-base leading-relaxed">
          <MarkdownRenderer
            content={result.text}
            sources={result.sources}
            onCitationClick={(id) => setActiveCitationId(id)}
            activeCitationId={activeCitationId}
            onOpenUrl={onOpenUrl}
          />
        </div>

        {/* Follow-up Suggested Queries Shelf (iOS Glass Pills) */}
        {result.suggestedQueries && result.suggestedQueries.length > 0 && (
          <div className="mt-7 pt-4 border-t border-black/10 dark:border-white/10">
            <span className="block text-xs font-mono font-medium uppercase tracking-wider text-neutral-400 mb-2.5">
              Связанные вопросы и уточнения:
            </span>
            <div className="flex flex-wrap gap-2">
              {result.suggestedQueries.map((sug, idx) => (
                <button
                  key={`sug-btn-${idx}`}
                  type="button"
                  onClick={() => onFollowUp(sug)}
                  className="text-left px-3.5 py-2 rounded-2xl text-xs font-medium text-current ios-glass-pill hover:bg-black/5 dark:hover:bg-white/[0.18] active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{sug}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};
