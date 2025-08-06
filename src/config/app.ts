export interface AppConfig {
  name: string;
  description: string;
  version: string;
  author: string;
  url: string;
  keywords: string[];
  features: {
    chat: boolean;
    search: boolean;
    sources: boolean;
    suggestions: boolean;
  };
  ui: {
    maxChatWidth: number;
    animationDuration: number;
    defaultTheme: 'light' | 'dark';
  };
  chat: {
    maxMessages: number;
    typingDelay: number;
    welcomeMessage: string;
    placeholders: string[];
  };
}

export const appConfig: AppConfig = {
  name: 'Poornasree AI',
  description: 'An intelligent AI assistant for research, analysis, and knowledge discovery',
  version: '1.0.0',
  author: 'Poornasree',
  url: 'https://poornasree-ai.vercel.app',
  keywords: ['AI', 'research', 'chat', 'knowledge', 'assistant'],
  features: {
    chat: true,
    search: true,
    sources: true,
    suggestions: true,
  },
  ui: {
    maxChatWidth: 768,
    animationDuration: 300,
    defaultTheme: 'light',
  },
  chat: {
    maxMessages: 100,
    typingDelay: 1000,
    welcomeMessage: 'Hello! I\'m your AI research assistant. How can I help you today?',
    placeholders: [
      'Ask me anything...',
      'What would you like to research?',
      'How can I help you today?',
      'Search for information...',
      'Ask a question...',
    ],
  },
};

export default appConfig;
