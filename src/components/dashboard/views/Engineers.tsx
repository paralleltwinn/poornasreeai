'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  TablePagination,
  Grid,
  Divider,
  Stack,
  useTheme,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Block as SuspendIcon,
  CheckCircle as ActivateIcon,
  Delete as DeleteIcon,
  Engineering as EngineeringIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as DepartmentIcon,
  CalendarToday as DateIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useSnackbar } from '@/contexts/SnackbarContext';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  phone_number?: string;
  department?: string;
  dealer?: string;
}

interface ApiResponse {
  users?: User[];
  total?: number;
  page?: number;
  size?: number;
  pages?: number;
  success?: boolean;
  message?: string;
  detail?: string;
  errors?: string[];
}

interface ViewProps {
  stats?: unknown;
  isLoading?: boolean;
  onRefresh?: () => void;
  realTimePendingCount?: number;
}

export default function Engineers({ onRefresh }: ViewProps) {
  const theme = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar();
  
  const [engineers, setEngineers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEngineer, setSelectedEngineer] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const handleApiError = (error: unknown, defaultMessage: string) => {
    console.error('API Error:', error);
    
    const err = error as { response?: { status: number; data?: { detail?: string; message?: string } }; request?: unknown; message?: string };
    
    if (err.response) {
      // Server responded with error status
      const status = err.response.status;
      const data = err.response.data;
      
      switch (status) {
        case 400:
          showError(data?.detail || 'Invalid request. Please check your input.', 'Bad Request');
          break;
        case 401:
          showError('Your session has expired. Please log in again.', 'Authentication Required');
          break;
        case 403:
          showError('You do not have permission to perform this action.', 'Access Denied');
          break;
        case 404:
          showError('The requested resource was not found.', 'Not Found');
          break;
        case 422:
          showError(data?.detail || 'Validation failed. Please check your input.', 'Validation Error');
          break;
        case 500:
          showError('A server error occurred. Please try again later.', 'Server Error');
          break;
        default:
          showError(data?.detail || defaultMessage, `Error ${status}`);
      }
    } else if (err.request) {
      // Network error
      showError('Unable to connect to the server. Please check your internet connection.', 'Connection Error');
    } else {
      // Other error
      showError(err.message || defaultMessage, 'Error');
    }
  };

  const makeApiRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      showError('Authentication token not found. Please log in again.', 'Authentication Error');
      throw new Error('No authentication token');
    }

    const defaultHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data: data,
        },
      };
    }

    return data;
  };

  const fetchEngineers = useCallback(async () => {
    try {
      setLoading(true);
      
      const data = await makeApiRequest(
        `http://localhost:8000/api/v1/admin/users?skip=${page * rowsPerPage}&limit=${rowsPerPage}`
      );
      
      if (data.users && Array.isArray(data.users)) {
        // Filter only engineers
        const engineerUsers = data.users.filter((user: User) => user.role === 'engineer');
        setEngineers(engineerUsers);
        setTotal(engineerUsers.length);
        
        if (engineerUsers.length === 0 && page > 0) {
          // No engineers on this page, go back to first page
          setPage(0);
          showInfo('No engineers found on this page. Returning to first page.');
        }
      } else {
        setEngineers([]);
        setTotal(0);
        showWarning('No engineer data received from server.');
      }
      
    } catch (err) {
      handleApiError(err, 'Failed to fetch engineers');
      setEngineers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, handleApiError, makeApiRequest, showInfo, showWarning]);

  useEffect(() => {
    fetchEngineers();
  }, [fetchEngineers]);

  const handleUserAction = async (userId: number, action: 'activate' | 'suspend' | 'delete') => {
    const user = engineers.find(u => u.id === userId);
    const userName = user ? `${user.first_name} ${user.last_name}` : `User ${userId}`;
    
    try {
      setActionLoading(userId);
      
      let endpoint = '';
      let method = 'PUT';
      const body = {};

      switch (action) {
        case 'activate':
          endpoint = `http://localhost:8000/api/v1/admin/users/${userId}/activate`;
          break;
        case 'suspend':
          endpoint = `http://localhost:8000/api/v1/admin/users/${userId}/suspend`;
          break;
        case 'delete':
          endpoint = `http://localhost:8000/api/v1/admin/users/${userId}`;
          method = 'DELETE';
          break;
      }

      const data = await makeApiRequest(endpoint, {
        method,
        body: method !== 'DELETE' ? JSON.stringify(body) : undefined,
      });

      // Success handling
      if (data.success) {
        showSuccess(data.message || `User ${action}d successfully`, `${action.charAt(0).toUpperCase() + action.slice(1)} Success`);
      } else {
        showSuccess(`${userName} has been ${action}d successfully`, `${action.charAt(0).toUpperCase() + action.slice(1)} Completed`);
      }

      // Refresh the data
      await fetchEngineers();
      if (onRefresh) onRefresh();

    } catch (err) {
      handleApiError(err, `Failed to ${action} user ${userName}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'error';
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string, isActive: boolean) => {
    if (!isActive) return 'Inactive';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleViewEngineer = (engineer: User) => {
    setSelectedEngineer(engineer);
    setViewDialogOpen(true);
    showInfo(`Viewing details for ${engineer.first_name} ${engineer.last_name}`, 'Engineer Details');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = async () => {
    showInfo('Refreshing engineers data...', 'Refresh');
    await fetchEngineers();
    showSuccess('Engineers data refreshed successfully', 'Refresh Complete');
  };

  if (loading && engineers.length === 0) {
    return (
      <Box>
        {/* Header Skeleton */}
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Skeleton variant="rectangular" width={56} height={56} sx={{ borderRadius: 3 }} />
              <Box>
                <Skeleton variant="text" width={300} height={40} />
                <Skeleton variant="text" width={400} height={24} />
              </Box>
            </Stack>
            <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
          </Stack>
        </Stack>

        {/* Table Skeleton */}
        <Card elevation={2}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    {['Engineer', 'Department', 'Contact', 'Status', 'Joined', 'Actions'].map((header) => (
                      <TableCell key={header} sx={{ fontWeight: 600 }}>
                        <Skeleton variant="text" width={80} />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {Array.from({ length: 6 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton variant="text" width={cellIndex === 0 ? 120 : 80} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              >
                <EngineeringIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight="700" color="text.primary">
                  Engineers Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage and monitor all registered engineers in the system
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="outlined"
              startIcon={loading ? <LoadingAnimation size={16} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </motion.div>

      {/* Empty State */}
      {!loading && engineers.length === 0 && (
        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <EngineeringIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Engineers Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              There are currently no engineers in the system.
            </Typography>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Engineers Table */}
      {engineers.length > 0 && (
        <Card elevation={2}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Engineer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {engineers.map((engineer) => (
                    <TableRow key={engineer.id} hover>
                      <TableCell>
                        <Stack>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {engineer.first_name} {engineer.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {engineer.id}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<DepartmentIcon sx={{ fontSize: 14 }} />}
                          label={engineer.department || 'Not specified'}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption">{engineer.email}</Typography>
                          </Stack>
                          {engineer.phone_number && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption">{engineer.phone_number}</Typography>
                            </Stack>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(engineer.status, engineer.is_active)}
                          color={getStatusColor(engineer.status, engineer.is_active)}
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <DateIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption">
                            {new Date(engineer.created_at).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewEngineer(engineer)}
                              color="primary"
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {engineer.is_active ? (
                            <Tooltip title="Suspend User">
                              <IconButton
                                size="small"
                                onClick={() => handleUserAction(engineer.id, 'suspend')}
                                disabled={actionLoading === engineer.id}
                                color="warning"
                              >
                                {actionLoading === engineer.id ? (
                                  <LoadingAnimation size={16} />
                                ) : (
                                  <SuspendIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Activate User">
                              <IconButton
                                size="small"
                                onClick={() => handleUserAction(engineer.id, 'activate')}
                                disabled={actionLoading === engineer.id}
                                color="success"
                              >
                                {actionLoading === engineer.id ? (
                                  <LoadingAnimation size={16} />
                                ) : (
                                  <ActivateIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              onClick={() => handleUserAction(engineer.id, 'delete')}
                              disabled={actionLoading === engineer.id}
                              color="error"
                            >
                              {actionLoading === engineer.id ? (
                                <LoadingAnimation size={16} />
                              ) : (
                                <DeleteIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </CardContent>
        </Card>
      )}

      {/* Engineer Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <EngineeringIcon color="primary" />
            <Box>
              <Typography variant="h6">
                {selectedEngineer?.first_name} {selectedEngineer?.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Engineer Details
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedEngineer && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Personal Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <TextField
                        label="First Name"
                        value={selectedEngineer.first_name}
                        InputProps={{ readOnly: true }}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Last Name"
                        value={selectedEngineer.last_name}
                        InputProps={{ readOnly: true }}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Email"
                        value={selectedEngineer.email}
                        InputProps={{ readOnly: true }}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Phone Number"
                        value={selectedEngineer.phone_number || 'Not provided'}
                        InputProps={{ readOnly: true }}
                        size="small"
                        fullWidth
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Professional Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <TextField
                        label="Department"
                        value={selectedEngineer.department || 'Not specified'}
                        InputProps={{ readOnly: true }}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Dealer"
                        value={selectedEngineer.dealer || 'Not specified'}
                        InputProps={{ readOnly: true }}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Role"
                        value={selectedEngineer.role}
                        InputProps={{ readOnly: true }}
                        size="small"
                        fullWidth
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Status
                        </Typography>
                        <Chip
                          label={getStatusLabel(selectedEngineer.status, selectedEngineer.is_active)}
                          color={getStatusColor(selectedEngineer.status, selectedEngineer.is_active)}
                          size="small"
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Account Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="User ID"
                          value={selectedEngineer.id}
                          InputProps={{ readOnly: true }}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Account Created"
                          value={new Date(selectedEngineer.created_at).toLocaleString()}
                          InputProps={{ readOnly: true }}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Last Login"
                          value={selectedEngineer.last_login ? new Date(selectedEngineer.last_login).toLocaleString() : 'Never'}
                          InputProps={{ readOnly: true }}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Account Active"
                          value={selectedEngineer.is_active ? 'Yes' : 'No'}
                          InputProps={{ readOnly: true }}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
