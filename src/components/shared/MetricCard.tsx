'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  isLoading?: boolean;
  description?: string;
  urgent?: boolean;
  trend?: {
    value: number;
    label?: string;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
  isLoading = false,
  description,
  urgent = false,
  trend,
}) => {
  const theme = useTheme();
  const colorValue = theme.palette[color].main;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
    >
      <Card
        elevation={0}
        sx={{
          height: '100%',
          border: `1px solid ${urgent ? theme.palette.warning.main : theme.palette.divider}`,
          borderRadius: 3,
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          ...(urgent && {
            boxShadow: `0 0 20px ${alpha(theme.palette.warning.main, 0.3)}`,
            animation: 'pulse 2s infinite',
          }),
          '&:hover': {
            boxShadow: urgent ? `0 0 25px ${alpha(theme.palette.warning.main, 0.4)}` : theme.shadows[4],
            borderColor: urgent ? theme.palette.warning.main : colorValue,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 4,
            background: `linear-gradient(90deg, ${urgent ? theme.palette.warning.main : colorValue} 0%, ${alpha(urgent ? theme.palette.warning.main : colorValue, 0.7)} 100%)`,
          },
          '@keyframes pulse': {
            '0%': {
              boxShadow: `0 0 20px ${alpha(theme.palette.warning.main, 0.3)}`,
            },
            '50%': {
              boxShadow: `0 0 30px ${alpha(theme.palette.warning.main, 0.5)}`,
            },
            '100%': {
              boxShadow: `0 0 20px ${alpha(theme.palette.warning.main, 0.3)}`,
            },
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {isLoading ? (
            <Box>
              <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 2, mb: 2 }} />
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="80%" height={20} />
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha(colorValue, 0.1),
                    color: colorValue,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {icon}
                </Box>
                {trend && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: trend.isPositive 
                          ? alpha(theme.palette.success.main, 0.1)
                          : alpha(theme.palette.error.main, 0.1),
                        color: trend.isPositive 
                          ? theme.palette.success.main 
                          : theme.palette.error.main,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        mb: trend.label ? 0.5 : 0,
                      }}
                    >
                      <Typography variant="caption" fontWeight={600}>
                        {trend.value.toLocaleString()}
                      </Typography>
                    </Box>
                    {trend.label && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {trend.label}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
              
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'text.primary', 
                  mb: 0.5,
                  lineHeight: 1.2,
                }}
              >
                {value.toLocaleString()}
              </Typography>
              
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontWeight: 500, mb: 1 }}
              >
                {title}
              </Typography>
              
              {description && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ opacity: 0.8 }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
