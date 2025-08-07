'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import ChatPage from '../components/ChatPage';
import SidebarLayout from '../components/SidebarLayout';
import { Box, Button, Typography } from '@mui/material';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Add debug logging
    console.log('Home page - Auth state changed:', { 
      isAuthenticated, 
      userRole: user?.role, 
      userRoleEnum: UserRole.SUPER_ADMIN,
      isEqual: user?.role === UserRole.SUPER_ADMIN,
      roleUpperCase: user?.role?.toString().toUpperCase(),
      isEqualUpperCase: user?.role?.toString().toUpperCase() === 'SUPER_ADMIN'
    });
    
    // Add a small delay to ensure auth state is fully updated
    const redirectTimeout = setTimeout(() => {
      // Open dashboard in new tab for super admin after login
      const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN || 
                          user?.role?.toString().toUpperCase() === 'SUPER_ADMIN' ||
                          user?.role?.toString().toLowerCase() === 'super_admin';
                          
      if (isAuthenticated && isSuperAdmin) {
        console.log('Opening dashboard in new tab for super admin...');
        window.open('/dashboard', '_blank');
      }
    }, 100);

    return () => clearTimeout(redirectTimeout);
  }, [isAuthenticated, user, router]);

  // Always show the chat interface (no redirect for super admin)
  return (
    <div>
      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ position: 'fixed', top: 10, right: 10, background: 'white', p: 1, border: '1px solid #ccc', zIndex: 9999 }}>
          <Typography variant="caption">
            Debug: Auth={isAuthenticated ? 'Y' : 'N'}, Role={user?.role || 'None'}, Token={localStorage.getItem('auth_token') ? 'Y' : 'N'}
          </Typography>
          <br />
          <Button size="small" onClick={() => localStorage.clear()}>Clear Storage</Button>
        </Box>
      )}
      
      <SidebarLayout>
        <ChatPage />
      </SidebarLayout>
    </div>
  );
}
