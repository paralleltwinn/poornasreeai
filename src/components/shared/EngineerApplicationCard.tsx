'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  Stack,
  Grid,
  Box,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import LoadingAnimation from '../LoadingAnimation';

interface PendingEngineer {
  id: number;
  status: string;
  review_notes?: string;
  review_date?: string;
  created_at: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
    is_active: boolean;
    phone_number?: string;
    state?: string;
    department?: string;
  };
  department?: string;
  experience?: string;
  skills?: string;
  portfolio?: string;
  cover_letter?: string;
}

interface EngineerApplicationCardProps {
  engineer: PendingEngineer;
  onAction: (id: number, action: 'approve' | 'reject') => void;
  isLoading?: boolean;
}

export const EngineerApplicationCard: React.FC<EngineerApplicationCardProps> = ({ 
  engineer, 
  onAction, 
  isLoading = false 
}) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          mb: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[2],
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Header Section */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 56,
                    height: 56,
                    fontSize: '1.4rem',
                    fontWeight: '600',
                  }}
                >
                  {engineer.user.first_name[0]}{engineer.user.last_name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5 }}>
                    {engineer.user.first_name} {engineer.user.last_name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {engineer.user.email}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={engineer.status.toUpperCase()}
                      size="small"
                      color="warning"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip
                      label={`User ID: ${engineer.user.id}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </Stack>
                </Box>
              </Stack>
              <Box sx={{ textAlign: 'right' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Applied: {new Date(engineer.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Application ID: #{engineer.id}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            {/* Contact Information */}
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                {engineer.user.phone_number && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Phone:</strong> {engineer.user.phone_number}
                      </Typography>
                    </Stack>
                  </Grid>
                )}
                {engineer.user.state && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Location:</strong> {engineer.user.state}
                      </Typography>
                    </Stack>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>User Status:</strong> {engineer.user.is_active ? 'Active' : 'Inactive'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Account Status:</strong> {engineer.user.status}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Professional Information */}
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon color="primary" />
                Professional Details
              </Typography>
              <Grid container spacing={2}>
                {engineer.department && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <BusinessIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Department:</strong> {engineer.department}
                      </Typography>
                    </Stack>
                  </Grid>
                )}
                {engineer.user.department && engineer.user.department !== engineer.department && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <BusinessIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>User Department:</strong> {engineer.user.department}
                      </Typography>
                    </Stack>
                  </Grid>
                )}
                {engineer.experience && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SchoolIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Experience:</strong> {engineer.experience}
                      </Typography>
                    </Stack>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>User Role:</strong> {engineer.user.role}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Skills and Portfolio */}
            {(engineer.skills || engineer.portfolio) && (
              <>
                <Divider />
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon color="primary" />
                    Skills & Portfolio
                  </Typography>
                  <Grid container spacing={2}>
                    {engineer.skills && (
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Technical Skills:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          bgcolor: theme.palette.grey[50], 
                          p: 2, 
                          borderRadius: 1,
                          border: `1px solid ${theme.palette.divider}`
                        }}>
                          {engineer.skills}
                        </Typography>
                      </Grid>
                    )}
                    {engineer.portfolio && (
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <VisibilityIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            <strong>Portfolio:</strong>
                          </Typography>
                          <Button
                            size="small"
                            href={engineer.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outlined"
                            sx={{ 
                              ml: 1, 
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              py: 0.5,
                              px: 1
                            }}
                          >
                            View Portfolio →
                          </Button>
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </>
            )}

            {/* Cover Letter */}
            {engineer.cover_letter && (
              <>
                <Divider />
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon color="primary" />
                    Cover Letter
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    bgcolor: theme.palette.grey[50], 
                    p: 2, 
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    fontStyle: 'italic',
                    lineHeight: 1.6
                  }}>
                    &ldquo;{engineer.cover_letter}&rdquo;
                  </Typography>
                </Box>
              </>
            )}

            {/* Review Information */}
            {(engineer.review_notes || engineer.review_date) && (
              <>
                <Divider />
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom color="warning.main">
                    Review Information
                  </Typography>
                  <Grid container spacing={2}>
                    {engineer.review_date && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Review Date:</strong> {new Date(engineer.review_date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    )}
                    {engineer.review_notes && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Review Notes:</strong> {engineer.review_notes}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </>
            )}

            <Divider />

            {/* Action Buttons */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="flex-end"
              sx={{ pt: 1 }}
            >
              <Button
                variant="outlined"
                color="error"
                startIcon={isLoading ? <LoadingAnimation size={16} /> : <CancelIcon />}
                onClick={() => onAction(engineer.id, 'reject')}
                disabled={isLoading}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5
                }}
              >
                Reject Application
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={isLoading ? <LoadingAnimation size={16} /> : <CheckCircleIcon />}
                onClick={() => onAction(engineer.id, 'approve')}
                disabled={isLoading}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                Approve Application
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};
