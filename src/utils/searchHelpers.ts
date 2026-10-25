/**
 * Search helpers and citation utilities for Argon Search.
 * Pure logic decoupled for testability and zero-dependency reliability.
 */

export interface GroundingSource {
  id: number;
  uri: string;
  title: string;
  domain: string;
  snippet?: string;
  isOfficial?: boolean;
  category?: 'official' | 'article' | 'media' | 'general';
}

export interface DirectWebsite {
  name: string;
  url: string;
  domain: string;
  description: string;
  category?: string;
  sublinks?: Array<{ title: string; url: string; description?: string }>;
}

export const COMMON_SITES: Record<string, DirectWebsite> = {
  youtube: {
    name: 'YouTube',
    url: 'https://www.youtube.com',
    domain: 'youtube.com',
    category: 'Видеохостинг и медиа',
    description: 'Крупнейший мировой видеохостинг и стриминговая платформа от Google. Смотрите видеоролики, музыку, прямые трансляции, Shorts и делитесь контентом со всем миром.',
    sublinks: [
      { title: 'YouTube Music', url: 'https://music.youtube.com', description: 'Музыкальные треки, альбомы и плейлисты' },
      { title: 'Тренды YouTube', url: 'https://www.youtube.com/feed/trending', description: 'Самые популярные видео прямо сейчас' },
      { title: 'YouTube Studio', url: 'https://studio.youtube.com', description: 'Творческая студия для авторов и аналитики' },
      { title: 'YouTube Shorts', url: 'https://www.youtube.com/shorts', description: 'Короткие вертикальные видеоклипы' },
      { title: 'YouTube Детям', url: 'https://www.youtubekids.com', description: 'Безопасный детский видеоконтент' },
      { title: 'Подписки', url: 'https://www.youtube.com/feed/subscriptions', description: 'Новые ролики от ваших любимых каналов' },
      { title: 'Справка и поддержка', url: 'https://support.google.com/youtube', description: 'Помощь, настройки и решение проблем' },
    ],
  },
  github: {
    name: 'GitHub',
    url: 'https://github.com',
    domain: 'github.com',
    category: 'Разработка и Open-Source',
    description: 'Крупнейшая платформа для совместной разработки программного обеспечения, хостинга Git-репозиториев и управления проектами.',
    sublinks: [
      { title: 'GitHub Explore', url: 'https://github.com/explore', description: 'Подборки интересных проектов' },
      { title: 'GitHub Trending', url: 'https://github.com/trending', description: 'Трендовые репозитории дня и недели' },
      { title: 'GitHub Docs', url: 'https://docs.github.com', description: 'Официальная документация' },
      { title: 'GitHub Marketplace', url: 'https://github.com/marketplace', description: 'Инструменты и GitHub Actions' },
    ],
  },
  telegram: {
    name: 'Telegram',
    url: 'https://telegram.org',
    domain: 'telegram.org',
    category: 'Мессенджер и каналы',
    description: 'Быстрый, безопасный и кроссплатформенный мессенджер с облачной синхронизацией, каналами, группами и ботами.',
    sublinks: [
      { title: 'Telegram Web (K)', url: 'https://web.telegram.org/k/', description: 'Веб-версия Telegram в браузере' },
      { title: 'Telegram Web (A)', url: 'https://web.telegram.org/a/', description: 'Альтернативная веб-версия' },
      { title: 'Telegram Desktop', url: 'https://desktop.telegram.org', description: 'Приложение для Windows, macOS, Linux' },
      { title: 'Telegram FAQ', url: 'https://telegram.org/faq/ru', description: 'Часто задаваемые вопросы' },
    ],
  },
  vk: {
    name: 'ВКонтакте',
    url: 'https://vk.com',
    domain: 'vk.com',
    category: 'Социальная сеть',
    description: 'Главная социальная сеть русскоязычного интернета. Общение, музыка, видео, сообщества и сервисы.',
    sublinks: [
      { title: 'VK Музыка', url: 'https://vk.com/music', description: 'Стриминг треков и плейлистов' },
      { title: 'VK Видео', url: 'https://vk.com/video', description: 'Фильмы, сериалы, ролики и стримы' },
      { title: 'VK Клипы', url: 'https://vk.com/clips', description: 'Короткие вертикальные ролики' },
      { title: 'VK Мессенджер', url: 'https://vk.com/im', description: 'Личные сообщения и чаты' },
    ],
  },
  google: {
    name: 'Google',
    url: 'https://www.google.com',
    domain: 'google.com',
    category: 'Поисковая система',
    description: 'Ведущая мировая поисковая система и цифровая платформа сервисов Google.',
    sublinks: [
      { title: 'Google Диск', url: 'https://drive.google.com', description: 'Облачное хранилище файлов' },
      { title: 'Google Карты', url: 'https://maps.google.com', description: 'Навигация и карты мира' },
      { title: 'Gmail', url: 'https://mail.google.com', description: 'Почтовый сервис Google' },
      { title: 'Google Переводчик', url: 'https://translate.google.com', description: 'Мгновенный перевод текстов' },
    ],
  },
  yandex: {
    name: 'Яндекс',
    url: 'https://ya.ru',
    domain: 'ya.ru',
    category: 'Поисковая система и экосистема',
    description: 'Российская поисковая система и экосистема сервисов: Карты, Музыка, Маркет, Такси, Погода, Диск.',
    sublinks: [
      { title: 'Яндекс Карты', url: 'https://yandex.ru/maps', description: 'Карты, пробки и маршруты' },
      { title: 'Яндекс Музыка', url: 'https://music.yandex.ru', description: 'Треки, подкасты и плейлисты' },
      { title: 'Яндекс Погода', url: 'https://yandex.ru/pogoda', description: 'Прогноз погоды по часам' },
      { title: 'Яндекс Маркет', url: 'https://market.yandex.ru', description: 'Маркетплейс товаров' },
    ],
  },
  reddit: {
    name: 'Reddit',
    url: 'https://www.reddit.com',
    domain: 'reddit.com',
    category: 'Форум и сообщества',
    description: 'Крупнейшая мировая платформа сообществ (сабреддитов), дискуссий, новостей и обмена опытом.',
    sublinks: [
      { title: 'Popular', url: 'https://www.reddit.com/r/popular/', description: 'Самые обсуждаемые посты дня' },
      { title: 'All Subreddits', url: 'https://www.reddit.com/subreddits/', description: 'Каталог тематических сообществ' },
    ],
  },
  wikipedia: {
    name: 'Википедия',
    url: 'https://ru.wikipedia.org',
    domain: 'ru.wikipedia.org',
    category: 'Интернет-энциклопедия',
    description: 'Свободная общедоступная многоязычная универсальная интернет-энциклопедия.',
    sublinks: [
      { title: 'Заглавная страница', url: 'https://ru.wikipedia.org/wiki/%D0%97%D0%B0%D0%B3%D0%BB%D0%B0%D0%B2%D0%BD%D0%B0%D1%8F_%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0' },
      { title: 'Портал сообщества', url: 'https://ru.wikipedia.org/wiki/%D0%92%D0%B8%D0%BA%D0%B8%D0%BF%D0%B5%D0%B4%D0%B8%D1%8F:%D0%9F%D0%BE%D1%80%D1%82%D0%B0%D0%BB_%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D1%81%D1%82%D0%B2%D0%B0' },
    ],
  },
  habr: {
    name: 'Хабр',
    url: 'https://habr.com',
    domain: 'habr.com',
    category: 'IT-сообщество и медиа',
    description: 'Главное русскоязычное сообщество IT-специалистов, статьи о программировании, дизайне, науке и карьере.',
    sublinks: [
      { title: 'Статьи и публикации', url: 'https://habr.com/ru/articles/', description: 'Свежие статьи IT-сообщества' },
      { title: 'Хабы по темам', url: 'https://habr.com/ru/hubs/', description: 'Каталог IT-направлений' },
    ],
  },
  twitch: {
    name: 'Twitch',
    url: 'https://www.twitch.tv',
    domain: 'twitch.tv',
    category: 'Стриминговая платформа',
    description: 'Ведущая мировая платформа для прямых видеотрансляций игр, киберспорта, музыки и живого общения.',
    sublinks: [
      { title: 'Трансляции и категории', url: 'https://www.twitch.tv/directory', description: 'Популярные категории и игры' },
    ],
  },
  steam: {
    name: 'Steam',
    url: 'https://store.steampowered.com',
    domain: 'steampowered.com',
    category: 'Игровая платформа',
    description: 'Крупнейший сервис цифровой дистрибуции компьютерных игр и сообщество геймеров от Valve.',
    sublinks: [
      { title: 'Магазин Steam', url: 'https://store.steampowered.com', description: 'Игры, скидки и новинки' },
      { title: 'Сообщество Steam', url: 'https://steamcommunity.com', description: 'Форумы, обзоры и мастерская' },
    ],
  },
  kinopoisk: {
    name: 'Кинопоиск',
    url: 'https://www.kinopoisk.ru',
    domain: 'kinopoisk.ru',
    category: 'Кино и онлайн-кинотеатр',
    description: 'Главный русскоязычный портал о кино: база фильмов, рейтинги, отзывы зрителей и онлайн-кинотеатр.',
    sublinks: [
      { title: 'Фильмы и топ-250', url: 'https://www.kinopoisk.ru/lists/top250/', description: 'Лучшие фильмы по версии зрителей' },
      { title: 'Онлайн-кинотеатр', url: 'https://hd.kinopoisk.ru', description: 'Смотреть фильмы и сериалы' },
    ],
  },
  rutube: {
    name: 'RUTUBE',
    url: 'https://rutube.ru',
    domain: 'rutube.ru',
    category: 'Видеохостинг',
    description: 'Российский видеохостинг и стриминговый сервис с фильмами, шоу, сериалами и блогерскими каналами.',
  },
  wpogoda: {
    name: 'w pogoda (Погода)',
    url: 'https://kinwik.github.io/?shem=aimgspe',
    domain: 'kinwik.github.io',
    category: 'Погода и метеопрогноз',
    description: 'w pogoda — Прогноз погоды в Санкт-Петербурге и городах в реальном времени: температура воздуха, осадки, давление, влажность, ветер и почасовой прогноз.',
    sublinks: [
      { title: 'w pogoda Онлайн', url: 'https://kinwik.github.io/?shem=aimgspe', description: 'Интерактивный прогноз погоды онлайн' },
    ],
  },
  claude: {
    name: 'Claude (Anthropic)',
    url: 'https://claude.ai',
    domain: 'claude.ai',
    category: 'Искусственный интеллект и чат-бот',
    description: 'Интеллектуальный AI-ассистент от Anthropic. Программирование, анализ текстов и документов, написание кода и решение аналитических задач.',
    sublinks: [
      { title: 'Claude AI Чат', url: 'https://claude.ai', description: 'Интерфейс общения с Claude' },
      { title: 'Anthropic Docs', url: 'https://docs.anthropic.com', description: 'Документация и возможности API' },
    ],
  },
  gemini: {
    name: 'Google Gemini',
    url: 'https://gemini.google.com',
    domain: 'gemini.google.com',
    category: 'Искусственный интеллект от Google',
    description: 'Мультимодальный AI-помощник от Google. Анализ текстов, кода, изображений, поиск информации и генерация контента.',
    sublinks: [
      { title: 'Gemini Чат', url: 'https://gemini.google.com', description: 'Диалог с AI-моделью Gemini' },
      { title: 'Google AI Studio', url: 'https://aistudio.google.com', description: 'Студия разработки для инженеров' },
    ],
  },
};

