'use client';

import React from 'react';
import { Box } from '@mui/material';
import AddAdminForm from '@/components/dashboard/AddAdminForm';

interface ViewProps {
  stats?: unknown;
  isLoading?: boolean;
  onRefresh?: () => void;
  realTimePendingCount?: number;
}

export default function AddAdmin({ onRefresh }: ViewProps) {
  return (
    <Box>
      <AddAdminForm onSuccess={onRefresh || (() => {})} />
    </Box>
  );
}
