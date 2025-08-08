'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Avatar,
  Stack,
  Chip,
  Collapse,
  useTheme,
  alpha,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Engineering as EngineeringIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as ExitToAppIcon,
  ExpandLess,
  ExpandMore,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

const DRAWER_WIDTH = 280;
const DRAWER_COLLAPSED_WIDTH = 72;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  badge?: number;
  children?: NavigationItem[];
  roles?: UserRole[];
}

interface DashboardStats {
  total_users: number;
  total_admins: number;
  total_engineers: number;
  total_customers: number;
  pending_engineers: number;
  active_users: number;
  inactive_users: number;
  approved_engineers: number;
  rejected_engineers: number;
  active_customers: number;
}

interface AdminSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  pendingApplications?: number;
  stats?: DashboardStats | null;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentView,
  onViewChange,
  pendingApplications = 0,
  stats,
}) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);

  // Handle both uppercase and lowercase role values from backend
  const userRoleStr = user?.role?.toString().toLowerCase();
  const isSuperAdmin = userRoleStr === 'super_admin';

  // Calculate badge numbers from stats
  const pendingCount = stats?.pending_engineers || pendingApplications || 0;
  const engineerCount = stats?.total_engineers || 0;
  const customerCount = stats?.total_customers || 0;
  const adminCount = stats?.total_admins || 0;

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      onClick: () => onViewChange('dashboard'),
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: <Badge badgeContent={pendingCount > 0 ? pendingCount : null} color="warning"><EngineeringIcon /></Badge>,
      children: [
        {
          id: 'pending-applications',
          label: 'Pending Review',
          icon: <AssessmentIcon />,
          onClick: () => onViewChange('pending-applications'),
          badge: pendingCount,
        },
      ],
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <PeopleIcon />,
      children: [
        {
          id: 'engineers',
          label: 'Engineers',
          icon: <EngineeringIcon />,
          onClick: () => onViewChange('engineers'),
          badge: engineerCount,
        },
        {
          id: 'customers',
          label: 'Customers',
          icon: <PeopleIcon />,
          onClick: () => onViewChange('customers'),
          badge: customerCount,
        },
      ],
    },
    {
      id: 'admin-management',
      label: 'Admin Management',
      icon: <AdminIcon />,
      roles: [UserRole.SUPER_ADMIN],
      children: [
        {
          id: 'add-admin',
          label: 'Add Admin',
          icon: <PersonAddIcon />,
          onClick: () => onViewChange('add-admin'),
          roles: [UserRole.SUPER_ADMIN],
        },
        {
          id: 'admin-list',
          label: 'Admin List',
          icon: <SecurityIcon />,
          onClick: () => onViewChange('admin-list'),
          roles: [UserRole.SUPER_ADMIN],
          badge: adminCount,
        },
      ],
    },
    {
      id: 'system',
      label: 'System',
      icon: <SettingsIcon />,
      children: [
        {
          id: 'system-status',
          label: 'System Status',
          icon: <AssessmentIcon />,
          onClick: () => onViewChange('system-status'),
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: <NotificationsIcon />,
          onClick: () => onViewChange('notifications'),
        },
      ],
    },
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: <SettingsIcon />,
      onClick: () => onViewChange('profile'),
    },
  ];

  const handleToggleExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const shouldShowItem = (item: NavigationItem): boolean => {
    if (!item.roles) return true;
    return item.roles.some(role => 
      user?.role === role || 
      user?.role?.toString().toUpperCase() === role.toString().toUpperCase()
    );
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    if (!shouldShowItem(item)) return null;

    const isExpanded = expandedItems.includes(item.id);
    const isActive = currentView === item.id;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                handleToggleExpand(item.id);
              } else if (item.onClick) {
                item.onClick();
              }
            }}
            sx={{
              px: 2,
              py: 1.5,
              ml: level * 2,
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon
              sx={{
                color: isActive ? theme.palette.primary.main : 'text.secondary',
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            {!isCollapsed && (
              <>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'primary.main' : 'text.primary',
                    fontSize: '0.9rem',
                  }}
                />
                {item.badge && item.badge > 0 && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="warning"
                    sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                  />
                )}
                {hasChildren && (
                  isExpanded ? <ExpandLess /> : <ExpandMore />
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && !isCollapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderNavigationItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.paper',
          transition: 'width 0.3s ease',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: 64,
        }}
      >
        {!isCollapsed && (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Image 
              src="/logo/iconlogo.png" 
              alt="Logo" 
              width={32}
              height={32}
            />
            <Typography variant="h6" fontWeight="600" color="primary.main">
              Admin Panel
            </Typography>
          </Stack>
        )}
        <IconButton
          onClick={() => setIsCollapsed(!isCollapsed)}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          {isCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {/* User Profile */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: isCollapsed ? 36 : 44,
              height: isCollapsed ? 36 : 44,
              fontSize: isCollapsed ? '1rem' : '1.2rem',
            }}
          >
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Avatar>
          {!isCollapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                fontWeight="600"
                noWrap
                sx={{ color: 'text.primary' }}
              >
                {user?.first_name} {user?.last_name}
              </Typography>
              <Chip
                label={isSuperAdmin ? 'Super Admin' : 'Admin'}
                size="small"
                color={isSuperAdmin ? 'primary' : 'secondary'}
                variant="outlined"
                sx={{ mt: 0.5, fontSize: '0.7rem' }}
              />
            </Box>
          )}
        </Stack>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ pt: 2 }}>
          {navigationItems.map(item => renderNavigationItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <ListItemButton
          onClick={logout}
          sx={{
            borderRadius: 2,
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.05),
            },
          }}
        >
          <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
            <ExitToAppIcon />
          </ListItemIcon>
          {!isCollapsed && (
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                color: 'error.main',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            />
          )}
        </ListItemButton>
      </Box>
    </Drawer>
  );
};
