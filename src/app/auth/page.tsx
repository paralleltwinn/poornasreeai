// =============================================================================
// AUTHENTICATION PAGE
// =============================================================================

/**
 * Dedicated authentication page
 * Can be used as /auth route or embedded in the main application
 */

'use client';

import React from 'react';
import { AuthScreen } from '../../components/auth';
import { useRouter } from 'next/navigation';

const AuthPage: React.FC = () => {
  const router = useRouter();

  const handleAuthSuccess = () => {
    // Redirect to dashboard or home page after successful authentication
    router.push('/');
  };

  return (
    <AuthScreen 
      onAuthSuccess={handleAuthSuccess}
      initialStep="login"
    />
  );
};

export default AuthPage;
