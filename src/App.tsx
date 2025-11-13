// src/App.tsx
import React from 'react';
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
            <Route path="/profile/:username" element={
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