/**
 * Normalizes query string for brand and intent matching.
 */
function normalizeQueryForMatching(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[«»""''.,!?]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Detects if a query refers to a direct web service or domain URL.
 * Supports natural language variations like:
 * "youtube", "ютуб", "ютюб", "сайт ютуб", "ютуб видео", "видео youtube", "смотреть ютуб", "youtube com"
 */
export function detectDirectWebsite(query: string): DirectWebsite | null {
  if (!query || typeof query !== 'string') return null;

  const normalized = normalizeQueryForMatching(query);
  const cleanTokens = normalized.split(' ');

  // 1. YouTube matching patterns
  const isYouTubeQuery =
    normalized.includes('youtube') ||
    normalized.includes('ютуб') ||
    normalized.includes('ютюб') ||
    normalized.includes('ютьюб') ||
    cleanTokens.includes('yt') ||
    normalized.startsWith('www.youtube') ||
    normalized.startsWith('m.youtube');

  if (isYouTubeQuery) {
    return COMMON_SITES.youtube;
  }

  // 2. GitHub matching patterns
  const isGitHubQuery =
    normalized.includes('github') ||
    normalized.includes('гитхаб') ||
    normalized.includes('гит хаб');

  if (isGitHubQuery) {
    return COMMON_SITES.github;
  }

  // 3. Telegram matching patterns
  const isTelegramQuery =
    normalized.includes('telegram') ||
    normalized.includes('телеграм') ||
    normalized.includes('телега') ||
    cleanTokens.includes('tg');

  if (isTelegramQuery) {
    return COMMON_SITES.telegram;
  }

  // 4. VK matching patterns
  const isVkQuery =
    cleanTokens.includes('vk') ||
    cleanTokens.includes('вк') ||
    normalized.includes('вконтакте') ||
    normalized.includes('vkontakte');

  if (isVkQuery) {
    return COMMON_SITES.vk;
  }

  // 5. Yandex matching patterns
  const isYandexQuery =
    normalized.includes('yandex') ||
    normalized.includes('яндекс') ||
    cleanTokens.includes('яру');

  if (isYandexQuery) {
    return COMMON_SITES.yandex;
  }

  // 6. Google matching patterns (when user explicitly searches for the service/search engine itself)
  const isGoogleQuery =
    (normalized.includes('google') || normalized.includes('гугл')) &&
    !normalized.includes('gemini') &&
    !normalized.includes('джемини') &&
    !normalized.includes('гемини') &&
    (cleanTokens.length <= 3 || normalized.includes('сайт') || normalized.includes('поиск') || normalized.includes('диск') || normalized.includes('карты'));

  if (isGoogleQuery) {
    return COMMON_SITES.google;
  }

  // 7. Reddit matching patterns
  const isRedditQuery = normalized.includes('reddit') || normalized.includes('реддит');
  if (isRedditQuery) {
    return COMMON_SITES.reddit;
  }

  // 8. Wikipedia explicit search
  const isWikiQuery =
    normalized.includes('wikipedia') ||
    normalized.includes('википедия') ||
    normalized.includes('википедии');
  if (isWikiQuery && cleanTokens.length <= 3) {
    return COMMON_SITES.wikipedia;
  }

  // 9. Habr matching
  const isHabrQuery = normalized.includes('habr') || normalized.includes('хабр');
  if (isHabrQuery) {
    return COMMON_SITES.habr;
  }

  // 10. Twitch matching
  const isTwitchQuery = normalized.includes('twitch') || normalized.includes('твич');
  if (isTwitchQuery) {
    return COMMON_SITES.twitch;
  }

  // 11. Steam matching
  const isSteamQuery = normalized.includes('steam') || normalized.includes('стим');
  if (isSteamQuery) {
    return COMMON_SITES.steam;
  }

  // 12. Kinopoisk matching
  const isKinopoiskQuery = normalized.includes('kinopoisk') || normalized.includes('кинопоиск');
  if (isKinopoiskQuery) {
    return COMMON_SITES.kinopoisk;
  }

  // 13. Rutube matching
  const isRutubeQuery = normalized.includes('rutube') || normalized.includes('рутуб');
  if (isRutubeQuery) {
    return COMMON_SITES.rutube;
  }

  // 14. Weather / w pogoda ("в погода") matching
  const isWeatherQuery =
    normalized.includes('в погода') ||
    normalized.includes('в погоде') ||
    normalized.includes('w pogoda') ||
    normalized.includes('wpogoda') ||
    normalized.includes('kinwik') ||
    normalized === 'погода' ||
    normalized === 'weather' ||
    normalized.startsWith('погода ') ||
    normalized.endsWith(' погода') ||
    normalized.includes('прогноз погоды') ||
    normalized.includes('погода спб') ||
    normalized.includes('погода онлайн');

  if (isWeatherQuery) {
    return COMMON_SITES.wpogoda;
  }

  // 15. Claude matching
  const isClaudeQuery =
    normalized.includes('claude') ||
    normalized.includes('клод') ||
    normalized.includes('anthropic') ||
    normalized.includes('claude.ai');

  if (isClaudeQuery) {
    return COMMON_SITES.claude;
  }

  // 16. Gemini matching
  const isGeminiQuery =
    normalized.includes('gemini') ||
    normalized.includes('джемини') ||
    normalized.includes('гемини') ||
    normalized.includes('гугл джемини') ||
    normalized.includes('gemini.google');

  if (isGeminiQuery) {
    return COMMON_SITES.gemini;
  }

  // 17. Check generic exact domain pattern e.g. "site.com" or "project.org"
  const rawClean = query
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/.*$/, '');

  const domainPattern = /^([a-z0-9-]+)\.(com|ru|org|net|io|dev|ai|app|co|me|tv|cc|to|fm|xyz|by|kz|ua)$/i;
  const match = rawClean.match(domainPattern);
  if (match) {
    const domainName = match[1];
    return {
      name: domainName.charAt(0).toUpperCase() + domainName.slice(1),
      url: `https://${rawClean}`,
      domain: rawClean,
      description: `Официальный веб-сайт ${rawClean}`,
      category: 'Официальный сайт',
    };
  }

  return null;
}

