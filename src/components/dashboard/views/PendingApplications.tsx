'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  useTheme,
  alpha,
  Paper,
  Chip,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { DashboardSection } from '@/components/shared/DashboardSection';
import { EngineerApplicationCard } from '@/components/shared/EngineerApplicationCard';
import { useApiResponse } from '@/hooks/useApiResponse';

interface PendingEngineer {
  id: number;
  status: string;
  review_notes?: string;
  review_date?: string;
  created_at: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
    is_active: boolean;
    phone_number?: string;
    state?: string;
    department?: string;
  };
  department?: string;
  experience?: string;
  skills?: string;
  portfolio?: string;
  cover_letter?: string;
}

interface PendingApplicationsProps {
  isLoading: boolean;
  onRefresh: () => void;
  onPendingCountChange?: (count: number) => void;
}

export default function PendingApplications({ isLoading, onRefresh, onPendingCountChange }: PendingApplicationsProps) {
  const theme = useTheme();
  const { handleAdminActionResponse } = useApiResponse();
  const [pendingEngineers, setPendingEngineers] = useState<PendingEngineer[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch pending engineers
  const fetchPendingEngineers = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:8000/api/v1/admin/engineers/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Pending Engineers API response:', data);
        if (Array.isArray(data)) {
          setPendingEngineers(data);
          console.log('Set pending engineers (array):', data.length, 'applications');
          onPendingCountChange?.(data.length);
        } else if (data.engineers && Array.isArray(data.engineers)) {
          setPendingEngineers(data.engineers);
          console.log('Set pending engineers (object.engineers):', data.engineers.length, 'applications');
          onPendingCountChange?.(data.engineers.length);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pending engineers:', error);
    }
  }, [onPendingCountChange]);

  useEffect(() => {
    fetchPendingEngineers();
  }, [fetchPendingEngineers]);

  // Handle engineer application actions
  const handleEngineerAction = async (applicationId: number, action: 'approve' | 'reject') => {
    setIsActionLoading(true);
    const result = await handleAdminActionResponse(async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');

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
          body: JSON.stringify({ reason: 'Application reviewed and rejected by admin' }),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to ${action} engineer application`);
      }

      return await response.json();
    }, `Engineer application ${action}d`);

    if (result) {
      // Remove the application from the list
      setPendingEngineers(prev => {
        const updated = prev.filter(eng => eng.id !== applicationId);
        // Update parent with new count immediately
        onPendingCountChange?.(updated.length);
        return updated;
      });
      // Add a small delay to ensure backend has processed the change
      setTimeout(() => {
        onRefresh();
      }, 500);
    }
    
    setIsActionLoading(false);
  };

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.main,
              }}
            >
              <AssignmentIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight="700" color="text.primary">
                Pending Applications
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Review and manage engineer applications awaiting approval.
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </motion.div>

      {/* Pending Applications Section */}
      <DashboardSection
        title="Engineer Applications"
        subtitle="Review and approve or reject pending applications"
        isLoading={isLoading}
        onRefresh={() => {
          fetchPendingEngineers();
          onRefresh();
        }}
        refreshing={isLoading}
        action={
          <Chip
            label={`${pendingEngineers.length} Applications`}
            color="warning"
            variant="outlined"
            sx={{ borderRadius: 2 }}
          />
        }
      >
        {pendingEngineers.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
              borderRadius: 3,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <AssignmentIcon
                sx={{
                  fontSize: 64,
                  color: alpha(theme.palette.primary.main, 0.5),
                  mb: 2,
                }}
              />
            </motion.div>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Pending Applications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All engineer applications have been reviewed. New applications will appear here.
            </Typography>
          </Paper>
        ) : (
          <Box>
            {pendingEngineers.map((engineer, index) => (
              <motion.div
                key={engineer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <EngineerApplicationCard
                  engineer={engineer}
                  onAction={handleEngineerAction}
                  isLoading={isActionLoading}
                />
              </motion.div>
            ))}
          </Box>
        )}
      </DashboardSection>
    </Box>
  );
}
