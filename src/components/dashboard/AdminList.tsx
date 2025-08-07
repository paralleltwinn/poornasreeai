'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  CircularProgress,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SuperAdminIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { useSnackbar } from '@/contexts/SnackbarContext';

interface AdminListProps {
  onRefresh: () => void;
}

interface Admin {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  department?: string;
  role: string;
  status: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export default function AdminList({ onRefresh }: AdminListProps) {
  const { showSuccess, showError } = useSnackbar();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; admin: Admin | null }>({
    open: false,
    admin: null,
  });

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/v1/admin/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        setAdmins(responseData.admins || []);
      } else {
        showError(responseData.message || 'Failed to fetch admin list', 'Fetch Error');
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
      showError('Network error. Please try again.', 'Connection Error');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleRefresh = () => {
    fetchAdmins();
    onRefresh();
  };

  const handleDeleteClick = (admin: Admin) => {
    setDeleteDialog({ open: true, admin });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, admin: null });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.admin) return;

    try {
      setDeleteLoading(deleteDialog.admin.id);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/v1/admin/users/${deleteDialog.admin.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        showSuccess(responseData.message || 'Admin deactivated successfully!', 'Success');
        fetchAdmins();
        onRefresh();
      } else {
        const errorMessage = responseData.message || responseData.detail || 'Failed to deactivate admin';
        showError(errorMessage, 'Deactivation Failed');
      }
    } catch (err) {
      console.error('Error deactivating admin:', err);
      showError('Network error. Please try again.', 'Connection Error');
    } finally {
      setDeleteLoading(null);
      setDeleteDialog({ open: false, admin: null });
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'SUPER_ADMIN' ? <SuperAdminIcon /> : <AdminIcon />;
  };

  const getRoleColor = (role: string) => {
    return role === 'SUPER_ADMIN' ? 'secondary' : 'primary';
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'error';
    return status === 'ACTIVE' ? 'success' : 'warning';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Manage Admins
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card elevation={2}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>Admin</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {admin.first_name[0]}{admin.last_name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {admin.first_name} {admin.last_name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {admin.email}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        {admin.phone_number && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {admin.phone_number}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>

                      <TableCell>
                        {admin.department && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {admin.department}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={getRoleIcon(admin.role)}
                          label={admin.role}
                          color={getRoleColor(admin.role) as 'primary' | 'secondary'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={admin.is_active ? admin.status : 'INACTIVE'}
                          color={getStatusColor(admin.status, admin.is_active) as 'success' | 'warning' | 'error'}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(admin.created_at)}
                        </Typography>
                        {admin.last_login && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Last login: {formatDate(admin.last_login)}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {admin.role !== 'SUPER_ADMIN' && (
                          <Tooltip title="Deactivate Admin">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(admin)}
                              disabled={deleteLoading === admin.id}
                              size="small"
                            >
                              {deleteLoading === admin.id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <DeleteIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {admins.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No admins found
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Admin Deactivation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to deactivate the admin account for{' '}
            <strong>
              {deleteDialog.admin?.first_name} {deleteDialog.admin?.last_name}
            </strong>
            ? This action will disable their access to the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteLoading !== null}
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
