// =============================================================================
// REGISTRATION TYPE SELECTION COMPONENT
// =============================================================================

/**
 * Component for selecting registration type (Customer or Engineer)
 * First step in the registration flow
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Person,
  Engineering,
  ArrowForward,
  ArrowBack,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface RegistrationTypeProps {
  onTypeSelect: (type: 'customer' | 'engineer') => void;
  onBackClick: () => void;
}

const RegistrationType: React.FC<RegistrationTypeProps> = ({
  onTypeSelect,
  onBackClick,
}) => {
  const theme = useTheme();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { 
      y: -4,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
    },
  };

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
          Back to Login
        </Button>

        {/* Registration options */}
        <Stack spacing={3}>
          {/* Customer registration */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card
              sx={{
                cursor: 'pointer',
                border: `2px solid transparent`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: theme.customShadows?.elevation3,
                },
              }}
              onClick={() => onTypeSelect('customer')}
            >
              <CardContent sx={{ padding: 4 }}>
                <Box display="flex" alignItems="center" gap={3}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.light,
                      borderRadius: '50%',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Person 
                      sx={{ 
                        fontSize: 32,
                        color: theme.palette.primary.main,
                      }} 
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        marginBottom: 1,
                        color: theme.palette.text.primary,
                      }}
                    >
                      Join as a Customer
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.5,
                      }}
                    >
                      Get access to AI-powered research and analysis tools.
                      Perfect for students, researchers, and professionals.
                    </Typography>
                  </Box>
                  
                  <ArrowForward 
                    sx={{ 
                      color: theme.palette.action.active,
                      fontSize: 24,
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Engineer registration */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card
              sx={{
                cursor: 'pointer',
                border: `2px solid transparent`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: theme.palette.secondary.main,
                  boxShadow: theme.customShadows?.elevation3,
                },
              }}
              onClick={() => onTypeSelect('engineer')}
            >
              <CardContent sx={{ padding: 4 }}>
                <Box display="flex" alignItems="center" gap={3}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.secondary.light,
                      borderRadius: '50%',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Engineering 
                      sx={{ 
                        fontSize: 32,
                        color: theme.palette.secondary.main,
                      }} 
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        marginBottom: 1,
                        color: theme.palette.text.primary,
                      }}
                    >
                      Apply as an Engineer
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.5,
                      }}
                    >
                      Join our team of engineers to help build the future of AI.
                      Application requires review and approval.
                    </Typography>
                  </Box>
                  
                  <ArrowForward 
                    sx={{ 
                      color: theme.palette.action.active,
                      fontSize: 24,
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Stack>

        {/* Additional info */}
        <Box
          sx={{
            backgroundColor: theme.palette.surface.container,
            borderRadius: 2,
            padding: 3,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
            }}
          >
            Already have an account?{' '}
            <Button
              variant="text"
              onClick={onBackClick}
              sx={{
                minWidth: 'auto',
                padding: 0,
                fontSize: 'inherit',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              Sign in here
            </Button>
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default RegistrationType;
