'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface ViewProps {
  stats?: unknown;
  isLoading?: boolean;
  onRefresh?: () => void;
  realTimePendingCount?: number;
}

export default function AllApplications({}: ViewProps) {
  return (
    <Box>
      <Typography variant="h4">All Applications</Typography>
      <Typography variant="body1">This view will show all engineer applications.</Typography>
    </Box>
  );
}
