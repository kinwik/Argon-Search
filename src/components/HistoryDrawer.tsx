import React from 'react';
import { X, Clock, Bookmark, Trash2 } from 'lucide-react';
import type { SearchHistoryItem } from '../types/search';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SearchHistoryItem[];
  onSelectQuery: (query: string) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onToggleBookmark: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelectQuery,
  onRemoveItem,
  onClearAll,
  onToggleBookmark,
}) => {
  if (!isOpen) return null;

  const bookmarkedItems = items.filter((i) => i.bookmarked);
  const recentItems = items.filter((i) => !i.bookmarked);

  const formatDate = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-950 border-l border-neutral-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white" />
              <h3 className="font-semibold text-white text-base font-['Plus_Jakarta_Sans']">
                История и закладки
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              aria-label="Закрыть панель"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {/* Bookmarks Section */}
            {bookmarkedItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                  <div className="flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-white" />
                    <span>Закладки ({bookmarkedItems.length})</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {bookmarkedItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all"
                    >
                      <button
                        onClick={() => {
                          onSelectQuery(item.query);
                          onClose();
                        }}
                        className="flex-1 text-left min-w-0 pr-2"
                      >
                        <p className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors truncate">
                          {item.query}
                        </p>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {formatDate(item.timestamp)}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onToggleBookmark(item.id)}
                          className="p-1 text-white hover:text-neutral-400 transition-colors"
                          title="Убрать из закладок"
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-white" />
                        </button>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-neutral-500 hover:text-white transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches Section */}
            <div>
              <div className="flex items-center justify-between mb-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <span>Недавние запросы</span>
                </div>
                {items.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-[11px] text-neutral-500 hover:text-white transition-colors"
                  >
                    Очистить всё
                  </button>
                )}
              </div>

              {recentItems.length === 0 && bookmarkedItems.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">История поиска пуста</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Ваши поисковые запросы сохраняются локально
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-850 hover:border-neutral-700 transition-all"
                    >
                      <button
                        onClick={() => {
                          onSelectQuery(item.query);
                          onClose();
                        }}
                        className="flex-1 text-left min-w-0 pr-2"
                      >
                        <p className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors truncate">
                          {item.query}
                        </p>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {formatDate(item.timestamp)}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onToggleBookmark(item.id)}
                          className="p-1 text-neutral-500 hover:text-white transition-colors"
                          title="Добавить в закладки"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-neutral-500 hover:text-white transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
