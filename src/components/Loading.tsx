'use client';

import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import LoadingAnimation, { LoadingWithText, PulseLoadingAnimation } from './LoadingAnimation';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'rotate' | 'pulse' | 'withText';
}

const Loading = ({ 
  message = 'Loading...', 
  size = 'medium', 
  variant = 'rotate' 
}: LoadingProps) => {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const renderAnimation = () => {
    const animationSize = sizeMap[size];
    
    switch (variant) {
      case 'pulse':
        return <PulseLoadingAnimation size={animationSize} />;
      case 'withText':
        return <LoadingWithText size={animationSize} text={message} />;
      default:
        return <LoadingAnimation size={animationSize} />;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {renderAnimation()}
      </motion.div>
      
      {message && variant !== 'withText' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center' }}
          >
            {message}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default Loading;
