'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stack,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  children,
  isLoading = false,
  onRefresh,
  refreshing = false,
  action,
  noPadding = false,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: 'hidden',
          '&:hover': {
            boxShadow: theme.shadows[2],
          },
        }}
      >
        {/* Section Header */}
        <Box
          sx={{
            p: 3,
            pb: subtitle ? 2 : 3,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                fontWeight="600"
                sx={{ 
                  color: 'text.primary',
                  mb: subtitle ? 0.5 : 0,
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            <Stack direction="row" spacing={1} alignItems="center">
              {action}
              {onRefresh && (
                <IconButton
                  onClick={onRefresh}
                  disabled={refreshing}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <RefreshIcon
                    sx={{
                      transition: 'transform 0.3s ease',
                      transform: refreshing ? 'rotate(360deg)' : 'rotate(0deg)',
                    }}
                  />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Section Content */}
        <Box sx={{ p: noPadding ? 0 : 3 }}>
          {isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
            </Stack>
          ) : (
            children
          )}
        </Box>
      </Paper>
    </motion.div>
  );
};
