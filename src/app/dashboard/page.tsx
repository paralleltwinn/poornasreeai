'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { UserRole } from '@/types/auth';
import { Alert, Snackbar } from '@mui/material';
import LoadingAnimation from '@/components/LoadingAnimation';

// Import dashboard components
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import ProfessionalAdminDashboard from '@/components/dashboard/ProfessionalAdminDashboard';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleEmailAction = useCallback(async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('auth_token');
      
      let response;
      if (action === 'approve') {
        response = await fetch(`http://localhost:8000/api/v1/admin/engineers/${applicationId}/approve`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        response = await fetch(`http://localhost:8000/api/v1/admin/engineers/${applicationId}/reject`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: "Application reviewed and rejected via email link" }),
        });
      }

      if (response.ok) {
        setNotification({ 
          message: `Engineer application ${action}d successfully!`, 
          type: 'success' 
        });
        // Remove URL parameters after successful action
        router.replace('/dashboard');
      } else {
        setNotification({ 
          message: `Failed to ${action} engineer application`, 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error(`Failed to ${action} engineer:`, error);
      setNotification({ 
        message: `Error occurred while ${action}ing application`, 
        type: 'error' 
      });
    }
  }, [router]);

  useEffect(() => {
    // Don't do anything while still loading auth state
    if (isLoading) {
      console.log('Dashboard page - Auth still loading...');
      return;
    }

    console.log('Dashboard page - Auth loaded:', { isAuthenticated, userRole: user?.role });
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to home');
      router.push('/');
      return;
    }

    // Check if user has admin privileges (ADMIN or SUPER_ADMIN)
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN || 
                        user?.role?.toString().toUpperCase() === 'SUPER_ADMIN' ||
                        user?.role?.toString().toLowerCase() === 'super_admin';
                        
    const isAdmin = user?.role === UserRole.ADMIN || 
                   user?.role?.toString().toUpperCase() === 'ADMIN' ||
                   user?.role?.toString().toLowerCase() === 'admin';
                        
    if (!isSuperAdmin && !isAdmin) {
      console.log('Not admin or super admin, role:', user?.role, 'redirecting to home');
      router.push('/');
      return;
    }
    
    console.log('Admin access granted, role:', user?.role);
    
    // Check for email action parameters
    const applicationId = searchParams.get('application_id');
    const action = searchParams.get('action');
    
    if (applicationId && action && (action === 'approve' || action === 'reject')) {
      handleEmailAction(applicationId, action);
    }
  }, [isAuthenticated, user, router, isLoading, searchParams, handleEmailAction]);

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingAnimation size={48} />
        </div>
      </div>
    );
  }

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN || 
                      user?.role?.toString().toUpperCase() === 'SUPER_ADMIN' ||
                      user?.role?.toString().toLowerCase() === 'super_admin';
                      
  const isAdmin = user?.role === UserRole.ADMIN || 
                 user?.role?.toString().toUpperCase() === 'ADMIN' ||
                 user?.role?.toString().toLowerCase() === 'admin';
                      
  if (!isAuthenticated || (!isSuperAdmin && !isAdmin)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingAnimation size={48} />
        </div>
      </div>
    );
  }

  // Render different dashboards based on user role
  return (
    <>
      {isSuperAdmin && <SuperAdminDashboard />}
      {isAdmin && <ProfessionalAdminDashboard />}
      
      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification(null)} 
          severity={notification?.type}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </>
  );
}
