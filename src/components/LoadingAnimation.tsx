'use client';

import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { appConfig } from '../config/app';

interface LoadingAnimationProps {
  size?: number;
  duration?: number;
  pauseDuration?: number;
}

const LoadingAnimation = ({ 
  size = 48, 
  duration = 1.5, 
  pauseDuration = 0.5 
}: LoadingAnimationProps) => {
  // Animation that rotates, pauses, rotates, pauses
  const rotateAnimation = {
    rotate: [0, 360, 360, 720, 720, 1080],
    transition: {
      duration: duration * 2 + pauseDuration * 2,
      repeat: Infinity,
      ease: [0.4, 0, 0.2, 1], // Material Design easing
      times: [0, 0.3, 0.5, 0.8, 0.9, 1], // Control timing of each rotation phase
    }
  };

  // Subtle scale animation for breathing effect
  const scaleAnimation = {
    scale: [1, 1.05, 1, 1.05, 1],
    transition: {
      duration: duration * 2 + pauseDuration * 2,
      repeat: Infinity,
      ease: "easeInOut",
    }
  };

  // Glow effect animation - DISABLED to prevent white background
  // const glowAnimation = {
  //   boxShadow: [
  //     `0 0 0px rgba(25, 118, 210, 0)`,
  //     `0 0 20px rgba(25, 118, 210, 0.3)`,
  //     `0 0 0px rgba(25, 118, 210, 0)`,
  //     `0 0 20px rgba(25, 118, 210, 0.3)`,
  //     `0 0 0px rgba(25, 118, 210, 0)`,
  //   ],
  //   transition: {
  //     duration: duration * 2 + pauseDuration * 2,
  //     repeat: Infinity,
  //     ease: "easeInOut",
  //   }
  // };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: size,
        height: size,
        backgroundColor: 'transparent',
        background: 'none',
      }}
    >
      <motion.div
        animate={rotateAnimation}
        style={{
          width: size,
          height: size,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
          background: 'none',
        }}
      >
        <motion.div
          animate={scaleAnimation}
          style={{
            width: size,
            height: size,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
            background: 'none',
          }}
        >
          <Box
            component="img"
            src="/logo/iconlogo.png"
            alt={`${appConfig.name} Loading`}
            sx={{
              width: size,
              height: size,
              objectFit: 'contain',
              backgroundColor: 'transparent !important',
              background: 'none !important',
              border: 'none',
              outline: 'none',
              boxShadow: 'none !important',
              '&::before, &::after': {
                display: 'none !important',
              },
              '& img': {
                backgroundColor: 'transparent !important',
                background: 'none !important',
              },
            }}
          />
        </motion.div>
      </motion.div>
    </Box>
  );
};

// Advanced loading animation with text
interface LoadingWithTextProps extends LoadingAnimationProps {
  text?: string;
  showText?: boolean;
}

export const LoadingWithText = ({ 
  text = "Loading...", 
  showText = true,
  ...animationProps 
}: LoadingWithTextProps) => {
  // Typing dots animation
  const dotsAnimation = {
    opacity: [0, 1, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <LoadingAnimation {...animationProps} />
      {showText && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            component="span"
            sx={{
              color: 'text.secondary',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {text}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={dotsAnimation}
                transition={{
                  ...dotsAnimation.transition,
                  delay: i * 0.2,
                }}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: 'currentColor',
                  color: 'rgba(0,0,0,0.6)',
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Pulse loading animation variant
export const PulseLoadingAnimation = ({ size = 48 }: { size?: number }) => {
  const pulseAnimation = {
    scale: [1, 1.2, 1, 1.2, 1],
    opacity: [0.7, 1, 0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: size,
        height: size,
        backgroundColor: 'transparent',
        background: 'none',
      }}
    >
      <motion.div animate={pulseAnimation}>
        <Box
          component="img"
          src="/logo/iconlogo.png"
          alt={`${appConfig.name} Loading`}
          sx={{
            width: size,
            height: size,
            objectFit: 'contain',
            backgroundColor: 'transparent',
            background: 'none',
            border: 'none',
            outline: 'none',
          }}
        />
      </motion.div>
    </Box>
  );
};

export default LoadingAnimation;
