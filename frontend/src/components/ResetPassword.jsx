import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TextField, Button, CircularProgress, Alert } from '@mui/material';
import { CheckCircle, Error, Visibility, VisibilityOff } from '@mui/icons-material';

import { API_BASE_URL } from "../config/api.js";

function ResetPassword() {
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });
  const [tokenValid, setTokenValid] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Validate token on component mount
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const validatePassword = (password) => {
    const requirements = [
      { regex: /.{8,}/, message: 'At least 8 characters' },
      { regex: /[A-Z]/, message: 'One uppercase letter' },
      { regex: /[a-z]/, message: 'One lowercase letter' },
      { regex: /\d/, message: 'One number' },
      { regex: /[@$!%*?&]/, message: 'One special character' }
    ];

    const feedback = [];
    let score = 0;

    requirements.forEach(req => {
      if (req.regex.test(password)) {
        score++;
      } else {
        feedback.push(req.message);
      }
    });

    return { score, feedback };
  };

  const handlePasswordChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    
    if (field === 'newPassword') {
      setPasswordStrength(validatePassword(value));
    }
    
    // Clear errors when user types
    if (error) setError('');
    if (success) setSuccess('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getPasswordStrengthColor = (score) => {
    if (score <= 2) return '#EF4444'; // Red
    if (score <= 3) return '#F59E0B'; // Orange
    if (score <= 4) return '#10B981'; // Green
    return '#059669'; // Dark Green
  };

  const getPasswordStrengthText = (score) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const { newPassword, confirmPassword } = passwords;
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    // Validate inputs
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in both password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Check password strength
    const strength = validatePassword(newPassword);
    if (strength.score < 5) {
      setError(`Password requirements not met: ${strength.feedback.join(', ')}`);
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = { 
        token: token.trim(), 
        newPassword: newPassword.trim() 
      };
      
      console.log('Reset Password request:', { token: token.substring(0, 10) + '...' });
      
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      console.log('Reset Password response:', data);
      
      if (data.success) {
        setSuccess(data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Password reset successful. Please log in with your new password.' }
          });
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Reset Password error:', err);
      setError('Unable to connect to server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4">
        <motion.div
          className="w-full max-w-md bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-red-500/30"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <Error sx={{ fontSize: 60, color: '#EF4444', mb: 2 }} />
            <h2 className="text-2xl font-bold text-red-400 mb-4">Invalid Reset Link</h2>
            <p className="text-gray-300 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/login"
              className="inline-block bg-gradient-to-r from-teal-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-teal-600 hover:to-purple-700 transition-all"
            >
              Back to Login
            </Link>
          </div>
        </motion.div>
      </section>
    );
  }

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
          Reset Password
        </motion.h1>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert
              severity="success"
              icon={<CheckCircle />}
              sx={{
                backgroundColor: '#10B981',
                color: 'white',
                '& .MuiAlert-icon': { color: 'white' }
              }}
            >
              {success}
            </Alert>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert
              severity="error"
              sx={{
                backgroundColor: '#EF4444',
                color: 'white',
                '& .MuiAlert-icon': { color: 'white' }
              }}
            >
              {error}
            </Alert>
          </motion.div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative">
              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.newPassword ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                variant="outlined"
                required
                disabled={loading || success}
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
                    '& fieldset': {
                      borderColor: '#6B7280',
                    },
                    '&:hover fieldset': {
                      borderColor: '#2DD4BF',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2DD4BF',
                    },
                  },
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                onClick={() => togglePasswordVisibility('newPassword')}
                disabled={loading || success}
              >
                {showPasswords.newPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>

            {passwords.newPassword && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-1 bg-gray-600 rounded">
                    <div
                      className="h-full rounded transition-all duration-300"
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: getPasswordStrengthColor(passwordStrength.score)
                      }}
                    />
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: getPasswordStrengthColor(passwordStrength.score) }}
                  >
                    {getPasswordStrengthText(passwordStrength.score)}
                  </span>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="text-xs text-red-300 space-y-1">
                    {passwordStrength.feedback.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative">
              <TextField
                fullWidth
                label="Confirm Password"
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                variant="outlined"
                required
                disabled={loading || success}
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
                    '& fieldset': {
                      borderColor: '#6B7280',
                    },
                    '&:hover fieldset': {
                      borderColor: '#2DD4BF',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2DD4BF',
                    },
                  },
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                disabled={loading || success}
              >
                {showPasswords.confirmPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>

            {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-300 text-sm mt-1"
              >
                Passwords do not match
              </motion.p>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || success}
              sx={{
                background: loading || success ? '#6B7280' : 'linear-gradient(to right, #2DD4BF, #A855F7)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': {
                  background: loading || success ? '#6B7280' : 'linear-gradient(to right, #14B8A6, #9333EA)',
                  transform: loading || success ? 'none' : 'scale(1.02)',
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
                  <span className="text-gray-300">Resetting Password...</span>
                </div>
              ) : success ? (
                <div className="flex items-center gap-2">
                  <CheckCircle sx={{ color: '#10B981' }} />
                  <span className="text-green-300">Password Reset!</span>
                </div>
              ) : (
                <span className="text-white">Reset Password</span>
              )}
            </Button>
          </motion.div>
        </form>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Link
            to="/login"
            className="text-teal-400 hover:text-pink-500 font-medium transition-colors"
          >
            ← Back to Login
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default ResetPassword;