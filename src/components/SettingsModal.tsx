import React from 'react';
import { X, Moon, Sun, Check, Trash2, Sliders, ShieldCheck } from 'lucide-react';
import type { AppTheme } from '../types/search';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  onClearHistory: () => void;
  historyCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onSelectTheme,
  onClearHistory,
  historyCount,
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl ios-glass-card p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular top glare line */}
        <div className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent ${
          isLight ? 'via-slate-400/30' : 'via-white/50'
        } to-transparent pointer-events-none`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 backdrop-blur-md">
              <Sliders className="w-4 h-4 text-current" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight font-['Plus_Jakarta_Sans']">
                Настройки браузера
              </h2>
              <p className="text-xs text-neutral-400">
                Персонализация внешнего вида и параметров
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl ios-glass-button hover:opacity-100 transition-opacity"
            aria-label="Закрыть настройки"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Settings Section */}
        <div className="py-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">
              Тема оформления
            </span>
            <span className="text-[11px] font-mono font-medium text-neutral-400">
              {theme === 'dark' ? 'Тёмная активна' : 'Светлая активна'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Dark Theme Card */}
            <button
              type="button"
              onClick={() => onSelectTheme('dark')}
              className={`p-4 rounded-2xl text-left transition-all relative flex flex-col justify-between border ${
                theme === 'dark'
                  ? 'bg-neutral-900 border-white/50 shadow-md ring-2 ring-white/30 text-white'
                  : 'bg-neutral-900/90 text-neutral-300 border-black/10 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-black border border-white/20 flex items-center justify-center text-white shadow-inner">
                  <Moon className="w-4 h-4" />
                </div>
                {theme === 'dark' && (
                  <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <span className="block text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
                  Тёмная
                </span>
                <span className="block text-[11px] text-neutral-400 mt-0.5 leading-snug">
                  Глубокий чёрный, матовое стекло и рефракция
                </span>
              </div>
            </button>

            {/* Light (White) Theme Card */}
            <button
              type="button"
              onClick={() => onSelectTheme('light')}
              className={`p-4 rounded-2xl text-left transition-all relative flex flex-col justify-between border ${
                theme === 'light'
                  ? 'bg-white text-slate-900 border-slate-300 shadow-md ring-2 ring-slate-900/20'
                  : 'bg-white/10 text-neutral-300 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                  <Sun className="w-4 h-4 text-amber-500" />
                </div>
                {theme === 'light' && (
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Светлая (белая)
                </span>
                <span className="block text-[11px] text-slate-600 mt-0.5 leading-snug">
                  Чистый белый, ледяной глянец и мягкие тени
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Data & Privacy Section */}
        <div className="pt-2 pb-4 border-t border-black/10 dark:border-white/10 space-y-3">
          <span className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">
            Данные браузера
          </span>

          <div className="flex items-center justify-between p-3 rounded-2xl ios-glass-card">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs font-semibold">История поисковых запросов</p>
                <p className="text-[11px] text-neutral-400">
                  Сохранено локально: {historyCount} {historyCount === 1 ? 'запись' : 'записей'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClearHistory}
              disabled={historyCount === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-400 ios-glass-button rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span className="font-mono text-[11px]">Argon Search • iOS Glass</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 active:scale-95 transition-all shadow-md"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
