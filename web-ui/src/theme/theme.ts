import { createTheme } from '@mui/material';

// Dark modern theme with deep blue and purple accents
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6', // Purple accent
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f0f23', // Very dark blue
      paper: '#1a1a2e', // Dark blue-gray
    },
    text: {
      primary: '#f1f5f9', // Light gray
      secondary: '#94a3b8', // Medium gray
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#94a3b8',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#94a3b8',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: '0 8px 25px -8px rgba(99, 102, 241, 0.4)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        },
        contained: {
          '&:hover': {
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
          },
        },
        outlined: {
          background: 'transparent',
          borderColor: '#6366f1',
          color: '#6366f1',
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.1)',
            borderColor: '#4f46e5',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px -12px rgba(99, 102, 241, 0.3)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: 'rgba(26, 26, 46, 0.8)',
            backdropFilter: 'blur(10px)',
            '& fieldset': {
              borderColor: 'rgba(99, 102, 241, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: '#6366f1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366f1',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#94a3b8',
            '&.Mui-focused': {
              color: '#6366f1',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
          color: '#f1f5f9',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
          background: 'rgba(30, 41, 59, 0.8)',
        },
        bar: {
          borderRadius: 8,
          background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: 'blur(10px)',
        },
        standardSuccess: {
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
        },
        standardError: {
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
        },
        standardWarning: {
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#fbbf24',
        },
        standardInfo: {
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
        },
      },
    },
  },
});

// Create a light theme variant for comparison
const lightTheme = createTheme({
  ...theme,
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
});

export default theme;
export { theme, lightTheme };
