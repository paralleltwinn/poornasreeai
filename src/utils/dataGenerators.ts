import { Message, Source, Suggestion } from '../types/chat';

export const generateWelcomeMessage = (name: string): Message => ({
  id: 'welcome',
  content: `Welcome to ${name}! I'm your AI research assistant. I can help you find information, answer questions, and provide insights on a wide range of topics. What would you like to explore today?`,
  role: 'assistant',
  timestamp: new Date(),
});

export const generateSampleSources = (): Source[] => [
  {
    id: '1',
    title: 'Advanced AI Research Papers',
    url: 'https://example.com/research',
    snippet: 'Latest developments in artificial intelligence and machine learning research.',
    domain: 'research.example.com',
    favicon: '/favicon.ico',
  },
  {
    id: '2',
    title: 'Technology News Updates',
    url: 'https://example.com/tech-news',
    snippet: 'Breaking news and updates from the technology industry.',
    domain: 'tech.example.com',
    favicon: '/favicon.ico',
  },
  {
    id: '3',
    title: 'Educational Resources',
    url: 'https://example.com/education',
    snippet: 'Comprehensive educational materials and tutorials.',
    domain: 'edu.example.com',
    favicon: '/favicon.ico',
  },
];

export const generateTrendingSuggestions = (): Suggestion[] => [
  { id: '1', text: 'What are the latest AI breakthroughs?', category: 'trending' },
  { id: '2', text: 'Explain quantum computing basics', category: 'trending' },
  { id: '3', text: 'Climate change solutions 2024', category: 'trending' },
  { id: '4', text: 'Future of renewable energy', category: 'trending' },
];

export const generateFollowUpSuggestions = (userQuery: string): Suggestion[] => [
  { id: '1', text: 'Tell me more about this topic', category: 'follow-up' },
  { id: '2', text: 'Show me related research', category: 'related' },
  { id: '3', text: 'What are the latest developments?', category: 'follow-up' },
  { id: '4', text: 'Compare different approaches', category: 'related' },
];

export const formatMessageId = (timestamp: number, role: 'user' | 'assistant'): string => 
  `${role}-${timestamp}`;

export const formatTimestamp = (date: Date): string => 
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const generateResponseWithSources = (query: string): { content: string; sources: Source[] } => {
  const queryLower = query.toLowerCase();
  
  // AI/Technology responses
  if (queryLower.includes('ai') || queryLower.includes('artificial intelligence')) {
    return {
      content: `Artificial Intelligence (AI) refers to computer systems that can perform tasks typically requiring human intelligence. Current AI technologies include machine learning, natural language processing, computer vision, and robotics. Recent breakthroughs in large language models like GPT and Claude have revolutionized how we interact with AI systems, enabling more natural conversations and complex reasoning capabilities.`,
      sources: [
        {
          id: '1',
          title: 'The State of AI in 2024: Progress and Challenges',
          url: 'https://example.com/ai-2024',
          snippet: 'Comprehensive overview of AI developments and future trends.',
          domain: 'ai-research.org',
        },
        {
          id: '2',
          title: 'Understanding Large Language Models',
          url: 'https://example.com/llm-guide',
          snippet: 'Deep dive into how modern AI language models work.',
          domain: 'tech-insights.com',
        },
      ],
    };
  }
  
  // Quantum computing responses
  if (queryLower.includes('quantum')) {
    return {
      content: `Quantum computing leverages quantum mechanical phenomena like superposition and entanglement to process information in fundamentally different ways than classical computers. While still in early stages, quantum computers show promise for solving complex problems in cryptography, drug discovery, and optimization that are intractable for classical computers.`,
      sources: [
        {
          id: '1',
          title: 'Quantum Computing: Current Capabilities and Future Potential',
          url: 'https://example.com/quantum-future',
          snippet: 'Analysis of quantum computing progress and applications.',
          domain: 'quantum-journal.org',
        },
        {
          id: '2',
          title: 'IBM Quantum Network: Latest Developments',
          url: 'https://example.com/ibm-quantum',
          snippet: 'Recent advances in quantum hardware and software.',
          domain: 'ibm.com',
        },
      ],
    };
  }
  
  // Climate/Environment responses
  if (queryLower.includes('climate') || queryLower.includes('environment')) {
    return {
      content: `Climate change remains one of the most pressing global challenges, with renewable energy adoption, carbon capture technologies, and sustainable practices being key solutions. Recent innovations in solar and wind technology have made renewable energy more cost-effective than fossil fuels in many regions, while emerging technologies like direct air capture and green hydrogen show promise for deep decarbonization.`,
      sources: [
        {
          id: '1',
          title: 'Renewable Energy Transitions: Global Progress Report 2024',
          url: 'https://example.com/renewable-2024',
          snippet: 'Latest data on global renewable energy adoption and costs.',
          domain: 'iea.org',
        },
        {
          id: '2',
          title: 'Carbon Capture and Storage: Technological Advances',
          url: 'https://example.com/carbon-capture',
          snippet: 'Overview of emerging carbon removal technologies.',
          domain: 'climate-tech.org',
        },
      ],
    };
  }
  
  // Default response
  return {
    content: `Thank you for your question about "${query}". Based on the latest research and expert analysis, I've compiled comprehensive information to help answer your inquiry. This topic involves multiple perspectives and recent developments that are worth exploring further.`,
    sources: [
      {
        id: '1',
        title: 'Comprehensive Research Analysis',
        url: 'https://example.com/research',
        snippet: 'In-depth analysis and expert perspectives on the topic.',
        domain: 'research-hub.org',
      },
      {
        id: '2',
        title: 'Latest Developments and Trends',
        url: 'https://example.com/trends',
        snippet: 'Current trends and future outlook for the subject.',
        domain: 'trend-analytics.com',
      },
      {
        id: '3',
        title: 'Expert Opinions and Insights',
        url: 'https://example.com/insights',
        snippet: 'Professional insights from industry experts.',
        domain: 'expert-views.net',
      },
    ],
  };
};
