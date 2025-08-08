'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  useTheme,
  alpha,
} from '@mui/material';
import { AdminSidebar } from '@/components/shared/AdminSidebar';
import { useApiResponse } from '@/hooks/useApiResponse';

// Dashboard Views
import {
  DashboardOverview,
  PendingApplications,
  Engineers,
  Customers,
  AddAdmin,
  AdminList,
  SystemStatus,
  Notifications,
  ProfileSettings,
} from './views';

interface DashboardStats {
  total_users: number;
  total_admins: number;
  total_engineers: number;
  total_customers: number;
  pending_engineers: number;
  active_users: number;
  inactive_users: number;
  approved_engineers: number;
  rejected_engineers: number;
  active_customers: number;
}

export default function ProfessionalAdminDashboard() {
  const theme = useTheme();
  const { showErrorMessage, showWarningMessage } = useApiResponse();
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [realTimePendingCount, setRealTimePendingCount] = useState<number>(0);

  // Fetch real-time pending applications count
  const fetchPendingCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        showWarningMessage('Authentication token not found', 'Warning');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/admin/engineers/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        let pendingCount = 0;
        
        if (Array.isArray(data)) {
          pendingCount = data.length;
        } else if (data.engineers && Array.isArray(data.engineers)) {
          pendingCount = data.engineers.length;
        }
        
        setRealTimePendingCount(pendingCount);
        
        // Update stats only if the count has changed
        setStats(prev => prev ? { ...prev, pending_engineers: pendingCount } : prev);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch pending count:', errorData);
        if (response.status === 401) {
          showErrorMessage('Session expired. Please log in again.', 'Authentication Error');
        } else {
          showWarningMessage('Failed to update pending applications count', 'Update Warning');
        }
      }
    } catch (error) {
      console.error('Failed to fetch pending count:', error);
      // Don't show error for this background operation unless it's critical
    }
  }, [showErrorMessage, showWarningMessage]); // Remove stats dependency to prevent infinite loop

  // Fetch dashboard statistics
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        showErrorMessage('Authentication token not found. Please log in again.', 'Authentication Error');
        return;
      }

      // For Super Admin, use the dashboard endpoint
      const response = await fetch('http://localhost:8000/api/v1/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStats(data.stats);
        console.log('Dashboard stats updated:', data.stats);
      } else {
        // Fallback to admin stats endpoint
        try {
          const fallbackResponse = await fetch('http://localhost:8000/api/v1/admin/stats', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          const fallbackData = await fallbackResponse.json();
          if (fallbackResponse.ok && fallbackData.success) {
            setStats(fallbackData.stats);
            console.log('Admin stats updated:', fallbackData.stats);
          } else {
            throw new Error(fallbackData.message || 'Failed to load statistics');
          }
        } catch (fallbackError) {
          console.error('Fallback stats fetch failed:', fallbackError);
          showErrorMessage('Failed to load dashboard statistics', 'Dashboard Error');
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      showErrorMessage('Network error while loading dashboard', 'Connection Error');
    } finally {
      setIsLoading(false);
    }
  }, [showErrorMessage]);

  useEffect(() => {
    fetchStats();
    fetchPendingCount(); // Fetch pending count immediately on load
    
    // Set up automatic refresh every 30 seconds for pending count
    const interval = setInterval(() => {
      fetchPendingCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []); // Empty dependency array to run only once on mount

  // Remove the problematic useEffect that was causing infinite updates
  // useEffect(() => {
  //   if (realTimePendingCount !== undefined && stats) {
  //     setStats(prev => prev ? { ...prev, pending_engineers: realTimePendingCount } : null);
  //   }
  // }, [realTimePendingCount, stats]);

  // Combined refresh function
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchStats(), fetchPendingCount()]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array since fetchStats and fetchPendingCount are stable

  const renderCurrentView = () => {
    const commonProps = {
      stats,
      isLoading,
      onRefresh: handleRefresh,
      realTimePendingCount,
    };

    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview {...commonProps} />;
      case 'pending-applications':
        return <PendingApplications 
          isLoading={isLoading} 
          onRefresh={handleRefresh} 
          onPendingCountChange={setRealTimePendingCount}
        />;
      case 'engineers':
        return <Engineers {...commonProps} />;
      case 'customers':
        return <Customers {...commonProps} />;
      case 'add-admin':
        return <AddAdmin {...commonProps} />;
      case 'admin-list':
        return <AdminList {...commonProps} />;
      case 'system-status':
        return <SystemStatus {...commonProps} />;
      case 'notifications':
        return <Notifications {...commonProps} />;
      case 'profile':
        return <ProfileSettings {...commonProps} />;
      default:
        return <DashboardOverview {...commonProps} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <AdminSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        pendingApplications={realTimePendingCount || stats?.pending_engineers || 0}
        stats={stats}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {renderCurrentView()}
        </Container>
      </Box>
    </Box>
  );
}
