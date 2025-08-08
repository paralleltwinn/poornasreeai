'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface ViewProps {
  stats?: unknown;
  isLoading?: boolean;
  onRefresh?: () => void;
  realTimePendingCount?: number;
}

export default function Notifications({}: ViewProps) {
  return (
    <Box>
      <Typography variant="h4">Notifications</Typography>
      <Typography variant="body1">This view will show system notifications.</Typography>
    </Box>
  );
}
