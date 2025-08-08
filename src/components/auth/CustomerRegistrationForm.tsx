// =============================================================================
// CUSTOMER REGISTRATION FORM COMPONENT
// =============================================================================

/**
 * Registration form for customer accounts
 * Includes OTP verification step
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  InputAdornment,
  Step,
  Stepper,
  StepLabel,
} from '@mui/material';
import {
  Email,
  Person,
  Phone,
  ArrowBack,
  ArrowForward,
  MarkEmailRead,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import LoadingAnimation from '../LoadingAnimation';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useApiResponse } from '../../hooks/useApiResponse';
import { OTPRequest, CustomerRegistration } from '../../types/auth';

interface CustomerRegistrationProps {
  onBackClick: () => void;
  onSuccess?: () => void;
  initialEmail?: string;
}

const CustomerRegistrationForm: React.FC<CustomerRegistrationProps> = ({
  onBackClick,
  onSuccess,
  initialEmail = '',
}) => {
  const { requestOTP, registerCustomer, isLoading, clearError } = useAuth();
  const { showError } = useSnackbar();
  const { handleRegistrationResponse, handleOtpRequestResponse } = useApiResponse();
  
  // Form state
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    email: initialEmail,
    first_name: '',
    last_name: '',
    machine_model: '',
    state: '',
    phone_number: '',
    otp_code: '',
  });
  const [otpTimer, setOtpTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update email if initialEmail changes
  useEffect(() => {
    if (initialEmail && initialEmail !== formData.email) {
      setFormData(prev => ({
        ...prev,
        email: initialEmail
      }));
    }
  }, [initialEmail, formData.email]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Debug form state changes
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  // Form validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isStep1Valid = 
    formData.email && 
    formData.first_name.trim() && 
    formData.last_name.trim() &&
    formData.machine_model.trim() &&
    formData.state.trim() &&
    formData.phone_number.trim() &&
    isValidEmail(formData.email);

  const isStep2Valid = formData.otp_code.length === 6;

  // Handle input change
  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    console.log(`Input changed - ${field}:`, value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };
      console.log('Updated form data:', newData);
      return newData;
    });
    clearError();
  };

  // Handle OTP request
  const handleOtpRequest = async () => {
    console.log('OTP request triggered', { step, formData, isStep1Valid });
    
    if (step === 0 && !isStep1Valid) {
      console.log('Step 1 validation failed:', {
        email: formData.email,
        hasEmail: !!formData.email,
        isValidEmail: isValidEmail(formData.email),
        firstName: formData.first_name.trim(),
        lastName: formData.last_name.trim(),
        machineModel: formData.machine_model.trim(),
        state: formData.state.trim(),
        phoneNumber: formData.phone_number.trim(),
      });
      showError('Please fill in all required fields correctly');
      return;
    }

    const result = await handleOtpRequestResponse(async () => {
      const otpRequest: OTPRequest = { 
        email: formData.email, 
        purpose: 'registration' 
      };
      console.log('Sending OTP request:', otpRequest);
      return await requestOTP(otpRequest);
    });

    if (result) {
      if (step === 0) {
        setStep(1);
      }
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start countdown timer (reset if already running)
      setOtpTimer(60);
      timerRef.current = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Handle registration
  const handleRegistration = async () => {
    if (!isStep2Valid) {
      showError('Please enter a valid 6-digit verification code');
      return;
    }

    const result = await handleRegistrationResponse(async () => {
      const registrationData: CustomerRegistration = {
        email: formData.email,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        machine_model: formData.machine_model.trim(),
        state: formData.state.trim(),
        phone_number: formData.phone_number.trim(),
        otp_code: formData.otp_code,
      };
      
      return await registerCustomer(registrationData);
    }, 'customer');

    if (result) {
      onSuccess?.();
    }
  };

  // Handle key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (step === 0) {
        handleOtpRequest();
      } else {
        handleRegistration();
      }
    }
  };

  const steps = ['Account Details', 'Verify Email'];

  return (
    <Box>
      <Stack spacing={4}>
        {/* Back button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={onBackClick}
          sx={{
            alignSelf: 'flex-start',
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          Back
        </Button>

        {/* Progress stepper */}
        <Stepper activeStep={step} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {step === 0 ? (
            // Step 1: Account details
            <Stack spacing={3}>
              <Typography variant="h6" textAlign="center" gutterBottom>
                Create Your Customer Account
              </Typography>

              <TextField
                fullWidth
                required
                name="email"
                label="Email Address"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange('email')}
                onKeyPress={handleKeyPress}
                autoComplete="email"
                error={!!(formData.email && !isValidEmail(formData.email))}
                helperText={
                  formData.email && !isValidEmail(formData.email)
                    ? 'Please enter a valid email address'
                    : ''
                }
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

              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  required
                  name="firstName"
                  label="First Name"
                  value={formData.first_name || ''}
                  onChange={handleInputChange('first_name')}
                  onKeyPress={handleKeyPress}
                  autoComplete="given-name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  required
                  name="lastName"
                  label="Last Name"
                  value={formData.last_name || ''}
                  onChange={handleInputChange('last_name')}
                  onKeyPress={handleKeyPress}
                  autoComplete="family-name"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  required
                  name="machineModel"
                  label="Machine Model"
                  value={formData.machine_model || ''}
                  onChange={handleInputChange('machine_model')}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  required
                  name="state"
                  label="State"
                  value={formData.state || ''}
                  onChange={handleInputChange('state')}
                  onKeyPress={handleKeyPress}
                  autoComplete="address-level1"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              <TextField
                fullWidth
                required
                name="phoneNumber"
                label="Phone Number"
                type="tel"
                value={formData.phone_number || ''}
                onChange={handleInputChange('phone_number')}
                onKeyPress={handleKeyPress}
                autoComplete="tel"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleOtpRequest}
                disabled={!isStep1Valid || isLoading}
                endIcon={<ArrowForward />}
                sx={{
                  borderRadius: 2,
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                {isLoading ? <LoadingAnimation size={24} /> : 'Send Verification Code'}
              </Button>
            </Stack>
          ) : (
            // Step 2: OTP verification
            <Stack spacing={3}>
              <Box textAlign="center">
                <MarkEmailRead 
                  sx={{ 
                    fontSize: 48, 
                    color: 'primary.main', 
                    marginBottom: 2 
                  }} 
                />
                <Typography variant="h6" gutterBottom>
                  Check Your Email
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We&apos;ve sent a 6-digit verification code to{' '}
                  <strong>{formData.email}</strong>
                </Typography>
              </Box>

              <TextField
                fullWidth
                name="otpCode"
                label="Verification Code"
                value={formData.otp_code || ''}
                onChange={handleInputChange('otp_code')}
                onKeyPress={handleKeyPress}
                placeholder="Enter 6-digit code"
                autoComplete="one-time-code"
                inputProps={{
                  maxLength: 6,
                  style: { 
                    textAlign: 'center', 
                    fontSize: '1.2em', 
                    letterSpacing: '0.5em' 
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleRegistration}
                  disabled={!isStep2Valid || isLoading}
                  sx={{
                    borderRadius: 2,
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: 500,
                  }}
                >
                  {isLoading ? <LoadingAnimation size={24} /> : 'Create Account'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    console.log('Resend OTP clicked', { 
                      email: formData.email, 
                      otpTimer, 
                      isLoading 
                    });
                    handleOtpRequest();
                  }}
                  disabled={otpTimer > 0 || isLoading}
                  sx={{
                    borderRadius: 2,
                    padding: '8px 24px',
                  }}
                >
                  {otpTimer > 0 ? `Resend code in ${otpTimer}s` : 'Resend verification code'}
                </Button>
              </Stack>
            </Stack>
          )}
        </motion.div>
      </Stack>
    </Box>
  );
};

export default CustomerRegistrationForm;
