'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  Typography,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Modal,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Chat as ChatIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Add as AddIcon,
  BookmarkBorder as BookmarkIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { appConfig } from '../config/app';
import { ChatSession } from '../types/chat';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import AuthModal from './auth/AuthModal';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH_COLLAPSED = 60;
const SIDEBAR_WIDTH_EXPANDED = 280;

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated, logout } = useAuth();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Mock chat sessions
  useEffect(() => {
    const mockSessions: ChatSession[] = [
      {
        id: '1',
        title: 'What is artificial intelligence?',
        messages: [],
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000),
      },
      {
        id: '2',
        title: 'Quantum computing explained',
        messages: [],
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000),
      },
      {
        id: '3',
        title: 'Climate change solutions',
        messages: [],
        createdAt: new Date(Date.now() - 259200000), // 3 days ago
        updatedAt: new Date(Date.now() - 259200000),
      },
    ];
    setChatSessions(mockSessions);
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      // Clear any existing timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      // Set a 2-second delay before hiding the sidebar
      const timeout = setTimeout(() => {
        setIsExpanded(false);
        setHoverTimeout(null);
      }, 2000);
      setHoverTimeout(timeout);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const toggleMobileDrawer = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChatSessions([newSession, ...chatSessions]);
    setSelectedSession(newSession.id);
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN || 
                          user?.role?.toString().toUpperCase() === 'SUPER_ADMIN' ||
                          user?.role?.toString().toLowerCase() === 'super_admin';
                          
      const isAdmin = user?.role === UserRole.ADMIN || 
                     user?.role?.toString().toUpperCase() === 'ADMIN' ||
                     user?.role?.toString().toLowerCase() === 'admin';
                          
      if (isSuperAdmin || isAdmin) {
        // Open dashboard in new tab for admins and super admins
        window.open('/dashboard', '_blank');
      } else {
        // For other users, logout
        logout();
      }
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src="/logo/iconlogo.png"
              alt={`${appConfig.name} Logo`}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                objectFit: 'contain',
                flexShrink: 0,
                position: 'relative',
                zIndex: 1,
              }}
            />
          </motion.div>
        </Box>
        <AnimatePresence mode="wait">
          {(isExpanded || isMobile) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ 
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1],
                opacity: { duration: 0.2 },
                width: { duration: 0.3 }
              }}
            >
              <Typography variant="h6" fontWeight="bold" noWrap>
                {appConfig.name}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* New Chat Button */}
      <Box sx={{ px: 1, mb: 1 }}>
        <ListItemButton
          onClick={createNewChat}
          sx={{
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            height: 44, // Fixed height to prevent glitching
            minHeight: 44, // Ensure consistent height
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            justifyContent: 'center',
            px: isExpanded || isMobile ? 2 : 1,
            position: 'relative',
            overflow: 'hidden', // Prevent text overflow during animation
          }}
        >
            {!(isExpanded || isMobile) ? (
              // Collapsed state - center the icon
              <AddIcon />
            ) : (
              // Expanded state - show icon and text
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'flex-start',
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: 'inherit', 
                    minWidth: 40,
                    mr: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AddIcon />
                </ListItemIcon>
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.4, 0.0, 0.2, 1],
                      opacity: { duration: 0.2 },
                      width: { duration: 0.3 }
                    }}
                    style={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium" color="inherit">
                      New Chat
                    </Typography>
                  </motion.div>
                </AnimatePresence>
              </Box>
            )}
          </ListItemButton>
        </Box>

      <Divider sx={{ mx: 1 }} />

      {/* Chat History */}
      <Box sx={{ flex: 1, overflow: 'hidden', py: 1 }}>
        <AnimatePresence mode="wait">
          {(isExpanded || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1]
              }}
            >
              <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
                Recent
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>

        <List sx={{ px: 1, overflow: 'auto', flex: 1 }}>
          {chatSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ListItemButton
                selected={selectedSession === session.id}
                onClick={() => setSelectedSession(session.id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  minHeight: 48, // Fixed height to prevent glitching
                  height: 48,
                  justifyContent: 'center',
                  px: 1, // Fixed padding for both states
                  position: 'relative',
                  overflow: 'hidden', // Prevent text overflow during animation
                  display: 'flex',
                  alignItems: 'center',
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                  {!(isExpanded || isMobile) ? (
                    // Collapsed state - center the icon
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <ChatIcon fontSize="small" />
                    </Box>
                  ) : (
                    // Expanded state - show icon and text
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'flex-start',
                        pl: 1, // Add left padding when expanded
                      }}
                    >
                      <ListItemIcon 
                        sx={{ 
                          minWidth: 40,
                          mr: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ChatIcon fontSize="small" />
                      </ListItemIcon>
                      <AnimatePresence mode="wait">
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: '100%' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ 
                            duration: 0.3,
                            ease: [0.4, 0.0, 0.2, 1],
                            opacity: { duration: 0.2 },
                            width: { duration: 0.3 }
                          }}
                          style={{
                            overflow: 'hidden',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ mb: 0.25, lineHeight: 1.2 }}
                          >
                            {session.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ lineHeight: 1 }}
                          >
                            {formatRelativeTime(session.updatedAt)}
                          </Typography>
                        </motion.div>
                      </AnimatePresence>
                    </Box>
                  )}
                </ListItemButton>
              </motion.div>
          ))}
        </List>
      </Box>

      <Divider sx={{ mx: 1 }} />

      {/* Bottom Navigation */}
      <List sx={{ px: 1, py: 1 }}>
        {[
          { icon: <HistoryIcon />, text: 'History', tooltip: 'Chat History' },
          { icon: <BookmarkIcon />, text: 'Saved', tooltip: 'Saved Chats' },
          { icon: <SettingsIcon />, text: 'Settings', tooltip: 'Settings' },
        ].map((item, index) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <ListItemButton
              sx={{
                borderRadius: 1,
                mb: 0.5,
                minHeight: 40, // Fixed height
                height: 40,
                justifyContent: 'center',
                px: isExpanded || isMobile ? 2 : 1,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {!(isExpanded || isMobile) ? (
                // Collapsed state - center the icon
                item.icon
              ) : (
                // Expanded state - show icon and text
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'flex-start',
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 40,
                      mr: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <AnimatePresence mode="wait">
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.4, 0.0, 0.2, 1],
                        opacity: { duration: 0.2 },
                        width: { duration: 0.3 }
                      }}
                      style={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2">
                        {item.text}
                      </Typography>
                    </motion.div>
                  </AnimatePresence>
                </Box>
              )}
              </ListItemButton>
            </motion.div>
        ))}
      </List>

      {/* User Profile / Authentication */}
      <Box sx={{ p: 1 }}>
        {(() => {
          const isSuperAdmin = isAuthenticated && (
            user?.role === UserRole.SUPER_ADMIN || 
            user?.role?.toString().toUpperCase() === 'SUPER_ADMIN' ||
            user?.role?.toString().toLowerCase() === 'super_admin'
          );
          
          const isAdmin = isAuthenticated && (
            user?.role === UserRole.ADMIN || 
            user?.role?.toString().toUpperCase() === 'ADMIN' ||
            user?.role?.toString().toLowerCase() === 'admin'
          );
          
          return (
            <Tooltip 
              title={
                isAuthenticated 
                  ? isSuperAdmin 
                    ? "Open Super Admin Dashboard" 
                    : isAdmin
                    ? "Open Admin Dashboard"
                    : "Logout"
                  : "Sign In"
              }
              placement="right"
            >
              <ListItemButton
                onClick={handleAuthClick}
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  height: 48,
                  justifyContent: 'center',
                  px: isExpanded || isMobile ? 2 : 1,
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {!(isExpanded || isMobile) ? (
                  // Collapsed state - show appropriate icon
                  <Avatar sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: isAuthenticated 
                      ? isSuperAdmin 
                        ? 'primary.main' 
                        : isAdmin 
                        ? 'secondary.main'
                        : 'grey.500'
                      : 'primary.main' 
                  }}>
                    {isAuthenticated ? (
                      <PersonIcon fontSize="small" />
                    ) : (
                      <LoginIcon fontSize="small" />
                    )}
                  </Avatar>
                ) : (
                  // Expanded state - show full authentication info
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      justifyContent: 'flex-start',
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        minWidth: 40,
                        mr: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: isAuthenticated 
                          ? isSuperAdmin 
                            ? 'primary.main' 
                            : isAdmin 
                            ? 'secondary.main'
                            : 'grey.500'
                          : 'primary.main' 
                      }}>
                        {isAuthenticated ? (
                          <PersonIcon fontSize="small" />
                        ) : (
                          <LoginIcon fontSize="small" />
                        )}
                      </Avatar>
                    </ListItemIcon>
                    <AnimatePresence mode="wait">
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ 
                          duration: 0.3,
                          ease: [0.4, 0.0, 0.2, 1],
                          opacity: { duration: 0.2 },
                          width: { duration: 0.3 }
                        }}
                        style={{
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          flex: 1,
                        }}
                      >
                        {isAuthenticated ? (
                          <>
                            <Typography variant="body2" sx={{ mb: 0.25, lineHeight: 1.2 }}>
                              {user?.first_name || 'User'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={user?.role || 'USER'} 
                                size="small" 
                                color={isSuperAdmin ? 'primary' : isAdmin ? 'secondary' : 'default'}
                                sx={{ 
                                  height: 16, 
                                  fontSize: '0.65rem',
                                  '& .MuiChip-label': { px: 0.5 }
                                }} 
                              />
                              {/* Show different icon based on user role */}
                              {isSuperAdmin || isAdmin ? (
                                <SettingsIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              ) : (
                                <LogoutIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              )}
                            </Box>
                          </>
                        ) : (
                          <>
                            <Typography variant="body2" sx={{ mb: 0.25, lineHeight: 1.2 }}>
                              Sign In
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                              Access your account
                            </Typography>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </Box>
                )}
              </ListItemButton>
            </Tooltip>
          );
        })()}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.appBar,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <IconButton
              onClick={toggleMobileDrawer}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </motion.div>
        </Box>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <motion.div
          initial={{ width: SIDEBAR_WIDTH_COLLAPSED }}
          animate={{
            width: isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
          }}
          transition={{ 
            duration: 0.4, 
            ease: [0.4, 0.0, 0.2, 1], // Material Design easing curve
            type: "tween"
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'relative',
            zIndex: theme.zIndex.drawer,
          }}
        >
          <Box sx={{ width: '100%', height: '100%' }}>
            {sidebarContent}
          </Box>
        </motion.div>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={isMobileOpen}
        onClose={toggleMobileDrawer}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH_EXPANDED,
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {children}
      </Box>

      {/* Authentication Modal */}
      <Modal
        open={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 500,
            outline: 'none',
          }}
        >
          <AuthModal
            onClose={() => setIsAuthModalOpen(false)}
            onAuthSuccess={handleAuthSuccess}
            initialStep="login"
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default SidebarLayout;
