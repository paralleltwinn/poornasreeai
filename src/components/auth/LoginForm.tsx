// =============================================================================
// LOGIN FORM COMPONENT
// =============================================================================

/**
 * Login form with email/password and OTP options
 * Handles password login and OTP-based authentication
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
  Stack,
  Link,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  MarkEmailRead,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useApiResponse } from '../../hooks/useApiResponse';
import { LoginRequest, OTPRequest, OTPVerifyRequest } from '../../types/auth';

interface LoginFormProps {
  onRegisterClick: () => void;
  onSuccess?: () => void;
}

type LoginMode = 'password' | 'otp';

const LoginForm: React.FC<LoginFormProps> = ({ onRegisterClick, onSuccess }) => {
  const { login, loginWithOTP, requestOTP, isLoading, clearError } = useAuth();
  const { handleLoginResponse, handleOtpRequestResponse, showSuccessMessage } = useApiResponse();
  
  // Form state
  const [mode, setMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Form validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordLoginValid = email && password && isValidEmail(email);
  const isOtpRequestValid = email && isValidEmail(email);
  const isOtpVerifyValid = email && otpCode.length === 6 && isValidEmail(email);

  // Handle tab change
  const handleModeChange = (_: React.SyntheticEvent, newMode: LoginMode) => {
    setMode(newMode);
    clearError();
    setOtpSent(false);
    setOtpCode('');
    setPassword('');
  };

  // Handle password login
  const handlePasswordLogin = async () => {
    if (!isPasswordLoginValid) return;

    const result = await handleLoginResponse(async () => {
      const credentials: LoginRequest = { email, password };
      return await login(credentials);
    });

    if (result) {
      onSuccess?.();
    }
  };

  // Handle OTP request
  const handleOtpRequest = async () => {
    if (!isOtpRequestValid) return;

    const result = await handleOtpRequestResponse(async () => {
      const otpRequest: OTPRequest = { email, purpose: 'login' };
      return await requestOTP(otpRequest);
    });

    if (result) {
      setOtpSent(true);
      
      // Start countdown timer
      setOtpTimer(60);
      const timer = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Handle OTP verification
  const handleOtpVerify = async () => {
    if (!isOtpVerifyValid) return;

    const result = await handleLoginResponse(async () => {
      const otpData: OTPVerifyRequest = {
        email,
        otp_code: otpCode,
        purpose: 'login',
      };
      return await loginWithOTP(otpData);
    });

    if (result) {
      onSuccess?.();
    }
  };

  // Handle key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (mode === 'password') {
        handlePasswordLogin();
      } else if (otpSent) {
        handleOtpVerify();
      } else {
        handleOtpRequest();
      }
    }
  };

  return (
    <Box>
      {/* Login mode tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 3 }}>
        <Tabs value={mode} onChange={handleModeChange} centered>
          <Tab
            label="Password"
            value="password"
            icon={<Lock />}
            iconPosition="start"
          />
          <Tab
            label="OTP"
            value="otp"
            icon={<MarkEmailRead />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <motion.div
        key={mode}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Stack spacing={3}>
          {/* Email field */}
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            error={!!(email && !isValidEmail(email))}
            helperText={email && !isValidEmail(email) ? 'Please enter a valid email address' : ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Password mode fields */}
          {mode === 'password' && (
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          )}

          {/* OTP mode fields */}
          {mode === 'otp' && otpSent && (
            <TextField
              fullWidth
              label="OTP Code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.slice(0, 6))}
              onKeyPress={handleKeyPress}
              placeholder="Enter 6-digit code"
              inputProps={{
                maxLength: 6,
                style: { textAlign: 'center', fontSize: '1.2em', letterSpacing: '0.5em' },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          )}

          {/* Action buttons */}
          {mode === 'password' ? (
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handlePasswordLogin}
              disabled={!isPasswordLoginValid || isLoading}
              sx={{
                borderRadius: 2,
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              Sign In
            </Button>
          ) : !otpSent ? (
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleOtpRequest}
              disabled={!isOtpRequestValid || isLoading}
              sx={{
                borderRadius: 2,
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              Send OTP
            </Button>
          ) : (
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleOtpVerify}
                disabled={!isOtpVerifyValid || isLoading}
                sx={{
                  borderRadius: 2,
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                Verify & Sign In
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={handleOtpRequest}
                disabled={otpTimer > 0 || isLoading}
                sx={{
                  borderRadius: 2,
                  padding: '8px 24px',
                }}
              >
                {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
              </Button>
            </Stack>
          )}

          {/* Divider */}
          <Divider sx={{ margin: '24px 0' }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Register link */}
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={onRegisterClick}
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Create one here
              </Link>
            </Typography>
          </Box>
        </Stack>
      </motion.div>
    </Box>
  );
};

export default LoginForm;
