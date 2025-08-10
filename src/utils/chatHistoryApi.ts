// =============================================================================
// CHAT HISTORY API UTILITIES
// =============================================================================
import type { Message } from '../types/chat';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types for chat history
export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: unknown[];
  message_metadata?: unknown;
  created_at: string;
}

export interface ChatConversation {
  id: number;
  conversation_id: string;
  title: string;
  message_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

export interface CreateConversationRequest {
  title?: string;
}

export interface SaveMessageRequest {
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: unknown[];
  message_metadata?: unknown;
}

export interface ChatHistoryResponse {
  success: boolean;
  conversations: ChatConversation[];
  total_conversations: number;
  page: number;
  per_page: number;
  total_pages: number;
  timestamp: string;
}

// Simple HTTP request function with optional authentication
const makeSimpleRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Try to get auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add authorization header if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Get chat history for the current user
 */
export const getChatHistory = async (page: number = 1, perPage: number = 20): Promise<ChatHistoryResponse> => {
  try {
    const response = await makeSimpleRequest<ChatHistoryResponse>(
      `/api/v1/ai/chat/history?page=${page}&per_page=${perPage}`,
      {
        method: 'GET',
      }
    );
    return response;
  } catch (error) {
    console.error('Failed to get chat history:', error);
    throw error;
  }
};

/**
 * Get a specific conversation with messages
 */
export const getConversation = async (conversationId: string): Promise<ChatConversation> => {
  try {
    const response = await makeSimpleRequest<ChatConversation>(
      `/api/v1/ai/chat/conversations/${conversationId}`,
      {
        method: 'GET',
      }
    );
    return response;
  } catch (error) {
    console.error('Failed to get conversation:', error);
    throw error;
  }
};

/**
 * Create a new conversation
 */
export const createConversation = async (request: CreateConversationRequest): Promise<{
  success: boolean;
  conversation_id: string;
  title: string;
  created_at: string;
}> => {
  try {
    const response = await makeSimpleRequest<{
      success: boolean;
      conversation_id: string;
      title: string;
      created_at: string;
    }>('/api/v1/ai/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response;
  } catch (error) {
    console.error('Failed to create conversation:', error);
    throw error;
  }
};

/**
 * Save a message to a conversation
 */
export const saveMessage = async (request: SaveMessageRequest): Promise<{
  success: boolean;
  message_id: number;
  conversation_id: string;
  saved_at: string;
}> => {
  try {
    const response = await makeSimpleRequest<{
      success: boolean;
      message_id: number;
      conversation_id: string;
      saved_at: string;
    }>('/api/v1/ai/chat/messages', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response;
  } catch (error) {
    console.error('Failed to save message:', error);
    throw error;
  }
};

/**
 * Update conversation details
 */
export const updateConversation = async (
  conversationId: string,
  updates: { title?: string; is_active?: boolean }
): Promise<{
  success: boolean;
  conversation_id: string;
  updated_at: string;
}> => {
  try {
    const response = await makeSimpleRequest<{
      success: boolean;
      conversation_id: string;
      updated_at: string;
    }>(`/api/v1/ai/chat/conversations/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response;
  } catch (error) {
    console.error('Failed to update conversation:', error);
    throw error;
  }
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId: string): Promise<{
  success: boolean;
  conversation_id: string;
  deleted_at: string;
}> => {
  try {
    const response = await makeSimpleRequest<{
      success: boolean;
      conversation_id: string;
      deleted_at: string;
    }>(`/api/v1/ai/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    throw error;
  }
};

/**
 * Generate a conversation title from the first message
 */
export const generateConversationTitle = (firstMessage: string): string => {
  // Take first 40 characters and add ellipsis if longer
  if (firstMessage.length <= 40) {
    return firstMessage;
  }
  
  // Try to break at word boundaries
  const truncated = firstMessage.substring(0, 37);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 20) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

/**
 * Save current conversation automatically
 */
export const saveCurrentConversation = async (
  messages: Message[],
  conversationId?: string,
  title?: string
): Promise<string | null> => {
  if (messages.length === 0) {
    return null;
  }

  try {
    let currentConversationId = conversationId;

    // Create conversation if it doesn't exist
    if (!currentConversationId) {
      const firstUserMessage = messages.find(msg => msg.role === 'user')?.content || '';
      const conversationTitle = title || generateConversationTitle(firstUserMessage);
      
      const newConversation = await createConversation({
        title: conversationTitle
      });
      currentConversationId = newConversation.conversation_id;
    }

    // Save all messages that haven't been saved yet
    for (const message of messages) {
      // Skip if message already has an ID (already saved)
      if (typeof message.id === 'number') continue;

      await saveMessage({
        conversation_id: currentConversationId,
        role: message.role,
        content: message.content,
        sources: message.sources,
        message_metadata: {} // Message type doesn't have message_metadata
      });
    }

    return currentConversationId;
  } catch (error) {
    console.error('Failed to save conversation:', error);
    throw error;
  }
};
