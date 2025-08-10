// =============================================================================
// AI API FUNCTIONS
// =============================================================================

/**
 * API functions for AI chat and search operations
 */

import { Source } from '../types/chat';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

// =============================================================================
// INTERFACES
// =============================================================================

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  concise?: boolean; // request concise PDF-style structured response
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  timestamp: string;
}

export interface SearchResult {
  content: string;
  score: number;
  metadata: {
    file_id: string;
    filename: string;
    chunk_index: number;
    file_type: string;
    source: string;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  total_results: number;
  timestamp: string;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Make authenticated AI API request
const makeAIRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// =============================================================================
// AI API FUNCTIONS
// =============================================================================

/**
 * Chat with AI using trained data from Weaviate and Gemini
 */
export const chatWithAI = async (request: ChatRequest): Promise<ChatResponse> => {
  return makeAIRequest<ChatResponse>(`${API_VERSION}/ai/chat`, {
    method: 'POST',
    body: JSON.stringify({ ...request }),
  });
};

/**
 * Search trained knowledge base using Weaviate vector search
 */
export const searchKnowledgeBase = async (query: string, limit: number = 5): Promise<SearchResponse> => {
  return makeAIRequest<SearchResponse>(`${API_VERSION}/ai/search`, {
    method: 'POST',
    body: JSON.stringify({ query, limit }),
  });
};

/**
 * Check AI services health
 */
export const checkAIHealth = async (): Promise<{
  overall_status: string;
  services: {
    weaviate: { connected: boolean; error?: string };
    google_ai: { configured: boolean; error?: string };
  };
}> => {
  return makeAIRequest(`${API_VERSION}/ai/health`, {
    method: 'GET',
  });
};

/**
 * Generate suggestions based on current context
 */
export const generateSuggestions = (query: string): string[] => {
  const suggestions = [
    'Tell me more about this topic',
    'Show me related information',
    'What are the latest developments?',
    'Compare different approaches',
    'Explain the benefits and drawbacks',
    'Provide practical examples',
  ];
  
  // Filter suggestions based on query context
  if (query.toLowerCase().includes('ai') || query.toLowerCase().includes('artificial intelligence')) {
    return [
      'What are the latest AI breakthroughs?',
      'Explain different types of AI models',
      'How is AI being used in industry?',
      'What are the ethical considerations?',
    ];
  }
  
  if (query.toLowerCase().includes('machine learning') || query.toLowerCase().includes('ml')) {
    return [
      'Compare supervised vs unsupervised learning',
      'What are popular ML algorithms?',
      'How to choose the right model?',
      'Explain deep learning concepts',
    ];
  }
  
  return suggestions;
};

/**
 * Format AI response with sources
 */
export const formatResponseWithSources = (
  response: string, 
  searchResults: SearchResult[]
): { content: string; sources: Source[] } => {
  // Convert search results to sources
  const sources: Source[] = searchResults.map((result, index) => ({
    id: `source_${index + 1}`,
    title: result.metadata.filename || 'Unknown Document',
    url: '#', // Could link to document viewer
    snippet: result.content.substring(0, 150) + '...',
    domain: 'trained-data',
    favicon: '/favicon.ico',
    relevance_score: result.score,
  }));

  // Add source references to response if applicable
  let enhancedContent = response;
  if (sources.length > 0) {
    enhancedContent += '\n\n**Sources:**\n';
    sources.forEach((source, index) => {
      const relevanceScore = source.relevance_score || 0;
      enhancedContent += `${index + 1}. ${source.title} (Relevance: ${(relevanceScore * 100).toFixed(1)}%)\n`;
    });
  }

  return {
    content: enhancedContent,
    sources,
  };
};
