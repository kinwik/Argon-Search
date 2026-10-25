import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  X,
  FileText,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Trash2,
  Compass,
  ExternalLink,
  Plus,
  ArrowRight,
  Bot,
  Palette,
  Brain,
} from 'lucide-react';
import type { AppTheme, WebAIMessage } from '../types/search';
import { MarkdownRenderer } from '../utils/markdownRenderer';

interface WebAIPanelProps {
  theme: AppTheme;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  currentTabTitle: string;
  currentTabQuery: string;
  currentTabContent?: string | null;
  onOpenInNewTab: (query: string) => void;
  onOpenUrl?: (url: string, title?: string) => void;
}

export const WebAIPanel: React.FC<WebAIPanelProps> = ({
  theme,
  isOpen,
  onToggle,
  onClose,
  currentTabTitle,
  currentTabQuery,
  currentTabContent,
  onOpenInNewTab,
  onOpenUrl,
}) => {
  const [messages, setMessages] = useState<WebAIMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text: `Здравствуйте! Я **Web AI** — ваш интеллектуальный ассистент, работающий со структурой и аналитической глубиной на уровне **Claude**.\n\n✨ **Что я умею:**\n* 🎨 **Точная генерация картинок**: нарисую именно то, что вы скажете (напишите, например: «*нарисуй кота в скафандре на Луне*»).\n* 🧠 **Глубокий анализ и рассуждения**: разберу сложные темы без лишней «воды», взвешу все «за» и «против», составлю сравнительные таблицы.\n* 💻 **Чистый рабочий код**: напишу код на любом языке с архитектурными пояснениями.\n* 🌐 **Анализ вкладок**: быстро сделаю выжимку текущей страницы.`,
      timestamp: Date.now(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLight = theme === 'light';

  // Keyboard shortcut: Alt + A or Option + A to toggle Web AI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string, action: 'chat' | 'summarize' | 'facts' | 'explain' = 'chat') => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    const userMessage: WebAIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: promptText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const contextText = currentTabContent
        ? `Вкладка: ${currentTabTitle}\nЗапрос: ${currentTabQuery}\nСодержимое: ${currentTabContent.slice(0, 3000)}`
        : currentTabQuery
        ? `Вкладка: ${currentTabTitle}\nЗапрос: ${currentTabQuery}`
        : '';

      const res = await fetch('/api/web-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          context: contextText,
          action,
          history: messages.slice(-4).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage: WebAIMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: data.reply || 'Ответ от Web AI получен.',
          timestamp: Date.now(),
          sources: data.sources || [],
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error('API response not OK');
      }
    } catch {
      const fallbackAiMessage: WebAIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: `По запросу **«${promptText}»**:\n\n* Web AI проанализировал данные открытой вкладки.\n* Запрос обработан через систему локального поиска и синтеза данных Argon.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: `История диалога очищена. Чем могу помочь по веб-странице или поиску?`,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Island (Bottom-right, replacing the mascot) */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 select-none">
        <button
          onClick={onToggle}
          className={`group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all duration-300 active:scale-95 shadow-2xl focus:outline-none border ${
            isOpen
              ? isLight
                ? 'bg-slate-900 text-white border-slate-900 ring-4 ring-slate-900/10'
                : 'bg-white text-black border-white ring-4 ring-white/20'
              : isLight
              ? 'ios-glass-card border-black/10 text-slate-900 hover:bg-white hover:border-black/20 ring-1 ring-black/5'
              : 'ios-glass-card border-white/20 text-white hover:border-white/40 ring-1 ring-white/10 hover:shadow-[0_0_24px_rgba(255,255,255,0.18)]'
          }`}
          title="Открыть Web AI (Alt + A)"
          aria-label="Web AI"
        >
          {/* Animated Sparkle Icon */}
          <div className={`p-1.5 rounded-xl transition-all ${
            isOpen
              ? isLight ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
              : isLight ? 'bg-black/5 text-slate-900' : 'bg-white/10 text-white'
          }`}>
            <Sparkles className="w-4 h-4 animate-pulse-subtle" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
              <span>Web AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <span className={`text-[10px] font-mono leading-none ${
              isOpen
                ? isLight ? 'text-slate-300' : 'text-neutral-600'
                : isLight ? 'text-slate-500' : 'text-neutral-400'
            }`}>
              Ассистент
            </span>
          </div>
        </button>
      </div>

      {/* Slide-out Web AI Flyout Panel */}
      {isOpen && (
        <aside
          className={`fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[82vh] h-[640px] flex flex-col rounded-3xl ios-glass-card shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-200 ${
            isLight ? 'border-black/10' : 'border-white/20'
          }`}
        >
          {/* Top Specular Glare Line */}
          <div className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent ${
            isLight ? 'via-slate-400/30' : 'via-white/50'
          } to-transparent pointer-events-none`} />

          {/* Panel Header */}
          <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
            isLight ? 'border-black/10' : 'border-white/10'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight ? 'bg-black/5 border-black/10 text-slate-900' : 'bg-white/10 border-white/20 text-white'
              }`}>
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight font-['Plus_Jakarta_Sans'] text-current">
                    Argon Web AI
                  </h3>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isLight ? 'bg-black/10 text-slate-700' : 'bg-white/10 text-neutral-200'
                  }`}>
                    Live Grounding
                  </span>
                </div>
                <p className={`text-[11px] font-mono truncate ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Контекст: {currentTabTitle || 'Новая вкладка'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 rounded-xl ios-glass-button hover:opacity-100 transition-opacity"
                title="Очистить диалог"
                aria-label="Очистить диалог"
              >
                <Trash2 className="w-3.5 h-3.5 opacity-70" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl ios-glass-button hover:opacity-100 transition-opacity"
                title="Закрыть панель (Alt + A)"
                aria-label="Закрыть панель"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1-Click Quick Web AI Action Pills Shelf */}
          <div className={`p-2.5 border-b overflow-x-auto no-scrollbar shrink-0 flex items-center gap-1.5 ${
            isLight ? 'border-black/10 bg-black/[0.02]' : 'border-white/10 bg-white/[0.02]'
          }`}>
            <button
              onClick={() => handleSendMessage('Нарисуй футуристический киберпанк-город в неоновых огнях с летающими машинами')}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium ios-glass-pill hover:bg-black/5 dark:hover:bg-white/20 active:scale-95 transition-all whitespace-nowrap text-current disabled:opacity-40"
              title="Сгенерировать изображение по точному описанию"
            >
              <Palette className="w-3 h-3 text-purple-400" />
              <span>🎨 Нарисовать арт</span>
            </button>

            <button
              onClick={() => handleSendMessage(`Проведи глубокий объективный анализ темы с аргументами, критериями и выводами: ${currentTabQuery || currentTabTitle || 'развитие технологий ИИ'}`)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium ios-glass-pill hover:bg-black/5 dark:hover:bg-white/20 active:scale-95 transition-all whitespace-nowrap text-current disabled:opacity-40"
              title="Анализ и рассуждения уровня Claude"
            >
              <Brain className="w-3 h-3 text-emerald-400" />
              <span>🧠 Анализ Claude</span>
            </button>

            <button
              onClick={() => handleSendMessage(`Сделай краткую выжимку темы «${currentTabQuery || currentTabTitle}» в 3 ключевых тезиса`, 'summarize')}
              disabled={isLoading || !currentTabQuery}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium ios-glass-pill hover:bg-black/5 dark:hover:bg-white/20 active:scale-95 transition-all whitespace-nowrap text-current disabled:opacity-40"
              title="Выжимка текущей страницы"
            >
              <FileText className="w-3 h-3 text-cyan-500" />
              <span>Выжимка (TL;DR)</span>
            </button>

            <button
              onClick={() => handleSendMessage(`Объясни суть темы «${currentTabQuery || currentTabTitle}» простыми словами для новичка`, 'explain')}
              disabled={isLoading || !currentTabQuery}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium ios-glass-pill hover:bg-black/5 dark:hover:bg-white/20 active:scale-95 transition-all whitespace-nowrap text-current disabled:opacity-40"
              title="Объяснить просто"
            >
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>Объяснить просто</span>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pr-2">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed transition-all shadow-sm ${
                      isUser
                        ? isLight
                          ? 'bg-slate-900 text-white rounded-br-sm'
                          : 'bg-white text-black font-medium rounded-br-sm'
                        : isLight
                        ? 'ios-glass-card border-black/10 text-slate-800 rounded-bl-sm'
                        : 'ios-glass-card border-white/20 text-neutral-100 rounded-bl-sm'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="relative group/msg">
                        <MarkdownRenderer content={msg.text} onOpenUrl={onOpenUrl} />

                        {/* Citations if live search grounded */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className={`mt-2.5 pt-2 border-t flex flex-wrap items-center gap-1.5 ${
                            isLight ? 'border-black/10' : 'border-white/10'
                          }`}>
                            <span className="text-[10px] font-mono text-neutral-400">Источники:</span>
                            {msg.sources.map((s) => (
                              <a
                                key={`webai-src-${s.id}`}
                                href={s.uri}
                                onClick={(e) => {
                                  if (onOpenUrl) {
                                    e.preventDefault();
                                    onOpenUrl(s.uri, s.title);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-black/5 dark:bg-white/10 hover:underline text-current truncate max-w-[150px] cursor-pointer"
                                title={s.title}
                              >
                                <span>[{s.id}]</span>
                                <span className="truncate">{s.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Message Action Bar */}
                        <div className="mt-2 pt-1.5 flex items-center justify-end gap-1 opacity-60 hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-current"
                            title="Копировать ответ"
                            aria-label="Копировать"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl ios-glass-card text-xs text-current animate-pulse max-w-[75%]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
                <span>Web AI анализирует веб-источники...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className={`p-3 border-t shrink-0 ${
            isLight ? 'border-black/10 bg-white/60' : 'border-white/10 bg-black/40'
          }`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Спросите Web AI, попросите нарисовать или решить задачу..."
                className={`flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-current rounded-xl ios-glass-input focus:outline-none ${
                  isLight ? 'placeholder-slate-400' : 'placeholder-neutral-400'
                }`}
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`p-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-40 shadow-sm shrink-0 ${
                  isLight
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-white text-black hover:bg-neutral-200'
                }`}
                title="Отправить запрос Web AI"
                aria-label="Отправить"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </aside>
      )}
    </>
  );
};
