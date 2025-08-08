'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import ChatPage from '../components/ChatPage';
import SidebarLayout from '../components/SidebarLayout';

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
      roleString: user?.role?.toString().toLowerCase()
    });
    
    // Add a small delay to ensure auth state is fully updated
    const redirectTimeout = setTimeout(() => {
      // Handle both uppercase and lowercase role values from backend
      const userRoleStr = user?.role?.toString().toLowerCase();
      const isSuperAdmin = userRoleStr === 'super_admin';
      const isAdmin = userRoleStr === 'admin';
                          
      if (isAuthenticated && (isSuperAdmin || isAdmin)) {
        console.log('Opening dashboard in new tab for admin/super admin...');
        window.open('/dashboard', '_blank');
      }
    }, 100);

    return () => clearTimeout(redirectTimeout);
  }, [isAuthenticated, user, router]);

  // Always show the chat interface (no redirect for super admin)
  return (
    <div>
      <SidebarLayout>
        <ChatPage />
      </SidebarLayout>
    </div>
  );
}
