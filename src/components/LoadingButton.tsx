'use client';

import { Box, Button, ButtonProps } from '@mui/material';
import LoadingAnimation from './LoadingAnimation';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingSize?: number;
  children: React.ReactNode;
}

/**
 * Button component that shows logo loading animation when loading=true
 * Maintains the same button size and spacing when loading
 */
const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingSize = 24,
  children,
  disabled,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
    >
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: loadingSize,
            minHeight: loadingSize,
          }}
        >
          <LoadingAnimation size={loadingSize} />
        </Box>
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;
