import React from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '@mui/material';
import { Event } from '@mui/icons-material';
import toast from 'react-hot-toast';

// Consistent API base URL (same as Login, Signup, Profile, Notes, StudyPlanner, etc.)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const GoogleAuthButton = () => {
  const handleGoogleAuth = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        toast.error('Please login first', { style: { background: '#EF4444', color: '#fff' } });
        return;
      }
      const res = await axios.get(`${API_BASE_URL}/api/study-planner/google`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.href = res.data.url;
    } catch (err) {
      toast.error('Google authentication failed', { style: { background: '#EF4444', color: '#fff' } });
      console.error('Google auth error:', err);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(45, 212, 191, 0.5)' }}
      whileTap={{ scale: 0.95 }}
      className="mb-6 border border-gradient-accent rounded-lg"
    >
      <Button
        variant="contained"
        startIcon={<Event />}
        onClick={handleGoogleAuth}
        fullWidth
        className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white rounded-lg py-3"
      >
        Connect Google Calendar
      </Button>
    </motion.div>
  );
};

export default GoogleAuthButton;