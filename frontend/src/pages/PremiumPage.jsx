import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Button, Alert, Box } from '@mui/material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AdUnitsIcon from '@mui/icons-material/AdUnits';

import { API_BASE_URL } from "../config/api.js";

const PremiumPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle payment status from URL query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    if (status === 'success') {
      toast.success('Payment successful! You are now a premium user.', {
        style: { background: '#10B981', color: '#fff', fontFamily: 'Arial, sans-serif' },
      });
      setTimeout(() => navigate('/'), 2000);
    } else if (status === 'failed') {
      toast.error('Payment failed. Please try again.', {
        style: { background: '#EF4444', color: '#fff', fontFamily: 'Arial, sans-serif' },
      });
    } else if (status === 'error') {
      toast.error('Payment error occurred.', {
        style: { background: '#EF4444', color: '#fff', fontFamily: 'Arial, sans-serif' },
      });
    }
  }, [location, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('jwtToken');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        setError('Please log in to proceed with payment');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/payment/initiate`,
        { userId, amount: 100 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { paymentUrl, paytmParams } = response.data;

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentUrl;
      Object.keys(paytmParams).forEach((key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paytmParams[key];
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError('Failed to initiate payment. Please try again.');
      setLoading(false);
      toast.error('Payment initiation failed', {
        style: { background: '#EF4444', color: '#fff', fontFamily: 'Arial, sans-serif' },
      });
      console.error('Payment error:', err);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay: 0.2 },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.3 },
    },
  };

  const iconVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      transition: { duration: 2, repeat: Infinity },
    },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(45, 212, 191, 0.2), transparent 70%)',
          animation: 'glow 5s infinite alternate',
        }}
      />
      <Container maxWidth="lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#0F172A]/90 rounded-2xl shadow-2xl p-8 border border-[#A855F7]/30 z-10"
        >
          <Typography
            variant="h2"
            className="text-4xl md:text-5xl font-bold text-center mb-6"
            style={{
              fontFamily: "'Dancing Script', cursive",
              background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            Unlock the Power of Premium
            <motion.div variants={iconVariants} animate="pulse" className="inline-block">
              <StarIcon className="text-[#2DD4BF] text-3xl md:text-4xl ml-2" />
            </motion.div>
          </Typography>
          <Typography
            variant="h6"
            className="text-lg md:text-xl text-gray-300 text-center mb-8 opacity-90"
          >
            Elevate your learning with exclusive features for just ₹100/month
          </Typography>
          {error && (
            <Alert severity="error" className="mb-6 bg-red-500/10 text-red-500 rounded-lg p-4">
              {error}
            </Alert>
          )}
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="bg-[#1E1B4B] rounded-xl p-6 border border-[#4B5563]"
              style={{ background: 'linear-gradient(to right, #1E1B4B, #0F172A)' }}
            >
              <Typography
                variant="h5"
                className="text-xl md:text-2xl text-[#2DD4BF] mb-4 flex items-center gap-2"
              >
                <motion.div variants={iconVariants} animate="pulse">
                  <CheckCircleIcon className="text-[#A855F7] text-xl md:text-2xl" />
                </motion.div>
                Premium Benefits
              </Typography>
              <ul className="list-none p-0 text-gray-300">
                <li className="flex items-center gap-2 mb-3 text-base md:text-lg">
                  <TrendingUpIcon className="text-[#10B981] text-lg md:text-xl" />
                  Unlimited Study Plans
                </li>
                <li className="flex items-center gap-2 mb-3 text-base md:text-lg">
                  <CheckCircleIcon className="text-[#10B981] text-lg md:text-xl" />
                  AI-Powered Insights
                </li>
                <li className="flex items-center gap-2 mb-3 text-base md:text-lg">
                  <SupportAgentIcon className="text-[#10B981] text-lg md:text-xl" />
                  Priority Support
                </li>
                <li className="flex items-center gap-2 mb-3 text-base md:text-lg">
                  <AdUnitsIcon className="text-[#10B981] text-lg md:text-xl" />
                  Ad-Free Experience
                </li>
              </ul>
            </motion.div>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="bg-[#1E1B4B] rounded-xl p-6 border border-[#4B5563]"
              style={{ background: 'linear-gradient(to right, #1E1B4B, #0F172A)' }}
            >
              <Typography
                variant="h5"
                className="text-xl md:text-2xl text-[#2DD4BF] mb-4 flex items-center gap-2"
              >
                <motion.div variants={iconVariants} animate="pulse">
                  <PaymentIcon className="text-[#A855F7] text-xl md:text-2xl" />
                </motion.div>
                How It Works
              </Typography>
              <ul className="list-none p-0 text-gray-300">
                <li className="flex items-center gap-2 mb-3 text-base md:text-lg">
                  <span className="text-[#10B981] font-bold">1.</span> Click "Pay Now"
                </li>
                <li className="flex items-center gap-2 mb-3 text-base md:text-lg">
                  <span className="text-[#10B981] font-bold">2.</span> Pay via Paytm or UPI
                </li>
                <li className="flex items-center gap-2 mb-3 text-base md:text-lg">
                  <span className="text-[#10B981] font-bold">3.</span> Unlock premium features
                </li>
              </ul>
            </motion.div>
          </Box>
          <motion.div
            className="flex justify-center"
            variants={buttonVariants}
            whileHover="hover"
          >
            <Button
              variant="contained"
              onClick={handlePayment}
              disabled={loading}
              className="text-white rounded-xl px-6 py-3 text-lg font-semibold"
              style={{
                background: 'linear-gradient(to right, #2DD4BF, #A855F7)',
                textTransform: 'none',
              }}
              startIcon={<PaymentIcon />}
            >
              {loading ? <CircularProgress size={24} style={{ color: '#E5E7EB' }} /> : 'Pay Now (₹100)'}
            </Button>
          </motion.div>
        </motion.div>
      </Container>
      <style>
        {`
          @keyframes glow {
            0% { opacity: 0.2; }
            100% { opacity: 0.4; }
          }
        `}
      </style>
    </div>
  );
};

export default PremiumPage;