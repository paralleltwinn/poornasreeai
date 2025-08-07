// =============================================================================
// AUTHENTICATION COMPONENTS EXPORTS
// =============================================================================

/**
 * Centralized exports for all authentication components
 */

export { default as AuthScreen } from './AuthScreen';
export { default as AuthLayout } from './AuthLayout';
export { default as LoginForm } from './LoginForm';
export { default as RegistrationType } from './RegistrationType';
export { default as CustomerRegistrationForm } from './CustomerRegistrationForm';
export { default as EngineerRegistrationForm } from './EngineerRegistrationForm';
export { default as ProtectedRoute } from './ProtectedRoute';

// Re-export auth context and hooks
export { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Re-export auth types
export * from '../../types/auth';
