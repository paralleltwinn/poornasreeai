'use client';

import React from 'react';
import { Box } from '@mui/material';
import SystemStatusIndicators from '@/components/dashboard/SystemStatusIndicators';

interface ViewProps {
  stats?: unknown;
  isLoading?: boolean;
  onRefresh?: () => void;
  realTimePendingCount?: number;
}

export default function SystemStatus({}: ViewProps) {
  return (
    <Box>
      <SystemStatusIndicators showTitle showRefreshButton />
    </Box>
  );
}
