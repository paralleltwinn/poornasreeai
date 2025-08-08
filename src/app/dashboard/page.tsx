'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiResponse } from '@/hooks/useApiResponse';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { UserRole } from '@/types/auth';
import LoadingAnimation from '@/components/LoadingAnimation';

// Import dashboard components
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import ProfessionalAdminDashboard from '@/components/dashboard/ProfessionalAdminDashboard';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { showSuccessMessage, showErrorMessage } = useApiResponse();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleEmailAction = useCallback(async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        showErrorMessage('Authentication token not found. Please log in again.', 'Authentication Error');
        return;
      }
      
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
        const responseData = await response.json();
        const message = responseData.message || `Engineer application ${action}d successfully!`;
        showSuccessMessage(message, 'Action Completed');
        // Remove URL parameters after successful action
        router.replace('/dashboard');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.detail || `Failed to ${action} engineer application`;
        
        if (response.status === 401) {
          showErrorMessage('Session expired. Please log in again.', 'Authentication Error');
        } else if (response.status === 403) {
          showErrorMessage('Access denied. Insufficient permissions.', 'Access Denied');
        } else if (response.status === 404) {
          showErrorMessage('Application not found. It may have already been processed.', 'Not Found');
        } else {
          showErrorMessage(errorMessage, 'Action Failed');
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} engineer:`, error);
      showErrorMessage(`Network error occurred while ${action}ing application`, 'Connection Error');
    }
  }, [router, showSuccessMessage, showErrorMessage]);

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
    // Handle both uppercase and lowercase role values from backend
    const userRoleStr = user?.role?.toString().toLowerCase();
    const isSuperAdmin = userRoleStr === 'super_admin';
    const isAdmin = userRoleStr === 'admin';
                        
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

  // Handle both uppercase and lowercase role values from backend
  const userRoleStr = user?.role?.toString().toLowerCase();
  const isSuperAdmin = userRoleStr === 'super_admin';
  const isAdmin = userRoleStr === 'admin';
                      
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
    </>
  );
}
