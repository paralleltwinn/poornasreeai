'use client';

import React from 'react';
import { Box } from '@mui/material';
import AdminList from '@/components/dashboard/AdminList';

interface ViewProps {
  stats?: unknown;
  isLoading?: boolean;
  onRefresh?: () => void;
  realTimePendingCount?: number;
}

export default function AdminListView({ onRefresh }: ViewProps) {
  return (
    <Box>
      <AdminList onRefresh={onRefresh || (() => {})} />
    </Box>
  );
}
