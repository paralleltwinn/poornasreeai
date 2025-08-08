// =============================================================================
// API RESPONSE HOOK
// =============================================================================

/**
 * Custom hook for handling API responses with snackbar notifications
 * Provides standardized success/error handling across the application
 */

'use client';

import { useCallback } from 'react';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { APIError } from '@/utils/api';

export interface ApiResponseOptions {
  successMessage?: string;
  successTitle?: string;
  errorTitle?: string;
  showSuccess?: boolean;
  showError?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: APIError) => void;
}

export const useApiResponse = () => {
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar();

  /**
   * Handle API response with automatic snackbar notifications
   */
  const handleApiResponse = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: ApiResponseOptions = {}
  ): Promise<T | null> => {
    const {
      successMessage,
      successTitle = 'Success',
      errorTitle = 'Error',
      showSuccess: shouldShowSuccess = true,
      showError: shouldShowError = true,
      onSuccess,
      onError,
    } = options;

    try {
      const result = await apiCall();
      
      // Handle success
      if (shouldShowSuccess) {
        const message = successMessage || getDefaultSuccessMessage(result);
        showSuccess(message, successTitle);
      }
      
      onSuccess?.(result);
      return result;
      
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle error
      if (shouldShowError) {
        const errorMessage = getErrorMessage(error);
        showError(errorMessage, errorTitle);
      }
      
      onError?.(error as APIError);
      return null;
    }
  }, [showSuccess, showError]);

  /**
   * Handle login response specifically
   */
  const handleLoginResponse = useCallback(async <T>(
    apiCall: () => Promise<T>,
    userType: 'customer' | 'engineer' | 'admin' = 'customer'
  ): Promise<T | null> => {
    return handleApiResponse(apiCall, {
      successMessage: getLoginSuccessMessage(userType),
      successTitle: 'Welcome Back!',
      errorTitle: 'Login Failed',
    });
  }, [handleApiResponse]);

  /**
   * Handle registration response
   */
  const handleRegistrationResponse = useCallback(async <T>(
    apiCall: () => Promise<T>,
    registrationType: 'customer' | 'engineer'
  ): Promise<T | null> => {
    return handleApiResponse(apiCall, {
      successMessage: getRegistrationSuccessMessage(registrationType),
      successTitle: 'Registration Successful',
      errorTitle: 'Registration Failed',
    });
  }, [handleApiResponse]);

  /**
   * Handle OTP request response
   */
  const handleOtpRequestResponse = useCallback(async <T>(
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    return handleApiResponse(apiCall, {
      successMessage: `OTP sent successfully! Please check your email.`,
      successTitle: 'OTP Sent',
      errorTitle: 'OTP Request Failed',
    });
  }, [handleApiResponse]);

  /**
   * Handle admin action responses
   */
  const handleAdminActionResponse = useCallback(async <T>(
    apiCall: () => Promise<T>,
    action: string
  ): Promise<T | null> => {
    return handleApiResponse(apiCall, {
      successMessage: `${action} completed successfully`,
      successTitle: 'Action Completed',
      errorTitle: 'Action Failed',
    });
  }, [handleApiResponse]);

  /**
   * Show manual success message
   */
  const showSuccessMessage = useCallback((message: string, title?: string) => {
    showSuccess(message, title);
  }, [showSuccess]);

  /**
   * Show manual error message
   */
  const showErrorMessage = useCallback((message: string, title?: string) => {
    showError(message, title);
  }, [showError]);

  /**
   * Show manual warning message
   */
  const showWarningMessage = useCallback((message: string, title?: string) => {
    showWarning(message, title);
  }, [showWarning]);

  /**
   * Show manual info message
   */
  const showInfoMessage = useCallback((message: string, title?: string) => {
    showInfo(message, title);
  }, [showInfo]);

  return {
    handleApiResponse,
    handleLoginResponse,
    handleRegistrationResponse,
    handleOtpRequestResponse,
    handleAdminActionResponse,
    showSuccessMessage,
    showErrorMessage,
    showWarningMessage,
    showInfoMessage,
  };
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get default success message from API response
 */
const getDefaultSuccessMessage = (response: unknown): string => {
  // Try to extract message from various response formats
  if (typeof response === 'object' && response !== null) {
    const responseObj = response as Record<string, unknown>;
    if (responseObj.message && typeof responseObj.message === 'string') return responseObj.message;
    if (responseObj.detail && typeof responseObj.detail === 'string') return responseObj.detail;
    if (responseObj.success && typeof responseObj.success === 'string') return responseObj.success;
  }
  
  return 'Operation completed successfully';
};

/**
 * Get user-friendly error message
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof APIError) {
    return error.message;
  }
  
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    if (errorObj.message && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    if (errorObj.detail && typeof errorObj.detail === 'string') {
      return errorObj.detail;
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Get login success message based on user type
 */
const getLoginSuccessMessage = (userType: string): string => {
  switch (userType.toLowerCase()) {
    case 'customer':
      return 'Welcome back! You are now logged in as a customer.';
    case 'engineer':
      return 'Welcome back! You are now logged in as an engineer.';
    case 'admin':
    case 'super_admin':
      return 'Welcome back! You are now logged in as an administrator.';
    default:
      return 'Welcome back! You are now logged in.';
  }
};

/**
 * Get registration success message based on type
 */
const getRegistrationSuccessMessage = (registrationType: string): string => {
  switch (registrationType.toLowerCase()) {
    case 'customer':
      return 'Customer registration successful! You can now access all customer features.';
    case 'engineer':
      return 'Engineer application submitted successfully! You will receive an email notification once your application is reviewed.';
    default:
      return 'Registration completed successfully!';
  }
};
