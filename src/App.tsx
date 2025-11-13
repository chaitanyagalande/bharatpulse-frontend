// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import MyPolls from './pages/MyPolls';
import MyVotes from './pages/MyVotes';
import Profile from './pages/Profile';
import UserPublicProfile from './pages/UserPublicProfile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#9C27B0', // Amethyst purple
      light: '#BA68C8',
      dark: '#7B1FA2',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E040FB', // Magenta accent
      light: '#EA80FC',
      dark: '#C2185B',
      contrastText: '#FFFFFF',
    },
    background: {
      default: 'linear-gradient(135deg, #1A0B2E 0%, #2D1B69 50%, #1A0B2E 100%)',
      paper: alpha('#2D1B69', 0.8),
    },
    text: {
      primary: '#F3E5F5',
      secondary: '#D1C4E9',
    },
    grey: {
      50: '#F3E5F5',
      100: '#E1BEE7',
      200: '#CE93D8',
      300: '#BA68C8',
      400: '#AB47BC',
      500: '#9C27B0',
      600: '#8E24AA',
      700: '#7B1FA2',
      800: '#6A1B9A',
      900: '#4A148C',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
      color: '#E040FB',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
      color: '#E040FB',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#BA68C8',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
      color: '#BA68C8',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#F3E5F5',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#F3E5F5',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#F3E5F5',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#D1C4E9',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #1A0B2E 0%, #2D1B69 50%, #1A0B2E 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '100vh',
            background: `
              radial-gradient(circle at 20% 80%, rgba(156, 39, 176, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(224, 64, 251, 0.15) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
            zIndex: -1,
          },
        },
        '& .dialog-backdrop-blur': {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(26, 11, 46, 0.7)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'rgba(45, 27, 105, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: alpha('#9C27B0', 0.3),
          boxShadow: `
            0 8px 32px 0 rgba(156, 39, 176, 0.1),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.1)
          `,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `
              0 12px 40px 0 rgba(156, 39, 176, 0.2),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.1)
            `,
            borderColor: alpha('#9C27B0', 0.5),
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 22px',
          fontSize: '0.875rem',
          background: 'linear-gradient(135deg, #9C27B0 0%, #E040FB 100%)',
          color: '#FFFFFF',
          border: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)',
          },
          '&.Mui-disabled': {
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.3)',
          },
        },
        outlined: {
          background: 'transparent',
          border: '2px solid',
          borderColor: '#9C27B0',
          color: '#9C27B0',
          '&:hover': {
            background: 'rgba(156, 39, 176, 0.1)',
            borderColor: '#E040FB',
          },
        },
        text: {
          background: 'transparent',
          color: '#9C27B0',
          '&:hover': {
            background: 'rgba(156, 39, 176, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(26, 11, 46, 0.8)',
          backdropFilter: 'blur(15px)',
          borderBottom: '1px solid',
          borderColor: alpha('#9C27B0', 0.2),
          boxShadow: '0 4px 20px rgba(156, 39, 176, 0.1)',
          color: '#F3E5F5',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(5px)',
            border: '1px solid',
            borderColor: alpha('#9C27B0', 0.3),
            transition: 'all 0.3s ease',
            '&:hover fieldset': {
              borderColor: '#9C27B0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#E040FB',
              boxShadow: '0 0 0 2px rgba(224, 64, 251, 0.1)',
            },
            '& input': {
              color: '#F3E5F5',
            },
            '& textarea': {
              color: '#F3E5F5',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#D1C4E9',
            '&.Mui-focused': {
              color: '#E040FB',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
          background: 'rgba(156, 39, 176, 0.1)',
          color: '#9C27B0',
          border: '1px solid',
          borderColor: alpha('#9C27B0', 0.3),
          backdropFilter: 'blur(5px)',
          '&:hover': {
            background: 'rgba(156, 39, 176, 0.2)',
          },
        },
        filled: {
          background: 'linear-gradient(135deg, #9C27B0 0%, #E040FB 100%)',
          color: '#FFFFFF',
          border: 'none',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 44,
          height: 26,
          padding: 0,
          margin: 8,
        },
        switchBase: {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(18px)',
            color: '#FFFFFF',
            '& + .MuiSwitch-track': {
              background: 'linear-gradient(135deg, #9C27B0 0%, #E040FB 100%)',
              opacity: 1,
              border: 'none',
            },
          },
        },
        thumb: {
          width: 22,
          height: 22,
          boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
        },
        track: {
          borderRadius: 26 / 2,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          opacity: 1,
          transition: 'background-color 300ms ease',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          backdropFilter: 'blur(10px)',
        },
        standardSuccess: {
          background: 'rgba(156, 39, 176, 0.1)',
          color: '#9C27B0',
          border: '1px solid',
          borderColor: alpha('#9C27B0', 0.3),
        },
        standardError: {
          background: 'rgba(244, 67, 54, 0.1)',
          color: '#FF6B6B',
          border: '1px solid',
          borderColor: alpha('#FF6B6B', 0.3),
        },
        standardInfo: {
          background: 'rgba(33, 150, 243, 0.1)',
          color: '#4FC3F7',
          border: '1px solid',
          borderColor: alpha('#4FC3F7', 0.3),
        },
        standardWarning: {
          background: 'rgba(255, 152, 0, 0.1)',
          color: '#FFB74D',
          border: '1px solid',
          borderColor: alpha('#FFB74D', 0.3),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 20,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          '& .MuiBackdrop-root': {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(26, 11, 46, 0.7)',
          },
        },
        paper: {
          background: 'rgba(45, 27, 105, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: alpha('#9C27B0', 0.3),
          boxShadow: '0 20px 60px rgba(156, 39, 176, 0.2)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
          background: 'rgba(255, 255, 255, 0.1)',
        },
        bar: {
          borderRadius: 4,
          background: 'linear-gradient(90deg, #9C27B0 0%, #E040FB 100%)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(26, 11, 46, 0.9)',
          backdropFilter: 'blur(15px)',
          borderRight: '1px solid',
          borderColor: alpha('#9C27B0', 0.2),
        },
      },
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1A0B2E 0%, #2D1B69 100%)',
        color: '#9C27B0',
        fontSize: '1.125rem',
        fontWeight: 600,
      }}>
        <div>Loading CityPolling...</div>
      </div>
    );
  }
  
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1A0B2E 0%, #2D1B69 100%)',
        color: '#9C27B0',
        fontSize: '1.125rem',
        fontWeight: 600,
      }}>
        <div>Loading CityPolling...</div>
      </div>
    );
  }
  
  return !user ? <>{children}</> : <Navigate to="/feed" />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes - NO Layout */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            {/* Protected routes - WITH Layout */}
            <Route path="/feed" element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } />
            <Route path="/my-polls" element={
              <ProtectedRoute>
                <MyPolls />
              </ProtectedRoute>
            } />
            <Route path="/my-votes" element={
              <ProtectedRoute>
                <MyVotes />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                <UserPublicProfile />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/feed" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;