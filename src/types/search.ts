export type SearchMode = 'overview' | 'fast' | 'deep' | 'news';

export type TimeFilter = 'all' | 'day' | 'week' | 'month' | 'year';

export type AppTheme = 'dark' | 'light';

export interface SearchSource {
  id: number;
  title: string;
  uri: string;
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

export interface SearchResponse {
  query: string;
  mode: SearchMode;
  latencyMs: number;
  text: string;
  sources: SearchSource[];
  webQueries: string[];
  suggestedQueries: string[];
  directWebsite?: DirectWebsite | null;
  searchEntryPointHtml?: string | null;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  mode: SearchMode;
  bookmarked?: boolean;
}

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SearchSource[];
  suggestedQueries?: string[];
  directWebsite?: DirectWebsite | null;
  latencyMs?: number;
  timestamp: number;
}

export interface WebAIMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  sources?: Array<{ id: number; title: string; uri: string }>;
}

export interface BrowserTab {
  id: string;
  title: string;
  query: string;
  result: SearchResponse | null;
  mode: SearchMode;
  timeFilter: TimeFilter;
  timestamp: number;
  favicon?: string;
  url?: string;
  viewType?: 'search' | 'web';
}
