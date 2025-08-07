// =============================================================================
// PROTECTED ROUTE COMPONENT
// =============================================================================

/**
 * Higher-order component for protecting routes that require authentication
 * Redirects to login if user is not authenticated
 */

'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import AuthScreen from './AuthScreen';
import Loading from '../Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return fallback || <Loading />;
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Check role permissions if required
  if (requiredRole && user) {
    const hasRequiredRole = requiredRole.includes(user.role);
    
    if (!hasRequiredRole) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            padding: 3,
          }}
        >
          <Box>
            <h2>Access Denied</h2>
            <p>You don&apos;t have permission to access this page.</p>
          </Box>
        </Box>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
