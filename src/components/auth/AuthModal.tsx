// =============================================================================
// AUTHENTICATION MODAL COMPONENT - RAZORPAY STYLE
// =============================================================================

/**
 * Modern authentication modal inspired by Razorpay design
 * Clean, minimal interface with professional styling
 */

'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Paper,
  Alert,
  IconButton,
  Typography,
  Fade,
  TextField,
  Button,
  InputAdornment,
  Divider,
  Stack,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { 
  Close as CloseIcon,
  Email,
  Google as GoogleIcon,
} from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { authAPI } from '@/utils/api';
import { DEPARTMENTS } from '@/constants/departments';
import { AuthStep, LoginRequest, CustomerRegistration, EngineerRegistration, OTPRequest, OTPVerifyRequest } from '../../types/auth';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess?: () => void;
  initialStep?: AuthStep;
}

const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onAuthSuccess,
  initialStep = 'login',
}) => {
  const theme = useTheme();
  const { showSuccess, showError } = useSnackbar();
  const { login, registerCustomer, registerEngineer, requestOTP, loginWithOTP, error, clearError, isLoading } = useAuth();
  
  // Auth flow state
  const [authStep, setAuthStep] = useState<AuthStep>(initialStep);
  const [otpTimer, setOtpTimer] = useState(0);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [checkingLoginMethod, setCheckingLoginMethod] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    machine_model: '',
    department: '',
    dealer: '',
    state: '',
    otp_code: '',
  });

  // Validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if user requires password login
  const checkLoginMethod = async (email: string) => {
    if (!isValidEmail(email)) {
      setRequiresPassword(false);
      return;
    }

    try {
      setCheckingLoginMethod(true);
      const response = await authAPI.checkLoginMethod(email);
      setRequiresPassword(response.requires_password);
    } catch (error) {
      console.error('Failed to check login method:', error);
      // Default to not requiring password if check fails
      setRequiresPassword(false);
    } finally {
      setCheckingLoginMethod(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    clearError();

    // Check login method when email changes
    if (field === 'email' && authStep === 'login') {
      checkLoginMethod(value);
    }
  };

  // Handle department select change
  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    setFormData(prev => ({
      ...prev,
      department: event.target.value,
    }));
    clearError();
  };

  // Handle key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (authStep === 'login') {
        handleLogin();
      } else if (authStep === 'register-customer') {
        handleCustomerRegistration();
      } else if (authStep === 'register-engineer') {
        handleEngineerRegistration();
      }
    }
  };

  // Handle login
  const handleLogin = async () => {
    if (!formData.email || !isValidEmail(formData.email)) return;
    
    try {
      // Check if user requires password login
      if (requiresPassword) {
        if (!formData.password) {
          showError('Password is required for this account', 'Missing Password');
          return;
        }
        
        const loginData: LoginRequest = {
          email: formData.email,
          password: formData.password,
        };
        await login(loginData);
        
        // Show success message
        showSuccess('Successfully logged in!', 'Login Success');
        
        // Close modal
        onClose?.();
        
        // Small delay to ensure auth state is updated before redirect
        setTimeout(() => {
          console.log('AuthModal: Login completed with password');
        }, 100);
        
        return;
      }
      
      // For users without password, send OTP first
      const otpData: OTPRequest = {
        email: formData.email,
        purpose: 'login',
      };
      await requestOTP(otpData);
      
      // Show OTP verification step
      setAuthStep('otp-verification');
      
      // Start timer
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
      
    } catch (error) {
      console.error('Login failed:', error);
      showError('Login failed. Please check your credentials and try again.', 'Login Error');
    }
  };

  // Handle OTP request
  const handleOTPRequest = async () => {
    if (!formData.email || !isValidEmail(formData.email)) return;
    
    try {
      const otpData: OTPRequest = {
        email: formData.email,
        purpose: authStep === 'register-customer' ? 'registration' : 'login',
      };
      await requestOTP(otpData);
      
      if (authStep === 'register-customer') {
        setAuthStep('otp-verification');
      }
      
      // Start timer
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
    } catch (error) {
      console.error('OTP request failed:', error);
    }
  };

  // Handle OTP verification for login and registration
  const handleOTPVerification = async () => {
    if (!formData.otp_code || formData.otp_code.length !== 6) return;
    
    try {
      // Check if this is for customer registration or login
      const isRegistration = authStep === 'otp-verification' && formData.first_name; // Has registration data
      
      if (isRegistration) {
        // This is customer registration
        handleCustomerRegistration();
      } else {
        // This is login OTP verification
        const verifyData: OTPVerifyRequest = {
          email: formData.email,
          otp_code: formData.otp_code,
          purpose: 'login',
        };
        await loginWithOTP(verifyData);
        
        // Show success message and handle redirection
        showSuccess('Successfully logged in with OTP!', 'Login Success');
        onClose?.();
        onAuthSuccess?.();
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      showError('OTP verification failed. Please check your code and try again.', 'Verification Error');
    }
  };

  // Handle customer registration
  const handleCustomerRegistration = async () => {
    if (authStep === 'register-customer' && !formData.otp_code) {
      handleOTPRequest();
      return;
    }
    
    if (authStep === 'otp-verification' || authStep === 'register-customer') {
      try {
        const registrationData: CustomerRegistration = {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          machine_model: formData.machine_model,
          state: formData.state,
          phone_number: formData.phone_number,
          otp_code: formData.otp_code,
        };
        await registerCustomer(registrationData);
        showSuccess('Registration successful! Welcome to Poornasree AI!', 'Registration Success');
        onAuthSuccess?.();
      } catch (error) {
        console.error('Customer registration failed:', error);
        showError('Registration failed. Please try again.', 'Registration Error');
      }
    }
  };

  // Handle engineer registration
  const handleEngineerRegistration = async () => {
    try {
      const registrationData: EngineerRegistration = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        department: formData.department,
        dealer: formData.dealer || undefined,
        state: formData.state,
      };
      await registerEngineer(registrationData);
      setAuthStep('welcome');
    } catch (error) {
      console.error('Engineer registration failed:', error);
    }
  };

  // Render forms based on step
  const renderForm = () => {
    switch (authStep) {
      case 'login':
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Enter your email or phone number"
              value={formData.email}
              onChange={handleInputChange('email')}
              onKeyPress={handleKeyPress}
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
                  fontSize: '1.1rem',
                  padding: '4px 8px',
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1rem',
                },
              }}
            />

            {/* Show password field dynamically based on user's account */}
            {requiresPassword && (
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                disabled={checkingLoginMethod}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    padding: '4px 8px',
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1rem',
                  },
                }}
              />
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={
                !formData.email || 
                checkingLoginMethod || 
                (requiresPassword && !formData.password) || 
                isLoading
              }
              sx={{
                borderRadius: 2,
                padding: '14px 24px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
            >
              {checkingLoginMethod 
                ? 'Checking...' 
                : requiresPassword 
                  ? 'Sign In' 
                  : 'Continue with OTP'
              }
            </Button>

            {/* Only show OTP/Google options for non-password users */}
            {!requiresPassword && !checkingLoginMethod && (
              <>
                <Divider sx={{ margin: '16px 0' }}>
                  <Typography variant="body2" color="text.secondary">
                    or
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<GoogleIcon />}
                  sx={{
                    borderRadius: 2,
                    padding: '14px 24px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  Continue with Google
                </Button>
              </>
            )}

            <Box textAlign="center" sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                New to Poornasree AI?{' '}
                <Button
                  variant="text"
                  onClick={() => setAuthStep('register-type')}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: 0,
                    minWidth: 'auto',
                  }}
                >
                  Create an account
                </Button>
              </Typography>
            </Box>
          </Stack>
        );

      case 'register-type':
        return (
          <Stack spacing={3}>
            <Typography variant="h6" textAlign="center" gutterBottom>
              Choose your account type
            </Typography>
            
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => setAuthStep('register-customer')}
              sx={{
                borderRadius: 2,
                padding: '16px 24px',
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                textAlign: 'left',
                justifyContent: 'flex-start',
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Customer Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For researchers and professionals
                </Typography>
              </Box>
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => setAuthStep('register-engineer')}
              sx={{
                borderRadius: 2,
                padding: '16px 24px',
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                textAlign: 'left',
                justifyContent: 'flex-start',
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Engineer Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Apply to join our engineering team
                </Typography>
              </Box>
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => setAuthStep('login')}
              sx={{ textTransform: 'none', mt: 2 }}
            >
              Back to Sign In
            </Button>
          </Stack>
        );

      case 'register-customer':
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              required
              label="Email address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              onKeyPress={handleKeyPress}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                required
                label="First name"
                value={formData.first_name}
                onChange={handleInputChange('first_name')}
                onKeyPress={handleKeyPress}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                required
                label="Last name"
                value={formData.last_name}
                onChange={handleInputChange('last_name')}
                onKeyPress={handleKeyPress}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                required
                label="Machine model"
                value={formData.machine_model}
                onChange={handleInputChange('machine_model')}
                onKeyPress={handleKeyPress}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                required
                label="State"
                value={formData.state}
                onChange={handleInputChange('state')}
                onKeyPress={handleKeyPress}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>

            <TextField
              fullWidth
              required
              label="Phone number"
              type="tel"
              value={formData.phone_number}
              onChange={handleInputChange('phone_number')}
              onKeyPress={handleKeyPress}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleCustomerRegistration}
              disabled={isLoading}
              sx={{
                borderRadius: 2,
                padding: '14px 24px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Send verification code
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => setAuthStep('register-type')}
              sx={{ textTransform: 'none' }}
            >
              Back
            </Button>
          </Stack>
        );

      case 'register-engineer':
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              required
              label="Email address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              onKeyPress={handleKeyPress}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                required
                label="First name"
                value={formData.first_name}
                onChange={handleInputChange('first_name')}
                onKeyPress={handleKeyPress}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                required
                label="Last name"
                value={formData.last_name}
                onChange={handleInputChange('last_name')}
                onKeyPress={handleKeyPress}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                required
                label="Phone number"
                type="tel"
                value={formData.phone_number}
                onChange={handleInputChange('phone_number')}
                onKeyPress={handleKeyPress}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <FormControl
                fullWidth
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  onChange={handleDepartmentChange}
                  label="Department"
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Dealer (optional)"
                value={formData.dealer}
                onChange={handleInputChange('dealer')}
                onKeyPress={handleKeyPress}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                required
                label="State"
                value={formData.state}
                onChange={handleInputChange('state')}
                onKeyPress={handleKeyPress}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleEngineerRegistration}
              disabled={isLoading}
              sx={{
                borderRadius: 2,
                padding: '14px 24px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Submit application
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => setAuthStep('register-type')}
              sx={{ textTransform: 'none' }}
            >
              Back
            </Button>
          </Stack>
        );

      case 'otp-verification':
        return (
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                Verify your email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We&apos;ve sent a verification code to {formData.email}
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Enter verification code"
              value={formData.otp_code}
              onChange={handleInputChange('otp_code')}
              onKeyPress={handleKeyPress}
              inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleOTPVerification}
              disabled={!formData.otp_code || formData.otp_code.length !== 6 || isLoading}
              sx={{
                borderRadius: 2,
                padding: '14px 24px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Verify and continue
            </Button>

            <Button
              variant="text"
              onClick={handleOTPRequest}
              disabled={otpTimer > 0}
              sx={{ textTransform: 'none' }}
            >
              {otpTimer > 0 ? `Resend code in ${otpTimer}s` : 'Resend code'}
            </Button>
          </Stack>
        );

      case 'welcome':
        return (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              Application submitted!
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Thank you for your application. We&apos;ll review it and get back to you soon.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setAuthStep('login')}
              sx={{ textTransform: 'none' }}
            >
              Back to sign in
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        borderRadius: 3,
        background: 'background.paper',
        maxHeight: '90vh',
        overflow: 'auto',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          background: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          padding: 3,
          paddingBottom: 2,
          zIndex: 10,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 32,
                height: 32,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src="/logo/iconlogo.png"
                alt="Poornasree AI"
                width={16}
                height={16}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              {authStep === 'login' ? 'Welcome to Poornasree AI' : 
               authStep === 'register-type' ? 'Create your account' :
               authStep === 'register-customer' ? 'Customer Registration' :
               authStep === 'register-engineer' ? 'Engineer Application' :
               authStep === 'otp-verification' ? 'Verify Email' :
               'Welcome!'}
            </Typography>
          </Box>
          
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              bgcolor: 'action.hover',
              '&:hover': {
                bgcolor: 'action.selected',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ padding: 3, paddingTop: 2 }}>
        {/* Subtitle */}
        {authStep === 'login' && (
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ marginBottom: 3 }}
          >
            Get started with your email or phone number
          </Typography>
        )}

        {/* Error message */}
        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              sx={{
                marginBottom: 3,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Form content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={authStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {renderForm()}
          </motion.div>
        </AnimatePresence>
      </Box>

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
            zIndex: 20,
            borderRadius: 3,
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
            <Box
              component="img"
              src="/logo/iconlogo.png"
              alt="Loading"
              sx={{
                width: 32,
                height: 32,
                opacity: 0.8,
              }}
            />
          </motion.div>
        </Box>
      )}
    </Paper>
  );
};

export default AuthModal;
