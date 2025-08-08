'use client';

import React from 'react';
import { Box } from '@mui/material';
import ProfileUpdateForm from '@/components/dashboard/ProfileUpdateForm';

interface ViewProps {
  stats?: unknown;
  isLoading?: boolean;
  onRefresh?: () => void;
  realTimePendingCount?: number;
}

export default function ProfileSettings({ onRefresh }: ViewProps) {
  return (
    <Box>
      <ProfileUpdateForm onSuccess={onRefresh || (() => {})} />
    </Box>
  );
}
