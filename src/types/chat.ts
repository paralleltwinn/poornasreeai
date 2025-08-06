export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sources?: Source[];
  status?: 'sending' | 'sent' | 'error';
}

export interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
  domain: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  relevanceScore: number;
}

export interface Suggestion {
  id: string;
  text: string;
  category: 'follow-up' | 'related' | 'trending';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  region: string;
  searchFilters: {
    timeRange: 'any' | 'day' | 'week' | 'month' | 'year';
    region: string;
    safeSearch: boolean;
  };
}
