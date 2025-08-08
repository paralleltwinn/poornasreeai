// =============================================================================
// ENGINEER REGISTRATION FORM COMPONENT  
// =============================================================================

/**
 * Registration form for engineer applications
 * Simplified form with only required fields: email, mobile, department, dealer(optional), state
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Email,
  Person,
  Phone,
  Work,
  ArrowBack,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useApiResponse } from '../../hooks/useApiResponse';
import { EngineerRegistration } from '../../types/auth';
import { DEPARTMENTS } from '../../constants/departments';
import AuthLayout from './AuthLayout';

interface EngineerRegistrationProps {
  onBackClick: () => void;
  onSuccess?: () => void;
  initialEmail?: string;
}

const EngineerRegistrationForm: React.FC<EngineerRegistrationProps> = ({
  onBackClick,
  onSuccess,
  initialEmail = '',
}) => {
  const { registerEngineer, isLoading, clearError } = useAuth();
  const { handleRegistrationResponse } = useApiResponse();
  
  // Debug: Check if DEPARTMENTS is loaded
  console.log('DEPARTMENTS loaded:', DEPARTMENTS);
  
  // Form state
  const [formData, setFormData] = useState({
    email: initialEmail,
    first_name: '',
    last_name: '',
    phone_number: '',
    department: '',
    dealer: '',
    state: '',
  });

  // Form validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = 
    formData.email &&
    isValidEmail(formData.email) &&
    formData.first_name.trim() &&
    formData.last_name.trim() &&
    formData.phone_number.trim() &&
    formData.department.trim() &&
    formData.state.trim();

  // Handle input change for text fields
  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    clearError();
  };

  // Handle department select change
  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    setFormData(prev => ({
      ...prev,
      department: event.target.value,
    }));
    clearError();
  };

  // Handle registration
  const handleRegistration = async () => {
    if (!isFormValid) return;

    const result = await handleRegistrationResponse(async () => {
      const registrationData: EngineerRegistration = {
        email: formData.email,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim(),
        department: formData.department.trim(),
        dealer: formData.dealer.trim() || undefined,
        state: formData.state.trim(),
      };
      
      return await registerEngineer(registrationData);
    }, 'engineer');

    if (result) {
      onSuccess?.();
    }
  };

  // Handle key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && isFormValid) {
      handleRegistration();
    }
  };

  return (
    <AuthLayout
      title="Join Our Engineering Team"
      subtitle="Apply to become an engineer at Poornasree AI"
      isLoading={isLoading}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Stack spacing={3}>
          {/* Contact Information */}
          <Typography variant="h6" color="text.primary">
            Contact Information
          </Typography>

          <TextField
            fullWidth
            required
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            onKeyPress={handleKeyPress}
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
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              required
              label="First Name"
              value={formData.first_name}
              onChange={handleInputChange('first_name')}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              required
              label="Last Name"
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
              label="Phone Number"
              type="tel"
              value={formData.phone_number}
              onChange={handleInputChange('phone_number')}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Work color="action" fontSize="small" />
                      {dept}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="Dealer (Optional)"
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

          {/* Submit button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleRegistration}
            disabled={!isFormValid || isLoading}
            sx={{
              borderRadius: 2,
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 500,
              marginTop: 3,
            }}
          >
            Submit Application
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={onBackClick}
            startIcon={<ArrowBack />}
            sx={{
              borderRadius: 2,
              padding: '12px 24px',
              fontSize: '1rem',
              marginTop: 1,
            }}
          >
            Back to Registration Type
          </Button>
        </Stack>
      </motion.div>
    </AuthLayout>
  );
};

export default EngineerRegistrationForm;