/**
 * Extracts clean domain name from a URL (e.g., "nature.com", "wikipedia.org").
 */
export function extractDomain(url: string): string {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^/:]+)/i);
    return match ? match[1].toLowerCase() : url;
  }
}

/**
 * Returns a high-res favicon URL for a given domain using Google Favicon API.
 */
export function getFaviconUrl(urlOrDomain: string): string {
  const domain = extractDomain(urlOrDomain);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

/**
 * Sanitizes and normalizes user query string.
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  return query
    .trim()
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 400);
}

/**
 * Calculates estimated reading time in minutes or seconds.
 */
export function calculateReadingTime(text: string): string {
  if (!text) return '1 мин';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 180);
  if (minutes <= 1) return '< 1 мин';
  return `${minutes} мин`;
}

/**
 * Extracts all unique citation numbers (e.g. [1], [2], [1, 2], [3][4]) referenced in markdown.
 */
export function extractCitationIndices(markdown: string): number[] {
  if (!markdown) return [];
  const citationRegex = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
  const indices = new Set<number>();
  let match: RegExpExecArray | null;

  while ((match = citationRegex.exec(markdown)) !== null) {
    const nums = match[1].split(',').map((n) => parseInt(n.trim(), 10));
    for (const num of nums) {
      if (!isNaN(num) && num > 0) {
        indices.add(num);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

/**
 * Normalizes and deduplicates grounding chunks returned from Gemini search grounding.
 */
export function deduplicateGroundingSources(
  rawChunks: Array<{ web?: { uri?: string; title?: string } }> | undefined | null
): GroundingSource[] {
  if (!Array.isArray(rawChunks)) return [];

  const seenUris = new Set<string>();
  const sources: GroundingSource[] = [];
  let index = 1;

  for (const chunk of rawChunks) {
    const web = chunk?.web;
    if (!web || !web.uri) continue;

    const uri = web.uri.trim();
    const normalizedKey = uri.replace(/#.*$/, '').replace(/\/$/, '').toLowerCase();

    if (seenUris.has(normalizedKey)) continue;
    seenUris.add(normalizedKey);

    const domain = extractDomain(uri);
    const title = (web.title && web.title.trim()) || domain || `Источник ${index}`;

    sources.push({
      id: index,
      uri,
      title,
      domain,
    });
    index++;
  }

  return sources;
}

/**
 * Formats elapsed response time into a clean human label (e.g., "0.45 с").
 */
export function formatSearchLatency(ms: number): string {
  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) return '0.0 с';
  if (ms < 1000) {
    return `${(ms / 1000).toFixed(2)} с`;
  }
  return `${(ms / 1000).toFixed(1)} с`;
}
