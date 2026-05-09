import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button, Typography } from '@mui/material';
import { Event, CheckCircle } from '@mui/icons-material';
import toast from 'react-hot-toast';

import { API_BASE_URL } from "../config/api.js";

const GoogleAuthButton = () => {
  const [isConnected, setIsConnected] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/study-planner/google`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      window.location.href = res.data.url;
    } catch (err) {
      toast.error('Failed to connect Google Calendar');
      console.error(err);
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }} 
      className="mb-6"
    >
      <Button
        variant="contained"
        startIcon={isConnected ? <CheckCircle /> : <Event />}
        onClick={handleGoogleAuth}
        fullWidth
        sx={{
          background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
        }}
      >
        {isConnected ? 'Google Calendar Connected ✓' : 'Connect Google Calendar'}
      </Button>
      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block', 
          textAlign: 'center', 
          mt: 1, 
          color: '#9CA3AF' 
        }}
      >
        Required for adding events to Google Calendar
      </Typography>
    </motion.div>
  );
};

export default GoogleAuthButton;