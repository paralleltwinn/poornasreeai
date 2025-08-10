// =============================================================================
// API UTILITIES
// =============================================================================

/**
 * Utilities for making API calls to the psr-ai-api backend
 * Handles authentication, error handling, and response formatting
 */

import { 
  LoginRequest, 
  LoginResponse, 
  OTPRequest, 
  OTPVerifyRequest,
  CustomerRegistration,
  EngineerRegistration,
  APIResponse,
  User
} from '../types/auth';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: string[]
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Helper function to make authenticated requests
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.message || 'An error occurred',
        response.status,
        data.errors
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network or other errors
    throw new APIError(
      'Network error occurred. Please check your connection.',
      500
    );
  }
};

// =============================================================================
// AUTHENTICATION API FUNCTIONS
// =============================================================================

export const authAPI = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return makeRequest<LoginResponse>(`${API_VERSION}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Request OTP for login or registration
   */
  async requestOTP(data: OTPRequest): Promise<APIResponse> {
    return makeRequest<APIResponse>(`${API_VERSION}/auth/request-otp`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Verify OTP and login
   */
  async verifyOTP(data: OTPVerifyRequest): Promise<LoginResponse> {
    return makeRequest<LoginResponse>(`${API_VERSION}/auth/verify-otp`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Register new customer account
   */
  async registerCustomer(data: CustomerRegistration): Promise<LoginResponse> {
    return makeRequest<LoginResponse>(`${API_VERSION}/auth/register/customer`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Apply as engineer
   */
  async registerEngineer(data: EngineerRegistration): Promise<APIResponse> {
    return makeRequest<APIResponse>(`${API_VERSION}/auth/register/engineer`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Check user login method (password vs OTP)
   */
  async checkLoginMethod(email: string): Promise<{
    requires_password: boolean;
    user_role: string | null;
    user_exists: boolean;
  }> {
    return makeRequest<{
      requires_password: boolean;
      user_role: string | null;
      user_exists: boolean;
    }>(`${API_VERSION}/auth/check-login-method/${encodeURIComponent(email)}`);
  },
};

// =============================================================================
// USER API FUNCTIONS
// =============================================================================

export const userAPI = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return makeRequest<User>(`${API_VERSION}/users/me`);
  },

  /**
   * Get user notifications
   */
  async getNotifications(page = 1, size = 20) {
    return makeRequest(`${API_VERSION}/users/notifications?page=${page}&size=${size}`);
  },

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: number): Promise<APIResponse> {
    return makeRequest<APIResponse>(`${API_VERSION}/users/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Store authentication token
 */
export const storeAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    console.log('Storing auth token:', token);
    localStorage.setItem('auth_token', token);
    console.log('Token stored, localStorage auth_token:', localStorage.getItem('auth_token'));
  }
};

/**
 * Remove authentication token
 */
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

/**
 * Decode JWT token (basic implementation)
 */
export const decodeToken = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return (decoded.exp as number) < currentTime;
};

export { APIError, makeRequest };
