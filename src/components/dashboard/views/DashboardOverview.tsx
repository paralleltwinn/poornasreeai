'use client';

import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Engineering as EngineeringIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { MetricCard } from '@/components/shared/MetricCard';
import { DashboardSection } from '@/components/shared/DashboardSection';
import SystemStatusIndicators from '@/components/dashboard/SystemStatusIndicators';

interface DashboardStats {
  total_users?: number;
  total_admins?: number;
  total_engineers?: number;
  total_customers?: number;
  pending_engineers?: number;
  active_users?: number;
  inactive_users?: number;
  approved_engineers?: number;
  rejected_engineers?: number;
  active_customers?: number;
}

interface DashboardOverviewProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  onRefresh: () => void;
  realTimePendingCount?: number;
}

export default function DashboardOverview({ stats, isLoading, onRefresh, realTimePendingCount }: DashboardOverviewProps) {
  const theme = useTheme();

  // Use real-time pending count if available, fallback to stats
  const currentPendingCount = realTimePendingCount ?? stats?.pending_engineers ?? 0;

  const statsCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: <PeopleIcon fontSize="large" />,
      color: 'primary' as const,
      description: 'All registered users',
      trend: {
        value: stats?.active_users || 0,
        label: 'Active',
        isPositive: true,
      },
    },
    {
      title: 'Engineers',
      value: stats?.total_engineers || 0,
      icon: <EngineeringIcon fontSize="large" />,
      color: 'success' as const,
      description: 'Total engineers',
      trend: {
        value: stats?.approved_engineers || 0,
        label: 'Approved',
        isPositive: true,
      },
    },
    {
      title: 'Customers',
      value: stats?.total_customers || 0,
      icon: <PeopleIcon fontSize="large" />,
      color: 'secondary' as const,
      description: 'Active customers',
      trend: {
        value: stats?.active_customers || 0,
        label: 'Active',
        isPositive: true,
      },
    },
    {
      title: 'Pending Applications',
      value: currentPendingCount,
      icon: <AssignmentIcon fontSize="large" />,
      color: currentPendingCount && currentPendingCount > 0 ? 'warning' as const : 'info' as const,
      description: 'Awaiting review',
      urgent: currentPendingCount && currentPendingCount > 0,
    },
  ];

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
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <DashboardIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight="700" color="text.primary">
                Dashboard Overview
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome to your admin dashboard. Here&apos;s a quick overview of your system.
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.title}>
            <MetricCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              isLoading={isLoading}
              description={card.description}
              trend={card.trend}
            />
          </Grid>
        ))}
      </Grid>

      {/* System Status */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <DashboardSection
            title="System Status"
            subtitle="Real-time system health and performance metrics"
            onRefresh={onRefresh}
            refreshing={isLoading}
          >
            <SystemStatusIndicators compact={false} showTitle={false} showRefreshButton={false} />
          </DashboardSection>
        </Grid>

        <Grid item xs={12} lg={4}>
          <DashboardSection
            title="Quick Stats"
            subtitle="Key performance indicators"
          >
            <Stack spacing={3}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" fontWeight="600" color="success.main">
                      {stats?.approved_engineers || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approved Engineers
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingUpIcon sx={{ color: 'info.main', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" fontWeight="600" color="info.main">
                      {stats?.active_users || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Users
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Pending Applications Alert */}
              {currentPendingCount && currentPendingCount > 0 && (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <AssignmentIcon sx={{ color: 'warning.main', fontSize: 32 }} />
                    <Box>
                      <Typography variant="h5" fontWeight="600" color="warning.main">
                        {currentPendingCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Applications Need Review
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* Application Statistics */}
              {(stats?.approved_engineers || stats?.rejected_engineers) && (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.3)}`,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="600" color="text.primary" sx={{ mb: 2 }}>
                    Application Status
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Approved:
                      </Typography>
                      <Typography variant="body2" fontWeight="600" color="success.main">
                        {stats?.approved_engineers || 0}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Rejected:
                      </Typography>
                      <Typography variant="body2" fontWeight="600" color="error.main">
                        {stats?.rejected_engineers || 0}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Pending:
                      </Typography>
                      <Typography variant="body2" fontWeight="600" color="warning.main">
                        {currentPendingCount}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              )}

              {stats?.total_admins !== undefined && (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <DashboardIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                    <Box>
                      <Typography variant="h5" fontWeight="600" color="primary.main">
                        {stats.total_admins}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Admins
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Stack>
          </DashboardSection>
        </Grid>
      </Grid>
    </Box>
  );
}
