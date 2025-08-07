'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  SlideProps,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// =============================================================================
// TYPES
// =============================================================================

export type SnackbarVariant = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarMessage {
  id: string;
  message: string;
  variant: SnackbarVariant;
  title?: string;
  duration?: number;
  action?: React.ReactNode;
}

interface SnackbarContextType {
  showSnackbar: (message: Omit<SnackbarMessage, 'id'>) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  hideSnackbar: (id?: string) => void;
}

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

// =============================================================================
// SLIDE TRANSITION
// =============================================================================

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showSnackbar = (snackbar: Omit<SnackbarMessage, 'id'>) => {
    const id = generateId();
    const newSnackbar: SnackbarMessage = {
      id,
      duration: 6000,
      ...snackbar,
    };

    setSnackbars(prev => [...prev, newSnackbar]);

    // Auto-hide after duration
    setTimeout(() => {
      hideSnackbar(id);
    }, newSnackbar.duration);
  };

  const showSuccess = (message: string, title?: string) => {
    showSnackbar({
      message,
      title,
      variant: 'success',
    });
  };

  const showError = (message: string, title?: string) => {
    showSnackbar({
      message,
      title,
      variant: 'error',
      duration: 8000, // Longer duration for errors
    });
  };

  const showWarning = (message: string, title?: string) => {
    showSnackbar({
      message,
      title,
      variant: 'warning',
    });
  };

  const showInfo = (message: string, title?: string) => {
    showSnackbar({
      message,
      title,
      variant: 'info',
    });
  };

  const hideSnackbar = (id?: string) => {
    if (id) {
      setSnackbars(prev => prev.filter(snackbar => snackbar.id !== id));
    } else {
      setSnackbars([]);
    }
  };

  const handleClose = (id: string) => {
    hideSnackbar(id);
  };

  const getIcon = (variant: SnackbarVariant) => {
    switch (variant) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <SnackbarContext.Provider
      value={{
        showSnackbar,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideSnackbar,
      }}
    >
      {children}
      
      {/* Render Snackbars */}
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={snackbar.id}
          open={true}
          onClose={() => handleClose(snackbar.id)}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            mb: index * 7, // Stack multiple snackbars
          }}
        >
          <Alert
            onClose={() => handleClose(snackbar.id)}
            severity={snackbar.variant}
            variant="filled"
            icon={getIcon(snackbar.variant)}
            sx={{
              width: '400px',
              boxShadow: 3,
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
            action={snackbar.action}
          >
            {snackbar.title && (
              <AlertTitle sx={{ fontWeight: 600 }}>
                {snackbar.title}
              </AlertTitle>
            )}
            {snackbar.message}
          </Alert>
        </Snackbar>
      ))}
    </SnackbarContext.Provider>
  );
};

// =============================================================================
// HOOK FOR USING SNACKBAR CONTEXT
// =============================================================================

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  
  return context;
};

export default SnackbarContext;
