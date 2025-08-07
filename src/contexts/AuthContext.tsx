// =============================================================================
// AUTHENTICATION CONTEXT
// =============================================================================

/**
 * React context for managing authentication state
 * Provides login, logout, and user management functionality
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  AuthState,
  AuthContextType,
  LoginRequest,
  OTPRequest,
  OTPVerifyRequest,
  CustomerRegistration,
  EngineerRegistration,
  User,
} from '../types/auth';
import { 
  authAPI, 
  userAPI, 
  storeAuthToken, 
  removeAuthToken, 
  isTokenExpired,
  APIError
} from '../utils/api';

// =============================================================================
// REDUCER TYPES AND ACTIONS
// =============================================================================

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading=true to wait for auth initialization
  error: null,
};

// =============================================================================
// REDUCER FUNCTION
// =============================================================================

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'LOGIN_SUCCESS':
      console.log('AuthContext Reducer: LOGIN_SUCCESS dispatched', action.payload);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // =============================================================================
  // INITIALIZATION EFFECT
  // =============================================================================

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthContext: Initializing authentication...');
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('AuthContext: No token found');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      console.log('AuthContext: Token found, checking expiration...');
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('AuthContext: Token expired, removing...');
        removeAuthToken();
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        console.log('AuthContext: Token valid, fetching user profile...');
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Fetch current user profile
        const user = await userAPI.getProfile();
        console.log('AuthContext: User profile fetched:', user);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
        
        console.log('AuthContext: Authentication initialized successfully');
      } catch (error) {
        console.error('Auth initialization failed:', error);
        removeAuthToken();
        dispatch({ type: 'SET_ERROR', payload: 'Session expired. Please login again.' });
      }
    };

    initializeAuth();
  }, []);

  // =============================================================================
  // AUTH METHODS
  // =============================================================================

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      console.log('Starting login process for:', credentials.email);
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
      storeAuthToken(response.access_token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.access_token,
        },
      });
      
      console.log('Login successful, user role:', response.user.role);
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof APIError ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const loginWithOTP = async (data: OTPVerifyRequest): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authAPI.verifyOTP(data);
      
      storeAuthToken(response.access_token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.access_token,
        },
      });
    } catch (error) {
      const message = error instanceof APIError ? error.message : 'OTP verification failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const requestOTP = async (data: OTPRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      await authAPI.requestOTP(data);
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return true;
    } catch (error) {
      const message = error instanceof APIError ? error.message : 'Failed to send OTP';
      dispatch({ type: 'SET_ERROR', payload: message });
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const registerCustomer = async (data: CustomerRegistration): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authAPI.registerCustomer(data);
      
      storeAuthToken(response.access_token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.access_token,
        },
      });
    } catch (error) {
      const message = error instanceof APIError ? error.message : 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const registerEngineer = async (data: EngineerRegistration): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      await authAPI.registerEngineer(data);
      
      dispatch({ type: 'SET_LOADING', payload: false });
      // Note: Engineer registration doesn't auto-login, requires admin approval
    } catch (error) {
      const message = error instanceof APIError ? error.message : 'Engineer application failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const logout = (): void => {
    removeAuthToken();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const contextValue: AuthContextType = {
    ...state,
    login,
    loginWithOTP,
    requestOTP,
    registerCustomer,
    registerEngineer,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// =============================================================================
// HOOK FOR USING AUTH CONTEXT
// =============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
