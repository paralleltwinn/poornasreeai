// =============================================================================
// AUTHENTICATION LAYOUT COMPONENT - RAZORPAY STYLE
// =============================================================================

/**
 * Modern authentication layout inspired by Razorpay
 * Features split-screen design with hero image and form
 */

'use client';

import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  error?: string | null;
  isLoading?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  error,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.background.default,
        display: 'flex',
      }}
    >
      {!isMobile && (
        // Left side - Hero section
        <Box
          sx={{
            flex: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing(4),
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              opacity: 0.3,
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            style={{ textAlign: 'center', zIndex: 1 }}
          >
            {/* Hero Image */}
            <Box
              sx={{
                marginBottom: 4,
                position: 'relative',
                width: 400,
                height: 300,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="AI Technology"
                fill
                style={{ objectFit: 'cover' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  padding: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  AI-Powered Research Assistant
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 700,
                marginBottom: 2,
                lineHeight: 1.2,
              }}
            >
              Join{' '}
              <Box component="span" sx={{ color: theme.palette.warning.light }}>
                10,000+
              </Box>{' '}
              Researchers
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                marginBottom: 4,
                maxWidth: 400,
              }}
            >
              that Trust Poornasree AI to Supercharge their Research
            </Typography>

            {/* Feature highlights */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                '🔬 Advanced Research Tools',
                '🤖 AI-Powered Analysis',
                '📊 Intelligent Insights',
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.8 + index * 0.1,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 2,
                      fontSize: '1.1rem',
                    }}
                  >
                    {feature}
                  </Typography>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Box>
      )}

      {/* Right side - Form section */}
      <Box
        sx={{
          flex: isMobile ? 1 : '0 0 480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing(isMobile ? 2 : 4),
          background: theme.palette.background.paper,
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <Paper
              elevation={0}
              sx={{
                padding: theme.spacing(isMobile ? 3 : 4),
                borderRadius: theme.spacing(2),
                background: 'transparent',
                border: 'none',
                position: 'relative',
              }}
            >
              {/* Logo and branding */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: theme.spacing(4),
                }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 2,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Image
                      src="/logo/iconlogo.png"
                      alt="Poornasree AI"
                      width={32}
                      height={32}
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                  </Box>
                </motion.div>

                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    marginBottom: theme.spacing(1),
                  }}
                >
                  {title}
                </Typography>

                {subtitle && (
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      textAlign: 'center',
                      fontSize: '1.1rem',
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>

              {/* Error message */}
              {error && (
                <Fade in={!!error}>
                  <Alert
                    severity="error"
                    sx={{
                      marginBottom: theme.spacing(3),
                      borderRadius: theme.spacing(1.5),
                      '& .MuiAlert-icon': {
                        alignItems: 'center',
                      },
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* Loading overlay */}
              {isLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    borderRadius: theme.spacing(2),
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Image
                      src="/logo/iconlogo.png"
                      alt="Loading"
                      width={32}
                      height={32}
                      style={{
                        opacity: 0.8,
                      }}
                    />
                  </motion.div>
                </Box>
              )}

              {/* Main content */}
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                {children}
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  textAlign: 'center',
                  marginTop: theme.spacing(4),
                  paddingTop: theme.spacing(3),
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.875rem',
                  }}
                >
                  © 2024 Poornasree AI - Intelligent Research Assistant
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default AuthLayout;
