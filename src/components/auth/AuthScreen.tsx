// =============================================================================
// AUTHENTICATION SCREEN COMPONENT
// =============================================================================

/**
 * Main authentication screen that handles the complete auth flow
 * Manages state between login, registration, and different auth steps
 */

'use client';

import React, { useState } from 'react';
import { Box, Fade, Alert } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { AuthStep } from '../../types/auth';

// Component imports
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';
import RegistrationType from './RegistrationType';
import CustomerRegistrationForm from './CustomerRegistrationForm';
import EngineerRegistrationForm from './EngineerRegistrationForm';

interface AuthScreenProps {
  onAuthSuccess?: () => void;
  initialStep?: AuthStep;
}

const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthSuccess,
  initialStep = 'login',
}) => {
  const { error, clearError, isLoading } = useAuth();
  
  // Auth flow state
  const [authStep, setAuthStep] = useState<AuthStep>(initialStep);
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get title and subtitle based on current step
  const getStepInfo = () => {
    switch (authStep) {
      case 'login':
        return {
          title: 'Welcome Back',
          subtitle: 'Sign in to continue your AI research journey',
        };
      case 'register-type':
        return {
          title: 'Join Poornasree AI',
          subtitle: 'Choose how you\'d like to get started',
        };
      case 'register-customer':
        return {
          title: 'Create Account',
          subtitle: 'Join thousands of researchers using AI-powered tools',
        };
      case 'register-engineer':
        return {
          title: 'Engineer Application',
          subtitle: 'Help us build the future of AI research tools',
        };
      case 'welcome':
        return {
          title: 'Welcome!',
          subtitle: 'Your account has been created successfully',
        };
      default:
        return {
          title: 'Authentication',
          subtitle: 'Sign in or create an account',
        };
    }
  };

  // Navigation handlers
  const handleGoToLogin = () => {
    setAuthStep('login');
    setEmail('');
    setSuccessMessage('');
    clearError();
  };

  const handleGoToRegister = () => {
    setAuthStep('register-type');
    clearError();
  };

  const handleRegistrationTypeSelect = (type: 'customer' | 'engineer') => {
    if (type === 'customer') {
      setAuthStep('register-customer');
    } else {
      setAuthStep('register-engineer');
    }
  };

  const handleAuthSuccess = () => {
    if (authStep === 'register-engineer') {
      // Engineer registration doesn't auto-login
      setSuccessMessage(
        'Your engineer application has been submitted successfully! ' +
        'You\'ll receive an email notification once our team reviews your application.'
      );
      setAuthStep('welcome');
    } else {
      // Customer registration or login
      onAuthSuccess?.();
    }
  };

  const handleEngineerApplicationSuccess = () => {
    setSuccessMessage(
      'Thank you for your application! We\'ve received your engineer application and ' +
      'our team will review it shortly. You\'ll receive an email notification with the decision.'
    );
    setAuthStep('welcome');
  };

  const { title, subtitle } = getStepInfo();

  // Render appropriate component based on auth step
  const renderAuthComponent = () => {
    switch (authStep) {
      case 'login':
        return (
          <LoginForm
            onRegisterClick={handleGoToRegister}
            onSuccess={handleAuthSuccess}
          />
        );

      case 'register-type':
        return (
          <RegistrationType
            onTypeSelect={handleRegistrationTypeSelect}
            onBackClick={handleGoToLogin}
          />
        );

      case 'register-customer':
        return (
          <CustomerRegistrationForm
            onBackClick={() => setAuthStep('register-type')}
            onSuccess={handleAuthSuccess}
            initialEmail={email}
          />
        );

      case 'register-engineer':
        return (
          <EngineerRegistrationForm
            onBackClick={() => setAuthStep('register-type')}
            onSuccess={handleEngineerApplicationSuccess}
            initialEmail={email}
          />
        );

      case 'welcome':
        return (
          <Box textAlign="center">
            <Fade in>
              <Alert 
                severity="success" 
                sx={{ 
                  borderRadius: 2,
                  marginBottom: 3,
                  textAlign: 'left',
                }}
              >
                {successMessage}
              </Alert>
            </Fade>
            
            <Box
              component="button"
              onClick={handleGoToLogin}
              sx={{
                background: 'none',
                border: 'none',
                color: 'primary.main',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 500,
                textDecoration: 'underline',
                padding: 0,
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              Back to Sign In
            </Box>
          </Box>
        );

      default:
        return (
          <LoginForm
            onRegisterClick={handleGoToRegister}
            onSuccess={handleAuthSuccess}
          />
        );
    }
  };

  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
      error={error}
      isLoading={isLoading}
    >
      <AnimatePresence mode="wait">
        {renderAuthComponent()}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default AuthScreen;
