// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
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
import theme from './theme';
import axios from 'axios';
import { Box, CircularProgress, Fade, Typography } from '@mui/material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Wakeup backend render through repeated wakeup 
const BackendGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    const wakeBackend = async () => {
      try {
        await axios.get(
          `${API_BASE_URL.replace('/api', '')}/health`,
          { timeout: 5000 }
        );
        console.log("✅ Backend awake");
        setBackendReady(true);
      } catch (err) {
        console.log("⏳ Backend sleeping, retrying in 5s...");
        setTimeout(wakeBackend, 5000);
      }
    };

    wakeBackend();
  }, []);

  if (!backendReady) {
    return (
      <Fade in timeout={600}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #1A0B2E 0%, #2D1B69 100%)",
            color: "white",
            gap: 3,
          }}
        >
          {/* App Name */}
          <Typography
            variant="h1"
            fontWeight="bold"
            sx={{
              background: "linear-gradient(90deg, #9C27B0, #E040FB)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 1,
              fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
              textAlign: 'center',
              mb: 1
            }}
          >
            BharatPulse
          </Typography>

          {/* Improved Tagline */}
          <Typography
            variant="subtitle1"
            component="p"
            align="center"
            color="text.secondary"
            sx={{ 
              fontStyle: 'italic',
              lineHeight: 1.4,
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              maxWidth: '90%',
              mx: 'auto'
            }}
          >
            A City-Based Community Polling Platform{" "}
            <Box 
              component="span" 
              sx={{ 
                display: 'block',
                fontWeight: 'medium',
                color: 'primary.main'
              }}
            >
              for Indian Cities
            </Box>
          </Typography>

          {/* Spinner */}
          <CircularProgress size={48} thickness={4} />

          {/* Status Text */}
          <Typography
            variant="body1"
            sx={{ 
              opacity: 0.85, 
              letterSpacing: 0.5,
              textAlign: 'center',
              maxWidth: '80%'
            }}
          >
            Waking up the server… This may take up to 1 minute on first load.
          </Typography>

          {/* Subtle Hint */}
          <Typography
            variant="caption"
            sx={{ opacity: 0.6, mt: 1 }}
          >
            Free hosting - Cold start optimization enabled
          </Typography>
        </Box>
      </Fade>
    );
  }

  return <>{children}</>;
};

// Auth route guards
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
        <div>Loading BharatPulse...</div>
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
        <div>Loading BharatPulse...</div>
      </div>
    );
  }
  
  return !user ? <>{children}</> : <Navigate to="/feed" />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Render cold start handled here */}
      <BackendGate> 
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
              <Route path="/profile/:username" element={
                <ProtectedRoute>
                  <UserPublicProfile />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/feed" />} />
            </Routes>
          </AuthProvider>
        </Router>
      </BackendGate>
    </ThemeProvider>
  );
};

export default App;