'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  ExitToApp as ExitToAppIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/contexts/AuthContext';
import { useApiResponse } from '@/hooks/useApiResponse';
import ProfileUpdateForm from '@/components/dashboard/ProfileUpdateForm';
import AddAdminForm from '@/components/dashboard/AddAdminForm';
import AdminList from '@/components/dashboard/AdminList';
import SystemStatusIndicators from '@/components/dashboard/SystemStatusIndicators';

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
  total_users: number;
  total_admins: number;
  total_engineers: number;
  total_customers: number;
  pending_engineers: number;
  active_users: number;
  inactive_users: number;
}

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const { showErrorMessage } = useApiResponse();
  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_admins: 0,
    total_engineers: 0,
    total_customers: 0,
    pending_engineers: 0,
    active_users: 0,
    inactive_users: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      console.log('Fetching dashboard stats with token:', token ? 'Token present' : 'No token');
      
      if (!token) {
        showErrorMessage('Authentication token not found. Please log in again.', 'Authentication Error');
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/v1/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Dashboard API response status:', response.status);
      const responseData = await response.json();
      console.log('Dashboard API response data:', responseData);

      if (response.ok && responseData.success) {
        console.log('Setting stats:', responseData.stats);
        setStats(responseData.stats);
      } else {
        console.error('Dashboard API error:', responseData);
        const errorMessage = responseData.message || responseData.detail || 'Failed to load dashboard statistics';
        
        if (response.status === 401) {
          showErrorMessage('Session expired. Please log in again.', 'Authentication Error');
        } else if (response.status === 403) {
          showErrorMessage('Access denied. Insufficient permissions.', 'Access Denied');
        } else {
          showErrorMessage(errorMessage, 'Dashboard Error');
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      showErrorMessage('Network error while loading dashboard', 'Connection Error');
    } finally {
      setLoading(false);
    }
  }, [showErrorMessage]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleLogout = () => {
    logout();
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: <PeopleIcon />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Admins',
      value: stats.total_admins,
      icon: <AdminIcon />,
      color: '#7b1fa2',
      bgColor: '#f3e5f5',
    },
    {
      title: 'Engineers',
      value: stats.total_engineers,
      icon: <SecurityIcon />,
      color: '#388e3c',
      bgColor: '#e8f5e8',
    },
    {
      title: 'Customers',
      value: stats.total_customers,
      icon: <PeopleIcon />,
      color: '#f57c00',
      bgColor: '#fff3e0',
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
              Super Admin Dashboard
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
              color="primary" 
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

        {/* Compact System Status */}
        <Box sx={{ mb: 3 }}>
          <SystemStatusIndicators compact showTitle={false} showRefreshButton={false} />
        </Box>

        {/* Tabs */}
        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="super admin dashboard tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<DashboardIcon />} 
              label="System Overview" 
              iconPosition="start"
            />
            <Tab 
              icon={<SettingsIcon />} 
              label="Profile Settings" 
              iconPosition="start"
            />
            <Tab 
              icon={<PersonAddIcon />} 
              label="Add Admin" 
              iconPosition="start"
            />
            <Tab 
              icon={<SecurityIcon />} 
              label="Admin Control" 
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
                {/* System Overview Tab */}
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    System Overview - Super Admin Access
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card elevation={1}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            User Activity
                          </Typography>
                          <List>
                            <ListItem>
                              <ListItemIcon>
                                <Badge badgeContent={stats.active_users} color="success">
                                  <PeopleIcon />
                                </Badge>
                              </ListItemIcon>
                              <ListItemText primary="Active Users" secondary={`${stats.active_users} users online`} />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <Badge badgeContent={stats.inactive_users} color="error">
                                  <PeopleIcon />
                                </Badge>
                              </ListItemIcon>
                              <ListItemText primary="Inactive Users" secondary={`${stats.inactive_users} users offline`} />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card elevation={1}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Pending Actions
                          </Typography>
                          <List>
                            <ListItem>
                              <ListItemIcon>
                                <Badge badgeContent={stats.pending_engineers} color="warning">
                                  <NotificationsIcon />
                                </Badge>
                              </ListItemIcon>
                              <ListItemText 
                                primary="Engineer Applications" 
                                secondary={`${stats.pending_engineers} pending reviews`} 
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12}>
                      <Card elevation={1} sx={{ bgcolor: 'primary.main', color: 'white' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                            Super Admin Privileges
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            You have exclusive access to admin management features. Only super admins can:
                          </Typography>
                          <List sx={{ color: 'white' }}>
                            <ListItem sx={{ pl: 0 }}>
                              <ListItemIcon sx={{ color: 'white', minWidth: 32 }}>•</ListItemIcon>
                              <ListItemText 
                                primary="Create new admin accounts"
                                primaryTypographyProps={{ color: 'white' }}
                              />
                            </ListItem>
                            <ListItem sx={{ pl: 0 }}>
                              <ListItemIcon sx={{ color: 'white', minWidth: 32 }}>•</ListItemIcon>
                              <ListItemText 
                                primary="Modify admin permissions and roles"
                                primaryTypographyProps={{ color: 'white' }}
                              />
                            </ListItem>
                            <ListItem sx={{ pl: 0 }}>
                              <ListItemIcon sx={{ color: 'white', minWidth: 32 }}>•</ListItemIcon>
                              <ListItemText 
                                primary="View and manage all admin accounts"
                                primaryTypographyProps={{ color: 'white' }}
                              />
                            </ListItem>
                            <ListItem sx={{ pl: 0 }}>
                              <ListItemIcon sx={{ color: 'white', minWidth: 32 }}>•</ListItemIcon>
                              <ListItemText 
                                primary="Access complete system statistics and logs"
                                primaryTypographyProps={{ color: 'white' }}
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* System Status Indicators */}
                  <Box sx={{ mt: 4 }}>
                    <SystemStatusIndicators showTitle showRefreshButton />
                  </Box>
                </Box>
              </TabPanel>

              <TabPanel value={currentTab} index={1}>
                {/* Profile Settings Tab */}
                <ProfileUpdateForm onSuccess={fetchDashboardStats} />
              </TabPanel>

              <TabPanel value={currentTab} index={2}>
                {/* Add Admin Tab - SUPER ADMIN ONLY */}
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Add New Admin Account
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Super Admin Exclusive: Create new administrator accounts with specific permissions.
                  </Typography>
                  <AddAdminForm onSuccess={fetchDashboardStats} />
                </Box>
              </TabPanel>

              <TabPanel value={currentTab} index={3}>
                {/* Admin Control Tab - SUPER ADMIN ONLY */}
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Admin Control Panel
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Super Admin Exclusive: Manage all administrator accounts, modify permissions, and control access levels.
                  </Typography>
                  <AdminList onRefresh={fetchDashboardStats} />
                </Box>
              </TabPanel>
            </motion.div>
          </AnimatePresence>
        </Paper>
      </Container>
    </Box>
  );
}
