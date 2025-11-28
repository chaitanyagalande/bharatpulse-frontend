// BackendGate.tsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Box, LinearProgress, Typography, Fade } from '@mui/material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BackendGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendReady, setBackendReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    // Slow smooth progress: increment smaller as it grows
    const interval = setInterval(() => {
      const increment = 0.02 + (100 - progressRef.current) * 0.001; 
      // Starts faster than 0, but extremely slows as it nears 100%
      progressRef.current = Math.min(progressRef.current + increment, 99);
      setProgress(progressRef.current);
    }, 100);

    const wakeBackend = async () => {
      try {
        await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, { timeout: 5000 });
        console.log('✅ Backend awake');
        progressRef.current = 100;
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => setBackendReady(true), 500); // show full bar briefly
      } catch (err) {
        console.log('⏳ Backend sleeping, retrying in 5s...');
        setTimeout(wakeBackend, 5000);
      }
    };

    wakeBackend();

    return () => clearInterval(interval);
  }, []);

  if (!backendReady) {
    return (
      <Fade in timeout={600}>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1A0B2E 0%, #2D1B69 100%)',
            color: 'white',
            gap: 3,
            px: 2,
          }}
        >
          <Typography
            variant="h1"
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(90deg, #9C27B0, #E040FB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: 1,
              fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
              textAlign: 'center',
              mb: 1,
            }}
          >
            BharatPulse
          </Typography>

          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            sx={{
              fontStyle: 'italic',
              lineHeight: 1.4,
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              maxWidth: '90%',
              mx: 'auto',
            }}
          >
            A City-Based Community Polling Platform{' '}
            <Box component="span" sx={{ display: 'block', fontWeight: 'medium', color: 'primary.main' }}>
              for Indian Cities
            </Box>
          </Typography>

          <Box sx={{ width: '80%', mt: 3 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
          </Box>

          <Typography
            variant="body1"
            sx={{ opacity: 0.85, letterSpacing: 0.5, textAlign: 'center', maxWidth: '80%', mt: 1 }}
          >
            Waking up the server… This may take a few minutes on first load.
          </Typography>

          <Typography variant="caption" sx={{ opacity: 0.6, mt: 1 }}>
            Free hosting - Cold start optimization enabled
          </Typography>
        </Box>
      </Fade>
    );
  }

  return <>{children}</>;
};

export default BackendGate;
