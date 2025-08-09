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
  People as CustomersIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Inventory as MachineIcon,
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
  machine_model?: string;
  state?: string;
}

interface ViewProps {
  stats?: unknown;
  isLoading?: boolean;
  onRefresh?: () => void;
  realTimePendingCount?: number;
}

export default function Customers({ onRefresh }: ViewProps) {
  const theme = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar();
  
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const handleApiError = useCallback((error: unknown, defaultMessage: string) => {
    console.error('API Error:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const err = error as { response?: { status?: number; data?: { detail?: string; errors?: string[] } } };
      // Server responded with error status
      const status = err.response?.status;
      const data = err.response?.data;
      
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
          if (data?.errors && Array.isArray(data.errors)) {
            data.errors.forEach((error: string) => showError(error, 'Validation Error'));
          } else {
            showError(data?.detail || 'Validation failed. Please check your input.', 'Validation Error');
          }
          break;
        case 500:
          showError('A server error occurred. Please try again later.', 'Server Error');
          break;
        default:
          showError(data?.detail || defaultMessage, `Error ${status}`);
      }
    } else if (error && typeof error === 'object' && 'request' in error) {
      // Network error
      showError('Unable to connect to the server. Please check your internet connection.', 'Connection Error');
    } else {
      // Other error
      const errorMessage = error instanceof Error ? error.message : defaultMessage;
      showError(errorMessage, 'Error');
    }
  }, [showError]);

  const makeApiRequest = useCallback(async (url: string, options: RequestInit = {}) => {
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
  }, [showError]);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      
      const data = await makeApiRequest(
        `http://localhost:8000/api/v1/admin/users?skip=${page * rowsPerPage}&limit=${rowsPerPage}`
      );
      
      if (data.users && Array.isArray(data.users)) {
        // Filter only customers
        const customerUsers = data.users.filter((user: User) => user.role === 'customer');
        setCustomers(customerUsers);
        setTotal(customerUsers.length);
        
        if (customerUsers.length === 0 && page > 0) {
          // No customers on this page, go back to first page
          setPage(0);
          showInfo('No customers found on this page. Returning to first page.');
        }
      } else {
        setCustomers([]);
        setTotal(0);
        showWarning('No customer data received from server.');
      }
      
    } catch (err) {
      handleApiError(err, 'Failed to fetch customers');
      setCustomers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleUserAction = async (userId: number, action: 'activate' | 'suspend' | 'delete') => {
    const user = customers.find(u => u.id === userId);
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
      await fetchCustomers();
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

  const handleViewCustomer = (customer: User) => {
    setSelectedCustomer(customer);
    setViewDialogOpen(true);
    showInfo(`Viewing details for ${customer.first_name} ${customer.last_name}`, 'Customer Details');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = async () => {
    showInfo('Refreshing customers data...', 'Refresh');
    await fetchCustomers();
    showSuccess('Customers data refreshed successfully', 'Refresh Complete');
  };

  if (loading && customers.length === 0) {
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
                  <TableRow sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                    {['Customer', 'Machine & Location', 'Contact', 'Status', 'Joined', 'Actions'].map((header) => (
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
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                }}
              >
                <CustomersIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight="700" color="text.primary">
                  Customers Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage and monitor all registered customers in the system
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
      {!loading && customers.length === 0 && (
        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CustomersIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Customers Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              There are currently no customers in the system.
            </Typography>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Customers Table */}
      {customers.length > 0 && (
        <Card elevation={2}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Machine & Location</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>
                        <Stack>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {customer.first_name} {customer.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {customer.id}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          {customer.machine_model && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <MachineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption">{customer.machine_model}</Typography>
                            </Stack>
                          )}
                          {customer.state && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption">{customer.state}</Typography>
                            </Stack>
                          )}
                          {!customer.machine_model && !customer.state && (
                            <Typography variant="caption" color="text.secondary">
                              Not specified
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption">{customer.email}</Typography>
                          </Stack>
                          {customer.phone_number && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption">{customer.phone_number}</Typography>
                            </Stack>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(customer.status, customer.is_active)}
                          color={getStatusColor(customer.status, customer.is_active)}
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <DateIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption">
                            {new Date(customer.created_at).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewCustomer(customer)}
                              color="primary"
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {customer.is_active ? (
                            <Tooltip title="Suspend User">
                              <IconButton
                                size="small"
                                onClick={() => handleUserAction(customer.id, 'suspend')}
                                disabled={actionLoading === customer.id}
                                color="warning"
                              >
                                {actionLoading === customer.id ? (
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
                                onClick={() => handleUserAction(customer.id, 'activate')}
                                disabled={actionLoading === customer.id}
                                color="success"
                              >
                                {actionLoading === customer.id ? (
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
                              onClick={() => handleUserAction(customer.id, 'delete')}
                              disabled={actionLoading === customer.id}
                              color="error"
                            >
                              {actionLoading === customer.id ? (
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

      {/* Customer Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CustomersIcon color="secondary" />
            <Box>
              <Typography variant="h6">
                {selectedCustomer?.first_name} {selectedCustomer?.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Customer Details
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedCustomer && (
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
                        value={selectedCustomer.first_name}
                        InputProps={{ readOnly: true }}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Last Name"
                        value={selectedCustomer.last_name}
                        InputProps={{ readOnly: true }}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Email"
                        value={selectedCustomer.email}
                        InputProps={{ readOnly: true }}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Phone Number"
                        value={selectedCustomer.phone_number || 'Not provided'}
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
                      Business Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      <TextField
                        label="Machine Model"
                        value={selectedCustomer.machine_model || 'Not specified'}
                        InputProps={{ readOnly: true }}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="State/Location"
                        value={selectedCustomer.state || 'Not specified'}
                        InputProps={{ readOnly: true }}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Role"
                        value={selectedCustomer.role}
                        InputProps={{ readOnly: true }}
                        size="small"
                        fullWidth
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Status
                        </Typography>
                        <Chip
                          label={getStatusLabel(selectedCustomer.status, selectedCustomer.is_active)}
                          color={getStatusColor(selectedCustomer.status, selectedCustomer.is_active)}
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
                          value={selectedCustomer.id}
                          InputProps={{ readOnly: true }}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Account Created"
                          value={new Date(selectedCustomer.created_at).toLocaleString()}
                          InputProps={{ readOnly: true }}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Last Login"
                          value={selectedCustomer.last_login ? new Date(selectedCustomer.last_login).toLocaleString() : 'Never'}
                          InputProps={{ readOnly: true }}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Account Active"
                          value={selectedCustomer.is_active ? 'Yes' : 'No'}
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
