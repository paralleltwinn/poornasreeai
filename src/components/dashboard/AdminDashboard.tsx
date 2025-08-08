'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
  Tab,
  Tabs,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  ExitToApp as ExitToAppIcon,
  Engineering as EngineeringIcon,
  Person as CustomerIcon,
  Assignment as AssignmentIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/contexts/AuthContext';
import { useApiResponse } from '@/hooks/useApiResponse';
import ProfileUpdateForm from '@/components/dashboard/ProfileUpdateForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface DashboardStats {
  total_engineers: number;
  total_customers: number;
  pending_engineers: number;
  approved_engineers: number;
  rejected_engineers: number;
  active_customers: number;
}

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
    dealer?: string;
    machine_model?: string;
  };
  department?: string;
  experience?: string;
  skills?: string;
  portfolio?: string;
  cover_letter?: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { handleAdminActionResponse } = useApiResponse();
  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    total_engineers: 0,
    total_customers: 0,
    pending_engineers: 0,
    approved_engineers: 0,
    rejected_engineers: 0,
    active_customers: 0,
  });
  const [pendingEngineers, setPendingEngineers] = useState<PendingEngineer[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('PendingEngineers state updated:', pendingEngineers.length, pendingEngineers);
  }, [pendingEngineers]);

  useEffect(() => {
    console.log('AdminDashboard: Fetching dashboard data...');
    fetchDashboardStats();
    fetchPendingEngineers();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8000/api/v1/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingEngineers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8000/api/v1/admin/engineers/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // The API returns the array directly, not wrapped in a success object
        if (Array.isArray(data)) {
          setPendingEngineers(data);
          console.log('Fetched pending engineers:', data.length);
        } else if (data.success) {
          // Fallback for wrapped response format
          setPendingEngineers(data.engineers || []);
        }
      } else {
        console.error('Failed to fetch pending engineers:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch pending engineers:', error);
    }
  };

  const handleEngineerAction = async (applicationId: number, action: 'approve' | 'reject') => {
    const result = await handleAdminActionResponse(async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      let response;
      if (action === 'approve') {
        response = await fetch(`http://localhost:8000/api/v1/admin/engineers/${applicationId}/approve`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        response = await fetch(`http://localhost:8000/api/v1/admin/engineers/${applicationId}/reject`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: "Application reviewed and rejected by admin" }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} engineer application`);
      }

      return await response.json();
    }, `Engineer application ${action}d`);

    if (result) {
      // Refresh data after successful action
      await fetchDashboardStats();
      await fetchPendingEngineers();
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleLogout = () => {
    logout();
  };

  const statsCards = [
    {
      title: 'Total Engineers',
      value: stats.total_engineers,
      icon: <EngineeringIcon />,
      color: '#388e3c',
      bgColor: '#e8f5e8',
    },
    {
      title: 'Total Customers',
      value: stats.total_customers,
      icon: <CustomerIcon />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Pending Applications',
      value: stats.pending_engineers,
      icon: <AssignmentIcon />,
      color: '#f57c00',
      bgColor: '#fff3e0',
    },
    {
      title: 'Active Customers',
      value: stats.active_customers,
      icon: <PeopleIcon />,
      color: '#7b1fa2',
      bgColor: '#f3e5f5',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Image 
              src="/logo/iconlogo.png" 
              alt="Poornasree AI" 
              width={32}
              height={32}
              style={{ marginRight: 16 }}
            />
            <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 600 }}>
              Admin Dashboard
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              color="inherit" 
              onClick={fetchDashboardStats}
              sx={{ color: 'text.primary' }}
              title="Refresh Dashboard"
            >
              <DashboardIcon />
            </IconButton>
            <Chip 
              label={user?.role} 
              color="secondary" 
              variant="outlined" 
              size="small"
            />
            <Typography variant="body2" sx={{ color: 'text.secondary', mx: 2 }}>
              Welcome, {user?.first_name}
            </Typography>
            <IconButton 
              color="inherit" 
              onClick={handleLogout}
              sx={{ color: 'text.primary' }}
            >
              <ExitToAppIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Stats Cards */}
        {loading ? (
          <Box sx={{ mb: 4 }}>
            <LinearProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statsCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={card.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    elevation={2}
                    sx={{ 
                      height: '100%',
                      background: `linear-gradient(135deg, ${card.bgColor} 0%, ${card.bgColor}dd 100%)`,
                      border: `1px solid ${card.color}20`,
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography 
                            variant="h4" 
                            component="div" 
                            sx={{ fontWeight: 700, color: card.color, mb: 1 }}
                          >
                            {card.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {card.title}
                          </Typography>
                        </Box>
                        <Box sx={{ color: card.color, opacity: 0.8 }}>
                          {card.icon}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Tabs */}
        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="admin dashboard tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<DashboardIcon />} 
              label="Overview" 
              iconPosition="start"
            />
            <Tab 
              icon={<AssignmentIcon />} 
              label="Engineer Applications" 
              iconPosition="start"
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="User Management" 
              iconPosition="start"
            />
            <Tab 
              icon={<SettingsIcon />} 
              label="Profile Settings" 
              iconPosition="start"
            />
          </Tabs>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabPanel value={currentTab} index={0}>
                {/* Overview Tab */}
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Admin Overview
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card elevation={1}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Engineer Applications Status
                          </Typography>
                          <List>
                            <ListItem>
                              <ListItemIcon>
                                <Badge badgeContent={stats.pending_engineers} color="warning">
                                  <AssignmentIcon />
                                </Badge>
                              </ListItemIcon>
                              <ListItemText 
                                primary="Pending Applications" 
                                secondary={`${stats.pending_engineers} awaiting review`} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <Badge badgeContent={stats.approved_engineers} color="success">
                                  <ApproveIcon />
                                </Badge>
                              </ListItemIcon>
                              <ListItemText 
                                primary="Approved Engineers" 
                                secondary={`${stats.approved_engineers} approved`} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <Badge badgeContent={stats.rejected_engineers} color="error">
                                  <RejectIcon />
                                </Badge>
                              </ListItemIcon>
                              <ListItemText 
                                primary="Rejected Applications" 
                                secondary={`${stats.rejected_engineers} rejected`} 
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card elevation={1}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Customer Activity
                          </Typography>
                          <List>
                            <ListItem>
                              <ListItemIcon>
                                <Badge badgeContent={stats.active_customers} color="success">
                                  <PeopleIcon />
                                </Badge>
                              </ListItemIcon>
                              <ListItemText 
                                primary="Active Customers" 
                                secondary={`${stats.active_customers} active users`} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <Badge badgeContent={stats.total_customers} color="info">
                                  <CustomerIcon />
                                </Badge>
                              </ListItemIcon>
                              <ListItemText 
                                primary="Total Customers" 
                                secondary={`${stats.total_customers} registered`} 
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              <TabPanel value={currentTab} index={1}>
                {/* Engineer Applications Tab */}
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Pending Engineer Applications
                  </Typography>
                  
                  {pendingEngineers.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No pending applications
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        All engineer applications have been reviewed.
                      </Typography>
                    </Paper>
                  ) : (
                    <Grid container spacing={3}>
                      {pendingEngineers.map((application) => (
                        <Grid item xs={12} md={6} lg={4} key={application.id}>
                          <Card elevation={2}>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                {application.user.first_name} {application.user.last_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {application.user.email}
                              </Typography>
                              <Chip 
                                label={application.user.department || 'No Department'} 
                                size="small" 
                                sx={{ mb: 2 }}
                              />
                              <Typography variant="body2" paragraph>
                                <strong>Phone:</strong> {application.user.phone_number || 'Not provided'}
                              </Typography>
                              <Typography variant="body2" paragraph>
                                <strong>State:</strong> {application.user.state || 'Not provided'}
                              </Typography>
                              <Typography variant="body2" paragraph>
                                <strong>Dealer:</strong> {application.user.dealer || 'Not provided'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Applied: {new Date(application.created_at).toLocaleDateString()}
                              </Typography>
                              
                              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  startIcon={<ApproveIcon />}
                                  onClick={() => handleEngineerAction(application.id, 'approve')}
                                  sx={{ flex: 1 }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<RejectIcon />}
                                  onClick={() => handleEngineerAction(application.id, 'reject')}
                                  sx={{ flex: 1 }}
                                >
                                  Reject
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </TabPanel>

              <TabPanel value={currentTab} index={2}>
                {/* User Management Tab */}
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    User Management
                  </Typography>
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      User Management Features
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Advanced user management features will be available here.
                      This includes viewing all users, managing permissions, and monitoring activity.
                    </Typography>
                  </Paper>
                </Box>
              </TabPanel>

              <TabPanel value={currentTab} index={3}>
                {/* Profile Settings Tab */}
                <ProfileUpdateForm onSuccess={fetchDashboardStats} />
              </TabPanel>
            </motion.div>
          </AnimatePresence>
        </Paper>
      </Container>
    </Box>
  );
}
