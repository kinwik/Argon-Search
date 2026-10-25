import React from 'react';
import { CheckCircle2, Globe, Compass, ArrowUpRight } from 'lucide-react';
import type { DirectWebsite } from '../types/search';
import { getFaviconUrl } from '../utils/searchHelpers';

interface OfficialSiteCardProps {
  site: DirectWebsite;
  onOpenUrl?: (url: string, title?: string) => void;
}

export const OfficialSiteCard: React.FC<OfficialSiteCardProps> = ({ site, onOpenUrl }) => {
  const favicon = getFaviconUrl(site.domain);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, targetUrl: string, title?: string) => {
    if (onOpenUrl) {
      e.preventDefault();
      onOpenUrl(targetUrl, title || site.name);
    }
  };

  return (
    <div className="relative overflow-hidden ios-glass-card rounded-3xl p-5 sm:p-6 mb-6 group transition-all">
      {/* iOS Specular Top Glare Edge */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-slate-400/30 dark:via-white/50 to-transparent pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Site Identity Lockup with iOS App Icon Aesthetics */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/[0.08] border border-black/10 dark:border-white/25 backdrop-blur-2xl flex items-center justify-center p-2.5 shadow-sm shrink-0">
            <img
              src={favicon}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="w-8 h-8 object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-current tracking-tight truncate font-['Plus_Jakarta_Sans']">
                {site.name}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 backdrop-blur-xl shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Официальный сайт</span>
              </span>
            </div>

            <p className="text-xs text-neutral-400 font-mono mt-0.5 truncate tracking-wide">
              {site.domain}
            </p>
          </div>
        </div>

        {/* Primary Apple iOS Action Button (Opens as in-app browser tab) */}
        <a
          href={site.url}
          onClick={(e) => handleClick(e, site.url, site.name)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-100 active:scale-95 rounded-2xl shadow-md transition-all whitespace-nowrap shrink-0 w-full sm:w-auto cursor-pointer"
        >
          <span>Перейти на сайт</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      {/* Description */}
      {site.description && (
        <p className="text-xs sm:text-sm text-current opacity-90 mt-3.5 leading-relaxed font-normal">
          {site.description}
        </p>
      )}

      {/* Sublinks & Deep Direct Sections (e.g. YouTube Music, Тренды, Studio, Shorts) */}
      {site.sublinks && site.sublinks.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-black/10 dark:border-white/10">
          <div className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-current opacity-70" />
            <span>Быстрый переход к разделам</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {site.sublinks.map((sub, idx) => (
              <a
                key={`sub-${idx}`}
                href={sub.url}
                onClick={(e) => handleClick(e, sub.url, `${site.name}: ${sub.title}`)}
                title={sub.description}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-current ios-glass-pill hover:bg-black/5 dark:hover:bg-white/[0.18] active:scale-95 transition-all cursor-pointer"
              >
                <Globe className="w-3 h-3 opacity-60" />
                <span>{sub.title}</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
