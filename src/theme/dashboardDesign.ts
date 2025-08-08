import { Theme, alpha } from '@mui/material/styles';

// Professional dashboard design tokens
export const dashboardDesign = {
  // Color palette for dashboard components
  colors: {
    primary: {
      main: '#6750A4',
      light: '#EADDFF',
      dark: '#21005D',
      gradient: 'linear-gradient(135deg, #6750A4 0%, #8B5FA6 100%)',
    },
    secondary: {
      main: '#625B71',
      light: '#E8DEF8',
      dark: '#1D192B',
      gradient: 'linear-gradient(135deg, #625B71 0%, #7A6B85 100%)',
    },
    success: {
      main: '#006E1C',
      light: '#B7F397',
      dark: '#002204',
      gradient: 'linear-gradient(135deg, #006E1C 0%, #00A626 100%)',
    },
    warning: {
      main: '#F57C00',
      light: '#FFE0B2',
      dark: '#E65100',
      gradient: 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)',
    },
    error: {
      main: '#BA1A1A',
      light: '#FFDAD6',
      dark: '#410002',
      gradient: 'linear-gradient(135deg, #BA1A1A 0%, #D32F2F 100%)',
    },
    neutral: {
      main: '#79747E',
      light: '#F3EDF7',
      dark: '#1C1B1F',
      gradient: 'linear-gradient(135deg, #79747E 0%, #5D5A66 100%)',
    },
  },

  // Spacing and sizing
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
    cardPadding: 24,
    sectionGap: 32,
  },

  // Typography scales
  typography: {
    dashboard: {
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.25,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.33,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.45,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.57,
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.57,
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.66,
      },
    },
  },

  // Border radius
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
    card: 12,
  },

  // Shadows
  shadows: {
    card: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    cardHover: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    elevated: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  },

  // Animation
  animation: {
    duration: {
      short: 150,
      standard: 300,
      long: 500,
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      decelerated: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerated: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
};

// Helper functions for creating dashboard styles
export const createDashboardCardStyle = (theme: Theme, color?: keyof typeof dashboardDesign.colors) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: dashboardDesign.borderRadius.card,
  boxShadow: dashboardDesign.shadows.card,
  transition: `all ${dashboardDesign.animation.duration.standard}ms ${dashboardDesign.animation.easing.standard}`,
  '&:hover': {
    boxShadow: dashboardDesign.shadows.cardHover,
    transform: 'translateY(-1px)',
    ...(color && {
      borderColor: dashboardDesign.colors[color].main,
    }),
  },
});

export const createStatsCardStyle = (theme: Theme, color: keyof typeof dashboardDesign.colors) => ({
  ...createDashboardCardStyle(theme, color),
  borderLeft: `4px solid ${dashboardDesign.colors[color].main}`,
  background: `linear-gradient(135deg, ${alpha(dashboardDesign.colors[color].light, 0.8)} 0%, ${alpha(dashboardDesign.colors[color].light, 0.4)} 100%)`,
  '&:hover': {
    ...createDashboardCardStyle(theme, color)['&:hover'],
    borderLeftColor: dashboardDesign.colors[color].dark,
    background: `linear-gradient(135deg, ${alpha(dashboardDesign.colors[color].light, 0.9)} 0%, ${alpha(dashboardDesign.colors[color].light, 0.5)} 100%)`,
  },
});

export const createIconContainerStyle = (theme: Theme, color: keyof typeof dashboardDesign.colors) => ({
  padding: dashboardDesign.spacing.medium,
  borderRadius: dashboardDesign.borderRadius.medium,
  backgroundColor: alpha(dashboardDesign.colors[color].main, 0.1),
  color: dashboardDesign.colors[color].main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `all ${dashboardDesign.animation.duration.standard}ms ${dashboardDesign.animation.easing.standard}`,
});

export const createGradientBackground = (color: keyof typeof dashboardDesign.colors) => {
  const colorConfig = dashboardDesign.colors[color];
  return colorConfig.gradient;
};

export default dashboardDesign;