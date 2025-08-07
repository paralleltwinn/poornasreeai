'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types/auth';

// Import dashboard component
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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

    // Only super admins can access dashboard (handle case variations)
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN || 
                        user?.role?.toString().toUpperCase() === 'SUPER_ADMIN' ||
                        user?.role?.toString().toLowerCase() === 'super_admin';
                        
    if (!isSuperAdmin) {
      console.log('Not super admin, role:', user?.role, 'redirecting to home');
      router.push('/');
      return;
    }
    
    console.log('Super admin access granted');
  }, [isAuthenticated, user, router, isLoading]);

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN || 
                      user?.role?.toString().toUpperCase() === 'SUPER_ADMIN' ||
                      user?.role?.toString().toLowerCase() === 'super_admin';
                      
  if (!isAuthenticated || !isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  return <SuperAdminDashboard />;
}
