'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface ViewProps {
  stats?: unknown;
  isLoading?: boolean;
  onRefresh?: () => void;
  realTimePendingCount?: number;
}

export default function Customers({}: ViewProps) {
  return (
    <Box>
      <Typography variant="h4">Customers</Typography>
      <Typography variant="body1">This view will show all customers.</Typography>
    </Box>
  );
}
