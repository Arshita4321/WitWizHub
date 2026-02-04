import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { handleError, handleSuccess } from "../utils";
import { API_BASE_URL } from "../config/api.js";


// Use environment variable for API base URL
// // Falls back to localhost during local development if .env is missing
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const userId = localStorage.getItem('userId');
    console.log('Login useEffect - localStorage:', { token, userId });
    if (token && userId) {
      const from = location.state?.from?.pathname || '/home';
      console.log('Login useEffect - Redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const { email, password } = loginInfo;
    
    setError('');
    
    if (!email?.trim() || !password?.trim()) {
      const errorMsg = 'Please fill in all fields';
      handleError(errorMsg);
      setError(errorMsg);
      return;
    }

    if (!validateEmail(email.trim())) {
      const errorMsg = 'Please enter a valid email address';
      handleError(errorMsg);
      setError(errorMsg);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        password: password
      };

      console.log('Login payload:', payload);
      console.log('Calling:', `${API_BASE_URL}/auth/login`);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        localStorage.setItem('jwtToken', data.jwtToken);
        localStorage.setItem('name', data.name);
        localStorage.setItem('userId', data.userId);
        
        console.log('localStorage after login:', {
          jwtToken: localStorage.getItem('jwtToken'),
          name: localStorage.getItem('name'),
          userId: localStorage.getItem('userId')
        });

        handleSuccess(data.message);
        
        const from = location.state?.from?.pathname || '/home';
        console.log('Login success - Redirecting to:', from);
        navigate(from, { replace: true });
      } else {
        const errorMsg = data.message || 'Login failed';
        handleError(errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.message.includes('Failed to fetch')
        ? 'Cannot connect to server. Is the backend running / deployed correctly?'
        : 'Unable to connect to server. Please try again.';
      handleError(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    const trimmedEmail = forgotPasswordEmail.trim();
    
    if (!trimmedEmail) {
      const errorMsg = 'Please enter your email address';
      handleError(errorMsg);
      setError(errorMsg);
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      const errorMsg = 'Please enter a valid email address';
      handleError(errorMsg);
      setError(errorMsg);
      return;
    }

    setForgotPasswordLoading(true);
    setError('');

    try {
      const payload = { email: trimmedEmail.toLowerCase() };
      console.log('Forgot Password payload:', payload);
      console.log('Calling:', `${API_BASE_URL}/auth/forgot-password`);

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Forgot Password response:', data);

      if (data.success) {
        handleSuccess(data.message);
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
        setError('');
      } else {
        const errorMsg = data.message || 'Failed to send reset email';
        handleError(errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Forgot Password error:', err);
      const errorMsg = err.message.includes('Failed to fetch')
        ? 'Cannot connect to server. Check your internet or backend status.'
        : 'Unable to connect to server. Please try again.';
      handleError(errorMsg);
      setError(errorMsg);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleForgotPasswordClose = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setError('');
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4">
      <motion.div
        className="w-full max-w-md bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-purple-500/30 relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-4xl font-bold text-teal-400 mb-6 text-center tracking-tight"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          Welcome Back
        </motion.h1>

        {error && (
          <motion.div
            className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email field */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={loginInfo.email}
              onChange={handleChange}
              variant="outlined"
              required
              disabled={loading}
              InputLabelProps={{ style: { color: '#E5E7EB' } }}
              InputProps={{
                style: {
                  color: '#E5E7EB',
                  backgroundColor: '#1E1B4B',
                  borderRadius: '8px',
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#6B7280' },
                  '&:hover fieldset': { borderColor: '#2DD4BF' },
                  '&.Mui-focused fieldset': { borderColor: '#2DD4BF' },
                },
              }}
            />
          </motion.div>

          {/* Password field */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} style={{ position: 'relative' }}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={loginInfo.password}
              onChange={handleChange}
              variant="outlined"
              required
              disabled={loading}
              InputLabelProps={{ style: { color: '#E5E7EB' } }}
              InputProps={{
                style: {
                  color: '#E5E7EB',
                  backgroundColor: '#1E1B4B',
                  borderRadius: '8px',
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#6B7280' },
                  '&:hover fieldset': { borderColor: '#2DD4BF' },
                  '&.Mui-focused fieldset': { borderColor: '#2DD4BF' },
                },
              }}
            />
            <i
              className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#E5E7EB',
                fontSize: '1.2rem',
                pointerEvents: loading ? 'none' : 'auto',
                opacity: loading ? 0.5 : 1,
              }}
            />
          </motion.div>

          <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <button
              type="button"
              className="text-teal-400 hover:text-pink-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowForgotPassword(true)}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                background: loading ? '#6B7280' : 'linear-gradient(to right, #2DD4BF, #A855F7)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                marginBottom: '12px',
                '&:hover': {
                  background: loading ? '#6B7280' : 'linear-gradient(to right, #14B8A6, #9333EA)',
                  transform: loading ? 'none' : 'scale(1.02)',
                },
                '&:disabled': {
                  background: '#6B7280',
                  color: '#9CA3AF',
                },
              }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <CircularProgress size={20} sx={{ color: '#9CA3AF' }} />
                  <span className="text-gray-300">Signing in...</span>
                </div>
              ) : (
                <span className="text-white">Login</span>
              )}
            </Button>
          </motion.div>
        </form>

        <motion.p
          className="mt-6 text-center text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Don't have an account?{' '}
          <NavLink
            to="/signup"
            className={({ isActive }) =>
              `text-teal-400 hover:text-pink-500 font-medium transition-colors relative z-10 ${isActive ? 'text-pink-500' : ''}`
            }
          >
            Sign Up
          </NavLink>
        </motion.p>
      </motion.div>

      {/* Forgot Password Dialog */}
      <Dialog
        open={showForgotPassword}
        onClose={handleForgotPasswordClose}
        PaperProps={{
          style: {
            backgroundColor: '#1E1B4B',
            color: '#E5E7EB',
            borderRadius: '12px',
            border: '2px solid transparent',
            borderImage: 'linear-gradient(to right, #2DD4BF, #A855F7) 1',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            minWidth: '400px',
          },
        }}
      >
        <DialogTitle style={{ 
          fontFamily: "'Dancing Script', cursive", 
          color: '#2DD4BF', 
          textAlign: 'center',
          fontSize: '1.5rem' 
        }}>
          Reset Your Password
        </DialogTitle>
        <DialogContent>
          <p className="text-gray-300 text-sm mb-4 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <TextField
            fullWidth
            label="Enter your email"
            type="email"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            variant="outlined"
            margin="normal"
            disabled={forgotPasswordLoading}
            InputLabelProps={{ style: { color: '#E5E7EB' } }}
            InputProps={{
              style: {
                color: '#E5E7EB',
                backgroundColor: '#0F172A',
                borderRadius: '8px',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#6B7280' },
                '&:hover fieldset': { borderColor: '#2DD4BF' },
                '&.Mui-focused fieldset': { borderColor: '#2DD4BF' },
              },
            }}
          />
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          <Button
            onClick={handleForgotPasswordClose}
            disabled={forgotPasswordLoading}
            style={{ color: '#EC4899' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleForgotPassword}
            disabled={forgotPasswordLoading}
            style={{
              background: forgotPasswordLoading ? '#6B7280' : 'linear-gradient(to right, #2DD4BF, #A855F7)',
              color: '#E5E7EB',
              borderRadius: '8px',
              minWidth: '120px',
            }}
          >
            {forgotPasswordLoading ? (
              <div className="flex items-center gap-2">
                <CircularProgress size={16} sx={{ color: '#9CA3AF' }} />
                <span>Sending...</span>
              </div>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}

export default Login;